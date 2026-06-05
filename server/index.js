import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import axios from 'axios'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'
import { calculateConsultationSplitNgn, calculateLabCommissionNgn } from '../src/lib/ngPricing.js'
import pkg from 'agora-access-token'
const { RtcTokenBuilder, RtcRole } = pkg

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '8mb' }))
app.use(express.urlencoded({ extended: true, limit: '8mb' }))

const AGORA_APP_ID = process.env.AGORA_APP_ID
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE
const VIDEO_TURN_URLS = String(process.env.VIDEO_TURN_URLS || process.env.TURN_URLS || '').split(',').map((item) => item.trim()).filter(Boolean)
const VIDEO_TURN_USERNAME = String(process.env.VIDEO_TURN_USERNAME || process.env.TURN_USERNAME || '').trim()
const VIDEO_TURN_CREDENTIAL = String(process.env.VIDEO_TURN_CREDENTIAL || process.env.TURN_CREDENTIAL || process.env.TURN_PASSWORD || '').trim()

// ---------- Supabase server‑side client ----------
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ FATAL: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.')
}
if (supabaseUrl && supabaseServiceKey && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY is not set. Falling back to anon key; database writes may fail if RLS is enabled.')
}
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const KORA_SECRET_KEY = String(process.env.KORA_SECRET_KEY || '').trim()
const KORA_BASE_URL = String(process.env.KORA_BASE_URL || 'https://api.korapay.com').trim().replace(/\/+$/, '')
const KORA_CHARGE_CURRENCY = String(process.env.KORA_CHARGE_CURRENCY || 'NGN').trim().toUpperCase()
const KORA_USD_EXCHANGE_RATE = Number(process.env.KORA_USD_EXCHANGE_RATE || 1600)

// ---------- STARTUP DIAGNOSTICS ----------
;(async () => {
  console.log('🔍 Running startup diagnostics...')
  
  // Test Supabase connection
  const { data: adminCount, error: dbError } = await supabase.from('admins').select('*', { count: 'exact', head: true })
  if (dbError) {
    console.error('❌ Cannot reach Supabase:', dbError.message)
  } else {
    console.log('✅ Supabase connection OK')
  }

  // Check check_password function
  const { error: fnError } = await supabase.rpc('check_password', { pass: 'test', hashed: 'test' })
  if (fnError) {
    console.error('❌ check_password function missing! Run this SQL in Supabase SQL Editor:')
    console.error(`
CREATE OR REPLACE FUNCTION check_password(pass text, hashed text)
RETURNS boolean AS $$
BEGIN
  RETURN hashed = crypt(pass, hashed);
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;
    `)
  } else {
    console.log('✅ check_password function exists')
  }
})()

// ---------- ID generator ----------
const generateId = (prefix) => `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
const videoSignalRooms = new Map()
let videoSignalSeq = 0

function generateReadablePatientId(kind = 'HRN') {
  const code = String(kind || 'HRN').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) || 'HRN'
  const stamp = Date.now().toString().slice(-6)
  const random = crypto.randomBytes(2).toString('hex').toUpperCase()
  return `PID-${code}-${stamp}${random}`
}

function getPatientIdPrefixForFacilityType(type) {
  if (String(type || '').toLowerCase() === 'phc') return 'PHC'
  if (String(type || '').toLowerCase() === 'private_clinic') return 'CLC'
  return 'FAC'
}

function getVideoSignalRoom(roomId) {
  const key = String(roomId || '').trim()
  if (!videoSignalRooms.has(key)) videoSignalRooms.set(key, [])
  return videoSignalRooms.get(key)
}

function buildVideoIceServers() {
  const iceServers = [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  ]
  if (VIDEO_TURN_URLS.length > 0 && VIDEO_TURN_USERNAME && VIDEO_TURN_CREDENTIAL) {
    iceServers.push({
      urls: VIDEO_TURN_URLS,
      username: VIDEO_TURN_USERNAME,
      credential: VIDEO_TURN_CREDENTIAL,
    })
  }
  return iceServers
}

function withTimeout(promise, ms, fallbackValue) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      setTimeout(() => resolve(fallbackValue), ms)
    }),
  ])
}

// ---------- Utility helpers ----------
function safeNumber(value) {
  const parsed = typeof value === 'string' ? Number(value) : value
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeSpecialtyKey(value = '') {
  const normalized = String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '')
  const aliases = {
    gynaecologist: 'gynaecology',
    gynaecology: 'gynaecology',
    gynecologist: 'gynaecology',
    gynecology: 'gynaecology',
    obstetricsandgynecology: 'gynaecology',
    obstetricsgynecology: 'gynaecology',
    obstetricsandgyn: 'gynaecology',
    obstetricsgyn: 'gynaecology',
    obgyn: 'gynaecology',
    generalpractice: 'generalpractitioner',
    gp: 'generalpractitioner',
  }
  return aliases[normalized] || normalized
}

function specialtyMatches(value, expected) {
  if (!expected) return true
  return normalizeSpecialtyKey(value) === normalizeSpecialtyKey(expected)
}

function normalizeAppBaseUrl(rawValue) {
  const value = String(rawValue || '').trim().replace(/\/+$/, '')
  if (!value) return ''
  if (value.includes('localhost') || value.includes('127.0.0.1')) return ''
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`
  try {
    const url = new URL(candidate)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return url.origin
  } catch { return '' }
}

function getApiOrigin(req) {
  const configured = process.env.APP_BASE_URL || process.env.VITE_APP_BASE || process.env.VITE_API_BASE || process.env.VERCEL_URL
  const normalized = normalizeAppBaseUrl(configured)
  if (normalized) return normalized
  const proto = (req.headers['x-forwarded-proto'] || 'http').toString().split(',')[0].trim()
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toString().split(',')[0].trim()
  if (!host) return ''
  return `${proto}://${host}`
}

function extractKoraCheckoutUrl(payload) {
  return payload?.data?.checkout_url
    || payload?.data?.checkoutUrl
    || payload?.checkout_url
    || payload?.checkoutUrl
    || payload?.data?.payment_url
    || payload?.payment_url
    || ''
}

function buildKoraTokenCharge(amountUSD) {
  const currency = KORA_CHARGE_CURRENCY || 'NGN'
  const exchangeRate = Number.isFinite(KORA_USD_EXCHANGE_RATE) && KORA_USD_EXCHANGE_RATE > 0
    ? KORA_USD_EXCHANGE_RATE
    : 1600
  const amount = currency === 'USD'
    ? Math.round(Number(amountUSD))
    : Math.round(Number(amountUSD) * exchangeRate)
  return { amount, currency, exchangeRate }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

function buildKoraCustomerEmail(email, patientId) {
  const normalized = String(email || '').trim().toLowerCase()
  if (isValidEmail(normalized)) return normalized
  const safeId = String(patientId || 'patient').replace(/[^a-zA-Z0-9]/g, '').slice(0, 40) || 'patient'
  return `no-reply+${safeId}@globaldoctorplatform.vercel.app`
}

function buildKoraCustomerName(name) {
  const normalized = String(name || '').trim().replace(/\s+/g, ' ')
  return normalized || 'GlobalDoc Patient'
}

function getKoraErrorMessage(error) {
  const data = error?.response?.data
  if (!data) return error?.message || 'Unknown Kora error'
  const fieldErrors = data.data && typeof data.data === 'object' ? JSON.stringify(data.data) : ''
  return [data.message || data.error || data.data?.message, fieldErrors].filter(Boolean).join(': ') || JSON.stringify(data)
}

function normalizeKoraStatus(payload) {
  const data = payload?.data || {}
  const nestedStatus = data.status || data.transaction_status || data.payment_status || data.charge_status
  if (nestedStatus) return String(nestedStatus).trim().toLowerCase()
  if (payload?.status === true || payload?.success === true || data.success === true) return 'success'
  if (payload?.status === false || payload?.success === false || data.success === false) return 'failed'
  return String(payload?.transaction_status || payload?.payment_status || payload?.charge_status || payload?.status || '').trim().toLowerCase()
}

function isKoraChargeSuccessful(payload) {
  return ['success', 'successful', 'completed', 'paid', 'succeeded', 'approved', 'captured'].includes(normalizeKoraStatus(payload))
}

const doctorOnlineWindowSeconds = Number(process.env.DOCTOR_ONLINE_WINDOW_SECONDS || 300)
const DOCTOR_ONLINE_WINDOW_MS = Math.max(60, Number.isFinite(doctorOnlineWindowSeconds) ? doctorOnlineWindowSeconds : 300) * 1000

function isDoctorRecentlyOnline(doctor = {}) {
  const nested = doctor.doctors || {}
  const rawOnline = Boolean(doctor.isOnline || doctor.is_online || nested.is_online)
  if (!rawOnline) return false
  const rawSeenAt = doctor.last_seen_at || doctor.updated_at || nested.last_seen_at || nested.updated_at
  if (!rawSeenAt) return false
  const seenAt = new Date(rawSeenAt).getTime()
  return Number.isFinite(seenAt) && Date.now() - seenAt <= DOCTOR_ONLINE_WINDOW_MS
}

async function queryKoraCharge(reference) {
  if (!KORA_SECRET_KEY) {
    return { ok: false, status: 'pending', payload: null, error: 'KORA_SECRET_KEY is not configured' }
  }

  try {
    const { data } = await axios.get(
      `${KORA_BASE_URL}/merchant/api/v1/charges/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${KORA_SECRET_KEY}` } }
    )
    return { ok: true, status: normalizeKoraStatus(data), payload: data }
  } catch (error) {
    return {
      ok: false,
      status: 'unknown',
      payload: error.response?.data || null,
      error: error.response?.data?.message || error.message,
    }
  }
}

function getKoraReferenceCandidates(reference, payload) {
  const data = payload?.data || {}
  return [
    reference,
    data.payment_reference,
    data.reference,
    data.transaction_reference,
    payload?.payment_reference,
    payload?.reference,
    payload?.transaction_reference,
  ].filter(Boolean).map((value) => String(value).trim()).filter(Boolean)
}

async function findPaymentByReference(referenceOrReferences) {
  const values = Array.isArray(referenceOrReferences) ? referenceOrReferences : [referenceOrReferences]
  const candidates = [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))]
  for (const candidate of candidates) {
    for (const column of ['reference', 'provider_reference', 'id']) {
      const { data, error } = await supabase.from('payments').select('*').eq(column, candidate).maybeSingle()
      if (!error && data) return data
    }
  }
  return null
}

function parsePaymentMetadata(payment) {
  if (!payment) return {}
  if (!payment.metadata) {
    const reference = String(payment.reference || payment.provider_reference || payment.id || '')
    const tokenMatch = reference.match(/^kora-token-(\d+)-(\d+)-/)
    const legacyMatch = reference.match(/^kora-token-(\d+)-/)
    return {
      patientId: payment.patient_id || '',
      tokensExpected: tokenMatch
        ? Number(tokenMatch[1])
        : Math.round(Number(payment.amount || 0) / Math.max(1, KORA_USD_EXCHANGE_RATE) * 10),
      koraAmount: payment.amount,
      koraCurrency: payment.currency,
      createdMs: tokenMatch ? Number(tokenMatch[2]) : legacyMatch ? Number(legacyMatch[1]) : null,
    }
  }
  if (typeof payment.metadata === 'string') {
    try {
      return JSON.parse(payment.metadata)
    } catch {
      return {}
    }
  }
  return payment.metadata
}

async function creditTokenPurchasePayment(payment, source = 'kora') {
  if (!payment) return { credited: false, tokens: null, reason: 'Payment not found' }
  if (['success', 'completed'].includes(String(payment.status || '').toLowerCase())) {
    const patientId = payment.patient_id || parsePaymentMetadata(payment).patientId
    const tokens = patientId ? await getPatientTokenBalance(patientId) : null
    return { credited: false, tokens, reason: 'Payment already credited' }
  }

  const metadata = parsePaymentMetadata(payment)
  const patientId = payment.patient_id || metadata.patientId
  const tokensExpected = Math.round(Number(metadata.tokensExpected || 0))
  if (!patientId || tokensExpected <= 0) {
    return { credited: false, tokens: null, reason: 'Payment metadata is incomplete' }
  }

  const tokens = await creditPatientTokens(patientId, tokensExpected, `Token purchase via ${source}`)
  await supabase.from('payments').update({ status: 'success' }).eq('id', payment.id)
  await recordTokenRevenueSplit(payment, metadata).catch((error) => console.warn('Token revenue split skipped:', error.message))
  return { credited: true, tokens, reason: 'Tokens credited' }
}

async function creditSubscriptionPayment(payment, source = 'kora') {
  if (!payment) return { credited: false, tokens: null, reason: 'Payment not found' }
  if (['success', 'completed'].includes(String(payment.status || '').toLowerCase())) {
    const patientId = payment.patient_id || parsePaymentMetadata(payment).patientId
    const tokens = patientId ? await getPatientTokenBalance(patientId) : null
    return { credited: false, tokens, reason: 'Subscription payment already credited' }
  }

  const metadata = parsePaymentMetadata(payment)
  const patientId = payment.patient_id || metadata.patientId
  const plan = String(metadata.plan || 'monthly')
  const tokensIncluded = Math.round(Number(metadata.tokensIncluded || 0))
  const amountUSD = Number(metadata.amountUSD || metadata.price || 0)
  if (!patientId || tokensIncluded <= 0 || !amountUSD) {
    return { credited: false, tokens: null, reason: 'Subscription metadata is incomplete' }
  }

  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('patient_id', patientId)
    .eq('status', 'active')
    .maybeSingle()
  if (!existing) {
    const now = new Date()
    const expiresAt = plan === 'monthly'
      ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : plan === 'yearly'
        ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const subscription = {
      id: generateId('sub'),
      patient_id: patientId,
      plan,
      amount_usd: amountUSD,
      price: amountUSD,
      tokens_included: tokensIncluded,
      status: 'active',
      started_at: now.toISOString(),
      created_at: now.toISOString(),
      expires_at: expiresAt,
    }
    const insert = await insertAdaptive('subscriptions', subscription)
    if (insert.error) return { credited: false, tokens: null, reason: insert.error.message }
  }

  const tokens = await creditPatientTokens(patientId, tokensIncluded, `Subscription payment via ${source}: ${plan} - ${tokensIncluded} tokens`)
  await supabase.from('payments').update({ status: 'success' }).eq('id', payment.id)
  return { credited: true, tokens, reason: 'Subscription activated and tokens credited' }
}

async function insertPaymentRecord(row) {
  const normalizedRow = {
    ...row,
    doctor_id: await resolvePaymentDoctorId(row.doctor_id),
  }
  const { error } = await supabase.from('payments').insert(normalizedRow)
  if (!error) return { error: null, mode: 'full' }
  if (!isMissingColumnError(error)) return { error, mode: 'full' }

  const fallback = {
    id: normalizedRow.id,
    patient_id: normalizedRow.patient_id,
    doctor_id: normalizedRow.doctor_id,
    amount: normalizedRow.amount,
    currency: normalizedRow.currency || 'NGN',
    type: normalizedRow.type || normalizedRow.payment_type || 'token_purchase',
    status: normalizedRow.status || 'pending',
    provider: normalizedRow.provider || normalizedRow.payment_provider || 'kora',
    reference: normalizedRow.reference || normalizedRow.provider_reference || normalizedRow.id,
    provider_reference: normalizedRow.reference || normalizedRow.provider_reference || normalizedRow.id,
    created_at: normalizedRow.created_at || new Date().toISOString(),
  }

  let candidate = { ...fallback }
  let lastError = null
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const retry = await supabase.from('payments').insert(candidate)
    if (!retry.error) return { error: null, mode: 'adaptive' }
    lastError = retry.error
    if (!isMissingColumnError(retry.error)) break
    const missingColumn = getMissingColumnName(retry.error)
    if (!missingColumn || !(missingColumn in candidate)) break
    const { [missingColumn]: _removed, ...nextCandidate } = candidate
    candidate = nextCandidate
  }
  return { error: lastError || error, mode: 'adaptive' }
}

async function insertAdaptive(table, rowOrRows) {
  const rows = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows]
  let candidate = rows.map((row) => ({ ...row }))
  let lastError = null

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const { error } = await supabase.from(table).insert(Array.isArray(rowOrRows) ? candidate : candidate[0])
    if (!error) return { error: null }
    lastError = error
    if (!isMissingColumnError(error)) break
    const missingColumn = getMissingColumnName(error)
    if (!missingColumn || !candidate.some((row) => missingColumn in row)) break
    candidate = candidate.map((row) => {
      const { [missingColumn]: _removed, ...nextRow } = row
      return nextRow
    })
  }

  return { error: lastError }
}

async function updateAdaptive(table, updates, applyFilter, options = {}) {
  let candidate = { ...updates }
  let lastError = null
  const select = options.select === undefined ? '*' : options.select
  const maybeSingle = options.maybeSingle !== false

  for (let attempt = 0; attempt < 12; attempt += 1) {
    let query = applyFilter(supabase.from(table).update(candidate))
    if (select) query = query.select(select)
    if (maybeSingle) query = query.maybeSingle()
    const { data, error } = await query
    if (!error) return { data, error: null }
    lastError = error
    if (!isMissingColumnError(error)) break
    const missingColumn = getMissingColumnName(error)
    if (!missingColumn || !(missingColumn in candidate)) break
    const { [missingColumn]: _removed, ...nextCandidate } = candidate
    candidate = nextCandidate
  }

  return { data: null, error: lastError }
}

async function insertOneReturningAdaptive(table, row) {
  let candidate = { ...row }
  let lastError = null
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const { data, error } = await supabase.from(table).insert(candidate).select('*').maybeSingle()
    if (!error) return { data, error: null }
    lastError = error
    if (!isMissingColumnError(error)) break
    const missingColumn = getMissingColumnName(error)
    if (!missingColumn || !(missingColumn in candidate)) break
    const { [missingColumn]: _removed, ...nextCandidate } = candidate
    candidate = nextCandidate
  }
  return { data: null, error: lastError }
}

function isIntegerSyntaxError(error) {
  const text = `${error?.code || ''} ${error?.message || ''} ${error?.details || ''}`.toLowerCase()
  return text.includes('22p02') || text.includes('invalid input syntax for type integer')
}

async function insertVitalParameterAdaptive(vital) {
  const attempts = [
    vital,
    Object.fromEntries(Object.entries(vital).filter(([key]) => key !== 'id')),
    Object.fromEntries(Object.entries(vital).filter(([key]) => key !== 'id' && key !== 'request_id')),
  ]
  let lastError = null

  for (const attempt of attempts) {
    const insert = await insertAdaptive('vital_parameters', attempt)
    if (!insert.error) return { error: null, row: attempt }
    lastError = insert.error
    if (!isIntegerSyntaxError(insert.error)) break
  }

  return { error: lastError, row: null }
}

async function resolvePaymentDoctorId(value) {
  const requested = String(value || '').trim()
  if (requested && requested !== 'system') return requested
  const { data } = await supabase.from('doctors').select('id').limit(1).maybeSingle()
  return data?.id ? String(data.id) : requested || 'system'
}

function isMissingColumnError(error) {
  const text = `${error?.code || ''} ${error?.message || ''} ${error?.details || ''}`.toLowerCase()
  return text.includes('schema cache') || text.includes('column')
}

function getMissingColumnName(error) {
  const text = `${error?.message || ''} ${error?.details || ''}`
  const quoted = text.match(/'([^']+)'\s+column/i)
  if (quoted?.[1]) return quoted[1]
  const named = text.match(/column\s+"?([a-zA-Z0-9_]+)"?\s+(?:does not exist|of)/i)
  return named?.[1] || ''
}

function withoutOptionalDoctorPayoutColumns(row) {
  const {
    bank_code,
    bank_account,
    currency,
    payout_method,
    mobile_money_operator,
    mobile_money_number,
    license_issuer,
    license_expiry,
    gender,
    profile_photo_url,
    ...safeRow
  } = row
  return safeRow
}

function sanitizePatientForResponse(patient) {
  if (!patient) return null
  const { password, portal_pin, ...rest } = patient
  const gender = patient.gender || patient.sex || ''
  const profilePhotoUrl = patient.profilePhotoUrl || patient.profile_photo_url || patient.avatar_url || ''
  return {
    ...rest,
    gender,
    sex: gender,
    profilePhotoUrl,
    profile_photo_url: profilePhotoUrl,
  }
}

function sanitizeDoctorForResponse(doctor) {
  if (!doctor) return null
  const { password, doctors, ...rest } = doctor
  const isOnline = isDoctorRecentlyOnline(doctor)
  const earningsTokens = Number(doctor.earningsTokens ?? doctor.earnings_tokens ?? doctors?.earnings_tokens ?? 0) || 0
  const gender = doctor.gender || doctor.sex || doctors?.gender || ''
  const profilePhotoUrl = doctor.profilePhotoUrl || doctor.profile_photo_url || doctors?.profile_photo_url || doctor.passportDataUrl || doctor.passport_data_url || doctors?.passport_data_url || ''
  const accountStatus = doctor.accountStatus || doctor.account_status || doctors?.account_status || 'active'
  const suspensionReason = doctor.suspensionReason || doctor.suspension_reason || doctors?.suspension_reason || ''
  return {
    ...rest,
    earningsTokens,
    earnings_tokens: earningsTokens,
    gender,
    sex: gender,
    profilePhotoUrl,
    profile_photo_url: profilePhotoUrl,
    bankCode: doctor.bankCode ?? doctor.bank_code ?? doctors?.bank_code ?? '',
    bankAccount: doctor.bankAccount ?? doctor.bank_account ?? doctors?.bank_account ?? '',
    payoutMethod: doctor.payoutMethod ?? doctor.payout_method ?? doctors?.payout_method ?? 'bank_account',
    mobileMoneyOperator: doctor.mobileMoneyOperator ?? doctor.mobile_money_operator ?? doctors?.mobile_money_operator ?? '',
    mobileMoneyNumber: doctor.mobileMoneyNumber ?? doctor.mobile_money_number ?? doctors?.mobile_money_number ?? '',
    currency: doctor.currency ?? doctors?.currency ?? '',
    isOnline,
    is_online: isOnline,
    accountStatus,
    account_status: accountStatus,
    suspensionReason,
    suspension_reason: suspensionReason,
    verified: Boolean(doctor.verified || doctors?.verified),
    license_verified: Boolean(doctor.license_verified || doctors?.license_verified),
    approval_status: (doctor.verified || doctors?.verified) ? 'approved' : 'pending_review',
  }
}

async function findPatientByIdentifier(identifier) {
  const raw = String(identifier || '').trim()
  if (!raw) return null
  const compact = raw.replace(/\s+/g, '')
  const normalized = compact.toUpperCase()
  const normalizedLoose = normalized.replace(/[^A-Z0-9-]/g, '')
  const noHyphen = normalizedLoose.replace(/-/g, '')

  const exact = await supabase.from('patients').select('*').eq('id', compact).maybeSingle()
  if (exact.data) return exact.data

  if (normalized !== compact) {
    const upper = await supabase.from('patients').select('*').eq('id', normalized).maybeSingle()
    if (upper.data) return upper.data
  }

  if (normalizedLoose && normalizedLoose !== compact && normalizedLoose !== normalized) {
    const loose = await supabase.from('patients').select('*').eq('id', normalizedLoose).maybeSingle()
    if (loose.data) return loose.data
  }

  if (noHyphen && noHyphen !== normalizedLoose) {
    const { data: candidates } = await supabase
      .from('patients')
      .select('*')
      .ilike('id', `%${noHyphen.slice(-8)}%`)
      .order('created_at', { ascending: false })
      .limit(20)
    const matched = (candidates || []).find((row) => String(row.id || '').toUpperCase().replace(/-/g, '') === noHyphen)
    if (matched) return matched
  }

  const fuzzy = await supabase.from('patients').select('*').ilike('id', `%${normalizedLoose || compact}%`).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (fuzzy.data) return fuzzy.data

  if (/^\d{6}$/.test(compact)) {
    const byPin = await supabase.from('patients').select('*').eq('portal_pin', compact).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (byPin.data) return byPin.data
  }

  return null
}

function normalizeDoctorPayload(body = {}) {
  return {
    email: String(body.email || '').trim().toLowerCase(),
    password: String(body.password || '').trim(),
    name: String(body.name || '').trim(),
    specialty: String(body.specialty || 'General Practitioner').trim(),
    location: String(body.location || '').trim(),
    languages: Array.isArray(body.languages)
      ? body.languages.filter(Boolean)
      : String(body.languages || 'English').split(',').map((item) => item.trim()).filter(Boolean),
    consultationFee: safeNumber(body.consultation_fee ?? body.fee) || 50,
    licenseNumber: String(body.licenseNumber || body.license_number || '').trim(),
    licenseIssuer: String(body.licenseIssuer || body.license_issuer || '').trim(),
    licenseExpiry: body.licenseExpiry || body.license_expiry || null,
    gender: String(body.gender || body.sex || '').trim(),
    profilePhotoUrl: String(body.profilePhotoUrl || body.profile_photo_url || '').trim(),
    signatureDataUrl: String(body.signatureDataUrl || body.signature_data_url || '').trim(),
    passportDataUrl: String(body.passportDataUrl || body.passport_data_url || '').trim(),
    bankCode: String(body.bankCode || body.bank_code || '').trim(),
    bankAccount: String(body.bankAccount || body.bank_account || '').trim(),
    currency: String(body.currency || '').trim(),
    payoutMethod: String(body.payoutMethod || body.payout_method || 'bank_account').trim(),
    mobileMoneyOperator: String(body.mobileMoneyOperator || body.mobile_money_operator || '').trim(),
    mobileMoneyNumber: String(body.mobileMoneyNumber || body.mobile_money_number || '').trim(),
  }
}

function getSmtpSettings() {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com'
  const isGmailSmtp = String(host).toLowerCase().includes('gmail.com')
  const user = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.MAIL_USER || process.env.GMAIL_USER || ''
  const rawPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || process.env.MAIL_PASS || process.env.GMAIL_APP_PASSWORD || ''
  const pass = isGmailSmtp ? String(rawPass).replace(/\s+/g, '') : String(rawPass)
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587)
  const secure = process.env.SMTP_SECURE !== undefined
    ? String(process.env.SMTP_SECURE).toLowerCase() === 'true'
    : port === 465
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || user
  const fromName = process.env.SMTP_FROM_NAME || 'GlobalDoc Connect'
  const warnings = []
  if (isGmailSmtp && pass && pass.length !== 16) {
    warnings.push('Gmail app passwords are normally 16 characters after spaces are removed. Generate a fresh Gmail App Password if login fails.')
  }
  return { user, pass, host, port, secure, from, fromName, warnings }
}

function describeSmtpError(error) {
  const message = String(error?.message || error || 'SMTP send failed')
  const code = error?.code ? ` (${error.code})` : ''
  const command = error?.command ? ` during ${error.command}` : ''
  if (/Invalid login|Username and Password not accepted|535/i.test(message)) {
    return `Gmail rejected the SMTP login${code}. Confirm the account has 2-Step Verification enabled and SMTP_PASS is a Gmail App Password.`
  }
  if (/self signed|certificate|tls/i.test(message)) {
    return `SMTP TLS/certificate error${code}: ${message}`
  }
  if (/timeout|timed out|ETIMEDOUT|ESOCKET/i.test(message)) {
    return `SMTP connection timed out${code}. Check SMTP_HOST, SMTP_PORT, SMTP_SECURE, and network access.`
  }
  return `${message}${code}${command}`
}

async function sendSmtpEmail({ to, subject, text, html }) {
  const settings = getSmtpSettings()
  if (!settings.user || !settings.pass || !to) {
    return {
      sent: false,
      reason: 'SMTP credentials or recipient email missing',
      configured: Boolean(settings.user && settings.pass),
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      warnings: settings.warnings,
    }
  }

  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: { user: settings.user, pass: settings.pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    tls: { servername: settings.host },
  })

  try {
    await transporter.verify()
    const info = await transporter.sendMail({
      from: `"${settings.fromName}" <${settings.from}>`,
      to,
      subject,
      text,
      html,
    })
    const rejected = Array.isArray(info.rejected) ? info.rejected : []
    if (rejected.length > 0) {
      return { sent: false, reason: `SMTP rejected: ${rejected.join(', ')}`, messageId: info.messageId || null, accepted: info.accepted || [] }
    }
    return { sent: true, messageId: info.messageId || null, accepted: info.accepted || [], response: info.response || null, warnings: settings.warnings }
  } catch (error) {
    return {
      sent: false,
      reason: describeSmtpError(error),
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      configured: true,
      warnings: settings.warnings,
    }
  }
}

async function sendDoctorApprovalEmail(doctor) {
  if (!doctor?.email) return { sent: false, reason: 'Doctor email missing' }
  const appUrl = normalizeAppBaseUrl(process.env.APP_BASE_URL || process.env.VITE_PUBLIC_APP_URL || process.env.VITE_API_BASE) || 'https://globaldoctorplatform.vercel.app'
  return sendSmtpEmail({
    to: doctor.email,
    subject: 'Your GlobalDoc Connect doctor account has been approved',
    text: [
      `Hello Dr. ${doctor.name || ''},`,
      '',
      'Your doctor account has been reviewed and approved.',
      `You can now sign in at ${appUrl}/doctor`,
      '',
      'GlobalDoc Connect',
    ].join('\n'),
  })
}

async function isPlatformAdminRequest(req) {
  const email = (req.headers['x-admin-email'] || '').trim()
  const password = (req.headers['x-admin-password'] || '').trim()
  if (!email || !password) return false
  const { data: admin } = await supabase.from('admins').select('*').eq('email', email).maybeSingle()
  if (!admin) return false
  const { data: ok, error } = await supabase.rpc('check_password', { pass: password, hashed: admin.password })
  if (error) return false
  return ok === true
}

async function getServerSettings() {
  const { data } = await supabase.from('server_settings').select('*')
  const settings = {}
  for (const row of data || []) {
    settings[row.key] = row.value
  }
  return {
    minimumSubscriptionUSD: Number(settings.minimumSubscriptionUSD) || 10,
    patientMinimumDepositUSD: Number(settings.patientMinimumDepositUSD) || 10,
    tokenPerUSDFirstPurchase: Number(settings.tokenPerUSDFirstPurchase) || 10,
    tokenPerUSDRepeatPurchase: Number(settings.tokenPerUSDRepeatPurchase) || 7.5,
    tokenToUSD: Number(settings.tokenToUSD) || 10,
    doctorMinimumWithdrawalUSD: Number(settings.doctorMinimumWithdrawalUSD) || 5,
    platformPaused: String(settings.platformPaused || 'false').toLowerCase() === 'true',
    platformPauseMessage: settings.platformPauseMessage || 'We are sorry, GlobalDoc is currently under review or update. Please try again shortly.',
  }
}

async function getPlatformPauseStatus() {
  const settings = await getServerSettings()
  return {
    paused: Boolean(settings.platformPaused),
    message: settings.platformPauseMessage,
  }
}

async function blockIfPlatformPaused(req, res) {
  const path = String(req.path || req.originalUrl || '')
  if (
    path === '/api/doctors/login' ||
    path === '/api/config' ||
    path === '/api/settings' ||
    path.startsWith('/api/admin/')
  ) {
    return false
  }
  if (await isPlatformAdminRequest(req)) return false
  const status = await getPlatformPauseStatus()
  if (!status.paused) return false
  res.status(503).json({
    error: status.message,
    platformPaused: true,
    message: status.message,
  })
  return true
}

async function getPatientTokenBalance(patientId) {
  const { data } = await supabase.from('patient_tokens').select('balance').eq('patient_id', patientId).maybeSingle()
  if (Number.isFinite(Number(data?.balance))) return Number(data.balance)
  const { data: patient } = await supabase.from('patients').select('tokens').eq('id', patientId).maybeSingle()
  const fallbackBalance = Number(patient?.tokens || 0) || 0
  if (patient) {
    await supabase
      .from('patient_tokens')
      .upsert({ patient_id: patientId, balance: fallbackBalance, updated_at: new Date().toISOString() }, { onConflict: 'patient_id' })
      .catch(() => null)
  }
  return fallbackBalance
}

async function deductPatientTokens(patientId, amount, description = '') {
  const tokens = Math.max(0, Math.round(Number(amount) || 0))
  const current = await getPatientTokenBalance(patientId)
  if (current < tokens) return false
  const newBalance = current - tokens
  await supabase
    .from('patient_tokens')
    .upsert({ patient_id: patientId, balance: newBalance, updated_at: new Date().toISOString() }, { onConflict: 'patient_id' })
  await supabase.from('patients').update({ tokens: newBalance }).eq('id', patientId)
  await supabase.from('token_transactions').insert({
    id: generateId('txn'),
    patient_id: patientId,
    transaction_type: 'use',
    amount: -tokens,
    description: description || `Deducted ${tokens} tokens`,
    created_at: new Date().toISOString()
  })
  return true
}

async function creditPatientTokens(patientId, amount, description = 'Token credit') {
  const current = await getPatientTokenBalance(patientId)
  const newBalance = current + amount
  await supabase
    .from('patient_tokens')
    .upsert({ patient_id: patientId, balance: newBalance, updated_at: new Date().toISOString() }, { onConflict: 'patient_id' })
  await supabase.from('patients').update({ tokens: newBalance }).eq('id', patientId)
  await supabase.from('token_transactions').insert({
    id: generateId('txn'),
    patient_id: patientId,
    transaction_type: 'purchase',
    amount,
    description,
    created_at: new Date().toISOString()
  })
  return newBalance
}

async function getDoctorProfile(id) {
  const { data } = await supabase.from('doctors').select('*').eq('id', id).maybeSingle()
  return data
}

async function updateDoctorEarnings(doctorId, tokens) {
  const { data: doctor } = await supabase.from('doctors').select('earnings_tokens').eq('id', doctorId).maybeSingle()
  const current = Number(doctor?.earnings_tokens) || 0
  const updated = Math.max(0, current + Number(tokens || 0))
  await supabase.from('doctors').update({ earnings_tokens: updated }).eq('id', doctorId)
  return updated
}

async function convertNgnToDoctorTokens(amountNgn) {
  const amount = Math.max(0, Number(amountNgn) || 0)
  if (amount <= 0) return 0
  const settings = await getServerSettings()
  const tokens = (amount / KORA_USD_EXCHANGE_RATE) * settings.tokenToUSD
  return Math.max(1, Math.round(tokens))
}

async function convertNgnToPatientTokens(amountNgn) {
  const amount = Math.max(0, Number(amountNgn) || 0)
  if (amount <= 0) return 0
  const settings = await getServerSettings()
  const tokens = (amount / KORA_USD_EXCHANGE_RATE) * settings.tokenToUSD
  return Math.max(1, Math.ceil(tokens))
}

async function chargePatientTokensForNgn({ patientId, amountNgn, description }) {
  const tokens = await convertNgnToPatientTokens(amountNgn)
  if (tokens <= 0) return { ok: true, tokens: 0, balance: await getPatientTokenBalance(patientId) }
  const balance = await getPatientTokenBalance(patientId)
  if (balance < tokens) return { ok: false, tokens, balance }
  const ok = await deductPatientTokens(patientId, tokens, description)
  if (!ok) return { ok: false, tokens, balance }
  return { ok: true, tokens, balance: balance - tokens }
}

async function reconcileDoctorEarnings(doctorId) {
  const doctor = await getDoctorProfile(doctorId)
  if (!doctor) return null

  const { data: consultations, error: consultError } = await supabase
    .from('consultations_ng')
    .select('*')
    .eq('doctor_id', String(doctorId))
    .order('created_at', { ascending: false })
    .limit(1000)
  if (consultError) throw consultError

  const consultationIds = (consultations || []).map((item) => item.id).filter(Boolean)
  let splits = []
  if (consultationIds.length) {
    const splitResult = await supabase.from('revenue_splits_ng').select('*').in('consultation_id', consultationIds)
    if (splitResult.error) throw splitResult.error
    splits = splitResult.data || []
  }

  const splitByConsultation = new Map()
  for (const split of splits) {
    if (!splitByConsultation.has(split.consultation_id)) splitByConsultation.set(split.consultation_id, split)
  }

  let doctorNgn = 0
  for (const consultation of consultations || []) {
    const recordedSplit = splitByConsultation.get(consultation.id)
    if (recordedSplit) {
      doctorNgn += Number(recordedSplit.doctor_ngn) || 0
      continue
    }
    if (consultation.status !== 'completed' && consultation.channel !== 'direct_home') continue
    const computedSplit = consultation.channel === 'direct_home'
      ? calculateConsultationSplitNgn({
          channel: consultation.channel,
          track: consultation.track,
          durationMin: consultation.duration_min,
        })
      : calculateFacilitySpecialtySplit({
          channel: consultation.channel,
          doctor,
          durationMin: consultation.duration_min,
        })
    doctorNgn += Number(computedSplit.doctor_ngn) || 0
  }

  const { data: payouts } = await supabase.from('payouts').select('*').eq('doctor_id', String(doctorId))
  const paidOutTokens = (payouts || []).reduce((sum, payout) => {
    const status = String(payout.status || 'pending').toLowerCase()
    if (['rejected', 'failed', 'cancelled', 'canceled'].includes(status)) return sum
    return sum + (Number(payout.amount_tokens ?? payout.tokens) || 0)
  }, 0)

  const earnedTokens = await convertNgnToDoctorTokens(doctorNgn)
  const expectedBalance = Math.max(0, earnedTokens - paidOutTokens)
  const currentBalance = Number(doctor.earnings_tokens) || 0
  const reconciledBalance = Math.max(currentBalance, expectedBalance)
  if (reconciledBalance !== currentBalance) {
    await supabase.from('doctors').update({ earnings_tokens: reconciledBalance }).eq('id', String(doctorId))
  }

  return {
    doctor: { ...doctor, earnings_tokens: reconciledBalance },
    consultations: consultations || [],
    revenueSplits: splits,
    doctorNgn,
    earnedTokens,
    paidOutTokens,
    earningsTokens: reconciledBalance,
  }
}

function getFacilityConsultationUnitNgn(doctor = {}) {
  const specialty = String(doctor.specialty || '').toLowerCase()
  if (!specialty || specialty.includes('general')) return 500
  if (['cardiology', 'neurology', 'oncology', 'orthopedics', 'obstetrics', 'gyn', 'urology', 'nephrology'].some((item) => specialty.includes(item))) {
    return 1500
  }
  return 1000
}

function calculateFacilitySpecialtySplit({ channel, doctor, durationMin }) {
  const blocks = Math.max(1, Math.ceil((Number(durationMin) || 15) / 15))
  const unit = getFacilityConsultationUnitNgn(doctor)
  const total = unit * blocks
  const doctorShare = Math.round(total * 0.5)
  const facilityShare = Math.round(total * 0.25)
  const dataFee = Math.round(total * 0.05)
  const platformShare = total - doctorShare - facilityShare - dataFee

  return {
    channel,
    track: doctor?.specialty || 'facility_specialty',
    durationMin: Math.max(1, Math.round(Number(durationMin) || 15)),
    blocks,
    total_ngn: total,
    patient_copay_ngn: total,
    facility_topup_ngn: 0,
    doctor_ngn: doctorShare,
    facility_ngn: facilityShare,
    platform_ngn: platformShare,
    data_fee_ngn: dataFee,
  }
}

function normalizeSplitForAvailableFacility(split, facilityId) {
  if (facilityId || !split?.facility_ngn) return split
  return {
    ...split,
    platform_ngn: (Number(split.platform_ngn) || 0) + (Number(split.facility_ngn) || 0),
    facility_ngn: 0,
  }
}

async function recordConsultationFinancials({
  consultationId,
  patientId,
  doctorId,
  facilityId,
  split,
  source,
  chargePatient = true,
  debitFacilityTopup = false,
}) {
  const normalizedSplit = normalizeSplitForAvailableFacility(split, facilityId)
  const { data: existingSplit } = await supabase
    .from('revenue_splits_ng')
    .select('*')
    .eq('consultation_id', consultationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingSplit) return { ok: true, split: existingSplit, tokensCharged: 0, existing: true }

  if (debitFacilityTopup && facilityId && normalizedSplit.facility_topup_ngn > 0) {
    const wallet = await getOrCreateFacilityWallet(facilityId)
    if ((Number(wallet?.balance_ngn) || 0) < normalizedSplit.facility_topup_ngn) {
      return {
        ok: false,
        error: 'PHC wallet insufficient balance for topup',
        balance_ngn: Number(wallet?.balance_ngn) || 0,
        required_ngn: normalizedSplit.facility_topup_ngn,
      }
    }
  }

  let tokensCharged = 0
  const patientChargeNgn = Number(normalizedSplit.patient_copay_ngn || normalizedSplit.total_ngn || 0)
  let requiredPatientTokens = 0
  if (chargePatient && patientId && patientChargeNgn > 0) {
    requiredPatientTokens = await convertNgnToPatientTokens(patientChargeNgn)
    const balance = await getPatientTokenBalance(patientId)
    if (balance < requiredPatientTokens) {
      return {
        ok: false,
        error: `Insufficient tokens. Required ${requiredPatientTokens} tokens for this referral/consultation.`,
        requiredTokens: requiredPatientTokens,
        balanceTokens: balance,
      }
    }
    const charge = await chargePatientTokensForNgn({
      patientId,
      amountNgn: patientChargeNgn,
      description: `${source || 'Consultation'} charge: ${patientChargeNgn} NGN equivalent`,
    })
    if (!charge.ok) {
      return {
        ok: false,
        error: `Insufficient tokens. Required ${charge.tokens} tokens for this referral/consultation.`,
        requiredTokens: charge.tokens,
        balanceTokens: charge.balance,
      }
    }
    tokensCharged = charge.tokens
  }

  if (debitFacilityTopup && facilityId && normalizedSplit.facility_topup_ngn > 0) {
    const debitResult = await debitFacilityWallet(facilityId, normalizedSplit.facility_topup_ngn, {
      reason: 'PHC consult topup funding',
      ref_type: 'consultation',
      ref_id: consultationId,
    })
    if (!debitResult.ok) {
      if (tokensCharged > 0 && patientId) await creditPatientTokens(patientId, tokensCharged, 'Automatic refund: facility top-up could not be completed')
      return {
        ok: false,
        error: 'PHC wallet insufficient balance for topup',
        balance_ngn: debitResult.balance_ngn,
        required_ngn: debitResult.required_ngn,
      }
    }
  }

  if (facilityId && normalizedSplit.facility_ngn > 0) {
    await creditFacilityWallet(facilityId, normalizedSplit.facility_ngn, {
      reason: source === 'specialty_referral' ? 'Facility share from specialty referral consultation' : 'Facility share from consultation',
      ref_type: 'consultation',
      ref_id: consultationId,
    })
  }

  if (doctorId && normalizedSplit.doctor_ngn > 0) {
    await updateDoctorEarnings(doctorId, await convertNgnToDoctorTokens(normalizedSplit.doctor_ngn))
  }

  await updatePlatformBalance(normalizedSplit.platform_ngn || 0, normalizedSplit.data_fee_ngn || 0)

  const revenueSplit = {
    id: generateId('rsng'),
    consultation_id: consultationId,
    channel: normalizedSplit.channel,
    track: normalizedSplit.track,
    total_ngn: normalizedSplit.total_ngn,
    doctor_ngn: normalizedSplit.doctor_ngn,
    platform_ngn: normalizedSplit.platform_ngn,
    facility_ngn: normalizedSplit.facility_ngn || 0,
    data_fee_ngn: normalizedSplit.data_fee_ngn || 0,
    patient_copay_ngn: normalizedSplit.patient_copay_ngn || 0,
    facility_topup_ngn: normalizedSplit.facility_topup_ngn || 0,
    created_at: new Date().toISOString(),
  }
  await insertAdaptive('revenue_splits_ng', revenueSplit)
  await updateAdaptive('consultations_ng', {
    total_ngn: normalizedSplit.total_ngn,
    blocks: normalizedSplit.blocks,
    duration_min: normalizedSplit.durationMin,
    patient_tokens_charged: tokensCharged,
  }, (query) => query.eq('id', consultationId), { select: null, maybeSingle: false })

  return { ok: true, split: revenueSplit, tokensCharged, existing: false }
}

async function recordTokenRevenueSplit(payment, metadata = {}) {
  const amountUsd = Number(metadata.amountUSD || metadata.amount_usd || 0)
  const amountNgn = Number(payment?.amount || 0)
  const baseAmount = amountNgn > 0 ? amountNgn : Math.round(amountUsd * KORA_USD_EXCHANGE_RATE)
  if (!baseAmount) return
  await insertAdaptive('token_revenue_splits', {
    id: generateId('trsplit'),
    payment_id: payment.id,
    patient_id: payment.patient_id || metadata.patientId || null,
    amount_ngn: baseAmount,
    doctors_pool_ngn: Math.round(baseAmount * 0.5),
    admin_ngn: Math.round(baseAmount * 0.4),
    company_ngn: baseAmount - Math.round(baseAmount * 0.5) - Math.round(baseAmount * 0.4),
    status: 'pending_distribution',
    metadata: {
      source: 'token_purchase',
      rule: '50% doctors by specialty/time, 40% admin, 10% company',
      tokensExpected: metadata.tokensExpected || null,
    },
    created_at: new Date().toISOString(),
  })
}

async function getFacilityById(facilityId) {
  const { data } = await supabase.from('facilities').select('*').eq('id', facilityId).maybeSingle()
  return data
}

async function getOrCreateFacilityWallet(facilityId) {
  let { data: wallet } = await supabase.from('facility_wallets').select('*').eq('facility_id', facilityId).maybeSingle()
  if (!wallet) {
    wallet = { facility_id: facilityId, balance_ngn: 0, updated_at: new Date().toISOString() }
    await supabase.from('facility_wallets').insert(wallet)
  }
  return wallet
}

async function recordFacilityWalletTx({ facilityId, direction, amountNgn, reason, ref_type, ref_id, meta }) {
  const amount = Math.max(0, Math.round(Number(amountNgn) || 0))
  await supabase.from('facility_wallet_tx').insert({
    id: generateId('fwtx'),
    facility_id: facilityId,
    direction,
    amount_ngn: amount,
    reason: reason || null,
    ref_type: ref_type || null,
    ref_id: ref_id || null,
    meta: meta || null,
    created_at: new Date().toISOString()
  })
}

async function creditFacilityWallet(facilityId, amountNgn, details = {}) {
  const wallet = await getOrCreateFacilityWallet(facilityId)
  const amount = Math.max(0, Math.round(Number(amountNgn) || 0))
  const newBalance = wallet.balance_ngn + amount
  await supabase.from('facility_wallets').update({ balance_ngn: newBalance, updated_at: new Date().toISOString() }).eq('facility_id', facilityId)
  await recordFacilityWalletTx({ facilityId, direction: 'credit', amountNgn: amount, ...details })
  return newBalance
}

async function debitFacilityWallet(facilityId, amountNgn, details = {}) {
  const wallet = await getOrCreateFacilityWallet(facilityId)
  const amount = Math.max(0, Math.round(Number(amountNgn) || 0))
  if (wallet.balance_ngn < amount) {
    return { ok: false, balance_ngn: wallet.balance_ngn, required_ngn: amount }
  }
  const newBalance = wallet.balance_ngn - amount
  await supabase.from('facility_wallets').update({ balance_ngn: newBalance, updated_at: new Date().toISOString() }).eq('facility_id', facilityId)
  await recordFacilityWalletTx({ facilityId, direction: 'debit', amountNgn: amount, ...details })
  return { ok: true, balance_ngn: newBalance }
}

async function getPlatformBalances() {
  const { data } = await supabase.from('platform_balances').select('*').eq('id', 1).maybeSingle()
  return {
    platformBalanceNgn: data?.platform_balance_ngn || 0,
    dataFundBalanceNgn: data?.data_fund_balance_ngn || 0,
  }
}

async function updatePlatformBalance(platformDelta, dataDelta) {
  const current = await getPlatformBalances()
  await supabase.from('platform_balances').upsert({
    id: 1,
    platform_balance_ngn: Math.max(0, current.platformBalanceNgn + (platformDelta || 0)),
    data_fund_balance_ngn: Math.max(0, current.dataFundBalanceNgn + (dataDelta || 0))
  }, { onConflict: 'id' })
}

async function recordAuditLog(req, entry = {}) {
  try {
    await supabase.from('audit_logs').insert({
      id: generateId('audit'),
      user_id: entry.userId || req.headers['x-admin-email'] || entry.senderId || 'system',
      user_type: entry.userType || (req.headers['x-admin-email'] ? 'admin' : 'system'),
      action: entry.action || 'unknown',
      resource_type: entry.resourceType || 'system',
      resource_id: entry.resourceId || null,
      ip_address: req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.ip || null,
      user_agent: req.headers['user-agent'] || null,
      changes: entry.changes || null,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.warn('Audit log write failed:', error.message)
  }
}

// ---------- HEALTH ----------
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// ---------- DEBUG ----------
app.get('/api/debug', async (req, res) => {
  const tables = ['admins', 'doctors_auth', 'doctors', 'patients', 'patient_tokens', 'facilities', 'consultations_ng']
  const results = {}
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
    results[table] = error ? `❌ ${error.message}` : `✅ ${data?.count ?? 0} rows`
  }
  const { error: fnError } = await supabase.rpc('check_password', { pass: 'x', hashed: 'x' })
  res.json({
    supabase_url: supabaseUrl,
    service_role_configured: Boolean(supabaseServiceKey),
    tables: results,
    check_password: fnError ? 'MISSING' : 'OK',
    env: { KORA: Boolean(KORA_SECRET_KEY), AGORA: Boolean(AGORA_APP_ID) }
  })
})

// ---------- CONFIG ----------
app.get('/api/config', async (req, res) => {
  const platform = await getPlatformPauseStatus()
  res.json({
    status: 'ok',
    origin: getApiOrigin(req),
    platform,
    configured: {
      kora: Boolean(KORA_SECRET_KEY),
      agora: Boolean(AGORA_APP_ID && AGORA_APP_CERTIFICATE),
      turn: VIDEO_TURN_URLS.length > 0 && Boolean(VIDEO_TURN_USERNAME && VIDEO_TURN_CREDENTIAL),
      adminEnv: Boolean(process.env.ADMIN_EMAIL || process.env.ADMIN_PASSWORD),
    },
  })
})

app.get('/api/video/ice-servers', (_req, res) => {
  res.json({
    iceServers: buildVideoIceServers(),
    turnConfigured: VIDEO_TURN_URLS.length > 0 && Boolean(VIDEO_TURN_USERNAME && VIDEO_TURN_CREDENTIAL),
  })
})

// ---------- ADMIN LOGIN ----------
app.post('/api/doctors/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

  try {
    // Admin check
    const { data: admin, error: adminError } = await supabase.from('admins').select('*').eq('email', email).maybeSingle()
    if (adminError) return res.status(500).json({ error: 'Database error (admins): ' + adminError.message })

    if (admin) {
      const { data: ok, error: rpcError } = await supabase.rpc('check_password', { pass: password, hashed: admin.password })
      if (rpcError) return res.status(500).json({ error: 'check_password function error: ' + rpcError.message })
      if (ok) {
        return res.json({ admin: { email: admin.email, name: admin.name, role: 'admin' }, message: 'Admin login successful' })
      }
    }

    if (await blockIfPlatformPaused(req, res)) return

    // Doctor check
    const { data: doctor, error: docError } = await supabase.from('doctors_auth').select('*').eq('email', email).maybeSingle()
    if (docError) return res.status(500).json({ error: 'Database error (doctors_auth): ' + docError.message })
    if (!doctor) return res.status(401).json({ error: 'Invalid credentials' })
    const { data: passwordOk, error: passwordError } = await supabase.rpc('check_password', { pass: password, hashed: doctor.password || '' })
    if (passwordError) return res.status(500).json({ error: 'check_password function error: ' + passwordError.message })
    if (!passwordOk) return res.status(401).json({ error: 'Invalid credentials' })
    if (!doctor.verified) {
      return res.status(403).json({
        error: 'Your doctor account is pending platform admin approval. You will receive an email when access is granted.',
        pendingApproval: true,
      })
    }

    const { data: profile } = await supabase.from('doctors').select('*').eq('id', String(doctor.id)).maybeSingle()
    const accountStatus = profile?.account_status || doctor.account_status || 'active'
    if (accountStatus === 'paused' || accountStatus === 'stopped') {
      return res.status(403).json({
        error: profile?.suspension_reason || doctor.suspension_reason || 'Your doctor account is paused by platform admin. Please answer the query or update your profile before access is restored.',
        doctor: sanitizeDoctorForResponse({ ...profile, ...doctor, id: String(doctor.id), is_online: false }),
        accountPaused: true,
      })
    }
    const onlineAt = new Date().toISOString()
    await supabase.from('doctors').update({ is_online: true, verified: true, license_verified: true, updated_at: onlineAt }).eq('id', String(doctor.id))
    res.json({ doctor: sanitizeDoctorForResponse({ ...profile, ...doctor, id: String(doctor.id), verified: true, license_verified: true, is_online: true, updated_at: onlineAt }), message: 'Login successful' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ---------- DOCTOR REGISTRATION ----------
app.post('/api/doctors/register', async (req, res) => {
  if (await blockIfPlatformPaused(req, res)) return
  const payload = normalizeDoctorPayload(req.body)
  if (!payload.email || !payload.name || !payload.specialty || !payload.location || !payload.licenseNumber || !payload.signatureDataUrl || !payload.passportDataUrl) {
    return res.status(400).json({ error: 'Email, name, specialty, country, license number, signature, and passport photo are required' })
  }

  const { data: existing } = await supabase.from('doctors_auth').select('id').eq('email', payload.email).maybeSingle()
  if (existing) return res.status(409).json({ error: 'Doctor already exists' })

  const newDoctor = {
    email: payload.email,
    password: payload.password,
    name: payload.name,
    specialty: payload.specialty,
    location: payload.location,
    license_number: payload.licenseNumber,
    signature_data_url: payload.signatureDataUrl || null,
    passport_data_url: payload.passportDataUrl || null,
    gender: payload.gender || null,
    profile_photo_url: payload.profilePhotoUrl || payload.passportDataUrl || null,
    account_status: 'active',
    suspension_reason: null,
    verified: false, created_at: new Date().toISOString()
  }
  const { data: authRow, error: authInsertError } = await insertOneReturningAdaptive('doctors_auth', newDoctor)
  if (authInsertError) return res.status(500).json({ error: authInsertError.message })

  const profileId = String(authRow.id)

  const profile = {
    id: profileId, name: payload.name, specialty: payload.specialty, location: payload.location,
    languages: ['English'], rating: 0, rating_count: 0,
    availability: 'Available upon request', verified: false, is_online: false,
    fee: payload.consultationFee, price: { basic: 50, premium: 100 },
    license_verified: false,
    license_number: payload.licenseNumber,
    license_issuer: payload.licenseIssuer || null,
    license_expiry: payload.licenseExpiry || null,
    bank_code: payload.bankCode || null,
    bank_account: payload.bankAccount || null,
    currency: payload.currency || null,
    payout_method: payload.payoutMethod,
    mobile_money_operator: payload.mobileMoneyOperator || null,
    mobile_money_number: payload.mobileMoneyNumber || null,
    signature_data_url: payload.signatureDataUrl || null,
    passport_data_url: payload.passportDataUrl || null,
    gender: payload.gender || null,
    profile_photo_url: payload.profilePhotoUrl || payload.passportDataUrl || null,
    account_status: 'active',
    suspension_reason: null,
    created_at: new Date().toISOString()
  }
  const { error: profileInsertError } = await insertAdaptive('doctors', profile)
  if (profileInsertError) return res.status(500).json({ error: profileInsertError.message })

  res.status(201).json({
    doctor: sanitizeDoctorForResponse({ ...profile, ...authRow }),
    pendingApproval: true,
    message: 'Registration submitted. A platform admin must review and approve your account before you can sign in.'
  })
})

// ---------- OAUTH BRIDGE ----------
app.post('/api/auth/oauth/bridge', async (req, res) => {
  if (await blockIfPlatformPaused(req, res)) return
  const {
    email,
    name,
    role,
    dateOfBirth,
    phone,
    country,
    language,
    gender,
    profilePhotoUrl,
    specialty,
    location,
    licenseNumber,
  } = req.body
  if (!email || !role) return res.status(400).json({ error: 'email and role required' })

  try {
    if (role === 'patient') {
      const patientEmail = email.toLowerCase()
      const patientProfile = {
        email: patientEmail,
        password: '',
        name: name || patientEmail.split('@')[0],
        date_of_birth: dateOfBirth || null,
        phone: phone || '',
        country: country || 'NG',
        language: language || 'English',
        gender: gender || req.body.sex || '',
        profile_photo_url: profilePhotoUrl || req.body.profile_photo_url || '',
        is_online: true,
      }
      let { data: patient, error: patientLookupError } = await supabase.from('patients').select('*').eq('email', patientEmail).maybeSingle()
      if (patientLookupError) return res.status(500).json({ error: 'Failed to load patient: ' + patientLookupError.message })
      if (!patient) {
        const id = generateReadablePatientId('HRN')
        const newPatient = {
          id,
          ...patientProfile,
          tokens: 0,
          created_at: new Date().toISOString()
        }
        const { error: insertErr } = await insertAdaptive('patients', newPatient)
        if (insertErr) return res.status(500).json({ error: 'Failed to create patient: ' + insertErr.message })
        await supabase.from('patient_tokens').upsert({ patient_id: id, balance: 0 }, { onConflict: 'patient_id' })
        await recordAuditLog(req, {
          userId: id,
          userType: 'patient',
          action: 'patient.oauth.create',
          resourceType: 'patient',
          resourceId: id,
          changes: { email: patientEmail },
        })
        return res.json({ patient: sanitizePatientForResponse(newPatient), message: 'Patient session ready' })
      }
      const { data: updatedPatient, error: updateErr } = await updateAdaptive('patients', patientProfile, (query) => query.eq('id', patient.id))
      if (updateErr) return res.status(500).json({ error: 'Failed to update patient: ' + updateErr.message })
      await supabase.from('patient_tokens').upsert({ patient_id: patient.id, balance: 0 }, { onConflict: 'patient_id', ignoreDuplicates: true })
      await recordAuditLog(req, {
        userId: patient.id,
        userType: 'patient',
        action: 'patient.oauth.login',
        resourceType: 'patient',
        resourceId: patient.id,
        changes: { email: patientEmail },
      })
      return res.json({ patient: sanitizePatientForResponse(updatedPatient || patient), message: 'Patient session ready' })
    }

    // Doctor
    const doctorEmail = email.toLowerCase()
    const signatureDataUrl = req.body.signatureDataUrl || req.body.signature_data_url || ''
    const passportDataUrl = req.body.passportDataUrl || req.body.passport_data_url || ''
    const doctorGender = req.body.gender || req.body.sex || ''
    const doctorProfilePhotoUrl = req.body.profilePhotoUrl || req.body.profile_photo_url || passportDataUrl || ''
    const hasDoctorProfileDetails = Boolean(specialty && location && licenseNumber && signatureDataUrl && passportDataUrl)
    const doctorProfile = {
      email: doctorEmail,
      password: '',
      name: name || doctorEmail.split('@')[0],
      specialty: specialty || 'General Practitioner',
      location: location || country || 'Nigeria',
      license_number: licenseNumber || 'PENDING',
      license_issuer: req.body.licenseIssuer || req.body.license_issuer || null,
      license_expiry: req.body.licenseExpiry || req.body.license_expiry || null,
      signature_data_url: signatureDataUrl || null,
      passport_data_url: passportDataUrl || null,
      gender: doctorGender || null,
      profile_photo_url: doctorProfilePhotoUrl || null,
    }
    let { data: doctor, error: doctorLookupError } = await supabase.from('doctors_auth').select('*').eq('email', doctorEmail).maybeSingle()
    if (doctorLookupError) return res.status(500).json({ error: 'Failed to load doctor: ' + doctorLookupError.message })
    if (!doctor) {
      if (!hasDoctorProfileDetails) {
        return res.status(428).json({
          profileRequired: true,
          message: 'Complete your doctor profile before submitting for admin approval.',
        })
      }
      const newDoc = { ...doctorProfile, verified: false, created_at: new Date().toISOString() }
      newDoc.account_status = 'active'
      newDoc.suspension_reason = null
      const { data: insertedDoctor, error: insertDocErr } = await insertOneReturningAdaptive('doctors_auth', newDoc)
      if (insertDocErr) return res.status(500).json({ error: 'Failed to create doctor auth: ' + insertDocErr.message })
      const profileId = String(insertedDoctor.id)

      const { error: insertProfErr } = await insertAdaptive('doctors', {
        id: profileId,
        name: insertedDoctor.name,
        specialty: insertedDoctor.specialty,
        location: insertedDoctor.location,
        languages: ['English'],
        rating: 0,
        rating_count: 0,
        is_online: false,
        fee: 35,
        price: { basic: 50, premium: 100 },
        license_verified: false,
        license_number: insertedDoctor.license_number,
        license_issuer: doctorProfile.license_issuer,
        license_expiry: doctorProfile.license_expiry,
        signature_data_url: insertedDoctor.signature_data_url || null,
        passport_data_url: insertedDoctor.passport_data_url || null,
        gender: doctorProfile.gender || null,
        profile_photo_url: doctorProfile.profile_photo_url || insertedDoctor.passport_data_url || null,
        account_status: 'active',
        suspension_reason: null,
        created_at: new Date().toISOString()
      })
      if (insertProfErr) return res.status(500).json({ error: 'Failed to create doctor profile: ' + insertProfErr.message })

      return res.status(403).json({
        doctor: sanitizeDoctorForResponse({ ...insertedDoctor, id: profileId }),
        pendingApproval: true,
        message: 'Doctor profile submitted. A platform admin must approve your account before dashboard access is enabled.'
      })
    } else {
      const profileId = String(doctor.id)
      const { data: profile } = await supabase.from('doctors').select('*').eq('id', profileId).maybeSingle()
      const accountStatus = profile?.account_status || doctor.account_status || 'active'
      if (accountStatus === 'paused' || accountStatus === 'stopped') {
        return res.status(403).json({
          doctor: sanitizeDoctorForResponse({ ...profile, ...doctor, id: profileId, is_online: false }),
          accountPaused: true,
          message: profile?.suspension_reason || doctor.suspension_reason || 'Your doctor account is paused by platform admin. Please answer the query or update your profile before access is restored.',
          error: profile?.suspension_reason || doctor.suspension_reason || 'Your doctor account is paused by platform admin.',
        })
      }
      if (!hasDoctorProfileDetails) {
        if (!doctor.verified) {
          return res.status(403).json({
            doctor: sanitizeDoctorForResponse({ ...profile, ...doctor, id: profileId }),
            pendingApproval: true,
            message: 'Your doctor account is waiting for platform admin approval.',
          })
        }
        const onlineAt = new Date().toISOString()
        if (profile) await supabase.from('doctors').update({ is_online: true, verified: true, license_verified: true, updated_at: onlineAt }).eq('id', profileId)
        return res.json({
          doctor: sanitizeDoctorForResponse({ ...profile, ...doctor, id: profileId, verified: true, license_verified: true, is_online: true, updated_at: onlineAt }),
          message: 'Doctor session ready',
        })
      }
      const doctorAuthUpdates = { ...doctorProfile }
      delete doctorAuthUpdates.password
      const { data: updatedDoctor, error: updateDocErr } = await updateAdaptive('doctors_auth', doctorAuthUpdates, (query) => query.eq('id', doctor.id))
      if (updateDocErr) return res.status(500).json({ error: 'Failed to update doctor auth: ' + updateDocErr.message })
      const { data: existingDoctorProfile } = await supabase.from('doctors').select('id').eq('id', profileId).maybeSingle()
      if (existingDoctorProfile) {
        await updateAdaptive('doctors', {
          name: doctorProfile.name,
          specialty: doctorProfile.specialty,
          location: doctorProfile.location,
          is_online: doctor.verified ? true : false,
          updated_at: new Date().toISOString(),
          license_number: doctorProfile.license_number,
          license_issuer: doctorProfile.license_issuer,
          license_expiry: doctorProfile.license_expiry,
          signature_data_url: doctorProfile.signature_data_url,
          passport_data_url: doctorProfile.passport_data_url,
          gender: doctorProfile.gender || null,
          profile_photo_url: doctorProfile.profile_photo_url || doctorProfile.passport_data_url || null,
        }, (query) => query.eq('id', profileId), { select: null, maybeSingle: false })
      } else {
        await insertAdaptive('doctors', {
          id: profileId,
          name: doctorProfile.name,
          specialty: doctorProfile.specialty,
          location: doctorProfile.location,
          languages: ['English'],
          rating: 0,
          rating_count: 0,
          is_online: false,
          fee: 35,
          price: { basic: 50, premium: 100 },
          license_verified: false,
          license_number: doctorProfile.license_number,
          license_issuer: doctorProfile.license_issuer,
          license_expiry: doctorProfile.license_expiry,
          signature_data_url: doctorProfile.signature_data_url,
          passport_data_url: doctorProfile.passport_data_url,
          gender: doctorProfile.gender || null,
          profile_photo_url: doctorProfile.profile_photo_url || doctorProfile.passport_data_url || null,
          account_status: 'active',
          suspension_reason: null,
          created_at: new Date().toISOString(),
        })
      }
      const doc = updatedDoctor || doctor
      if (!doc.verified) {
        return res.status(403).json({
          doctor: sanitizeDoctorForResponse(doc),
          pendingApproval: true,
          message: 'Doctor profile updated and is waiting for platform admin approval.'
        })
      }
      return res.json({ doctor: sanitizeDoctorForResponse(doc), message: 'Doctor session ready' })
    }
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ---------- PATIENT AUTH (email) – lowercased ----------
app.post('/api/patients/register', async (req, res) => {
  if (await blockIfPlatformPaused(req, res)) return
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  const name = String(req.body.name || '')
  const dateOfBirth = req.body.dateOfBirth || ''
  const phone = String(req.body.phone || '')
  const country = String(req.body.country || '')
  const language = String(req.body.language || 'English')
  const gender = String(req.body.gender || req.body.sex || '').trim()
  const profilePhotoUrl = String(req.body.profilePhotoUrl || req.body.profile_photo_url || '').trim()

  if (!email || !password || !name || !dateOfBirth || !phone || !country) {
    return res.status(400).json({ error: 'All required fields must be provided' })
  }

  const { data: existing } = await supabase.from('patients').select('*').eq('email', email).maybeSingle()
  if (existing) {
    const updatedPatient = {
      ...existing,
      email,
      password,
      name,
      date_of_birth: dateOfBirth,
      phone,
      country,
      language: language || existing.language || 'English',
      gender,
      profile_photo_url: profilePhotoUrl,
      is_online: true,
    }
    const { data: savedPatient, error: updateError } = await updateAdaptive('patients', {
        password,
        name,
        date_of_birth: dateOfBirth,
        phone,
        country,
        language: updatedPatient.language,
        gender,
        profile_photo_url: profilePhotoUrl,
        is_online: true,
      }, (query) => query.eq('id', existing.id))
    if (updateError) return res.status(500).json({ error: updateError.message })
    const { data: existingTokenRow } = await supabase
      .from('patient_tokens')
      .select('patient_id')
      .eq('patient_id', existing.id)
      .maybeSingle()
    if (!existingTokenRow) {
      await supabase.from('patient_tokens').insert({ patient_id: existing.id, balance: Number(existing.tokens || 0) })
    }
    await recordAuditLog(req, {
      userId: existing.id,
      userType: 'patient',
      action: 'patient.profile.update',
      resourceType: 'patient',
      resourceId: existing.id,
      changes: { email, source: 'email' },
    })
    return res.status(200).json({
      patient: sanitizePatientForResponse(savedPatient || updatedPatient),
      message: 'Patient profile updated and signed in',
    })
  }

  const id = generateReadablePatientId('HRN')
  const newPatient = {
    id, email, password, name, date_of_birth: dateOfBirth,
    phone, country, language: language || 'English',
    gender, profile_photo_url: profilePhotoUrl,
    tokens: 0, is_online: true, created_at: new Date().toISOString()
  }
  const { error: patientInsertError } = await insertAdaptive('patients', newPatient)
  if (patientInsertError) return res.status(500).json({ error: patientInsertError.message })
  await supabase.from('patient_tokens').upsert({ patient_id: id, balance: 0 }, { onConflict: 'patient_id' })
  await recordAuditLog(req, {
    userId: id,
    userType: 'patient',
    action: 'patient.register',
    resourceType: 'patient',
    resourceId: id,
    changes: { email, source: 'email' },
  })

  res.status(201).json({ patient: sanitizePatientForResponse(newPatient), message: 'Registration successful' })
})

app.post('/api/patients/login', async (req, res) => {
  if (await blockIfPlatformPaused(req, res)) return
  const emailOrPatientId = String(req.body.email || req.body.patientId || '').trim()
  const email = emailOrPatientId.toLowerCase()
  const password = String(req.body.password || '')

  if (!emailOrPatientId || !password) return res.status(400).json({ error: 'Email/PID and password/PIN are required' })

  let patient = null
  if (/^\d{6}$/.test(password) || emailOrPatientId.toUpperCase().startsWith('PID-')) {
    const byIdentifier = await findPatientByIdentifier(emailOrPatientId)
    if (byIdentifier?.portal_pin === password) patient = byIdentifier
  }

  if (!patient && email.includes('@')) {
    const { data: patientByEmail } = await supabase.from('patients').select('*').eq('email', email).maybeSingle()
    if (patientByEmail) {
      const { data: passwordOk, error: passwordError } = await supabase.rpc('check_password', { pass: password, hashed: patientByEmail.password || '' })
      if (passwordError) return res.status(500).json({ error: 'check_password function error: ' + passwordError.message })
      if (passwordOk) patient = patientByEmail
    }
  }

  if (!patient) return res.status(401).json({ error: 'Invalid credentials. Facility-created patients should use their PID and 6-digit PIN.' })

  await supabase.from('patients').update({ is_online: true }).eq('id', patient.id)
  await recordAuditLog(req, {
    userId: patient.id,
    userType: 'patient',
    action: 'patient.login',
    resourceType: 'patient',
    resourceId: patient.id,
  })
  res.json({ patient: sanitizePatientForResponse(patient), message: 'Login successful' })
})

// ---------- FACILITY PATIENT AUTH ----------
app.post('/api/patients/facility/register', async (req, res) => {
  if (await blockIfPlatformPaused(req, res)) return
  const facilityId = String(req.body?.facilityId || '').trim()
  const facilityPin = String(req.body?.facilityPin || req.body?.pin || '').trim()
  const fullName = String(req.body?.name || '').trim()
  const patientPin = String(req.body?.patientPin || req.body?.portalPin || '').trim()
  const phone = String(req.body?.phone || '').trim()
  const gender = String(req.body?.gender || req.body?.sex || '').trim()
  const profilePhotoUrl = String(req.body?.profilePhotoUrl || req.body?.profile_photo_url || '').trim()

  if (!facilityId || !facilityPin || !fullName || !/^\d{6}$/.test(patientPin)) {
    return res.status(400).json({ error: 'Facility ID, facility PIN, name, and 6-digit patient PIN required' })
  }

  const { data: facility } = await supabase.from('facilities').select('*').eq('id', facilityId).eq('pin', facilityPin).maybeSingle()
  if (!facility) return res.status(401).json({ error: 'Invalid facility credentials' })

  const { data: existing } = await supabase.from('patients').select('id').eq('facility_id', facilityId).eq('portal_pin', patientPin).eq('name', fullName).maybeSingle()
  if (existing) return res.status(409).json({ error: 'Patient already exists with this name and PIN' })

  const id = generateReadablePatientId(getPatientIdPrefixForFacilityType(facility.type))
  const newPatient = {
    id, email: null, password: patientPin, portal_pin: patientPin,
    name: fullName, date_of_birth: null, phone, country: 'NG', language: 'English',
    gender, profile_photo_url: profilePhotoUrl,
    tokens: 0, is_online: false, registered_via: 'facility', facility_id: facilityId,
    facility_type: facility.type, created_at: new Date().toISOString()
  }
  const { error: insertError } = await insertAdaptive('patients', newPatient)
  const { data: savedPatient } = insertError ? { data: null } : await supabase.from('patients').select('*').eq('id', id).maybeSingle()
  if (insertError) return res.status(500).json({ error: insertError.message })

  const { error: tokenError } = await supabase
    .from('patient_tokens')
    .upsert({ patient_id: id, balance: 0 }, { onConflict: 'patient_id' })
  if (tokenError) console.error('Failed to create patient token row:', tokenError.message)

  await recordAuditLog(req, {
    userId: facilityId,
    userType: 'facility',
    action: 'facility.patient.register',
    resourceType: 'patient',
    resourceId: id,
    changes: { facilityId, patientName: fullName },
  })

  res.status(201).json({
    patient: sanitizePatientForResponse(savedPatient || newPatient),
    login: { patientId: id, pin: patientPin },
    message: 'Patient registered via facility'
  })
})

app.post('/api/patients/facility/login', async (req, res) => {
  if (await blockIfPlatformPaused(req, res)) return
  const patientId = String(req.body?.patientId || '').trim()
  const fullName = String(req.body?.name || req.body?.fullName || '').trim()
  const patientPin = String(req.body?.pin || '').trim()

  if (!/^\d{6}$/.test(patientPin)) return res.status(400).json({ error: 'PIN must be a 6-digit number' })

  let patient = null
  if (patientId) {
    const found = await findPatientByIdentifier(patientId)
    if (found?.portal_pin === patientPin) patient = found
  } else {
    let query = supabase
      .from('patients')
      .select('*')
      .eq('portal_pin', patientPin)
      .order('created_at', { ascending: false })
      .limit(10)
    if (fullName) query = query.ilike('name', `%${fullName.replace(/[%_]/g, '')}%`)
    const { data } = await query
    patient = (data || [])[0] || null
  }
  if (!patient) return res.status(401).json({ error: 'Invalid credentials' })

  await supabase.from('patients').update({ is_online: true }).eq('id', patient.id)
  res.json({ patient: sanitizePatientForResponse(patient), message: 'Login successful' })
})

// ---------- TOKENS ----------
app.get('/api/patients/:patientId/tokens', async (req, res) => {
  const balance = await getPatientTokenBalance(req.params.patientId)
  res.json({ tokens: balance })
})

app.get('/api/patients/:patientId/tokens/history', async (req, res) => {
  const { data } = await supabase.from('token_transactions').select('*').eq('patient_id', req.params.patientId).order('created_at', { ascending: false })
  res.json({ transactions: data || [] })
})

app.post('/api/patients/:patientId/tokens/add', async (req, res) => {
  const amount = Math.max(0, Math.round(Number(req.body?.amount || 0)))
  if (amount <= 0) return res.status(400).json({ error: 'Valid amount required' })
  const newBalance = await creditPatientTokens(req.params.patientId, amount, `Manual top-up of ${amount} tokens`)
  res.json({ tokens: newBalance, message: 'Tokens added' })
})

app.post('/api/patients/:patientId/tokens/purchase/initialize', async (req, res) => {
  const { patientId } = req.params
  const amountUSD = safeNumber(req.body?.amountUSD)
  const settings = await getServerSettings()
  if (amountUSD === null || amountUSD < settings.patientMinimumDepositUSD) {
    return res.status(400).json({ error: `Minimum deposit $${settings.patientMinimumDepositUSD}` })
  }
  if (!Number.isInteger(amountUSD)) return res.status(400).json({ error: 'Deposit amount must be a whole number' })

  const { count } = await supabase.from('token_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('patient_id', patientId)
    .eq('transaction_type', 'purchase')
  const purchasedBefore = (count || 0) > 0
  const rate = purchasedBefore ? settings.tokenPerUSDRepeatPurchase : settings.tokenPerUSDFirstPurchase
  const tokensExpected = Math.round(amountUSD * rate)
  const koraCharge = buildKoraTokenCharge(amountUSD)

  const reference = `kora-token-${tokensExpected}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  // *** FORCE production origin for Kora URLs – NEVER rely on request headers on Vercel ***
  const origin = getApiOrigin(req) || 'https://globaldoctorplatform.vercel.app'

  const requestedEmail = String(req.body.email || '').trim().toLowerCase()
  let { data: patientProfile } = await supabase
    .from('patients')
    .select('id, email, name')
    .eq('id', patientId)
    .maybeSingle()
  if (!patientProfile && requestedEmail) {
    const lookup = await supabase
      .from('patients')
      .select('id, email, name')
      .eq('email', requestedEmail)
      .maybeSingle()
    patientProfile = lookup.data || null
  }
  if (!patientProfile?.id) {
    return res.status(404).json({
      error: 'Patient profile was not saved on the medical server. Complete patient signup again after running the database repair SQL.',
    })
  }
  const savedPatientId = patientProfile.id
  const patientEmail = buildKoraCustomerEmail(patientProfile.email || requestedEmail, savedPatientId)
  const patientName = buildKoraCustomerName(patientProfile.name || req.body.name)

  const { error: paymentInsertError } = await insertPaymentRecord({
    id: reference,
    patient_id: savedPatientId,
    doctor_id: 'system',
    amount: koraCharge.amount,
    currency: koraCharge.currency,
    type: 'token_purchase',
    status: 'pending',
    provider: 'kora',
    reference,
    metadata: {
      purpose: 'token_purchase',
      patientId: savedPatientId,
      tokensExpected,
      rate,
      amountUSD,
      koraAmount: koraCharge.amount,
      koraCurrency: koraCharge.currency,
      exchangeRate: koraCharge.exchangeRate,
    },
    created_at: new Date().toISOString()
  })
  if (paymentInsertError) return res.status(500).json({ error: `Could not create payment record: ${paymentInsertError.message}` })

  if (!KORA_SECRET_KEY) {
    return res.json({
      reference, tokensExpected, rate,
      checkout_url: `https://kora-pay.com/pay/${reference}`,
      message: 'Payment initialized (mock - no KORA key)'
    })
  }

  try {
    const koraPayload = {
      amount: Number(koraCharge.amount),
      currency: String(koraCharge.currency || 'NGN').toUpperCase(),
      reference,
      redirect_url: `${origin}/payment-success?reference=${encodeURIComponent(reference)}`,
      notification_url: `${origin}/api/webhooks/kora`,
      narration: `GlobalDoc token purchase ${tokensExpected} tokens`,
      customer: {
        email: patientEmail,
        name: patientName,
      },
      merchant_bears_cost: true,
    }
    const { data: response } = await axios.post(
      `${KORA_BASE_URL}/merchant/api/v1/charges/initialize`,
      koraPayload,
      { headers: { Authorization: `Bearer ${KORA_SECRET_KEY}` } }
    )

    const checkoutUrl = extractKoraCheckoutUrl(response)
    if (!checkoutUrl) {
      return res.status(500).json({
        error: 'Kora did not return a checkout URL',
        details: response
      })
    }

    return res.json({
      reference, tokensExpected, rate,
      checkout_url: checkoutUrl,
      message: response?.message || 'Payment initialized'
    })
  } catch (error) {
    const koraError = error.response?.data || error.message
    console.error('Kora initialization error:', koraError)
    return res.status(500).json({
      error: 'Failed to initialize Kora payment',
      details: getKoraErrorMessage(error),
      provider: koraError,
      kora: {
        amount: koraCharge.amount,
        currency: koraCharge.currency,
        customerEmail: patientEmail,
        origin,
      }
    })
  }
})

app.get('/api/patients/:patientId/tokens/purchase/initialize', (_req, res) => {
  res.status(405).json({
    error: 'Payment initialization must be started from the Buy Tokens button, not opened directly in the browser.',
    method: 'POST required',
  })
})

// ---------- SUBSCRIPTIONS ----------
app.get('/api/patients/:patientId/subscription', async (req, res) => {
  const { data } = await supabase.from('subscriptions').select('*').eq('patient_id', req.params.patientId).eq('status', 'active').maybeSingle()
  res.json({ subscription: data || null })
})

app.post('/api/subscriptions', async (req, res) => {
  const { plan, patientId, price, tokensIncluded, email, name } = req.body
  if (!plan || !patientId || !price || !tokensIncluded) return res.status(400).json({ error: 'Missing subscription details' })

  const settings = await getServerSettings()
  if (Number(price) < settings.minimumSubscriptionUSD) return res.status(400).json({ error: `Minimum subscription is $${settings.minimumSubscriptionUSD}` })

  const { data: existing } = await supabase.from('subscriptions').select('id').eq('patient_id', patientId).eq('status', 'active').maybeSingle()
  if (existing) return res.status(409).json({ error: 'Active subscription already exists' })

  const { data: patientProfile } = await supabase
    .from('patients')
    .select('id, email, name')
    .eq('id', patientId)
    .maybeSingle()
  if (!patientProfile?.id) return res.status(404).json({ error: 'Patient profile not found' })

  const amountUSD = Math.round(Number(price))
  const normalizedTokens = Math.round(Number(tokensIncluded))
  const koraCharge = buildKoraTokenCharge(amountUSD)
  const reference = `kora-sub-${plan}-${normalizedTokens}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const origin = getApiOrigin(req) || 'https://globaldoctorplatform.vercel.app'
  const patientEmail = buildKoraCustomerEmail(patientProfile.email || email, patientProfile.id)
  const patientName = buildKoraCustomerName(patientProfile.name || name)

  const { error: paymentInsertError } = await insertPaymentRecord({
    id: reference,
    patient_id: patientProfile.id,
    doctor_id: 'system',
    amount: koraCharge.amount,
    currency: koraCharge.currency,
    type: 'subscription',
    payment_type: 'subscription',
    status: 'pending',
    provider: 'kora',
    payment_provider: 'kora',
    reference,
    description: `GlobalDoc ${plan} subscription`,
    metadata: {
      purpose: 'subscription',
      patientId: patientProfile.id,
      plan,
      tokensIncluded: normalizedTokens,
      amountUSD,
      price: amountUSD,
      koraAmount: koraCharge.amount,
      koraCurrency: koraCharge.currency,
      exchangeRate: koraCharge.exchangeRate,
    },
    created_at: new Date().toISOString(),
  })
  if (paymentInsertError) return res.status(500).json({ error: `Could not create subscription payment: ${paymentInsertError.message}` })

  if (!KORA_SECRET_KEY) {
    return res.status(201).json({
      reference,
      tokensExpected: normalizedTokens,
      tokensIncluded: normalizedTokens,
      checkout_url: `https://kora-pay.com/pay/${reference}`,
      message: 'Subscription payment initialized (mock - no KORA key)',
    })
  }

  try {
    const koraPayload = {
      amount: Number(koraCharge.amount),
      currency: String(koraCharge.currency || 'NGN').toUpperCase(),
      reference,
      redirect_url: `${origin}/payment-success?reference=${encodeURIComponent(reference)}`,
      notification_url: `${origin}/api/webhooks/kora`,
      narration: `GlobalDoc ${plan} subscription ${normalizedTokens} tokens`,
      customer: { email: patientEmail, name: patientName },
      merchant_bears_cost: true,
    }
    const { data: response } = await axios.post(
      `${KORA_BASE_URL}/merchant/api/v1/charges/initialize`,
      koraPayload,
      { headers: { Authorization: `Bearer ${KORA_SECRET_KEY}` } }
    )
    const checkoutUrl = extractKoraCheckoutUrl(response)
    if (!checkoutUrl) return res.status(500).json({ error: 'Kora did not return a checkout URL', details: response })
    return res.status(201).json({
      reference,
      tokensExpected: normalizedTokens,
      tokensIncluded: normalizedTokens,
      checkout_url: checkoutUrl,
      message: response?.message || 'Subscription payment initialized',
    })
  } catch (error) {
    const koraError = error.response?.data || error.message
    console.error('Kora subscription initialization error:', koraError)
    return res.status(500).json({
      error: 'Failed to initialize Kora subscription payment',
      details: getKoraErrorMessage(error),
      provider: koraError,
      kora: { amount: koraCharge.amount, currency: koraCharge.currency, customerEmail: patientEmail, origin },
    })
  }

  const id = generateId('sub')
  const subscription = {
    id, patient_id: patientId, plan, price, tokens_included: tokensIncluded,
    status: 'active', created_at: new Date().toISOString(),
    expires_at: plan === 'monthly'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  }
  await supabase.from('subscriptions').insert(subscription)
  await creditPatientTokens(patientId, tokensIncluded, `Subscription: ${plan} – ${tokensIncluded} tokens`)

  res.status(201).json({ subscription, message: 'Subscription activated' })
})

// ---------- DOCTOR PAYOUT DETAILS & WITHDRAWAL ----------
app.patch('/api/doctors/:doctorId/payout-details', async (req, res) => {
  const { doctorId } = req.params
  const { payoutMethod, bankCode, bankAccount, currency, mobileMoneyOperator, mobileMoneyNumber } = req.body
  const updates = {}
  if (payoutMethod) updates.payout_method = payoutMethod
  if (bankCode) updates.bank_code = bankCode
  if (bankAccount) updates.bank_account = bankAccount
  if (currency) updates.currency = currency
  if (mobileMoneyOperator) updates.mobile_money_operator = mobileMoneyOperator
  if (mobileMoneyNumber) updates.mobile_money_number = mobileMoneyNumber
  await supabase.from('doctors').update(updates).eq('id', String(doctorId))
  res.json({ message: 'Payout details updated' })
})

function validateDoctorPayoutDetails(doctor = {}) {
  const method = doctor.payout_method || doctor.payoutMethod || 'bank_account'
  const currency = String(doctor.currency || '').trim()
  if (method === 'mobile_money') {
    if (!doctor.mobile_money_operator || !doctor.mobile_money_number) {
      return 'Add your mobile money operator and mobile money number before requesting withdrawal.'
    }
    return null
  }
  if (!doctor.bank_code || !doctor.bank_account) {
    return 'Add your bank code and bank account number before requesting withdrawal.'
  }
  if (!currency) return 'Select your payout currency before requesting withdrawal.'
  return null
}

app.post('/api/doctors/:doctorId/withdraw', async (req, res) => {
  const { doctorId } = req.params
  const { tokens: requestedTokens } = req.body
  const ledger = await reconcileDoctorEarnings(doctorId)
  if (!ledger?.doctor) return res.status(404).json({ error: 'Doctor not found' })
  const payoutValidation = validateDoctorPayoutDetails(ledger.doctor)
  if (payoutValidation) return res.status(400).json({ error: payoutValidation })

  const available = Number(ledger.earningsTokens) || 0
  const settings = await getServerSettings()
  const minTokens = settings.doctorMinimumWithdrawalUSD * settings.tokenToUSD

  let tokensToWithdraw = requestedTokens === undefined || requestedTokens === null ? available : Math.max(0, Math.floor(Number(requestedTokens) || 0))
  if (tokensToWithdraw <= 0) return res.status(400).json({ error: 'Valid token amount required' })
  if (tokensToWithdraw > available) return res.status(400).json({ error: 'Requested tokens exceed available balance' })
  if (tokensToWithdraw < minTokens) return res.status(400).json({ error: `Minimum withdrawal is ${minTokens} tokens ($${settings.doctorMinimumWithdrawalUSD})` })

  const reference = `kora-wd-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const payoutInsert = await insertAdaptive('payouts', {
    id: reference,
    doctor_id: String(doctorId),
    amount_tokens: tokensToWithdraw,
    amount_usd: tokensToWithdraw / settings.tokenToUSD,
    status: 'pending',
    reference,
    payout_method: ledger.doctor.payout_method || 'bank_account',
    currency: ledger.doctor.currency || 'USD',
    destination: {
      bank_code: ledger.doctor.bank_code || null,
      bank_account: ledger.doctor.bank_account || null,
      mobile_money_operator: ledger.doctor.mobile_money_operator || null,
      mobile_money_number: ledger.doctor.mobile_money_number || null,
    },
    created_at: new Date().toISOString()
  })
  if (payoutInsert.error) return res.status(500).json({ error: payoutInsert.error.message })

  await updateDoctorEarnings(String(doctorId), -tokensToWithdraw)

  res.json({
    message: KORA_SECRET_KEY
      ? `Withdrawal request for ${tokensToWithdraw} tokens has been queued for payout review.`
      : `Withdrawal request for ${tokensToWithdraw} tokens has been queued. Add KORA_SECRET_KEY on the server to enable live Kora payout processing.`,
    reference,
    tokensDebited: tokensToWithdraw,
    remainingTokens: available - tokensToWithdraw,
    amountUsd: tokensToWithdraw / settings.tokenToUSD,
    amountUSD: tokensToWithdraw / settings.tokenToUSD,
  })
})

app.get('/api/doctors/:doctorId/financials', async (req, res) => {
  const { doctorId } = req.params
  let ledger
  try {
    ledger = await reconcileDoctorEarnings(doctorId)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
  if (!ledger?.doctor) return res.status(404).json({ error: 'Doctor not found' })

  const { data: payouts } = await supabase
    .from('payouts')
    .select('*')
    .eq('doctor_id', String(doctorId))
    .order('created_at', { ascending: false })
    .limit(50)

  const settings = await getServerSettings()
  const earningsTokens = Number(ledger.earningsTokens) || 0
  res.json({
    doctor: sanitizeDoctorForResponse(ledger.doctor),
    earningsTokens,
    earnings_tokens: earningsTokens,
    estimatedUsd: earningsTokens / settings.tokenToUSD,
    earnedTokens: ledger.earnedTokens,
    paidOutTokens: ledger.paidOutTokens,
    consultationCount: ledger.consultations?.length || 0,
    completedConsultationCount: (ledger.consultations || []).filter((item) => item.status === 'completed').length,
    doctorNgn: ledger.doctorNgn,
    settings: {
      tokenToUSD: settings.tokenToUSD,
      doctorMinimumWithdrawalUSD: settings.doctorMinimumWithdrawalUSD,
      minimumWithdrawalTokens: settings.doctorMinimumWithdrawalUSD * settings.tokenToUSD,
    },
    consultations: ledger.consultations || [],
    revenueSplits: ledger.revenueSplits || [],
    payouts: payouts || [],
  })
})

app.get('/api/admin/payouts', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const status = String(req.query.status || '').trim().toLowerCase()
  let query = supabase.from('payouts').select('*').order('created_at', { ascending: false }).limit(300)
  if (status && status !== 'all') query = query.eq('status', status)
  const { data: payouts, error } = await query
  if (error) return res.status(500).json({ error: error.message })

  const doctorIds = [...new Set((payouts || []).map((item) => item.doctor_id).filter(Boolean).map(String))]
  let doctorsById = new Map()
  if (doctorIds.length > 0) {
    const { data: doctors } = await supabase
      .from('doctors')
      .select('id,email,name,specialty,payout_method,currency,bank_code,bank_account,mobile_money_operator,mobile_money_number')
      .in('id', doctorIds)
    doctorsById = new Map((doctors || []).map((doctor) => [String(doctor.id), sanitizeDoctorForResponse(doctor)]))
  }

  res.json({
    payouts: (payouts || []).map((payout) => ({
      ...payout,
      doctor: doctorsById.get(String(payout.doctor_id)) || null,
    })),
  })
})

app.get('/api/admin/overview', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })

  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - 7)
  const doctorActiveSince = new Date(Date.now() - DOCTOR_ONLINE_WINDOW_MS).toISOString()

  const countRows = async (table, apply = (query) => query) => {
    try {
      const query = apply(supabase.from(table).select('id', { count: 'exact', head: true }))
      const { count, error } = await query
      if (error) return 0
      return count || 0
    } catch {
      return 0
    }
  }

  const [
    patientsTotal,
    patientsToday,
    patientsWeek,
    patientsOnline,
    doctorProfilesTotal,
    doctorAccountsTotal,
    doctorsVerified,
    doctorsPending,
    doctorsOnline,
    doctorsPaused,
    facilitiesTotal,
    facilitiesActive,
    facilitiesPaused,
    consultationsTotal,
    consultationsToday,
    consultationsWeek,
    appointmentsTotal,
    paymentsTotal,
    successfulPayments,
    pendingPayments,
    failedPayments,
    payoutsPending,
    payoutsPaid,
    payoutsRejected,
    specialtyReferrals,
    facilityReferrals,
    appointmentsScheduled,
    appointmentsCompleted,
    consultationsCompleted,
    consultationsInProgress,
    prescriptionsTotal,
    labOrdersTotal,
    vitalRequestsTotal,
    adminsTotal,
    auditCount,
  ] = await Promise.all([
    countRows('patients'),
    countRows('patients', (query) => query.gte('created_at', startOfDay.toISOString())),
    countRows('patients', (query) => query.gte('created_at', startOfWeek.toISOString())),
    countRows('patients', (query) => query.eq('is_online', true)),
    countRows('doctors'),
    countRows('doctors_auth'),
    countRows('doctors', (query) => query.eq('verified', true).eq('license_verified', true)),
    countRows('doctors_auth', (query) => query.eq('verified', false)),
    countRows('doctors', (query) => query.eq('is_online', true).gte('updated_at', doctorActiveSince)),
    countRows('doctors', (query) => query.in('account_status', ['paused', 'stopped'])),
    countRows('facilities'),
    countRows('facilities', (query) => query.eq('is_active', true)),
    countRows('facilities', (query) => query.eq('is_active', false)),
    countRows('consultations_ng'),
    countRows('consultations_ng', (query) => query.gte('created_at', startOfDay.toISOString())),
    countRows('consultations_ng', (query) => query.gte('created_at', startOfWeek.toISOString())),
    countRows('appointments'),
    countRows('payments'),
    countRows('payments', (query) => query.in('status', ['success', 'successful', 'completed', 'paid'])),
    countRows('payments', (query) => query.eq('status', 'pending')),
    countRows('payments', (query) => query.in('status', ['failed', 'cancelled', 'rejected'])),
    countRows('payouts', (query) => query.eq('status', 'pending')),
    countRows('payouts', (query) => query.in('status', ['paid', 'completed'])),
    countRows('payouts', (query) => query.in('status', ['rejected', 'failed'])),
    countRows('specialty_referrals'),
    countRows('facility_referrals'),
    countRows('appointments', (query) => query.eq('status', 'scheduled')),
    countRows('appointments', (query) => query.in('status', ['completed', 'done'])),
    countRows('consultations_ng', (query) => query.eq('status', 'completed')),
    countRows('consultations_ng', (query) => query.in('status', ['in_progress', 'active'])),
    countRows('prescriptions'),
    countRows('lab_orders'),
    countRows('vital_parameter_requests'),
    countRows('admins'),
    countRows('audit_logs'),
  ])

  const [{ data: recentAuditLogs }, { data: recentConsultations }, { data: recentPayments }, { data: paymentRows }, { data: revenueRows }] = await Promise.all([
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(8),
    supabase.from('consultations_ng').select('id,patient_id,doctor_id,channel,track,status,total_ngn,created_at').order('created_at', { ascending: false }).limit(8),
    supabase.from('payments').select('id,patient_id,doctor_id,amount,currency,type,payment_type,status,created_at').order('created_at', { ascending: false }).limit(8),
    supabase.from('payments').select('amount,currency,status').limit(5000),
    supabase.from('revenue_splits_ng').select('total_ngn,doctor_ngn,platform_ngn,facility_ngn,data_fee_ngn').limit(5000),
  ])

  const paymentSummary = (paymentRows || []).reduce((summary, payment) => {
    const currency = String(payment.currency || 'NGN').toUpperCase()
    const amount = Number(payment.amount || 0)
    if (!Number.isFinite(amount)) return summary
    summary.byCurrency[currency] = (summary.byCurrency[currency] || 0) + amount
    if (['success', 'successful', 'completed', 'paid'].includes(String(payment.status || '').toLowerCase())) {
      summary.successByCurrency[currency] = (summary.successByCurrency[currency] || 0) + amount
    }
    return summary
  }, { byCurrency: {}, successByCurrency: {} })

  const revenueSummary = (revenueRows || []).reduce((summary, row) => ({
    totalNgn: summary.totalNgn + Number(row.total_ngn || 0),
    doctorNgn: summary.doctorNgn + Number(row.doctor_ngn || 0),
    platformNgn: summary.platformNgn + Number(row.platform_ngn || 0),
    facilityNgn: summary.facilityNgn + Number(row.facility_ngn || 0),
    dataFeeNgn: summary.dataFeeNgn + Number(row.data_fee_ngn || 0),
  }), { totalNgn: 0, doctorNgn: 0, platformNgn: 0, facilityNgn: 0, dataFeeNgn: 0 })

  const doctorsTotal = doctorAccountsTotal || doctorProfilesTotal

  res.json({
    overview: {
      users: {
        total: patientsTotal + doctorsTotal + facilitiesTotal,
        patients: patientsTotal,
        doctors: doctorsTotal,
        facilities: facilitiesTotal,
        admins: adminsTotal,
        onlinePatients: patientsOnline,
        onlineDoctors: doctorsOnline,
      },
      doctors: {
        total: doctorsTotal,
        profiles: doctorProfilesTotal,
        accounts: doctorAccountsTotal,
        verified: doctorsVerified,
        pending: doctorsPending,
        online: doctorsOnline,
        paused: doctorsPaused,
      },
      facilities: {
        total: facilitiesTotal,
        active: facilitiesActive,
        paused: facilitiesPaused,
      },
      patients: {
        total: patientsTotal,
        today: patientsToday,
        thisWeek: patientsWeek,
        online: patientsOnline,
      },
      activity: {
        consultations: consultationsTotal,
        consultationsToday,
        consultationsThisWeek: consultationsWeek,
        consultationsCompleted,
        consultationsInProgress,
        appointments: appointmentsTotal,
        appointmentsScheduled,
        appointmentsCompleted,
        payments: paymentsTotal,
        successfulPayments,
        pendingPayments,
        failedPayments,
        pendingPayouts: payoutsPending,
        paidPayouts: payoutsPaid,
        rejectedPayouts: payoutsRejected,
        referrals: specialtyReferrals + facilityReferrals,
        specialtyReferrals,
        facilityReferrals,
        prescriptions: prescriptionsTotal,
        labOrders: labOrdersTotal,
        vitalRequests: vitalRequestsTotal,
        auditLogs: auditCount,
      },
      finance: {
        paymentsByCurrency: paymentSummary.byCurrency,
        successfulPaymentsByCurrency: paymentSummary.successByCurrency,
        revenueNgn: revenueSummary,
      },
      recent: {
        auditLogs: recentAuditLogs || [],
        consultations: recentConsultations || [],
        payments: recentPayments || [],
      },
      generatedAt: now.toISOString(),
    },
  })
})

app.patch('/api/admin/payouts/:payoutId/status', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })

  const allowedStatuses = new Set(['pending', 'processing', 'paid', 'completed', 'rejected', 'failed'])
  const status = String(req.body?.status || '').trim().toLowerCase()
  if (!allowedStatuses.has(status)) return res.status(400).json({ error: 'Invalid payout status' })

  const { data: payout, error: fetchError } = await supabase
    .from('payouts')
    .select('*')
    .eq('id', req.params.payoutId)
    .maybeSingle()
  if (fetchError) return res.status(500).json({ error: fetchError.message })
  if (!payout) return res.status(404).json({ error: 'Payout request not found' })

  const previousStatus = String(payout.status || 'pending').toLowerCase()
  const shouldRefund = ['rejected', 'failed'].includes(status) && ['pending', 'processing'].includes(previousStatus)
  if (shouldRefund && payout.doctor_id) {
    await updateDoctorEarnings(String(payout.doctor_id), Number(payout.amount_tokens || 0))
  }

  const nowIso = new Date().toISOString()
  const updates = {
    status,
    provider_reference: req.body?.providerReference ? String(req.body.providerReference).trim() : payout.provider_reference || null,
    admin_note: req.body?.note ? String(req.body.note).trim() : payout.admin_note || null,
    paid_at: ['paid', 'completed'].includes(status) ? nowIso : payout.paid_at || null,
    updated_at: nowIso,
  }

  const update = await updateAdaptive(
    'payouts',
    updates,
    (query) => query.eq('id', req.params.payoutId),
  )
  if (update.error) {
    if (shouldRefund && payout.doctor_id) {
      await updateDoctorEarnings(String(payout.doctor_id), -Number(payout.amount_tokens || 0))
    }
    return res.status(500).json({ error: update.error.message })
  }

  await recordAuditLog(req, {
    action: 'payout.status.update',
    resourceType: 'payout',
    resourceId: req.params.payoutId,
    changes: { previousStatus, status, refundedTokens: shouldRefund ? Number(payout.amount_tokens || 0) : 0 },
  })

  res.json({
    payout: update.data || { ...payout, ...updates },
    message: shouldRefund
      ? `Payout marked ${status}. ${Number(payout.amount_tokens || 0)} tokens returned to the doctor.`
      : `Payout marked ${status}.`,
  })
})

// ---------- SETTINGS ----------
app.get('/api/settings', async (_req, res) => {
  res.json({ settings: await getServerSettings() })
})

app.patch('/api/admin/settings', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const updates = []
  if (req.body?.minimumSubscriptionUSD !== undefined) {
    const minimumSubscriptionUSD = Number(req.body.minimumSubscriptionUSD)
    if (!Number.isFinite(minimumSubscriptionUSD) || minimumSubscriptionUSD < 1) return res.status(400).json({ error: 'Invalid minimum subscription value' })
    updates.push({ key: 'minimumSubscriptionUSD', value: String(minimumSubscriptionUSD) })
  }
  if (req.body?.platformPaused !== undefined) {
    updates.push({ key: 'platformPaused', value: Boolean(req.body.platformPaused) ? 'true' : 'false' })
  }
  if (req.body?.platformPauseMessage !== undefined) {
    updates.push({
      key: 'platformPauseMessage',
      value: String(req.body.platformPauseMessage || '').trim() || 'We are sorry, GlobalDoc is currently under review or update. Please try again shortly.',
    })
  }
  if (updates.length === 0) return res.status(400).json({ error: 'No settings supplied' })
  await supabase.from('server_settings').upsert(updates, { onConflict: 'key' })
  await recordAuditLog(req, {
    action: 'settings.update',
    resourceType: 'server_settings',
    resourceId: 'platform',
    changes: Object.fromEntries(updates.map((item) => [item.key, item.value])),
  })
  res.json({ settings: await getServerSettings(), message: 'Updated' })
})

app.post('/api/admin/smtp/test', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const to = String(req.body?.to || req.headers['x-admin-email'] || '').trim()
  if (!to) return res.status(400).json({ error: 'Recipient email is required' })
  const settings = getSmtpSettings()
  const smtp = {
    configured: Boolean(settings.user && settings.pass),
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    from: settings.from,
    user: settings.user ? `${settings.user.slice(0, 3)}***${settings.user.slice(-8)}` : '',
  }
  try {
    const email = await sendSmtpEmail({
      to,
      subject: 'GlobalDoc SMTP test',
      text: `This is a GlobalDoc SMTP test sent at ${new Date().toISOString()}.`,
    })
    res.json({ email, smtp })
  } catch (error) {
    res.status(500).json({ error: error.message, smtp })
  }
})

// ---------- ONLINE STATUS ----------
app.get('/api/online/status', async (_req, res) => {
  const activeSince = new Date(Date.now() - DOCTOR_ONLINE_WINDOW_MS).toISOString()
  const { data: doctors } = await supabase.from('doctors').select('*').eq('is_online', true).gte('updated_at', activeSince)
  const { data: patients } = await supabase.from('patients').select('*').eq('is_online', true)
  const { data: emergency } = await supabase.from('emergency_requests').select('*').eq('status', 'pending')
  res.json({ doctors: (doctors || []).map(sanitizeDoctorForResponse), patients: patients || [], emergencyRequests: emergency || [] })
})

app.patch('/api/doctors/:doctorId/status', async (req, res) => {
  const { data: doctor } = await supabase.from('doctors').select('account_status, suspension_reason').eq('id', req.params.doctorId).maybeSingle()
  if ((doctor?.account_status === 'paused' || doctor?.account_status === 'stopped') && Boolean(req.body.isOnline)) {
    return res.status(403).json({ error: doctor.suspension_reason || 'Doctor account is paused by platform admin.' })
  }
  await supabase.from('doctors').update({ is_online: Boolean(req.body.isOnline), updated_at: new Date().toISOString() }).eq('id', req.params.doctorId)
  res.json({ message: 'Status updated' })
})

app.patch('/api/patients/:patientId/status', async (req, res) => {
  await supabase.from('patients').update({ is_online: Boolean(req.body.isOnline) }).eq('id', req.params.patientId)
  res.json({ message: 'Status updated' })
})

// ---------- DOCTOR LIST ----------
app.get('/api/doctors', async (req, res) => {
  const buildQuery = (withStatus = true) => {
    let query = supabase.from('doctors').select('*').eq('verified', true).eq('license_verified', true)
    if (withStatus) query = query.or('account_status.is.null,account_status.eq.active')
    if (req.query.minRating) query = query.gte('rating', Number(req.query.minRating))
    return query.order('rating', { ascending: false })
  }
  let { data, error } = await buildQuery(true)
  if (error && isMissingColumnError(error)) {
    const fallback = await buildQuery(false)
    data = fallback.data || []
    error = fallback.error
  }
  if (error) return res.status(500).json({ error: error.message })
  const specialty = String(req.query.specialty || '').trim()
  const wantsOnlineFilter = req.query.online !== undefined && req.query.online !== ''
  const requiredOnline = req.query.online === 'true'
  const doctors = (data || [])
    .filter((doctor) => specialtyMatches(doctor.specialty, specialty))
    .map(sanitizeDoctorForResponse)
    .filter((doctor) => !wantsOnlineFilter || Boolean(doctor.isOnline) === requiredOnline)
  res.json({ doctors })
})

// ---------- DOCTOR AVAILABILITY (mock) ----------
app.get('/api/doctors/:doctorId/availability', (_req, res) => {
  const slots = {}
  const day = new Date().getDay()
  if (day >= 1 && day <= 5) {
    for (let h = 9; h < 17; h++) {
      for (let m = 0; m < 60; m += 30) {
        slots[`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`] = Math.random() > 0.3
      }
    }
  }
  res.json({ slots })
})

// ---------- REVIEWS ----------
app.post('/api/reviews', async (req, res) => {
  const { doctorId, patientId, rating, comment, verifiedPatient } = req.body
  if (!doctorId || !patientId || !rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Invalid review' })
  if (!verifiedPatient) return res.status(403).json({ error: 'Only verified patients may submit reviews' })

  const id = generateId('rev')
  const review = { id, doctor_id: doctorId, patient_id: patientId, rating, comment, verified: true, created_at: new Date().toISOString() }
  await supabase.from('reviews').insert(review)

  const { data: reviews } = await supabase.from('reviews').select('rating').eq('doctor_id', doctorId)
  const avg = reviews?.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  await supabase.from('doctors').update({ rating: Number(avg.toFixed(2)), rating_count: reviews?.length || 0 }).eq('id', doctorId)

  res.status(201).json({ review, message: 'Review submitted' })
})

// ---------- APPOINTMENTS ----------
app.post('/api/appointments', async (req, res) => {
  const { patientId, doctorId, consultationType, notes, subscriptionType, tokensRequired } = req.body
  const scheduledDate = req.body.scheduledDate || (req.body.date && req.body.time ? new Date(`${req.body.date}T${req.body.time}:00`).toISOString() : '')
  if (!patientId || !doctorId || !scheduledDate || !consultationType) return res.status(400).json({ error: 'Missing fields' })

  const requiredTokens = tokensRequired || (consultationType === 'referral' ? 15 : 20)
  const balance = await getPatientTokenBalance(patientId)
  if (balance < requiredTokens) return res.status(402).json({ error: 'Insufficient tokens' })

  const deducted = await deductPatientTokens(patientId, requiredTokens)
  if (!deducted) return res.status(402).json({ error: 'Insufficient tokens' })

  const { data: doctor } = await supabase.from('doctors').select('name').eq('id', doctorId).maybeSingle()

  const id = generateId('appt')
  const appointment = {
    id, patient_id: patientId, doctor_id: doctorId, doctor_name: doctor?.name || '',
    consultation_type: consultationType, scheduled_date: scheduledDate, notes,
    subscription_type: subscriptionType, tokens_charged: requiredTokens,
    status: 'confirmed', created_at: new Date().toISOString()
  }
  const appointmentInsert = await insertAdaptive('appointments', appointment)
  if (appointmentInsert.error) return res.status(500).json({ error: appointmentInsert.error.message })

  const date = new Date(scheduledDate)
  await insertAdaptive('appointment_reminders', [
    {
      id: generateId('rem24'), appointment_id: id, reminder_type: '24_hours',
      should_send_to: ['doctor', 'patient'], notification_channels: ['in_app', 'email'],
      scheduled_send_time: new Date(date.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      is_sent: false, created_at: new Date().toISOString()
    },
    {
      id: generateId('rem1h'), appointment_id: id, reminder_type: '1_hour',
      should_send_to: ['doctor', 'patient'], notification_channels: ['in_app', 'email'],
      scheduled_send_time: new Date(date.getTime() - 60 * 60 * 1000).toISOString(),
      is_sent: false, created_at: new Date().toISOString()
    }
  ])

  await insertAdaptive('notifications', [
    {
      id: generateId('notif'), user_id: patientId, user_type: 'patient',
      notification_type: 'appointment_confirmed', title: 'Appointment confirmed',
      message: `Your appointment with ${doctor?.name || ''} is on ${new Date(scheduledDate).toLocaleString()}`,
      related_resource_type: 'appointment', related_resource_id: id,
      is_read: false, notification_channels: ['in_app', 'email'], created_at: new Date().toISOString()
    },
    {
      id: generateId('notif'), user_id: doctorId, user_type: 'doctor',
      notification_type: 'appointment_confirmed', title: 'New appointment',
      message: `You have a new appointment on ${new Date(scheduledDate).toLocaleString()}`,
      related_resource_type: 'appointment', related_resource_id: id,
      is_read: false, notification_channels: ['in_app', 'email'], created_at: new Date().toISOString()
    }
  ])

  res.status(201).json({ appointment, message: 'Appointment scheduled' })
})

app.get('/api/appointments', async (req, res) => {
  let query = supabase.from('appointments').select('*')
  if (req.query.patientId) query = query.eq('patient_id', req.query.patientId)
  if (req.query.doctorId) query = query.eq('doctor_id', req.query.doctorId)
  const { data } = await query
  res.json({ appointments: data || [] })
})

// ---------- NOTIFICATIONS ----------
app.get('/api/notifications', async (req, res) => {
  const { userId, userType } = req.query
  if (!userId || !userType) return res.status(400).json({ error: 'userId and userType required' })
  const { data } = await supabase.from('notifications').select('*')
    .eq('user_id', userId).eq('user_type', userType)
    .order('created_at', { ascending: false })
  res.json({ notifications: data || [] })
})

app.patch('/api/notifications/:notificationId/read', async (req, res) => {
  await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', req.params.notificationId)
  res.json({ message: 'Marked as read' })
})

// ---------- CHAT ----------
app.post('/api/chat/messages', async (req, res) => {
  const { consultationId, senderId, senderType, recipientId, recipientType, messageType, messageContent } = req.body
  if (!senderId || !senderType || !recipientId || !recipientType || !messageContent) {
    return res.status(400).json({ error: 'Missing chat message fields' })
  }
  const id = generateId('msg')
  const message = {
    id, consultation_id: consultationId || null, sender_id: senderId, sender_type: senderType,
    recipient_id: recipientId, recipient_type: recipientType,
    message_type: messageType || 'text', message_content: messageContent,
    is_read: false, created_at: new Date().toISOString()
  }
  const insert = await insertAdaptive('chat_messages', message)
  if (insert.error) return res.status(500).json({ error: insert.error.message })
  res.status(201).json({ chatMessage: message, message: 'Sent' })
})

app.get('/api/chat/messages', async (req, res) => {
  const { consultationId, patientId, doctorId } = req.query
  if (!consultationId && (!patientId || !doctorId)) {
    return res.status(400).json({ error: 'consultationId or patientId and doctorId required' })
  }
  let query = supabase.from('chat_messages').select('*')
  if (patientId && doctorId) {
    query = query.or(`and(sender_id.eq.${patientId},recipient_id.eq.${doctorId}),and(sender_id.eq.${doctorId},recipient_id.eq.${patientId})`)
  } else {
    query = query.eq('consultation_id', consultationId)
  }
  const { data, error } = await query.order('created_at', { ascending: true }).limit(300)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ messages: data || [] })
})

app.get('/api/patients/:patientId/clinical-notes', async (req, res) => {
  const patient = await findPatientByIdentifier(req.params.patientId)
  if (!patient) return res.status(404).json({ error: 'Patient not found' })
  const { doctorId } = req.query
  let query = supabase.from('patient_clinical_notes').select('*').eq('patient_id', patient.id)
  if (doctorId) query = query.eq('doctor_id', doctorId)
  const { data, error } = await query.order('created_at', { ascending: false }).limit(100)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ notes: data || [] })
})

app.post('/api/patients/:patientId/clinical-notes', async (req, res) => {
  const patient = await findPatientByIdentifier(req.params.patientId)
  if (!patient) return res.status(404).json({ error: 'Patient not found' })
  const { doctorId, consultationId, diagnosis, plan, followUp, visibility } = req.body || {}
  if (!doctorId || !diagnosis || !plan) {
    return res.status(400).json({ error: 'doctorId, diagnosis, and plan are required' })
  }
  const note = {
    id: generateId('note'),
    patient_id: patient.id,
    doctor_id: doctorId,
    consultation_id: consultationId || null,
    diagnosis: String(diagnosis).trim(),
    plan: String(plan).trim(),
    follow_up: followUp ? String(followUp).trim() : null,
    visibility: visibility || 'care_team',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  const insert = await insertAdaptive('patient_clinical_notes', note)
  if (insert.error) return res.status(500).json({ error: insert.error.message })
  res.status(201).json({ note, message: 'Clinical note saved' })
})

app.post('/api/video-signal', (req, res) => {
  const { roomId, senderId, senderType, type, payload } = req.body || {}
  if (!roomId || !senderId || !type || !payload) {
    return res.status(400).json({ error: 'roomId, senderId, type, and payload are required' })
  }

  const message = {
    id: generateId('sig'),
    seq: Date.now() * 1000 + (++videoSignalSeq % 1000),
    room_id: String(roomId),
    sender_id: String(senderId),
    sender_type: senderType || 'user',
    type: String(type),
    payload,
    created_at: new Date().toISOString(),
  }
  const room = getVideoSignalRoom(roomId)
  room.push(message)
  if (room.length > 300) room.splice(0, room.length - 300)

  supabase.from('video_signals').insert(message).then(({ error }) => {
    if (error) console.warn('Video signal stored in memory only:', error.message)
  }).catch((error) => {
    console.warn('Video signal Supabase write timed out or failed:', error.message)
  })

  res.status(201).json({ signal: message, message: 'Signal sent' })
})

app.get('/api/video-signal', async (req, res) => {
  const roomId = String(req.query.roomId || '').trim()
  const senderId = String(req.query.senderId || '').trim()
  const type = String(req.query.type || '').trim()
  const since = Number(req.query.since || 0)
  if (!roomId || !senderId) return res.status(400).json({ error: 'roomId and senderId are required' })

  let query = supabase
    .from('video_signals')
    .select('*')
    .eq('room_id', roomId)
    .neq('sender_id', senderId)
    .gt('seq', since)
    .order('seq', { ascending: true })
    .limit(100)
  if (type) query = query.eq('type', type)
  const { data, error } = await withTimeout(query, 2500, { data: null, error: new Error('video signal query timeout') })

  const memorySignals = getVideoSignalRoom(roomId)
    .filter((message) => message.seq > since && message.sender_id !== senderId && (!type || message.type === type))
  const merged = new Map()
  ;[...(data || []), ...memorySignals].forEach((message) => {
    if (message?.id) merged.set(message.id, message)
  })
  const signals = [...merged.values()].sort((a, b) => Number(a.seq || 0) - Number(b.seq || 0)).slice(-100)
  res.json({ signals })
})

app.get('/api/prescriptions', async (req, res) => {
  const { patientId, doctorId, facilityId, consultationId } = req.query
  let query = supabase.from('prescriptions').select('*').order('issued_at', { ascending: false })
  if (patientId) query = query.eq('patient_id', patientId)
  if (doctorId) query = query.eq('doctor_id', doctorId)
  if (facilityId) query = query.eq('facility_id', facilityId)
  if (consultationId) query = query.eq('consultation_id', consultationId)
  const { data, error } = await query.limit(100)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ prescriptions: data || [] })
})

app.post('/api/prescriptions', async (req, res) => {
  const {
    consultationId,
    patientId,
    patientName,
    doctorId,
    doctorName,
    doctorLicenseNumber,
    doctorSignatureDataUrl,
    facilityId,
    medications,
    notes,
  } = req.body || {}

  if (!consultationId || !patientId || !doctorId || !medications) {
    return res.status(400).json({ error: 'consultationId, patientId, doctorId, and medications are required' })
  }

  const [{ data: doctorRow }, patientRecord] = await Promise.all([
    supabase
      .from('doctors')
      .select('name, license_number, signature_data_url')
      .eq('id', doctorId)
      .maybeSingle(),
    findPatientByIdentifier(patientId),
  ])
  const signatureDataUrl = doctorSignatureDataUrl || doctorRow?.signature_data_url || null
  const resolvedPatientId = patientRecord?.id || patientId
  const resolvedPatientName = patientName || patientRecord?.name || 'Patient'
  const resolvedDoctorName = doctorName || doctorRow?.name || 'Doctor'
  const resolvedDoctorLicenseNumber = doctorLicenseNumber || doctorRow?.license_number || null

  const row = {
    id: generateId('rx'),
    consultation_id: consultationId,
    patient_id: resolvedPatientId,
    patient_name: resolvedPatientName,
    doctor_id: doctorId,
    doctor_name: resolvedDoctorName,
    doctor_license_number: resolvedDoctorLicenseNumber,
    doctor_signature_data_url: signatureDataUrl,
    facility_id: facilityId || null,
    company_name: 'GlobalDoc',
    logo_text: 'GD',
    medications,
    prescription_text: medications,
    notes: notes || null,
    status: 'sent',
    issued_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }

  const insert = await insertAdaptive('prescriptions', row)
  if (insert.error) return res.status(500).json({ error: insert.error.message })

  await insertAdaptive('notifications', {
    id: generateId('notif'),
    user_id: resolvedPatientId,
    user_type: 'patient',
    notification_type: 'prescription',
    type: 'prescription',
    title: 'New prescription available',
    message: `Dr. ${resolvedDoctorName || 'your doctor'} sent a prescription you can download.`,
    related_resource_type: 'prescription',
    related_resource_id: row.id,
    is_read: false,
    created_at: new Date().toISOString(),
  })

  res.status(201).json({ prescription: row, message: 'Prescription sent' })
})

// ---------- PATIENT FILES ----------
app.post('/api/patients/files/upload', async (req, res) => {
  const { patientId, name, mimeType, size, contentBase64 } = req.body
  if (!patientId || !name || !mimeType || !size || !contentBase64) return res.status(400).json({ error: 'Missing data' })
  const id = generateId('file')
  await supabase.from('patient_files').insert({
    id, patient_id: patientId, name, mime_type: mimeType, size, content_base64: contentBase64, created_at: new Date().toISOString()
  })
  res.status(201).json({ file: { id, name, mimeType, size }, message: 'File uploaded' })
})

app.get('/api/patients/files', async (req, res) => {
  const { patientId } = req.query
  if (!patientId) return res.status(400).json({ error: 'patientId required' })
  const { data } = await supabase.from('patient_files').select('*').eq('patient_id', patientId)
  res.json({ files: data || [] })
})

app.get('/api/patients/files/:fileId/download', async (req, res) => {
  const { patientId } = req.query
  const { fileId } = req.params
  const { data: file } = await supabase.from('patient_files').select('*').eq('id', fileId).eq('patient_id', patientId).maybeSingle()
  if (!file) return res.status(404).json({ error: 'File not found' })
  res.json({ id: file.id, name: file.name, mimeType: file.mime_type, contentBase64: file.content_base64 })
})

// ---------- EMERGENCY ----------
app.post('/api/emergency/call', async (req, res) => {
  const { patientId, patientName, reason } = req.body
  if (!patientId || !patientName || !reason) return res.status(400).json({ error: 'Missing fields' })
  const id = generateId('emerg')
  await supabase.from('emergency_requests').insert({ id, patient_id: patientId, patient_name: patientName, reason, status: 'pending', created_at: new Date().toISOString() })
  res.status(201).json({ message: 'Emergency request created' })
})

// ---------- COMMUNITY CHAT ----------
app.get('/api/doctors/community/messages', async (_req, res) => {
  const { data } = await supabase.from('community_messages').select('*').order('created_at', { ascending: false }).limit(200)
  res.json({ messages: data || [] })
})

app.post('/api/doctors/community/messages', async (req, res) => {
  const { senderId, senderName, senderType, phone, message } = req.body
  if (!senderId || !senderName || !message) return res.status(400).json({ error: 'senderId, senderName, and message required' })
  const id = generateId('comm')
  await supabase.from('community_messages').insert({
    id, sender_id: senderId, sender_name: senderName, sender_type: senderType || 'doctor',
    phone: phone || null, message, created_at: new Date().toISOString()
  })
  await recordAuditLog(req, {
    userId: senderId,
    userType: senderType || 'doctor',
    action: 'community.message.create',
    resourceType: 'community_message',
    resourceId: id,
    changes: { senderName, senderType: senderType || 'doctor' },
  })
  res.status(201).json({ message: 'Community message sent' })
})

// ---------- LEGACY REFERRAL SUPPORT ----------
app.get('/api/specialties', (_req, res) => {
  res.json({
    specialties: [
      'General Practitioner',
      'Cardiology',
      'Dermatology',
      'Psychiatry',
      'Pediatrics',
      'Oncology',
      'Neurology',
      'Urology',
      'Gynaecologist',
      'Orthopedics',
      'Obstetrics & Gynecology',
      'Ophthalmology',
    ],
  })
})

app.get('/api/tokens/balance/:patientId', async (req, res) => {
  const balance = await getPatientTokenBalance(req.params.patientId)
  res.json({ balance, tokens: balance })
})

app.post('/api/tokens/deduct', async (req, res) => {
  const patientId = req.body?.patientId || req.body?.userId
  const amount = Math.max(0, Math.round(Number(req.body?.amount || 0)))
  if (!patientId || amount <= 0) return res.status(400).json({ error: 'patientId and valid amount required' })
  const ok = await deductPatientTokens(patientId, amount)
  if (!ok) return res.status(402).json({ error: 'Insufficient tokens' })
  const balance = await getPatientTokenBalance(patientId)
  res.json({ balance, tokens: balance, message: 'Tokens deducted' })
})

app.get('/api/referrals/pending/:userId/:consultationId', (req, res) => {
  res.json({ referral: null, referrals: [], userId: req.params.userId, consultationId: req.params.consultationId })
})

app.post('/api/referrals/request', (req, res) => {
  res.status(201).json({
    referral: {
      id: generateId('refreq'),
      ...req.body,
      status: 'pending_doctor_approval',
      created_at: new Date().toISOString(),
    },
    message: 'Referral request submitted',
  })
})

app.post('/api/referrals/initiate', (req, res) => {
  res.status(201).json({
    referral: {
      id: generateId('refinit'),
      ...req.body,
      status: 'pending_patient_approval',
      created_at: new Date().toISOString(),
    },
    message: 'Referral initiated',
  })
})

app.patch('/api/referrals/:referralId/respond', (req, res) => {
  res.json({
    referral: {
      id: req.params.referralId,
      status: req.body?.accepted === false ? 'rejected' : 'accepted',
      responded_at: new Date().toISOString(),
    },
    message: 'Referral response recorded',
  })
})

// ---------- ADMIN: DOCTOR MANAGEMENT ----------
app.get('/api/admin/doctors', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const { data: authRows, error: authError } = await supabase.from('doctors_auth').select('*').order('created_at', { ascending: false })
  if (authError) return res.status(500).json({ error: authError.message })
  const { data: profiles, error: profileError } = await supabase.from('doctors').select('*')
  if (profileError) return res.status(500).json({ error: profileError.message })
  const profileById = new Map((profiles || []).map((item) => [String(item.id), item]))
  const doctors = (authRows || []).map((row) => {
    const profileId = String(row.id)
    return sanitizeDoctorForResponse({ ...profileById.get(profileId), ...row, id: profileId })
  })
  res.json({ doctors })
})

app.post('/api/admin/doctors', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const payload = normalizeDoctorPayload(req.body)
  if (!payload.email || !payload.password || !payload.name || !payload.specialty || !payload.location || !payload.licenseNumber || !payload.signatureDataUrl || !payload.passportDataUrl) {
    return res.status(400).json({ error: 'Email, password, name, specialty, country, license number, signature, and passport photo are required' })
  }
  const { data: existing } = await supabase.from('doctors_auth').select('id').eq('email', payload.email).maybeSingle()
  if (existing) return res.status(409).json({ error: 'A doctor already exists with this email' })

  const authRow = {
    email: payload.email,
    password: payload.password,
    name: payload.name,
    specialty: payload.specialty,
    location: payload.location,
    license_number: payload.licenseNumber,
    signature_data_url: payload.signatureDataUrl || null,
    passport_data_url: payload.passportDataUrl || null,
    gender: payload.gender || null,
    profile_photo_url: payload.profilePhotoUrl || payload.passportDataUrl || null,
    verified: true,
    account_status: 'active',
    suspension_reason: null,
    created_at: new Date().toISOString(),
  }
  const { data: insertedAuthRow, error: authInsertError } = await insertOneReturningAdaptive('doctors_auth', authRow)
  if (authInsertError) return res.status(500).json({ error: authInsertError.message })
  const profileId = String(insertedAuthRow.id)

  const doctor = {
    id: profileId, name: payload.name, specialty: payload.specialty, location: payload.location, languages: payload.languages,
    rating: 0, rating_count: 0, availability: 'Available upon request', verified: true, is_online: false,
    fee: payload.consultationFee, license_number: payload.licenseNumber, license_issuer: payload.licenseIssuer || null,
    license_expiry: payload.licenseExpiry || null, bank_code: payload.bankCode || null, bank_account: payload.bankAccount || null,
    currency: payload.currency || null, payout_method: payload.payoutMethod,
    mobile_money_operator: payload.mobileMoneyOperator || null, mobile_money_number: payload.mobileMoneyNumber || null,
    signature_data_url: payload.signatureDataUrl || null,
    passport_data_url: payload.passportDataUrl || null,
    gender: payload.gender || null,
    profile_photo_url: payload.profilePhotoUrl || payload.passportDataUrl || null,
    license_verified: true,
    account_status: 'active',
    suspension_reason: null,
    created_at: new Date().toISOString()
  }
  let { error: profileInsertError } = await insertAdaptive('doctors', doctor)
  if (profileInsertError) return res.status(500).json({ error: profileInsertError.message })
  const emailResult = await sendDoctorApprovalEmail(insertedAuthRow).catch((error) => ({ sent: false, reason: error.message }))
  await recordAuditLog(req, {
    action: 'doctor.admin.create',
    resourceType: 'doctor',
    resourceId: profileId,
    changes: { email: payload.email, specialty: payload.specialty },
  })
  res.status(201).json({ doctor: sanitizeDoctorForResponse({ ...doctor, ...insertedAuthRow, id: profileId }), email: emailResult, message: 'Doctor added and approved' })
})

app.delete('/api/admin/doctors/:doctorId', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  await supabase.from('doctors').delete().eq('id', String(req.params.doctorId))
  await supabase.from('doctors_auth').delete().eq('id', req.params.doctorId)
  await recordAuditLog(req, {
    action: 'doctor.delete',
    resourceType: 'doctor',
    resourceId: req.params.doctorId,
  })
  res.json({ message: 'Doctor deleted' })
})

app.patch('/api/admin/doctors/:doctorId', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const payload = normalizeDoctorPayload(req.body)
  if (!payload.name || !payload.specialty || !payload.location || !payload.licenseNumber) {
    return res.status(400).json({ error: 'Name, specialty, location, and license number are required' })
  }
  const authUpdates = {
    name: payload.name,
    specialty: payload.specialty,
    location: payload.location,
    license_number: payload.licenseNumber,
  }
  if (payload.email) authUpdates.email = payload.email
  if (payload.password) authUpdates.password = payload.password
  if (payload.signatureDataUrl) authUpdates.signature_data_url = payload.signatureDataUrl
  if (payload.passportDataUrl) authUpdates.passport_data_url = payload.passportDataUrl
  if (payload.gender) authUpdates.gender = payload.gender
  if (payload.profilePhotoUrl) authUpdates.profile_photo_url = payload.profilePhotoUrl
  const profileUpdates = {
    name: payload.name,
    specialty: payload.specialty,
    location: payload.location,
    languages: payload.languages,
    fee: payload.consultationFee,
    license_number: payload.licenseNumber,
    license_issuer: payload.licenseIssuer || null,
    license_expiry: payload.licenseExpiry || null,
    bank_code: payload.bankCode || null,
    bank_account: payload.bankAccount || null,
    currency: payload.currency || null,
    payout_method: payload.payoutMethod,
    mobile_money_operator: payload.mobileMoneyOperator || null,
    mobile_money_number: payload.mobileMoneyNumber || null,
    gender: payload.gender || null,
    profile_photo_url: payload.profilePhotoUrl || payload.passportDataUrl || null,
  }
  if (payload.signatureDataUrl) profileUpdates.signature_data_url = payload.signatureDataUrl
  if (payload.passportDataUrl) profileUpdates.passport_data_url = payload.passportDataUrl
  const { data: authRow, error: authError } = await updateAdaptive('doctors_auth', authUpdates, (query) => query.eq('id', req.params.doctorId))
  if (authError) return res.status(500).json({ error: authError.message })
  let { data: profile, error: profileError } = await updateAdaptive('doctors', profileUpdates, (query) => query.eq('id', String(req.params.doctorId)))
  if (profileError) return res.status(500).json({ error: profileError.message })
  await recordAuditLog(req, {
    action: 'doctor.update',
    resourceType: 'doctor',
    resourceId: req.params.doctorId,
    changes: { email: payload.email, specialty: payload.specialty },
  })
  res.json({ doctor: sanitizeDoctorForResponse({ ...profile, ...authRow, id: String(req.params.doctorId) }), message: 'Doctor updated' })
})

app.patch('/api/admin/doctors/:doctorId/verify', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const approvedAt = new Date().toISOString()
  const { data: authRow, error: authError } = await supabase
    .from('doctors_auth')
    .update({ verified: true })
    .eq('id', req.params.doctorId)
    .select('*')
    .maybeSingle()
  if (authError) return res.status(500).json({ error: authError.message })
  let { data: profile, error: profileError } = await supabase
    .from('doctors')
    .update({ verified: true, license_verified: true, is_online: false })
    .eq('id', String(req.params.doctorId))
    .select('*')
    .maybeSingle()
  if (profileError) return res.status(500).json({ error: profileError.message })
  if (authRow && !profile) {
    const createdProfile = {
      id: String(req.params.doctorId),
      email: authRow.email,
      name: authRow.name,
      specialty: authRow.specialty || 'General Practitioner',
      location: authRow.location || 'Nigeria',
      languages: ['English'],
      verified: true,
      license_verified: true,
      is_online: false,
      license_number: authRow.license_number,
      signature_data_url: authRow.signature_data_url || null,
      passport_data_url: authRow.passport_data_url || null,
      created_at: new Date().toISOString(),
    }
    const insert = await insertAdaptive('doctors', createdProfile)
    if (insert.error) return res.status(500).json({ error: insert.error.message })
    profile = createdProfile
  }
  if (!authRow && !profile) return res.status(404).json({ error: 'Doctor not found' })
  const doctor = sanitizeDoctorForResponse({ ...profile, ...authRow, id: String(req.params.doctorId), approved_at: approvedAt })
  const emailResult = await sendDoctorApprovalEmail(doctor).catch((error) => ({ sent: false, reason: error.message }))
  await recordAuditLog(req, {
    action: 'doctor.approve',
    resourceType: 'doctor',
    resourceId: req.params.doctorId,
  })
  res.json({ doctor, email: emailResult, message: 'Doctor approved and access granted' })
})

app.patch('/api/admin/doctors/:doctorId/account-status', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const status = String(req.body?.status || '').trim().toLowerCase()
  if (!['active', 'paused', 'stopped'].includes(status)) return res.status(400).json({ error: 'status must be active, paused, or stopped' })
  const reason = String(req.body?.reason || '').trim()
  const updates = {
    account_status: status,
    suspension_reason: status === 'active' ? null : reason || 'Account paused by platform admin pending review.',
    is_online: status === 'active' ? false : false,
  }
  const authUpdates = {
    account_status: status,
    suspension_reason: updates.suspension_reason,
  }
  const [{ data: profile, error: profileError }, { data: authRow, error: authError }] = await Promise.all([
    updateAdaptive('doctors', updates, (query) => query.eq('id', String(req.params.doctorId))),
    updateAdaptive('doctors_auth', authUpdates, (query) => query.eq('id', req.params.doctorId)),
  ])
  if (profileError && !isMissingColumnError(profileError)) return res.status(500).json({ error: profileError.message })
  if (authError && !isMissingColumnError(authError)) console.warn('doctors_auth status update skipped:', authError.message)
  if (!profile && !authRow) return res.status(404).json({ error: 'Doctor not found' })
  await recordAuditLog(req, {
    action: status === 'active' ? 'doctor.resume' : 'doctor.pause',
    resourceType: 'doctor',
    resourceId: req.params.doctorId,
    changes: { status, reason },
  })
  res.json({
    doctor: sanitizeDoctorForResponse({ ...profile, ...authRow, id: String(req.params.doctorId), account_status: status, suspension_reason: updates.suspension_reason }),
    message: status === 'active' ? 'Doctor resumed.' : 'Doctor paused.',
  })
})

// ---------- ADMIN: REVIEWS ----------
app.get('/api/admin/reviews', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const { data: reviews, error } = await supabase.from('reviews').select('*, doctors(name, specialty)')
  if (error) return res.status(500).json({ error: error.message })
  const enriched = reviews.map(r => ({
    ...r,
    doctor_name: r.doctors?.name,
    doctor_specialty: r.doctors?.specialty
  }))
  res.json({ reviews: enriched, total: enriched.length })
})

app.patch('/api/admin/reviews/:reviewId/verify', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  await supabase.from('reviews').update({ verified: true }).eq('id', req.params.reviewId)
  res.json({ message: 'Review verified' })
})

app.patch('/api/admin/reviews/:reviewId/reject', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  await supabase.from('reviews').delete().eq('id', req.params.reviewId)
  res.json({ message: 'Review rejected' })
})

async function buildPatientRecordSnapshot(patientId) {
  const patient = await findPatientByIdentifier(patientId)
  if (!patient) return null
  const resolvedPatientId = patient.id
  const labOrderIds = await supabase.from('lab_orders').select('id').eq('patient_id', resolvedPatientId)
  const [files, appointments, consultations, labOrders, labPayments, facilityReferrals, specialtyReferrals, vitals, vitalRequests, reviews, prescriptions, clinicalNotes] = await Promise.all([
    supabase.from('patient_files').select('*').eq('patient_id', resolvedPatientId),
    supabase.from('appointments').select('*').eq('patient_id', resolvedPatientId),
    supabase.from('consultations_ng').select('*').eq('patient_id', resolvedPatientId),
    supabase.from('lab_orders').select('*').eq('patient_id', resolvedPatientId),
    supabase.from('lab_payments').select('*').in('order_id', (labOrderIds.data || []).map((order) => order.id)),
    supabase.from('facility_referrals').select('*').eq('patient_id', resolvedPatientId),
    supabase.from('specialty_referrals').select('*').eq('patient_id', resolvedPatientId).order('created_at', { ascending: false }),
    supabase.from('vital_parameters').select('*').eq('patient_id', resolvedPatientId).order('measured_at', { ascending: false }),
    supabase.from('vital_parameter_requests').select('*').eq('patient_id', resolvedPatientId).order('requested_at', { ascending: false }),
    supabase.from('reviews').select('*').eq('patient_id', resolvedPatientId).order('created_at', { ascending: false }),
    supabase.from('prescriptions').select('*').eq('patient_id', resolvedPatientId).order('issued_at', { ascending: false }),
    supabase.from('patient_clinical_notes').select('*').eq('patient_id', resolvedPatientId).order('created_at', { ascending: false }),
  ])
  return {
    patient: sanitizePatientForResponse(patient),
    files: files.data || [],
    appointments: appointments.data || [],
    consultations_ng: consultations.data || [],
    labs: { orders: labOrders.data || [], payments: labPayments.data || [] },
    referrals: { specialty: specialtyReferrals.data || [], facility: facilityReferrals.data || [] },
    vitals: vitals.data || [],
    vital_requests: vitalRequests.data || [],
    reviews: reviews.data || [],
    prescriptions: prescriptions.data || [],
    clinical_notes: clinicalNotes.data || [],
  }
}

// ---------- SPECIALTY REFERRALS ----------
app.get('/api/referrals/specialty/doctors', async (req, res) => {
  const specialty = String(req.query.specialty || '').trim()
  const excludeDoctorId = String(req.query.excludeDoctorId || '').trim()
  if (!specialty) return res.status(400).json({ error: 'specialty is required' })

  let query = supabase
    .from('doctors')
    .select('id,email,name,specialty,location,languages,rating,rating_count,is_online,updated_at,account_status,profile_photo_url,gender')
    .eq('verified', true)
    .eq('license_verified', true)
    .or('account_status.is.null,account_status.eq.active')
    .order('is_online', { ascending: false })
    .order('rating', { ascending: false })
    .limit(100)
  if (excludeDoctorId) query = query.neq('id', excludeDoctorId)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  const doctors = (data || []).filter((doctor) => specialtyMatches(doctor.specialty, specialty)).map((doctor) => {
    const online = isDoctorRecentlyOnline(doctor)
    return sanitizeDoctorForResponse({
      ...doctor,
      is_online: online,
      availability_status: online ? 'online' : 'offline',
    })
  })
  res.json({ doctors })
})

app.post('/api/referrals/specialty/create', async (req, res) => {
  const { doctorId, patientId, consultationId, fromSpecialty, toSpecialty, targetDoctorId, appointmentAt, reason, notes } = req.body || {}
  if (!doctorId || !patientId || !toSpecialty || !reason) {
    return res.status(400).json({ error: 'doctorId, patientId, target specialty, and reason are required' })
  }
  const [doctor, snapshot, targetDoctor] = await Promise.all([
    getDoctorProfile(doctorId),
    buildPatientRecordSnapshot(patientId),
    targetDoctorId ? getDoctorProfile(targetDoctorId) : Promise.resolve(null),
  ])
  if (!doctor) return res.status(404).json({ error: 'Referring doctor not found' })
  if (!snapshot?.patient) return res.status(404).json({ error: 'Patient not found' })
  if (targetDoctorId) {
    if (!targetDoctor) return res.status(404).json({ error: 'Selected specialist not found' })
    if (!specialtyMatches(targetDoctor.specialty, toSpecialty)) {
      return res.status(400).json({ error: 'Selected doctor does not match the target specialty' })
    }
  }
  const appointmentDate = appointmentAt ? new Date(appointmentAt) : null
  if (appointmentDate && Number.isNaN(appointmentDate.getTime())) return res.status(400).json({ error: 'Invalid appointment time' })

  const referral = {
    id: generateId('sref'),
    patient_id: snapshot.patient.id,
    from_doctor_id: String(doctorId),
    from_doctor_name: doctor.name || '',
    from_specialty: fromSpecialty || doctor.specialty || 'General Practitioner',
    to_specialty: String(toSpecialty).trim(),
    target_doctor_id: targetDoctorId ? String(targetDoctorId) : null,
    target_doctor_name: targetDoctor?.name || null,
    source_consultation_id: consultationId || null,
    consultation_id: consultationId || null,
    reason: String(reason).trim(),
    notes: String(notes || '').trim() || null,
    patient_snapshot: snapshot.patient,
    record_snapshot: snapshot,
    status: 'pending',
    created_at: new Date().toISOString(),
  }
  const insert = await insertAdaptive('specialty_referrals', referral)
  if (insert.error) return res.status(500).json({ error: insert.error.message })

  const targetDoctors = targetDoctorId
    ? [{ id: String(targetDoctorId) }]
    : ((await supabase
      .from('doctors')
      .select('id,specialty')
      .eq('verified', true)
      .eq('license_verified', true)
      .or('account_status.is.null,account_status.eq.active')
      .limit(100)).data || []).filter((doctor) => specialtyMatches(doctor.specialty, referral.to_specialty)).slice(0, 20)

  await Promise.all((targetDoctors || []).map((targetDoctor) => insertAdaptive('notifications', {
    id: generateId('notif'),
    user_id: targetDoctor.id,
    user_type: 'doctor',
    notification_type: 'specialty_referral',
    type: 'referral',
    title: 'Specialty referral available',
    message: `${doctor.name || 'A doctor'} referred ${snapshot.patient.name || snapshot.patient.id} to ${referral.to_specialty}.`,
    related_resource_type: 'specialty_referral',
    related_resource_id: referral.id,
    is_read: false,
    notification_channels: ['in_app'],
    created_at: new Date().toISOString(),
  })))

  await insertAdaptive('notifications', {
    id: generateId('notif'),
    user_id: snapshot.patient.id,
    user_type: 'patient',
    notification_type: 'specialty_referral_created',
    type: 'referral',
    title: 'Specialty referral created',
    message: `${doctor.name || 'Your doctor'} referred you to ${targetDoctor?.name ? `Dr. ${targetDoctor.name}` : referral.to_specialty}. You can review this in your notifications and appointments.`,
    related_resource_type: 'specialty_referral',
    related_resource_id: referral.id,
    is_read: false,
    notification_channels: ['in_app'],
    created_at: new Date().toISOString(),
  })

  let appointment = null
  if (appointmentAt) {
    const appointmentId = generateId('apt-ref')
    appointment = {
      id: appointmentId,
      patient_id: snapshot.patient.id,
      doctor_id: targetDoctorId ? String(targetDoctorId) : null,
      doctor_name: targetDoctor?.name || referral.to_specialty,
      doctor_specialty: referral.to_specialty,
      consultation_type: 'specialty_referral',
      subscription_type: 'referral',
      scheduled_date: appointmentDate.toISOString(),
      duration_minutes: 30,
      status: 'scheduled',
      notes: `Referral from Dr. ${doctor.name || doctorId}: ${referral.reason}`,
      tokens_charged: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    await insertAdaptive('appointments', appointment)
    await insertAdaptive('notifications', {
      id: generateId('notif'),
      user_id: snapshot.patient.id,
      user_type: 'patient',
      notification_type: 'specialty_referral_appointment',
      type: 'appointment',
      title: 'Specialist appointment suggested',
      message: `A ${referral.to_specialty} appointment was scheduled for ${appointmentDate.toLocaleString()}.`,
      related_resource_type: 'appointment',
      related_resource_id: appointmentId,
      is_read: false,
      notification_channels: ['in_app'],
      created_at: new Date().toISOString(),
    })
  }

  res.status(201).json({ referral, appointment, message: 'Specialty referral created with patient record attached.' })
})

app.get('/api/referrals/specialty', async (req, res) => {
  let query = supabase.from('specialty_referrals').select('*').order('created_at', { ascending: false })
  if (req.query.patientId) query = query.eq('patient_id', req.query.patientId)
  if (req.query.doctorId) query = query.eq('from_doctor_id', req.query.doctorId)
  if (req.query.targetDoctorId) query = query.or(`target_doctor_id.is.null,target_doctor_id.eq.${String(req.query.targetDoctorId).replace(/[,()]/g, '')}`)
  const { data, error } = await query.limit(100)
  if (error) return res.status(500).json({ error: error.message })
  const specialty = String(req.query.specialty || '').trim()
  res.json({ referrals: (data || []).filter((referral) => specialtyMatches(referral.to_specialty, specialty)) })
})

app.post('/api/referrals/specialty/:referralId/accept', async (req, res) => {
  const referralId = String(req.params.referralId || '').trim()
  const doctorId = String(req.body?.doctorId || '').trim()
  if (!referralId || !doctorId) return res.status(400).json({ error: 'referralId and doctorId required' })

  const { data: referral, error: referralError } = await supabase
    .from('specialty_referrals')
    .select('*')
    .eq('id', referralId)
    .maybeSingle()
  if (referralError) return res.status(500).json({ error: referralError.message })
  if (!referral) return res.status(404).json({ error: 'Referral not found' })
  if (String(referral.status || '').toLowerCase() === 'accepted') {
    return res.status(409).json({ error: 'Referral has already been accepted' })
  }

  const doctor = await getDoctorProfile(doctorId)
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' })
  if (!specialtyMatches(doctor.specialty, referral.to_specialty)) {
    return res.status(403).json({ error: 'This referral belongs to a different specialty' })
  }
  if (referral.target_doctor_id && String(referral.target_doctor_id) !== doctorId) {
    return res.status(403).json({ error: 'This referral was assigned to another specialist' })
  }

  const patient = await findPatientByIdentifier(referral.patient_id)
  if (!patient) return res.status(404).json({ error: 'Patient not found' })

  const split = calculateFacilitySpecialtySplit({
    channel: 'specialty_referral',
    doctor,
    durationMin: Number(req.body?.durationMin || 15),
  })
  const consultation = {
    id: generateId('cng-ref'),
    patient_id: patient.id,
    doctor_id: doctorId,
    facility_id: patient.facility_id || null,
    channel: 'specialty_referral',
    track: doctor.specialty || referral.to_specialty || 'specialty',
    duration_min: split.durationMin,
    blocks: split.blocks,
    total_ngn: split.total_ngn,
    status: 'in_progress',
    created_at: new Date().toISOString(),
  }
  const { data: insertedConsultation, error: consultationError } = await supabase
    .from('consultations_ng')
    .insert(consultation)
    .select('*')
    .maybeSingle()
  if (consultationError) return res.status(500).json({ error: consultationError.message })

  const financials = await recordConsultationFinancials({
    consultationId: insertedConsultation?.id || consultation.id,
    patientId: patient.id,
    doctorId,
    facilityId: patient.facility_id || null,
    split,
    source: 'specialty_referral',
    chargePatient: true,
    debitFacilityTopup: false,
  })
  if (!financials.ok) {
    await supabase.from('consultations_ng').update({ status: 'cancelled' }).eq('id', insertedConsultation?.id || consultation.id)
    return res.status(402).json(financials)
  }

  const acceptedAt = new Date().toISOString()
  const { data: updatedReferral, error: updateError } = await supabase
    .from('specialty_referrals')
    .update({
      status: 'accepted',
      accepted_by_doctor_id: doctorId,
      accepted_at: acceptedAt,
      consultation_id: insertedConsultation?.id || consultation.id,
      updated_at: acceptedAt,
    })
    .eq('id', referralId)
    .select('*')
    .maybeSingle()
  if (updateError) return res.status(500).json({ error: updateError.message })

  if (referral.source_consultation_id || (referral.consultation_id && referral.consultation_id !== (insertedConsultation?.id || consultation.id))) {
    await supabase
      .from('consultations_ng')
      .update({ status: 'referred', completed_at: acceptedAt, updated_at: acceptedAt })
      .eq('id', referral.source_consultation_id || referral.consultation_id)
      .neq('id', insertedConsultation?.id || consultation.id)
  }

  await insertAdaptive('notifications', [
    {
      id: generateId('notif'),
      user_id: patient.id,
      user_type: 'patient',
      notification_type: 'specialty_referral_accepted',
      type: 'referral',
      title: 'Specialist accepted your referral',
      message: `Dr. ${doctor.name || doctorId} accepted your ${doctor.specialty || referral.to_specialty} referral. Open the video room when ready.`,
      related_resource_type: 'consultation',
      related_resource_id: insertedConsultation?.id || consultation.id,
      is_read: false,
      notification_channels: ['in_app'],
      created_at: acceptedAt,
    },
    {
      id: generateId('notif'),
      user_id: referral.from_doctor_id,
      user_type: 'doctor',
      notification_type: 'specialty_referral_accepted',
      type: 'referral',
      title: 'Referral accepted',
      message: `Dr. ${doctor.name || doctorId} accepted ${patient.name || patient.id}. The previous consultation was closed as referred.`,
      related_resource_type: 'specialty_referral',
      related_resource_id: referralId,
      is_read: false,
      notification_channels: ['in_app'],
      created_at: acceptedAt,
    },
  ])

  res.json({
    referral: updatedReferral || referral,
    patient: sanitizePatientForResponse(patient),
    consultation: { ...(insertedConsultation || consultation), patient_tokens_charged: financials.tokensCharged },
    split: financials.split,
    tokensCharged: financials.tokensCharged,
    doctor: sanitizeDoctorForResponse(doctor),
    message: 'Referral accepted, patient tokens charged, and consultation room opened',
  })
})

app.post('/api/patients/referrals', async (req, res) => {
  req.url = '/api/referrals/specialty/create'
  req.body = {
    ...req.body,
    doctorId: req.body.doctorId || req.body.fromDoctorId || 'system-doctor',
  }
  app.handle(req, res)
})

app.get('/api/patients/:patientId/referrals', async (req, res) => {
  const { data } = await supabase.from('specialty_referrals').select('*').eq('patient_id', req.params.patientId).order('created_at', { ascending: false })
  res.json({ referrals: data || [] })
})

// ---------- ADMIN: REFERRALS ----------
app.post('/api/admin/referrals', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  req.url = '/api/referrals/specialty/create'
  app.handle(req, res)
})

app.get('/api/admin/referrals', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const { data } = await supabase.from('specialty_referrals').select('*').order('created_at', { ascending: false }).limit(500)
  res.json({ referrals: data || [] })
})

// ---------- ADMIN: FILES ----------
app.post('/api/admin/files/upload', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const mockFiles = [{
    id: `file-${Date.now()}`,
    name: 'Sample Document.pdf',
    size: '2.4 MB',
    type: 'application/pdf',
    uploadedAt: new Date().toISOString()
  }]
  res.status(201).json({ files: mockFiles, message: 'Files uploaded' })
})

app.get('/api/admin/files', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  res.json({ files: [], total: 0 })
})

app.delete('/api/admin/files/:fileId', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  res.json({ message: 'File deleted' })
})

// ---------- ADMIN: PATIENTS ----------
app.get('/api/admin/patients', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const { data } = await supabase.from('patients').select('*')
  res.json({ patients: data || [], total: data?.length || 0 })
})

app.get('/api/admin/patients/:patientId', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const patient = await findPatientByIdentifier(req.params.patientId)
  if (!patient) return res.status(404).json({ error: 'Patient not found' })
  res.json({ patient: sanitizePatientForResponse(patient) })
})

// ---------- PATIENT RECORD AGGREGATION ----------
app.get('/api/patients/:patientId/record', async (req, res) => {
  const patient = await findPatientByIdentifier(req.params.patientId)
  if (!patient) return res.status(404).json({ error: 'Patient not found' })
  const patientId = patient.id

  const [tokens, files, appointments, consultations, labOrders, labPayments, facilityReferrals, specialtyReferrals, vitals, vitalRequests, reviews, prescriptions, clinicalNotes] = await Promise.all([
    supabase.from('patient_tokens').select('balance').eq('patient_id', patientId).maybeSingle(),
    supabase.from('patient_files').select('*').eq('patient_id', patientId),
    supabase.from('appointments').select('*').eq('patient_id', patientId),
    supabase.from('consultations_ng').select('*').eq('patient_id', patientId),
    supabase.from('lab_orders').select('*').eq('patient_id', patientId),
    supabase.from('lab_payments').select('*').in('order_id', (await supabase.from('lab_orders').select('id').eq('patient_id', patientId)).data?.map(o => o.id) || []),
    supabase.from('facility_referrals').select('*').eq('patient_id', patientId),
    supabase.from('specialty_referrals').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }),
    supabase.from('vital_parameters').select('*').eq('patient_id', patientId).order('measured_at', { ascending: false }),
    supabase.from('vital_parameter_requests').select('*').eq('patient_id', patientId).order('requested_at', { ascending: false }),
    supabase.from('reviews').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }),
    supabase.from('prescriptions').select('*').eq('patient_id', patientId).order('issued_at', { ascending: false }),
    supabase.from('patient_clinical_notes').select('*').eq('patient_id', patientId).order('created_at', { ascending: false })
  ])

  res.json({
    patient: sanitizePatientForResponse(patient),
    tokens: { balance: tokens.data?.balance || 0, transactions: [] },
    files: files.data || [],
    referrals: { specialty: specialtyReferrals.data || [], facility: facilityReferrals.data || [] },
    appointments: appointments.data || [],
    consultations_ng: consultations.data || [],
    labs: { orders: labOrders.data || [], payments: labPayments.data || [] },
    vitals: vitals.data || [],
    vital_requests: vitalRequests.data || [],
    reviews: reviews.data || [],
    prescriptions: prescriptions.data || [],
    clinical_notes: clinicalNotes.data || []
  })
})

app.get('/api/facilities/:facilityId/patients', async (req, res) => {
  const { facilityId } = req.params
  const pin = String(req.query.pin || '').trim()
  const search = String(req.query.search || '').trim()
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)))
  const offset = Math.max(0, Number(req.query.offset || 0))

  const facility = await getFacilityById(facilityId)
  if (!facility || facility.pin !== pin) return res.status(401).json({ error: 'Invalid facility credentials' })
  if (facility.is_active === false) return res.status(403).json({ error: facility.suspension_reason || 'This facility is paused by platform admin pending review.' })

  let query = supabase
    .from('patients')
    .select('*', { count: 'exact' })
    .eq('facility_id', facilityId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    const term = search.replace(/[%_,]/g, '')
    query = query.or(`id.ilike.%${term}%,name.ilike.%${term}%,phone.ilike.%${term}%`)
  }

  const { data, error, count } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json({
    patients: (data || []).map(sanitizePatientForResponse),
    total: count || 0,
    limit,
    offset,
  })
})

app.get('/api/facilities/:facilityId/patients/:patientId/record', async (req, res) => {
  const { facilityId, patientId } = req.params
  const pin = String(req.query.pin || '').trim()
  const facility = await getFacilityById(facilityId)
  if (!facility || facility.pin !== pin) return res.status(401).json({ error: 'Invalid facility credentials' })

  const patient = await findPatientByIdentifier(patientId)
  if (!patient) return res.status(404).json({ error: 'Patient not found' })
  if (patient.facility_id && String(patient.facility_id) !== String(facilityId)) {
    return res.status(404).json({ error: 'Patient not found for this facility' })
  }
  if (!patient.facility_id) {
    await supabase.from('patients').update({ facility_id: facilityId, facility_type: facility.type, registered_via: patient.registered_via || 'facility' }).eq('id', patient.id)
  }

  const patientIdResolved = patient.id
  const [tokens, files, appointments, consultations, labOrders, labPayments, facilityReferrals, specialtyReferrals, vitals, vitalRequests, reviews, prescriptions, clinicalNotes] = await Promise.all([
    supabase.from('patient_tokens').select('balance').eq('patient_id', patientIdResolved).maybeSingle(),
    supabase.from('patient_files').select('*').eq('patient_id', patientIdResolved),
    supabase.from('appointments').select('*').eq('patient_id', patientIdResolved),
    supabase.from('consultations_ng').select('*').eq('patient_id', patientIdResolved),
    supabase.from('lab_orders').select('*').eq('patient_id', patientIdResolved),
    supabase.from('lab_payments').select('*').in('order_id', (await supabase.from('lab_orders').select('id').eq('patient_id', patientIdResolved)).data?.map(o => o.id) || []),
    supabase.from('facility_referrals').select('*').eq('patient_id', patientIdResolved),
    supabase.from('specialty_referrals').select('*').eq('patient_id', patientIdResolved).order('created_at', { ascending: false }),
    supabase.from('vital_parameters').select('*').eq('patient_id', patientIdResolved).order('measured_at', { ascending: false }),
    supabase.from('vital_parameter_requests').select('*').eq('patient_id', patientIdResolved).order('requested_at', { ascending: false }),
    supabase.from('reviews').select('*').eq('patient_id', patientIdResolved).order('created_at', { ascending: false }),
    supabase.from('prescriptions').select('*').eq('patient_id', patientIdResolved).order('issued_at', { ascending: false }),
    supabase.from('patient_clinical_notes').select('*').eq('patient_id', patientIdResolved).order('created_at', { ascending: false })
  ])

  res.json({
    patient: sanitizePatientForResponse(patient),
    tokens: { balance: tokens.data?.balance || 0, transactions: [] },
    files: files.data || [],
    referrals: { specialty: specialtyReferrals.data || [], facility: facilityReferrals.data || [] },
    appointments: appointments.data || [],
    consultations_ng: consultations.data || [],
    labs: { orders: labOrders.data || [], payments: labPayments.data || [] },
    vitals: vitals.data || [],
    vital_requests: vitalRequests.data || [],
    reviews: reviews.data || [],
    prescriptions: prescriptions.data || [],
    clinical_notes: clinicalNotes.data || []
  })
})

app.get('/api/facilities/:facilityId/stats', async (req, res) => {
  const { facilityId } = req.params
  const pin = String(req.query.pin || '').trim()
  const facility = await getFacilityById(facilityId)
  if (!facility || facility.pin !== pin) return res.status(401).json({ error: 'Invalid facility credentials' })

  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const startOfWeek = new Date(startOfDay)
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay())

  const [patientsTotal, patientsToday, patientsWeek, consultsTotal, consultsToday, consultsWeek] = await Promise.all([
    supabase.from('patients').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId),
    supabase.from('patients').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId).gte('created_at', startOfDay.toISOString()),
    supabase.from('patients').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId).gte('created_at', startOfWeek.toISOString()),
    supabase.from('consultations_ng').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId),
    supabase.from('consultations_ng').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId).gte('created_at', startOfDay.toISOString()),
    supabase.from('consultations_ng').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId).gte('created_at', startOfWeek.toISOString()),
  ])

  res.json({
    patients: {
      total: patientsTotal.count || 0,
      today: patientsToday.count || 0,
      this_week: patientsWeek.count || 0,
    },
    consultations: {
      total: consultsTotal.count || 0,
      today: consultsToday.count || 0,
      this_week: consultsWeek.count || 0,
    },
  })
})

app.patch('/api/facilities/:facilityId/patients/:patientId', async (req, res) => {
  const { facilityId, patientId } = req.params
  const pin = String(req.body?.pin || req.query.pin || '').trim()
  const facility = await getFacilityById(facilityId)
  if (!facility || facility.pin !== pin) return res.status(401).json({ error: 'Invalid facility credentials' })

  const patient = await findPatientByIdentifier(patientId)
  if (!patient || patient.facility_id !== facilityId) return res.status(404).json({ error: 'Patient not found for this facility' })

  const updates = {}
  if (req.body?.name !== undefined) updates.name = String(req.body.name || '').trim()
  if (req.body?.phone !== undefined) updates.phone = String(req.body.phone || '').trim()
  if (req.body?.gender !== undefined || req.body?.sex !== undefined) updates.gender = String(req.body.gender || req.body.sex || '').trim()
  if (req.body?.profilePhotoUrl !== undefined || req.body?.profile_photo_url !== undefined) {
    updates.profile_photo_url = String(req.body.profilePhotoUrl || req.body.profile_photo_url || '').trim()
  }
  if (req.body?.patientPin !== undefined || req.body?.portalPin !== undefined) {
    const nextPin = String(req.body.patientPin || req.body.portalPin || '').trim()
    if (nextPin && !/^\d{6}$/.test(nextPin)) return res.status(400).json({ error: 'Patient PIN must be 6 digits' })
    if (nextPin) updates.portal_pin = nextPin
  }
  if (!updates.name && !updates.phone && !updates.portal_pin && updates.gender === undefined && updates.profile_photo_url === undefined) return res.status(400).json({ error: 'No patient changes supplied' })

  const { data, error } = await updateAdaptive('patients', updates, (query) => query.eq('id', patient.id))
  if (error) return res.status(500).json({ error: error.message })
  res.json({ patient: sanitizePatientForResponse(data || { ...patient, ...updates }), message: 'Patient updated' })
})

app.get('/api/doctors/:doctorId/facility-patients', async (req, res) => {
  const { doctorId } = req.params
  const search = String(req.query.search || '').trim().toLowerCase()
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)))
  const offset = Math.max(0, Number(req.query.offset || 0))

  const { data: consultations, error: consultError } = await supabase
    .from('consultations_ng')
    .select('*')
    .eq('doctor_id', String(doctorId))
    .order('created_at', { ascending: false })
    .limit(300)
  if (consultError) return res.status(500).json({ error: consultError.message })

  const patientIds = [...new Set((consultations || []).map((item) => item.patient_id).filter(Boolean))]
  if (patientIds.length === 0) return res.json({ patients: [], total: 0, limit, offset })

  const { data: patients, error: patientError } = await supabase.from('patients').select('*').in('id', patientIds)
  if (patientError) return res.status(500).json({ error: patientError.message })

  const facilityIds = [...new Set([
    ...(consultations || []).map((item) => item.facility_id),
    ...(patients || []).map((item) => item.facility_id),
  ].filter(Boolean))]
  const { data: facilities } = facilityIds.length
    ? await supabase.from('facilities').select('id, type, name, state, lga').in('id', facilityIds)
    : { data: [] }
  const facilityById = new Map((facilities || []).map((facility) => [String(facility.id), facility]))

  const consultationByPatient = new Map()
  for (const item of consultations || []) {
    if (!consultationByPatient.has(item.patient_id)) consultationByPatient.set(item.patient_id, item)
  }

  let rows = (patients || []).map((patient) => {
    const latestConsultation = consultationByPatient.get(patient.id)
    return {
      ...sanitizePatientForResponse(patient),
      latest_consultation: latestConsultation || null,
      assigned_at: latestConsultation?.created_at || patient.created_at,
      facility_id: latestConsultation?.facility_id || patient.facility_id,
      facility: facilityById.get(String(latestConsultation?.facility_id || patient.facility_id || '')) || null,
      facility_name: facilityById.get(String(latestConsultation?.facility_id || patient.facility_id || ''))?.name || '',
      facility_type: facilityById.get(String(latestConsultation?.facility_id || patient.facility_id || ''))?.type || patient.facility_type || '',
    }
  })

  if (search) {
    rows = rows.filter((patient) => {
      const haystack = [patient.id, patient.name, patient.phone, patient.email, patient.facility_id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(search)
    })
  }

  rows.sort((a, b) => new Date(b.assigned_at || 0) - new Date(a.assigned_at || 0))
  res.json({
    patients: rows.slice(offset, offset + limit),
    total: rows.length,
    limit,
    offset,
  })
})

app.get('/api/doctors/:doctorId/consultation-patients', async (req, res) => {
  const { doctorId } = req.params
  const search = String(req.query.search || '').trim().toLowerCase()
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)))
  const offset = Math.max(0, Number(req.query.offset || 0))
  const onlineOnly = req.query.onlineOnly === undefined ? true : String(req.query.onlineOnly).toLowerCase() !== 'false'

  const { data: consultations, error: consultError } = await supabase
    .from('consultations_ng')
    .select('*')
    .eq('doctor_id', String(doctorId))
    .order('created_at', { ascending: false })
    .limit(500)
  if (consultError) return res.status(500).json({ error: consultError.message })

  const patientIds = [...new Set((consultations || []).map((item) => item.patient_id).filter(Boolean))]
  if (patientIds.length === 0) return res.json({ patients: [], total: 0, limit, offset })

  const { data: patients, error: patientError } = await supabase.from('patients').select('*').in('id', patientIds)
  if (patientError) return res.status(500).json({ error: patientError.message })

  const facilityIds = [...new Set([
    ...(consultations || []).map((item) => item.facility_id),
    ...(patients || []).map((item) => item.facility_id),
  ].filter(Boolean))]
  const { data: facilities } = facilityIds.length
    ? await supabase.from('facilities').select('id, type, name, state, lga').in('id', facilityIds)
    : { data: [] }
  const facilityById = new Map((facilities || []).map((facility) => [String(facility.id), facility]))

  const consultationIds = (consultations || []).map((item) => item.id).filter(Boolean)
  const { data: videoJoinSignals } = consultationIds.length
    ? await supabase
      .from('video_signals')
      .select('room_id, sender_id, sender_type, type, seq, created_at')
      .in('room_id', consultationIds)
      .in('type', ['join_request', 'join_accept'])
      .order('seq', { ascending: false })
      .limit(300)
    : { data: [] }
  const latestVideoSignalByRoom = new Map()
  for (const signal of videoJoinSignals || []) {
    if (!latestVideoSignalByRoom.has(signal.room_id)) latestVideoSignalByRoom.set(signal.room_id, signal)
  }

  const patientById = new Map((patients || []).map((patient) => [patient.id, patient]))
  const activeConsultations = (consultations || []).filter((consultation) => {
    const status = String(consultation.status || '').toLowerCase()
    return !['completed', 'cancelled', 'canceled', 'referred'].includes(status)
  })
  const consultationByPatient = new Map()
  for (const consultation of activeConsultations) {
    const current = consultationByPatient.get(consultation.patient_id)
    const latestVideoSignal = latestVideoSignalByRoom.get(consultation.id)
    const currentSignal = current ? latestVideoSignalByRoom.get(current.id) : null
    const consultationWaiting = latestVideoSignal?.type === 'join_request'
    const currentWaiting = currentSignal?.type === 'join_request'
    if (!current || (consultationWaiting && !currentWaiting) || new Date(consultation.created_at || 0) > new Date(current.created_at || 0)) {
      consultationByPatient.set(consultation.patient_id, consultation)
    }
  }

  let rows = [...consultationByPatient.values()].map((consultation) => {
    const patient = patientById.get(consultation.patient_id) || { id: consultation.patient_id, name: 'Patient' }
    const latestVideoSignal = latestVideoSignalByRoom.get(consultation.id)
    const facilityId = consultation.facility_id || patient.facility_id || null
    const facility = facilityById.get(String(facilityId || '')) || null
    const channel = String(consultation.channel || '')
    const source = channel === 'direct_home'
      ? 'direct_patient'
      : channel === 'specialty_referral'
        ? 'specialty_referral'
        : 'facility'
    return {
      ...sanitizePatientForResponse(patient),
      latest_consultation: consultation,
      assigned_at: consultation.created_at,
      facility_id: facilityId,
      facility,
      facility_name: facility?.name || '',
      facility_type: facility?.type || patient.facility_type || '',
      source,
      video_waiting: latestVideoSignal?.type === 'join_request',
      video_waiting_at: latestVideoSignal?.type === 'join_request' ? latestVideoSignal.created_at : null,
      online_status: patient.is_online ? 'online' : 'offline',
    }
  })

  if (onlineOnly) {
    rows = rows.filter((patient) => patient.is_online || patient.video_waiting)
  }

  if (search) {
    rows = rows.filter((patient) => {
      const haystack = [patient.id, patient.name, patient.phone, patient.email, patient.facility_id, patient.facility_name, patient.facility_type, patient.latest_consultation?.channel]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(search)
    })
  }

  rows.sort((a, b) => {
    const waitingDelta = Number(Boolean(b.video_waiting)) - Number(Boolean(a.video_waiting))
    if (waitingDelta) return waitingDelta
    const sourceWeight = (patient) => patient.source === 'facility' ? 2 : patient.source === 'specialty_referral' ? 1 : 0
    const sourceDelta = sourceWeight(b) - sourceWeight(a)
    if (sourceDelta) return sourceDelta
    return new Date(b.assigned_at || 0) - new Date(a.assigned_at || 0)
  })

  res.json({
    patients: rows.slice(offset, offset + limit),
    total: rows.length,
    limit,
    offset,
  })
})

// ---------- FACILITIES ----------
app.post('/api/facilities', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const { type, name, state, lga, address, phone, email, referral_payout_ngn, pin } = req.body
  if (!type || !name) return res.status(400).json({ error: 'type and name required' })
  const id = generateId('fac')
  const facilityPin = pin || Math.floor(100000 + Math.random() * 900000).toString()
  await supabase.from('facilities').insert({
    id, type, name, state, lga, address, phone, email,
    pin: facilityPin, referral_payout_ngn: referral_payout_ngn || 0, is_active: true
  })
  await supabase.from('facility_wallets').insert({ facility_id: id, balance_ngn: 0 })
  await recordAuditLog(req, {
    action: 'facility.create',
    resourceType: 'facility',
    resourceId: id,
    changes: { type, name, state, lga },
  })
  res.status(201).json({ facility: { id, type, name, state, lga, address, phone, email, referral_payout_ngn: referral_payout_ngn || 0, pin: facilityPin }, message: 'Facility created' })
})

app.get('/api/facilities', async (req, res) => {
  const type = req.query.type
  let query = supabase.from('facilities').select('*, facility_wallets(balance_ngn)')
  if (type) query = query.eq('type', type)
  let { data, error } = await query
  if (error) {
    let fallback = supabase.from('facilities').select('*')
    if (type) fallback = fallback.eq('type', type)
    const fallbackResult = await fallback
    data = fallbackResult.data || []
  }
  const facilityIds = (data || []).map((facility) => facility.id).filter(Boolean)
  const { data: wallets } = facilityIds.length
    ? await supabase.from('facility_wallets').select('facility_id, balance_ngn').in('facility_id', facilityIds)
    : { data: [] }
  const walletByFacility = new Map((wallets || []).map((wallet) => [wallet.facility_id, wallet]))
  const result = (data || []).map(f => ({
    ...f,
    wallet_balance_ngn: walletByFacility.get(f.id)?.balance_ngn ?? f.facility_wallets?.[0]?.balance_ngn ?? 0,
  }))
  res.json({ facilities: result })
})

app.patch('/api/admin/facilities/:facilityId', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const { facilityId } = req.params
  const updates = {}
  ;['type', 'name', 'state', 'lga', 'address', 'phone', 'email'].forEach((key) => {
    if (req.body?.[key] !== undefined) updates[key] = String(req.body[key] || '').trim()
  })
  if (req.body?.pin !== undefined) {
    const pin = String(req.body.pin || '').trim()
    if (pin && !/^\d{6}$/.test(pin)) return res.status(400).json({ error: 'Facility PIN must be 6 digits' })
    if (pin) updates.pin = pin
  }
  if (req.body?.referral_payout_ngn !== undefined) {
    updates.referral_payout_ngn = Math.max(0, Math.round(Number(req.body.referral_payout_ngn || 0)))
  }
  if (req.body?.is_active !== undefined) updates.is_active = Boolean(req.body.is_active)
  if (req.body?.suspension_reason !== undefined) {
    updates.suspension_reason = String(req.body.suspension_reason || '').trim() || null
  }
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No facility changes supplied' })

  const { data, error } = await updateAdaptive('facilities', updates, (query) => query.eq('id', facilityId))
  if (error) return res.status(500).json({ error: error.message })
  if (!data) return res.status(404).json({ error: 'Facility not found' })
  await recordAuditLog(req, {
    action: 'facility.update',
    resourceType: 'facility',
    resourceId: facilityId,
    changes: updates,
  })
  res.json({ facility: data, message: 'Facility updated' })
})

app.post('/api/facilities/auth', async (req, res) => {
  if (await blockIfPlatformPaused(req, res)) return
  const { facilityId, pin } = req.body
  const { data: facility } = await supabase.from('facilities').select('*').eq('id', facilityId).eq('pin', pin).maybeSingle()
  if (!facility) return res.status(401).json({ error: 'Invalid credentials' })
  if (facility.is_active === false) {
    return res.status(403).json({
      error: facility.suspension_reason || 'This facility account is paused by platform admin pending review.',
      facilityPaused: true,
    })
  }
  const wallet = await getOrCreateFacilityWallet(facilityId)
  const { data: tx } = await supabase.from('facility_wallet_tx').select('*').eq('facility_id', facilityId).order('created_at', { ascending: false }).limit(20)
  res.json({ facility: { ...facility, pin: undefined }, wallet, transactions: tx || [] })
})

app.post('/api/admin/facilities/:facilityId/fund', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const { facilityId } = req.params
  const amountNgn = Math.max(0, Math.round(Number(req.body?.amount_ngn || 0)))
  if (amountNgn <= 0) return res.status(400).json({ error: 'amount_ngn must be > 0' })
  await creditFacilityWallet(facilityId, amountNgn, { reason: 'Admin funding', ref_type: 'admin_fund', ref_id: req.headers['x-admin-email'] })
  const wallet = await getOrCreateFacilityWallet(facilityId)
  await recordAuditLog(req, {
    action: 'facility.wallet.fund',
    resourceType: 'facility_wallet',
    resourceId: facilityId,
    changes: { amount_ngn: amountNgn, balance_ngn: wallet.balance_ngn },
  })
  res.json({ facilityId, balance_ngn: wallet.balance_ngn, message: 'Wallet funded' })
})

// ---------- CONSULTATIONS (NGN) ----------
app.post('/api/consultations/start', async (req, res) => {
  const { patientId, doctorId, channel, track, facilityId, facilityPin, durationMin } = req.body
  const allowedChannels = ['direct_home', 'facility_private', 'facility_phc']
  if (!patientId || !doctorId || !allowedChannels.includes(channel)) return res.status(400).json({ error: 'patientId, doctorId, and valid channel required' })

  const patientRecord = await findPatientByIdentifier(patientId)
  if (!patientRecord) return res.status(404).json({ error: 'Patient not found' })

  const doctor = await getDoctorProfile(doctorId)
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' })

  if (channel !== 'direct_home') {
    if (!facilityId || !facilityPin) return res.status(400).json({ error: 'facilityId and facilityPin required' })
    const facility = await getFacilityById(facilityId)
    if (!facility || facility.pin !== facilityPin) return res.status(401).json({ error: 'Invalid facility credentials' })
    if (facility.is_active === false) return res.status(403).json({ error: facility.suspension_reason || 'This facility is paused by platform admin pending review.' })
    if ((channel === 'facility_private' && facility.type !== 'private_clinic') ||
        (channel === 'facility_phc' && facility.type !== 'phc')) {
      return res.status(400).json({ error: 'Facility type mismatch' })
    }
    if (patientRecord.facility_id && String(patientRecord.facility_id) !== String(facilityId)) {
      return res.status(404).json({ error: 'Patient not found for this facility' })
    }
    if (!patientRecord.facility_id) {
      await supabase.from('patients').update({ facility_id: facilityId, facility_type: facility.type, registered_via: patientRecord.registered_via || 'facility' }).eq('id', patientRecord.id)
    }
  }

  const split = channel === 'direct_home'
    ? calculateConsultationSplitNgn({ channel, track: track || 'economy', durationMin: durationMin || 15 })
    : calculateFacilitySpecialtySplit({ channel, doctor, durationMin: durationMin || 15 })
  const id = generateId('cng')
  const consultation = {
    id, patient_id: patientRecord.id, doctor_id: doctorId, facility_id: facilityId,
    channel: split.channel, track: split.track, duration_min: split.durationMin,
    blocks: split.blocks, total_ngn: split.total_ngn, status: 'in_progress',
    created_at: new Date().toISOString()
  }
  await supabase.from('consultations_ng').insert(consultation)

  let directHomeTokensCharged = 0
  if (channel === 'direct_home') {
    const doctorPrice = doctor?.price && typeof doctor.price === 'object' ? doctor.price : {}
    const priceKey = split.track === 'premium' ? 'premium' : 'basic'
    directHomeTokensCharged = Math.max(1, Math.round(Number(doctorPrice[priceKey] ?? doctorPrice[split.track] ?? doctor.consultation_fee ?? doctor.fee ?? 20) || 20))
    const charged = await deductPatientTokens(patientRecord.id, directHomeTokensCharged, `Direct ${split.track} consultation with Dr. ${doctor.name || doctorId}`)
    if (!charged) {
      await supabase.from('consultations_ng').update({ status: 'cancelled' }).eq('id', id)
      return res.status(402).json({
        ok: false,
        error: `Insufficient tokens. Required ${directHomeTokensCharged} tokens for this consultation.`,
        requiredTokens: directHomeTokensCharged,
        balanceTokens: await getPatientTokenBalance(patientRecord.id),
      })
    }
  }

  const financials = await recordConsultationFinancials({
    consultationId: id,
    patientId: patientRecord.id,
    doctorId,
    facilityId,
    split,
    source: channel === 'direct_home' ? 'Direct live consultation' : 'Facility consultation',
    chargePatient: channel !== 'direct_home',
    debitFacilityTopup: channel === 'facility_phc',
  })
  if (!financials.ok) {
    await supabase.from('consultations_ng').update({ status: 'cancelled' }).eq('id', id)
    return res.status(402).json(financials)
  }
  if (directHomeTokensCharged > 0) {
    await updateAdaptive('consultations_ng', {
      patient_tokens_charged: directHomeTokensCharged,
    }, (query) => query.eq('id', id), { select: null, maybeSingle: false })
  }

  await insertAdaptive('notifications', {
    id: generateId('notif'),
    user_id: doctorId,
    user_type: 'doctor',
    notification_type: 'consultation_started',
    type: 'consultation',
    title: channel === 'direct_home' ? 'Patient started a live consultation' : 'Facility consultation started',
    message: `${patientRecord?.name || 'A patient'} is waiting in consultation ${id}.`,
    related_resource_type: 'consultation',
    related_resource_id: id,
    is_read: false,
    notification_channels: ['in_app'],
    created_at: new Date().toISOString(),
  })

  res.status(201).json({
    consultation: { ...consultation, patient_tokens_charged: directHomeTokensCharged || financials.tokensCharged, total_ngn: financials.split?.total_ngn ?? split.total_ngn },
    split: financials.split || split,
    tokensCharged: directHomeTokensCharged || financials.tokensCharged,
  })
})

app.post('/api/consultations/end', async (req, res) => {
  const { consultationId, durationMin } = req.body
  if (!consultationId) return res.status(400).json({ error: 'consultationId required' })

  const { data: consultation } = await supabase.from('consultations_ng').select('*').eq('id', consultationId).maybeSingle()
  if (!consultation) return res.status(404).json({ error: 'Consultation not found' })
  if (consultation.status === 'completed') return res.json({ consultation, message: 'Already completed' })

  if (consultation.facility_id) {
    const facilityPin = req.body?.facilityPin || req.body?.pin
    if (!facilityPin) return res.status(400).json({ error: 'facilityPin required' })
    const facility = await getFacilityById(consultation.facility_id)
    if (!facility || facility.pin !== facilityPin) return res.status(401).json({ error: 'Invalid facility credentials' })
  }

  const finalDurationMin = durationMin || consultation.duration_min
  const doctor = await getDoctorProfile(consultation.doctor_id)
  const split = consultation.channel === 'direct_home'
    ? calculateConsultationSplitNgn({
        channel: consultation.channel,
        track: consultation.track,
        durationMin: finalDurationMin
      })
    : calculateFacilitySpecialtySplit({
        channel: consultation.channel,
        doctor,
        durationMin: finalDurationMin
      })

  const { data: existingSplit } = await supabase
    .from('revenue_splits_ng')
    .select('*')
    .eq('consultation_id', consultationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!existingSplit && split.channel === 'facility_phc' && consultation.facility_id) {
    const debitResult = await debitFacilityWallet(consultation.facility_id, split.facility_topup_ngn, {
      reason: 'PHC consult topup funding',
      ref_type: 'consultation',
      ref_id: consultationId
    })
    if (!debitResult.ok) {
      return res.status(400).json({
        error: 'PHC wallet insufficient balance for topup',
        balance_ngn: debitResult.balance_ngn,
        required_ngn: debitResult.required_ngn
      })
    }
  }

  if (!existingSplit && consultation.facility_id && split.facility_ngn > 0) {
    await creditFacilityWallet(consultation.facility_id, split.facility_ngn, {
      reason: 'Facility share from consultation',
      ref_type: 'consultation', ref_id: consultationId
    })
  }

  if (!existingSplit && split.doctor_ngn > 0) {
    await updateDoctorEarnings(consultation.doctor_id, await convertNgnToDoctorTokens(split.doctor_ngn))
  }

  const platformDelta = split.platform_ngn || 0
  const dataDelta = split.data_fee_ngn || 0
  if (!existingSplit) await updatePlatformBalance(platformDelta, dataDelta)

  const revenueSplit = existingSplit || {
    id: generateId('rsng'),
    consultation_id: consultationId,
    channel: split.channel, track: split.track,
    total_ngn: split.total_ngn, doctor_ngn: split.doctor_ngn, platform_ngn: split.platform_ngn,
    facility_ngn: split.facility_ngn || 0, data_fee_ngn: split.data_fee_ngn || 0,
    patient_copay_ngn: split.patient_copay_ngn || 0, facility_topup_ngn: split.facility_topup_ngn || 0,
    created_at: new Date().toISOString()
  }
  if (!existingSplit) await supabase.from('revenue_splits_ng').insert(revenueSplit)

  await supabase.from('consultations_ng').update({
    status: 'completed', duration_min: split.durationMin, blocks: split.blocks,
    total_ngn: split.total_ngn, completed_at: new Date().toISOString()
  }).eq('id', consultationId)

  const currentBalances = await getPlatformBalances()
  res.json({
    consultation: { ...consultation, status: 'completed', ...split },
    split: revenueSplit,
    ledgers: { platformBalanceNgn: currentBalances.platformBalanceNgn, dataFundBalanceNgn: currentBalances.dataFundBalanceNgn },
    message: 'Consultation completed and split recorded'
  })
})

// ---------- FACILITY REFERRALS ----------
app.post('/api/referrals/facility/create', async (req, res) => {
  const { doctorId, patientId, facilityId, reason, notes } = req.body
  if (!doctorId || !patientId || !facilityId || !reason) return res.status(400).json({ error: 'doctorId, patientId, facilityId, reason required' })

  const facility = await getFacilityById(facilityId)
  if (!facility) return res.status(404).json({ error: 'Facility not found' })

  const code = `GD-${facility.type.toUpperCase().slice(0, 3)}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
  const { data: latestVitals } = await supabase
    .from('vital_parameters')
    .select('*')
    .eq('patient_id', patientId)
    .order('measured_at', { ascending: false })
    .limit(20)
  const referral = {
    id: generateId('fref'), code, from_doctor_id: doctorId, patient_id: patientId,
    facility_id: facilityId, facility_type: facility.type, reason, notes: notes || null,
    vitals_snapshot: latestVitals || [],
    payout_ngn: facility.referral_payout_ngn || 0, status: 'pending',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }
  const insert = await insertAdaptive('facility_referrals', referral)
  if (insert.error) return res.status(500).json({ error: insert.error.message })

  res.status(201).json({ referral, referralCode: code, message: 'Facility referral created' })
})

app.get('/api/referrals/facility', async (req, res) => {
  let query = supabase.from('facility_referrals').select('*')
  if (req.query.doctorId) query = query.eq('from_doctor_id', req.query.doctorId)
  if (req.query.facilityId) query = query.eq('facility_id', req.query.facilityId)
  if (req.query.patientId) query = query.eq('patient_id', req.query.patientId)
  const { data } = await query
  res.json({ referrals: data || [] })
})

app.post('/api/referrals/facility/redeem', async (req, res) => {
  const { facilityId, pin, code } = req.body
  if (!facilityId || !pin || !code) return res.status(400).json({ error: 'facilityId, pin, code required' })

  const facility = await getFacilityById(facilityId)
  if (!facility || facility.pin !== pin) return res.status(401).json({ error: 'Invalid facility credentials' })

  const { data: referral } = await supabase.from('facility_referrals').select('*').eq('code', code).eq('facility_id', facilityId).maybeSingle()
  if (!referral) return res.status(404).json({ error: 'Referral not found' })
  if (referral.status !== 'pending') return res.status(400).json({ error: `Referral is ${referral.status}` })
  if (new Date(referral.expires_at) <= Date.now()) {
    await supabase.from('facility_referrals').update({ status: 'expired' }).eq('id', referral.id)
    return res.status(400).json({ error: 'Referral expired' })
  }

  let tokensCharged = 0
  if (referral.payout_ngn > 0) {
    const charge = await chargePatientTokensForNgn({
      patientId: referral.patient_id,
      amountNgn: referral.payout_ngn,
      description: `Facility referral redeemed at ${facility.name || facilityId}: ${referral.payout_ngn} NGN equivalent`,
    })
    if (!charge.ok) {
      return res.status(402).json({
        error: `Insufficient patient tokens for facility referral. Required ${charge.tokens} tokens.`,
        requiredTokens: charge.tokens,
        balanceTokens: charge.balance,
      })
    }
    tokensCharged = charge.tokens
  }

  await updateAdaptive('facility_referrals', {
    status: 'redeemed',
    redeemed_at: new Date().toISOString(),
    tokens_charged: tokensCharged,
  }, (query) => query.eq('id', referral.id), { select: null, maybeSingle: false })

  if (referral.payout_ngn > 0) {
    await creditFacilityWallet(facilityId, referral.payout_ngn, {
      reason: 'Referral payout',
      ref_type: 'facility_referral',
      ref_id: referral.id
    })
    const balances = await getPlatformBalances()
    await updatePlatformBalance(-referral.payout_ngn, 0)
  }

  const wallet = await getOrCreateFacilityWallet(facilityId)
  res.json({
    referral: { ...referral, status: 'redeemed', tokens_charged: tokensCharged },
    wallet_balance_ngn: wallet.balance_ngn,
    tokensCharged,
    message: 'Referral redeemed and patient tokens charged',
  })
})

// ---------- LAB ORDERS & PAYMENTS ----------
app.post('/api/labs/order', async (req, res) => {
  const { consultationId, patientId, patientName, doctorId, doctorName, doctorLicenseNumber, doctorSignatureDataUrl, facilityId, tests, total_price_ngn } = req.body
  if (!patientId || !doctorId || !tests?.length || !total_price_ngn) return res.status(400).json({ error: 'Patient, doctor, requested tests, and estimated price are required' })

  if (facilityId) {
    const facility = await getFacilityById(facilityId)
    if (!facility || facility.type !== 'lab') return res.status(400).json({ error: 'facilityId must be a lab when supplied' })
  }

  const [{ data: doctorRow }, patientRecord] = await Promise.all([
    supabase.from('doctors').select('name, license_number, signature_data_url').eq('id', doctorId).maybeSingle(),
    findPatientByIdentifier(patientId),
  ])
  const signatureDataUrl = doctorSignatureDataUrl || doctorRow?.signature_data_url || null
  const resolvedPatientId = patientRecord?.id || patientId
  const resolvedPatientName = patientName || patientRecord?.name || null
  const resolvedDoctorName = doctorName || doctorRow?.name || null
  const resolvedDoctorLicenseNumber = doctorLicenseNumber || doctorRow?.license_number || null

  const order = {
    id: generateId('labord'),
    consultation_id: consultationId || null, patient_id: resolvedPatientId, doctor_id: doctorId,
    patient_name: resolvedPatientName, doctor_name: resolvedDoctorName,
    doctor_license_number: resolvedDoctorLicenseNumber,
    doctor_signature_data_url: signatureDataUrl,
    company_name: 'GlobalDoc', logo_text: 'GD',
    facility_id: facilityId, tests, total_price_ngn: Math.round(total_price_ngn),
    status: 'ordered', created_at: new Date().toISOString()
  }
  await supabase.from('lab_orders').insert(order)
  res.status(201).json({ order, message: 'Lab order created' })
})

app.get('/api/labs/orders', async (req, res) => {
  const { patientId, doctorId, facilityId, consultationId } = req.query
  let query = supabase.from('lab_orders').select('*').order('created_at', { ascending: false })
  if (patientId) query = query.eq('patient_id', patientId)
  if (doctorId) query = query.eq('doctor_id', doctorId)
  if (facilityId) query = query.eq('facility_id', facilityId)
  if (consultationId) query = query.eq('consultation_id', consultationId)
  const { data, error } = await query.limit(100)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ orders: data || [] })
})

app.post('/api/labs/pay', async (req, res) => {
  const { orderId, amount_paid_ngn, method } = req.body
  if (!orderId || !amount_paid_ngn) return res.status(400).json({ error: 'orderId and amount_paid_ngn required' })

  const { data: order } = await supabase.from('lab_orders').select('*').eq('id', orderId).maybeSingle()
  if (!order) return res.status(404).json({ error: 'Lab order not found' })
  if (order.status === 'paid') return res.json({ order, message: 'Already paid' })

  const commission = calculateLabCommissionNgn(amount_paid_ngn)
  const payment = {
    id: generateId('labpay'),
    order_id: orderId,
    facility_id: order.facility_id,
    amount_paid_ngn: commission.total_ngn,
    platform_commission_ngn: commission.platform_commission_ngn,
    facility_net_ngn: commission.facility_net_ngn,
    method: method || 'cash',
    created_at: new Date().toISOString()
  }
  await supabase.from('lab_payments').insert(payment)

  await creditFacilityWallet(order.facility_id, commission.facility_net_ngn, { reason: 'Lab payment (net)', ref_type: 'lab_order', ref_id: orderId })
  await updatePlatformBalance(commission.platform_commission_ngn, 0)

  await supabase.from('lab_orders').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', orderId)

  res.json({ order: { ...order, status: 'paid' }, payment, message: 'Lab payment recorded' })
})

// ---------- ANNOUNCEMENTS ----------
app.get('/api/announcements', async (req, res) => {
  const audience = String(req.query.audience || '').trim().toLowerCase()
  const now = new Date().toISOString()
  let query = supabase.from('announcements').select('*').eq('is_active', true)
    .or(`expires_at.is.null, expires_at.gt.${now}`)
  if (audience && audience !== 'all') {
    const audiences = audience === 'landing' ? ['landing', 'public', 'all'] : [audience, 'all']
    query = query.in('audience', audiences)
  }
  query = query.order('created_at', { ascending: false })
  const { data } = await query
  res.json({ announcements: data || [] })
})

app.post('/api/admin/announcements', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const { title, message, audience, severity, expires_at } = req.body
  if (!title || !message || !audience) return res.status(400).json({ error: 'title, message, audience required' })
  const id = generateId('ann')
  await supabase.from('announcements').insert({
    id, audience, severity: severity || 'info', title, message,
    is_active: true, created_at: new Date().toISOString(), expires_at: expires_at || null
  })
  await recordAuditLog(req, {
    action: 'announcement.create',
    resourceType: 'announcement',
    resourceId: id,
    changes: { audience, severity: severity || 'info', title },
  })
  res.status(201).json({ announcement: { id, audience, severity, title, message }, message: 'Announcement published' })
})

app.delete('/api/admin/announcements/:announcementId', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  await supabase.from('announcements').delete().eq('id', req.params.announcementId)
  await recordAuditLog(req, {
    action: 'announcement.delete',
    resourceType: 'announcement',
    resourceId: req.params.announcementId,
  })
  res.json({ message: 'Announcement deleted' })
})

// ---------- AUDIT LOGS ----------
app.get('/api/admin/audit-logs', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(500)
  res.json({ auditLogs: data || [] })
})

// ---------- PAYMENTS / WEBHOOKS ----------
app.post('/api/payments/kora/initialize', async (req, res) => {
  const { amount, currency, description, customer, metadata } = req.body
  const numericAmount = safeNumber(amount)
  if (numericAmount === null || numericAmount <= 0) return res.status(400).json({ error: 'Valid payment amount is required' })
  const chargeCurrency = String(currency || KORA_CHARGE_CURRENCY || 'NGN').trim().toUpperCase()

  const reference = `kora-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const { error: paymentInsertError } = await insertPaymentRecord({
    id: reference, patient_id: metadata?.patientId || metadata?.patient_id || 'system', doctor_id: metadata?.doctorId || metadata?.doctor_id || 'system', amount: numericAmount, currency: chargeCurrency, description,
    customer, metadata, status: 'pending', provider: 'kora', reference, created_at: new Date().toISOString()
  })
  if (paymentInsertError) return res.status(500).json({ error: `Could not create payment record: ${paymentInsertError.message}` })

  if (!KORA_SECRET_KEY) {
    return res.json({
      reference,
      checkout_url: `https://kora-pay.com/pay/${reference}`,
      message: 'Payment request queued. Add KORA_SECRET_KEY on the server to enable live checkout.',
    })
  }

  try {
    const origin = getApiOrigin(req) || 'https://globaldoctorplatform.vercel.app'
    const { data: response } = await axios.post(
      `${KORA_BASE_URL}/merchant/api/v1/charges/initialize`,
      {
        amount: numericAmount,
        currency: chargeCurrency,
        reference,
        redirect_url: `${origin}/payment-success?reference=${encodeURIComponent(reference)}`,
        notification_url: `${origin}/api/webhooks/kora`,
        narration: description || 'GlobalDoc payment',
        customer: {
          email: customer?.email || metadata?.email || 'patient@globaldoc.com',
          name: customer?.name || metadata?.name || 'GlobalDoc Patient',
        },
        metadata: metadata || {},
      },
      { headers: { Authorization: `Bearer ${KORA_SECRET_KEY}` } }
    )

    const checkoutUrl = extractKoraCheckoutUrl(response)
    if (!checkoutUrl) {
      return res.status(500).json({ error: 'Kora did not return a checkout URL', details: response })
    }

    return res.json({ reference, checkout_url: checkoutUrl, message: response?.message || 'Payment initialized' })
  } catch (error) {
    const koraError = error.response?.data || error.message
    console.error('Kora initialization error:', koraError)
    return res.status(500).json({
      error: 'Failed to initialize Kora payment',
      details: getKoraErrorMessage(error),
      provider: koraError,
      kora: { amount: numericAmount, currency: chargeCurrency },
    })
  }
})

app.post('/api/payments', (req, res) => {
  req.url = '/api/payments/kora/initialize'
  app.handle(req, res)
})

app.get('/api/payments/kora/verify/:reference', async (req, res) => {
  const { reference } = req.params
  let payment = await findPaymentByReference(reference)
  let charge = null

  if (!payment) {
    charge = await queryKoraCharge(reference)
    if (charge.ok) {
      payment = await findPaymentByReference(getKoraReferenceCandidates(reference, charge.payload))
    }
  }
  if (!payment) return res.status(404).json({ error: 'Payment not found', status: charge?.status || 'unknown' })

  if (['success', 'completed'].includes(String(payment.status || '').toLowerCase())) {
    const metadata = parsePaymentMetadata(payment)
    const patientId = payment.patient_id || metadata.patientId
    const tokens = patientId ? await getPatientTokenBalance(patientId) : null
    return res.json({ status: 'success', credited: false, tokens, payment, message: 'Payment was already verified.' })
  }

  if (!charge) charge = await queryKoraCharge(payment.reference || payment.provider_reference || reference)
  if (!charge.ok) {
    return res.status(502).json({
      status: charge.status,
      credited: false,
      error: 'Could not verify payment with Kora',
      details: charge.error,
      payment,
    })
  }

  if (!isKoraChargeSuccessful(charge.payload)) {
    await supabase.from('payments').update({ status: charge.status || 'pending' }).eq('id', payment.id)
    return res.json({
      status: charge.status || 'pending',
      credited: false,
      payment,
      message: 'Payment is not successful yet.',
    })
  }

  if ((payment.type || payment.payment_type) === 'token_purchase') {
    const result = await creditTokenPurchasePayment(payment, 'Kora')
    const { data: refreshedPayment } = await supabase.from('payments').select('*').eq('id', payment.id).maybeSingle()
    return res.json({
      status: 'success',
      credited: result.credited,
      tokens: result.tokens,
      payment: refreshedPayment || payment,
      message: result.reason,
    })
  }

  if ((payment.type || payment.payment_type) === 'subscription') {
    const result = await creditSubscriptionPayment(payment, 'Kora')
    const { data: refreshedPayment } = await supabase.from('payments').select('*').eq('id', payment.id).maybeSingle()
    return res.json({
      status: 'success',
      credited: result.credited,
      tokens: result.tokens,
      payment: refreshedPayment || payment,
      message: result.reason,
    })
  }

  await supabase.from('payments').update({ status: 'success' }).eq('id', payment.id)
  res.json({ status: 'success', credited: false, payment, message: 'Payment verified.' })
})

app.post('/api/webhooks/kora', async (req, res) => {
  const event = req.body?.event
  const data = req.body?.data || {}
  const reference = data.reference || data.payment_reference

  if (!reference) return res.status(400).json({ error: 'Missing payment reference' })

  const { data: payment } = await supabase.from('payments').select('*').eq('reference', reference).maybeSingle()
  if (!payment) return res.status(404).json({ error: 'Payment not found' })

  const successful = event === 'charge.success' || isKoraChargeSuccessful({ data })
  if (!successful) {
    await supabase.from('payments').update({ status: normalizeKoraStatus({ data }) || 'pending' }).eq('id', payment.id)
    return res.json({ received: true, credited: false })
  }

  if ((payment.type || payment.payment_type) === 'token_purchase') {
    const result = await creditTokenPurchasePayment(payment, 'Kora webhook')
    return res.json({ received: true, credited: result.credited, tokens: result.tokens })
  }

  if ((payment.type || payment.payment_type) === 'subscription') {
    const result = await creditSubscriptionPayment(payment, 'Kora webhook')
    return res.json({ received: true, credited: result.credited, tokens: result.tokens })
  }

  await supabase.from('payments').update({ status: 'success' }).eq('id', payment.id)
  res.json({ received: true, credited: false })
})

// ---------- VIDEO TOKEN ----------
app.get('/api/video/token', (req, res) => {
  const channelName = req.query.channelName
  if (!channelName) return res.status(400).json({ error: 'channelName required' })
  if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) return res.status(500).json({ error: 'Video SDK not configured' })
  const token = RtcTokenBuilder.buildTokenWithUid(AGORA_APP_ID, AGORA_APP_CERTIFICATE, channelName, 0, RtcRole.PUBLISHER, Math.floor(Date.now() / 1000) + 3600)
  res.json({ token, appId: AGORA_APP_ID })
})

// ---------- VITAL PARAMETERS ----------
app.post('/api/vital-requests', async (req, res) => {
  const { consultationId, patientId, doctorId, parameterName, instructions } = req.body || {}
  if (!consultationId || !patientId || !doctorId || !parameterName) {
    return res.status(400).json({ error: 'consultationId, patientId, doctorId, and parameterName are required' })
  }

  await supabase
    .from('vital_parameter_requests')
    .update({ status: 'cancelled' })
    .eq('consultation_id', consultationId)
    .eq('patient_id', patientId)
    .eq('doctor_id', doctorId)
    .eq('parameter_name', parameterName)
    .in('status', ['pending', 'measuring'])

  const request = {
    id: generateId('vreq'),
    consultation_id: consultationId,
    patient_id: patientId,
    doctor_id: doctorId,
    parameter_name: parameterName,
    instructions: instructions || null,
    status: 'pending',
    requested_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }
  const insert = await insertAdaptive('vital_parameter_requests', request)
  if (insert.error) return res.status(500).json({ error: insert.error.message })
  await insertAdaptive('notifications', {
    id: generateId('notif'),
    user_id: patientId,
    user_type: 'patient',
    notification_type: 'vital_request',
    type: 'vital_request',
    title: 'Vital sign requested',
    message: instructions || `Your doctor requested ${parameterName}. Open the video room to capture and save it.`,
    related_resource_type: 'vital_parameter_request',
    related_resource_id: request.id,
    is_read: false,
    notification_channels: ['in_app', 'voice_prompt'],
    created_at: new Date().toISOString(),
  }).catch(() => null)
  res.status(201).json({ request, message: 'Vital request sent' })
})

app.get('/api/vital-requests', async (req, res) => {
  const { consultationId, patientId, doctorId, status } = req.query
  let query = supabase.from('vital_parameter_requests').select('*').order('requested_at', { ascending: false })
  if (consultationId) query = query.eq('consultation_id', consultationId)
  if (patientId) query = query.eq('patient_id', patientId)
  if (doctorId) query = query.eq('doctor_id', doctorId)
  if (status) query = query.eq('status', status)
  const { data, error } = await query.limit(50)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ requests: data || [] })
})

app.patch('/api/vital-requests/:requestId', async (req, res) => {
  const status = ['pending', 'measuring', 'completed', 'cancelled'].includes(String(req.body?.status || ''))
    ? String(req.body.status)
    : undefined
  const updates = {
    status,
    completed_at: status === 'completed' ? new Date().toISOString() : undefined,
  }
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key])
  const { data, error } = await supabase
    .from('vital_parameter_requests')
    .update(updates)
    .eq('id', req.params.requestId)
    .select('*')
    .maybeSingle()
  if (error) return res.status(500).json({ error: error.message })
  res.json({ request: data, message: 'Vital request updated' })
})

app.post('/api/vital-requests/cancel-active', async (req, res) => {
  const { consultationId, patientId, doctorId } = req.body || {}
  if (!consultationId && !patientId && !doctorId) {
    return res.status(400).json({ error: 'consultationId, patientId, or doctorId is required' })
  }
  let query = supabase
    .from('vital_parameter_requests')
    .update({ status: 'cancelled' })
    .in('status', ['pending', 'measuring'])
  if (consultationId) query = query.eq('consultation_id', consultationId)
  if (patientId) query = query.eq('patient_id', patientId)
  if (doctorId) query = query.eq('doctor_id', doctorId)
  const { error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: 'Active vital requests cancelled' })
})

app.get('/api/vital-parameters', async (req, res) => {
  const { consultationId, patientId, doctorId } = req.query
  let query = supabase.from('vital_parameters').select('*').order('measured_at', { ascending: false })
  if (consultationId) query = query.eq('consultation_id', consultationId)
  if (patientId) query = query.eq('patient_id', patientId)
  if (doctorId) query = query.eq('doctor_id', doctorId)
  const { data, error } = await query.limit(100)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ vitals: data || [] })
})

app.post('/api/vital-parameters', async (req, res) => {
  let {
    consultation_id,
    patient_id,
    doctor_id,
    request_id,
    parameter_name,
    parameter_value,
    unit,
    source,
    confidence,
    measured_at,
    metadata,
  } = req.body || {}

  if (request_id && (!consultation_id || !patient_id || !doctor_id || !parameter_name)) {
    const { data: requestRow, error: requestError } = await supabase
      .from('vital_parameter_requests')
      .select('*')
      .eq('id', request_id)
      .maybeSingle()
    if (requestError) return res.status(500).json({ error: requestError.message })
    if (requestRow) {
      consultation_id = consultation_id || requestRow.consultation_id
      patient_id = patient_id || requestRow.patient_id
      doctor_id = doctor_id || requestRow.doctor_id
      parameter_name = parameter_name || requestRow.parameter_name
    }
  }

  if (!patient_id || !parameter_name || parameter_value === undefined || parameter_value === null) {
    return res.status(400).json({ error: 'patient_id, parameter_name, and parameter_value are required' })
  }

  const vital = {
    id: generateId('vital'),
    consultation_id: consultation_id || null,
    patient_id,
    doctor_id: doctor_id || null,
    request_id: request_id || null,
    parameter_name,
    parameter_value: String(parameter_value),
    unit: unit || null,
    source: source || 'manual',
    confidence: confidence ?? null,
    metadata: metadata || null,
    measured_at: measured_at || new Date().toISOString(),
    created_at: new Date().toISOString(),
  }

  const insert = await insertVitalParameterAdaptive(vital)
  if (insert.error) return res.status(500).json({ error: insert.error.message })
  if (request_id) {
    await supabase.from('vital_parameter_requests').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    }).eq('id', request_id)
  }
  if (doctor_id) {
    await insertAdaptive('notifications', {
      id: generateId('notif'),
      user_id: doctor_id,
      user_type: 'doctor',
      notification_type: 'vital_recorded',
      type: 'vital_recorded',
      title: 'Vital sign saved',
      message: `${parameter_name} was captured and saved for this consultation.`,
      related_resource_type: 'vital_parameter',
      related_resource_id: insert.row?.id || vital.id,
      is_read: false,
      notification_channels: ['in_app'],
      created_at: new Date().toISOString(),
    }).catch(() => null)
  }
  res.status(201).json({ vital, message: 'Vital parameter recorded' })
})

// ---------- FORGOT / RESET PASSWORD ----------
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email, userType } = req.body
  if (!email || !userType) return res.status(400).json({ error: 'email and userType required' })

  const normalizedEmail = email.toLowerCase()
  const table = userType === 'patient' ? 'patients' : 'doctors_auth'

  // Check if user exists
  const { data: user } = await supabase.from(table).select('*').eq('email', normalizedEmail).maybeSingle()
  if (!user) {
    // Do not reveal whether the email exists – simply return ok
    return res.json({ message: 'If that email is registered, a reset link has been sent.' })
  }

  // Generate a secure token
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour

  // Store the token
  await supabase.from('password_reset_tokens').insert({
    id: generateId('pwrst'),
    user_email: normalizedEmail,
    user_type: userType,
    token,
    expires_at: expiresAt,
    created_at: new Date().toISOString()
  })

  // Send email
  const origin = 'https://globaldoctorplatform.vercel.app'
  const resetUrl = `${origin}/reset-password?token=${encodeURIComponent(token)}&userType=${encodeURIComponent(userType)}`

  const emailResult = await sendSmtpEmail({
    to: normalizedEmail,
    subject: 'Reset your password',
    text: `Click the link to reset your password: ${resetUrl}\nThis link expires in 1 hour.`,
  }).catch((error) => ({ sent: false, reason: error.message }))
  if (!emailResult.sent) {
    console.error('Password reset email failed:', emailResult.reason || 'SMTP not configured')
  }

  res.json({ message: 'If that email is registered, a reset link has been sent.' })
})

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword, userType } = req.body
  if (!token || !newPassword || !userType) return res.status(400).json({ error: 'token, newPassword, and userType required' })

  // Find a valid token
  const { data: resetEntry } = await supabase.from('password_reset_tokens')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (!resetEntry) return res.status(400).json({ error: 'Invalid or expired reset token.' })

  // Update the password
  const table = userType === 'patient' ? 'patients' : 'doctors_auth'
  const { error: updateError } = await supabase.from(table)
    .update({ password: newPassword })
    .eq('email', resetEntry.user_email)

  if (updateError) return res.status(500).json({ error: updateError.message })

  // Mark token as used
  await supabase.from('password_reset_tokens').update({ used: true }).eq('id', resetEntry.id)

  res.json({ message: 'Password has been reset. You can now log in.' })
})

// ---------- EXPORT ----------
const port = process.env.PORT || 4000
export default app

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`)
  })
}
