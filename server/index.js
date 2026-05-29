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
app.use(express.json())

const AGORA_APP_ID = process.env.AGORA_APP_ID
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE

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

const KORA_SECRET_KEY = process.env.KORA_SECRET_KEY
const KORA_BASE_URL = process.env.KORA_BASE_URL || 'https://api.korapay.com'

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

// ---------- Utility helpers ----------
function safeNumber(value) {
  const parsed = typeof value === 'string' ? Number(value) : value
  return Number.isFinite(parsed) ? parsed : null
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

function sanitizePatientForResponse(patient) {
  if (!patient) return null
  const { password, portal_pin, ...rest } = patient
  return rest
}

function sanitizeDoctorForResponse(doctor) {
  if (!doctor) return null
  const { password, doctors, ...rest } = doctor
  return {
    ...rest,
    verified: Boolean(doctor.verified || doctors?.verified),
    license_verified: Boolean(doctor.license_verified || doctors?.license_verified),
    approval_status: (doctor.verified || doctors?.verified) ? 'approved' : 'pending_review',
  }
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
    bankCode: String(body.bankCode || body.bank_code || '').trim(),
    bankAccount: String(body.bankAccount || body.bank_account || '').trim(),
    currency: String(body.currency || '').trim(),
    payoutMethod: String(body.payoutMethod || body.payout_method || 'bank_account').trim(),
    mobileMoneyOperator: String(body.mobileMoneyOperator || body.mobile_money_operator || '').trim(),
    mobileMoneyNumber: String(body.mobileMoneyNumber || body.mobile_money_number || '').trim(),
  }
}

async function sendDoctorApprovalEmail(doctor) {
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  const smtpPort = Number(process.env.SMTP_PORT || 587)
  if (!smtpUser || !smtpPass || !doctor?.email) {
    return { sent: false, reason: 'SMTP credentials or doctor email missing' }
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  })

  const appUrl = normalizeAppBaseUrl(process.env.APP_BASE_URL || process.env.VITE_PUBLIC_APP_URL || process.env.VITE_API_BASE) || 'https://globaldoctorplattform.vercel.app'
  await transporter.sendMail({
    from: `"GlobalDoc Connect" <${smtpUser}>`,
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
  return { sent: true }
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
  }
}

async function getPatientTokenBalance(patientId) {
  const { data } = await supabase.from('patient_tokens').select('balance').eq('patient_id', patientId).maybeSingle()
  return data?.balance || 0
}

async function deductPatientTokens(patientId, amount) {
  const current = await getPatientTokenBalance(patientId)
  if (current < amount) return false
  const newBalance = current - amount
  await supabase.from('patient_tokens').update({ balance: newBalance }).eq('patient_id', patientId)
  await supabase.from('token_transactions').insert({
    id: generateId('txn'),
    patient_id: patientId,
    transaction_type: 'use',
    amount: -amount,
    description: `Deducted ${amount} tokens`,
    created_at: new Date().toISOString()
  })
  return true
}

async function creditPatientTokens(patientId, amount, description = 'Token credit') {
  const current = await getPatientTokenBalance(patientId)
  const newBalance = current + amount
  await supabase.from('patient_tokens').update({ balance: newBalance }).eq('patient_id', patientId)
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
  const updated = Math.max(0, current + tokens)
  await supabase.from('doctors').update({ earnings_tokens: updated }).eq('id', doctorId)
  return updated
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
app.get('/api/config', (req, res) => {
  res.json({
    status: 'ok',
    origin: getApiOrigin(req),
    configured: {
      kora: Boolean(KORA_SECRET_KEY),
      agora: Boolean(AGORA_APP_ID && AGORA_APP_CERTIFICATE),
      adminEnv: Boolean(process.env.ADMIN_EMAIL || process.env.ADMIN_PASSWORD),
    },
  })
})

// ---------- ADMIN LOGIN ----------
app.post('/api/doctors/login', async (req, res) => {
  const { email, password } = req.body
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

    // Doctor check
    const { data: doctor, error: docError } = await supabase.from('doctors_auth').select('*').eq('email', email).eq('password', password).maybeSingle()
    if (docError) return res.status(500).json({ error: 'Database error (doctors_auth): ' + docError.message })
    if (!doctor) return res.status(401).json({ error: 'Invalid credentials' })
    if (!doctor.verified) {
      return res.status(403).json({
        error: 'Your doctor account is pending platform admin approval. You will receive an email when access is granted.',
        pendingApproval: true,
      })
    }

    await supabase.from('doctors').update({ is_online: true }).eq('id', doctor.id)
    res.json({ doctor: sanitizeDoctorForResponse(doctor), message: 'Login successful' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ---------- DOCTOR REGISTRATION ----------
app.post('/api/doctors/register', async (req, res) => {
  const { email, password, name, specialty, location, licenseNumber } = req.body
  if (!email || !name || !specialty || !location || !licenseNumber) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  const { data: existing } = await supabase.from('doctors_auth').select('id').eq('email', email).maybeSingle()
  if (existing) return res.status(409).json({ error: 'Doctor already exists' })

  const id = generateId('doc')
  const newDoctor = {
    id, email, password, name, specialty, location,
    license_number: licenseNumber,
    verified: false, created_at: new Date().toISOString()
  }
  await supabase.from('doctors_auth').insert(newDoctor)

  const profile = {
    id, name, specialty, location,
    languages: ['English'], rating: 0, rating_count: 0,
    availability: 'Available upon request', verified: false, is_online: false,
    fee: 50, price: { basic: 50, premium: 100 },
    license_verified: false, license_number: licenseNumber,
    created_at: new Date().toISOString()
  }
  await supabase.from('doctors').insert(profile)

  res.status(201).json({
    doctor: sanitizeDoctorForResponse(newDoctor),
    pendingApproval: true,
    message: 'Registration submitted. A platform admin must review and approve your account before you can sign in.'
  })
})

// ---------- OAUTH BRIDGE ----------
app.post('/api/auth/oauth/bridge', async (req, res) => {
  const {
    email,
    name,
    role,
    dateOfBirth,
    phone,
    country,
    language,
    specialty,
    location,
    licenseNumber,
  } = req.body
  if (!email || !role) return res.status(400).json({ error: 'email and role required' })

  try {
    if (role === 'patient') {
      const patientProfile = {
        email,
        password: '',
        name: name || email.split('@')[0],
        date_of_birth: dateOfBirth || null,
        phone: phone || '',
        country: country || 'NG',
        language: language || 'English',
        is_online: true,
      }
      let { data: patient, error: patientLookupError } = await supabase.from('patients').select('*').eq('email', email).maybeSingle()
      if (patientLookupError) return res.status(500).json({ error: 'Failed to load patient: ' + patientLookupError.message })
      if (!patient) {
        const id = `patient-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
        const newPatient = {
          id,
          ...patientProfile,
          tokens: 0,
          created_at: new Date().toISOString()
        }
        const { error: insertErr } = await supabase.from('patients').insert(newPatient)
        if (insertErr) return res.status(500).json({ error: 'Failed to create patient: ' + insertErr.message })
        await supabase.from('patient_tokens').upsert({ patient_id: id, balance: 0 }, { onConflict: 'patient_id' })
        return res.json({ patient: sanitizePatientForResponse(newPatient), message: 'Patient session ready' })
      }
      const { data: updatedPatient, error: updateErr } = await supabase
        .from('patients')
        .update(patientProfile)
        .eq('id', patient.id)
        .select('*')
        .maybeSingle()
      if (updateErr) return res.status(500).json({ error: 'Failed to update patient: ' + updateErr.message })
      await supabase.from('patient_tokens').upsert({ patient_id: patient.id, balance: 0 }, { onConflict: 'patient_id', ignoreDuplicates: true })
      return res.json({ patient: sanitizePatientForResponse(updatedPatient || patient), message: 'Patient session ready' })
    }

    // Doctor
    const doctorProfile = {
      email,
      password: '',
      name: name || email.split('@')[0],
      specialty: specialty || 'General Practitioner',
      location: location || country || 'Nigeria',
      license_number: licenseNumber || 'PENDING',
      verified: false,
    }
    let { data: doctor, error: doctorLookupError } = await supabase.from('doctors_auth').select('*').eq('email', email).maybeSingle()
    if (doctorLookupError) return res.status(500).json({ error: 'Failed to load doctor: ' + doctorLookupError.message })
    if (!doctor) {
      const id = generateId('doc')
      const newDoc = { id, ...doctorProfile, created_at: new Date().toISOString() }
      const { error: insertDocErr } = await supabase.from('doctors_auth').insert(newDoc)
      if (insertDocErr) return res.status(500).json({ error: 'Failed to create doctor auth: ' + insertDocErr.message })

      const { error: insertProfErr } = await supabase.from('doctors').insert({
        id,
        name: newDoc.name,
        specialty: newDoc.specialty,
        location: newDoc.location,
        languages: ['English'],
        rating: 0,
        rating_count: 0,
        is_online: true,
        fee: 35,
        price: { basic: 50, premium: 100 },
        license_verified: false,
        license_number: newDoc.license_number,
        created_at: new Date().toISOString()
      })
      if (insertProfErr) return res.status(500).json({ error: 'Failed to create doctor profile: ' + insertProfErr.message })

      return res.status(403).json({
        doctor: sanitizeDoctorForResponse(newDoc),
        pendingApproval: true,
        message: 'Doctor profile submitted. A platform admin must approve your account before dashboard access is enabled.'
      })
    } else {
      const { data: updatedDoctor, error: updateDocErr } = await supabase
        .from('doctors_auth')
        .update(doctorProfile)
        .eq('id', doctor.id)
        .select('*')
        .maybeSingle()
      if (updateDocErr) return res.status(500).json({ error: 'Failed to update doctor auth: ' + updateDocErr.message })
      const { data: existingDoctorProfile } = await supabase.from('doctors').select('id').eq('id', doctor.id).maybeSingle()
      if (existingDoctorProfile) {
        await supabase.from('doctors').update({
          name: doctorProfile.name,
          specialty: doctorProfile.specialty,
          location: doctorProfile.location,
          is_online: true,
          license_number: doctorProfile.license_number,
        }).eq('id', doctor.id)
      } else {
        await supabase.from('doctors').insert({
          id: doctor.id,
          name: doctorProfile.name,
          specialty: doctorProfile.specialty,
          location: doctorProfile.location,
          languages: ['English'],
          rating: 0,
          rating_count: 0,
          is_online: true,
          fee: 35,
          price: { basic: 50, premium: 100 },
          license_verified: false,
          license_number: doctorProfile.license_number,
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

// ---------- PATIENT AUTH (email) ----------
app.post('/api/patients/register', async (req, res) => {
  const { email, password, name, dateOfBirth, phone, country, language } = req.body
  if (!email || !password || !name || !dateOfBirth || !phone || !country) {
    return res.status(400).json({ error: 'All required fields must be provided' })
  }

  const { data: existing } = await supabase.from('patients').select('id').eq('email', email).maybeSingle()
  if (existing) return res.status(409).json({ error: 'Patient already exists' })

  const id = `patient-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
  const newPatient = {
    id, email, password, name, date_of_birth: dateOfBirth,
    phone, country, language: language || 'English',
    tokens: 0, is_online: true, created_at: new Date().toISOString()
  }
  await supabase.from('patients').insert(newPatient)
  await supabase.from('patient_tokens').insert({ patient_id: id, balance: 0 })

  res.status(201).json({ patient: sanitizePatientForResponse(newPatient), message: 'Registration successful' })
})

app.post('/api/patients/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

  const { data: patient } = await supabase.from('patients').select('*').eq('email', email).eq('password', password).maybeSingle()
  if (!patient) return res.status(401).json({ error: 'Invalid credentials' })

  await supabase.from('patients').update({ is_online: true }).eq('id', patient.id)
  res.json({ patient: sanitizePatientForResponse(patient), message: 'Login successful' })
})

// ---------- FACILITY PATIENT AUTH ----------
app.post('/api/patients/facility/register', async (req, res) => {
  const facilityId = String(req.body?.facilityId || '').trim()
  const facilityPin = String(req.body?.facilityPin || req.body?.pin || '').trim()
  const fullName = String(req.body?.name || '').trim()
  const patientPin = String(req.body?.patientPin || req.body?.portalPin || '').trim()
  const phone = String(req.body?.phone || '').trim()

  if (!facilityId || !facilityPin || !fullName || !/^\d{6}$/.test(patientPin)) {
    return res.status(400).json({ error: 'Facility ID, facility PIN, name, and 6-digit patient PIN required' })
  }

  const { data: facility } = await supabase.from('facilities').select('*').eq('id', facilityId).eq('pin', facilityPin).maybeSingle()
  if (!facility) return res.status(401).json({ error: 'Invalid facility credentials' })

  const { data: existing } = await supabase.from('patients').select('id').eq('portal_pin', patientPin).eq('name', fullName).maybeSingle()
  if (existing) return res.status(409).json({ error: 'Patient already exists with this name and PIN' })

  const id = `patient-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
  const newPatient = {
    id, email: null, password: null, portal_pin: patientPin,
    name: fullName, date_of_birth: null, phone, country: 'NG', language: 'English',
    tokens: 0, is_online: false, registered_via: 'facility', facility_id: facilityId,
    facility_type: facility.type, created_at: new Date().toISOString()
  }
  await supabase.from('patients').insert(newPatient)
  await supabase.from('patient_tokens').insert({ patient_id: id, balance: 0 })

  res.status(201).json({
    patient: sanitizePatientForResponse(newPatient),
    login: { patientId: id, pin: patientPin },
    message: 'Patient registered via facility'
  })
})

app.post('/api/patients/facility/login', async (req, res) => {
  const patientId = String(req.body?.patientId || '').trim()
  const fullName = String(req.body?.name || req.body?.fullName || '').trim()
  const patientPin = String(req.body?.pin || '').trim()

  if (!/^\d{6}$/.test(patientPin)) return res.status(400).json({ error: 'PIN must be a 6-digit number' })

  let query = supabase.from('patients').select('*').eq('portal_pin', patientPin)
  if (patientId) query = query.eq('id', patientId)
  else if (fullName) query = query.eq('name', fullName)

  const { data: patient } = await query.maybeSingle()
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

  const reference = `kora-token-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const origin = getApiOrigin(req)

  await supabase.from('payments').insert({
    id: reference,
    patient_id: patientId,
    amount: amountUSD,
    type: 'token_purchase',
    status: 'pending',
    provider: 'kora',
    reference,
    created_at: new Date().toISOString()
  })

  if (!KORA_SECRET_KEY) {
    return res.json({
      reference, tokensExpected, rate,
      checkout_url: `https://kora-pay.com/pay/${reference}`,
      message: 'Payment initialized (mock)'
    })
  }

  try {
    const { data: response } = await axios.post(`${KORA_BASE_URL}/merchant/api/v1/charges/initialize`, {
      amount: amountUSD, currency: 'USD', reference,
      redirect_url: origin ? `${origin}/payment-success?reference=${encodeURIComponent(reference)}` : undefined,
      notification_url: origin ? `${origin}/api/webhooks/kora` : undefined,
      narration: `Token purchase (${tokensExpected} tokens)`,
      customer: { email: req.body.email, name: req.body.name },
      metadata: { purpose: 'token_purchase', patientId }
    }, { headers: { Authorization: `Bearer ${KORA_SECRET_KEY}` } })

    return res.json({
      reference, tokensExpected, rate,
      checkout_url: response.data?.data?.checkout_url || response.data?.data?.checkoutUrl,
      message: response.data?.message || 'Payment initialized'
    })
  } catch (error) {
    console.error('Kora initialization error:', error?.response?.data || error)
    return res.status(500).json({ error: 'Failed to initialize Kora payment' })
  }
})

// ---------- SUBSCRIPTIONS ----------
app.get('/api/patients/:patientId/subscription', async (req, res) => {
  const { data } = await supabase.from('subscriptions').select('*').eq('patient_id', req.params.patientId).eq('status', 'active').maybeSingle()
  res.json({ subscription: data || null })
})

app.post('/api/subscriptions', async (req, res) => {
  const { plan, patientId, price, tokensIncluded } = req.body
  if (!plan || !patientId || !price || !tokensIncluded) return res.status(400).json({ error: 'Missing subscription details' })

  const settings = await getServerSettings()
  if (Number(price) < settings.minimumSubscriptionUSD) return res.status(400).json({ error: `Minimum subscription is $${settings.minimumSubscriptionUSD}` })

  const { data: existing } = await supabase.from('subscriptions').select('id').eq('patient_id', patientId).eq('status', 'active').maybeSingle()
  if (existing) return res.status(409).json({ error: 'Active subscription already exists' })

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
  await supabase.from('doctors').update(updates).eq('id', doctorId)
  res.json({ message: 'Payout details updated' })
})

app.post('/api/doctors/:doctorId/withdraw', async (req, res) => {
  const { doctorId } = req.params
  const { tokens: requestedTokens } = req.body
  const doctor = await getDoctorProfile(doctorId)
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' })

  const available = Number(doctor.earnings_tokens) || 0
  const settings = await getServerSettings()
  const minTokens = settings.doctorMinimumWithdrawalUSD * settings.tokenToUSD

  let tokensToWithdraw = requestedTokens === undefined || requestedTokens === null ? available : Math.max(0, Math.floor(Number(requestedTokens) || 0))
  if (tokensToWithdraw <= 0) return res.status(400).json({ error: 'Valid token amount required' })
  if (tokensToWithdraw > available) return res.status(400).json({ error: 'Requested tokens exceed available balance' })
  if (tokensToWithdraw < minTokens) return res.status(400).json({ error: `Minimum withdrawal is ${minTokens} tokens ($${settings.doctorMinimumWithdrawalUSD})` })

  await updateDoctorEarnings(doctorId, -tokensToWithdraw)

  const reference = `kora-wd-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  await supabase.from('payouts').insert({
    id: reference,
    doctor_id: doctorId,
    tokens: tokensToWithdraw,
    amount_usd: tokensToWithdraw / settings.tokenToUSD,
    status: 'pending',
    reference,
    created_at: new Date().toISOString()
  })

  res.json({
    message: `Withdrawal of ${tokensToWithdraw} tokens initiated (mock)`,
    reference,
    tokensDebited: tokensToWithdraw,
    remainingTokens: available - tokensToWithdraw,
  })
})

// ---------- SETTINGS ----------
app.get('/api/settings', async (_req, res) => {
  res.json({ settings: await getServerSettings() })
})

app.patch('/api/admin/settings', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const { minimumSubscriptionUSD } = req.body
  if (typeof minimumSubscriptionUSD !== 'number' || minimumSubscriptionUSD < 1) return res.status(400).json({ error: 'Invalid value' })
  await supabase.from('server_settings').upsert({ key: 'minimumSubscriptionUSD', value: minimumSubscriptionUSD }, { onConflict: 'key' })
  res.json({ settings: await getServerSettings(), message: 'Updated' })
})

// ---------- ONLINE STATUS ----------
app.get('/api/online/status', async (_req, res) => {
  const { data: doctors } = await supabase.from('doctors').select('*').eq('is_online', true)
  const { data: patients } = await supabase.from('patients').select('*').eq('is_online', true)
  const { data: emergency } = await supabase.from('emergency_requests').select('*').eq('status', 'pending')
  res.json({ doctors: doctors || [], patients: patients || [], emergencyRequests: emergency || [] })
})

app.patch('/api/doctors/:doctorId/status', async (req, res) => {
  await supabase.from('doctors').update({ is_online: Boolean(req.body.isOnline) }).eq('id', req.params.doctorId)
  res.json({ message: 'Status updated' })
})

app.patch('/api/patients/:patientId/status', async (req, res) => {
  await supabase.from('patients').update({ is_online: Boolean(req.body.isOnline) }).eq('id', req.params.patientId)
  res.json({ message: 'Status updated' })
})

// ---------- DOCTOR LIST ----------
app.get('/api/doctors', async (req, res) => {
  let query = supabase.from('doctors').select('*').eq('verified', true).eq('license_verified', true)
  if (req.query.specialty) query = query.eq('specialty', req.query.specialty)
  if (req.query.minRating) query = query.gte('rating', Number(req.query.minRating))
  if (req.query.online !== undefined && req.query.online !== '') query = query.eq('is_online', req.query.online === 'true')
  query = query.order('rating', { ascending: false })
  const { data } = await query
  res.json({ doctors: data || [] })
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
  const { patientId, doctorId, scheduledDate, consultationType, notes, subscriptionType, tokensRequired } = req.body
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
  await supabase.from('appointments').insert(appointment)

  const date = new Date(scheduledDate)
  await supabase.from('appointment_reminders').insert([
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

  await supabase.from('notifications').insert([
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
  if (!consultationId || !senderId || !senderType || !recipientId || !recipientType || !messageContent) {
    return res.status(400).json({ error: 'Missing chat message fields' })
  }
  const id = generateId('msg')
  const message = {
    id, consultation_id: consultationId, sender_id: senderId, sender_type: senderType,
    recipient_id: recipientId, recipient_type: recipientType,
    message_type: messageType || 'text', message_content: messageContent,
    is_read: false, created_at: new Date().toISOString()
  }
  await supabase.from('chat_messages').insert(message)
  res.status(201).json({ chatMessage: message, message: 'Sent' })
})

app.get('/api/chat/messages', async (req, res) => {
  const { consultationId } = req.query
  if (!consultationId) return res.status(400).json({ error: 'consultationId required' })
  const { data } = await supabase.from('chat_messages').select('*')
    .eq('consultation_id', consultationId).order('created_at', { ascending: true })
  res.json({ messages: data || [] })
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
  res.status(201).json({ message: 'Community message sent' })
})

// ---------- ADMIN: DOCTOR MANAGEMENT ----------
app.get('/api/admin/doctors', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const { data: authRows, error: authError } = await supabase.from('doctors_auth').select('*').order('created_at', { ascending: false })
  if (authError) return res.status(500).json({ error: authError.message })
  const { data: profiles, error: profileError } = await supabase.from('doctors').select('*')
  if (profileError) return res.status(500).json({ error: profileError.message })
  const profileById = new Map((profiles || []).map((item) => [item.id, item]))
  const doctors = (authRows || []).map((row) => sanitizeDoctorForResponse({ ...profileById.get(row.id), ...row }))
  res.json({ doctors })
})

app.post('/api/admin/doctors', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const payload = normalizeDoctorPayload(req.body)
  if (!payload.email || !payload.password || !payload.name || !payload.specialty || !payload.location || !payload.licenseNumber) {
    return res.status(400).json({ error: 'Email, password, name, specialty, location, and license number are required' })
  }
  const { data: existing } = await supabase.from('doctors_auth').select('id').eq('email', payload.email).maybeSingle()
  if (existing) return res.status(409).json({ error: 'A doctor already exists with this email' })

  const id = generateId('doc')
  const authRow = {
    id,
    email: payload.email,
    password: payload.password,
    name: payload.name,
    specialty: payload.specialty,
    location: payload.location,
    license_number: payload.licenseNumber,
    bank_code: payload.bankCode || null,
    bank_account: payload.bankAccount || null,
    currency: payload.currency || null,
    verified: true,
    created_at: new Date().toISOString(),
  }
  const doctor = {
    id, name: payload.name, specialty: payload.specialty, location: payload.location, languages: payload.languages,
    rating: 0, rating_count: 0, availability: 'Available upon request', verified: true, is_online: false,
    fee: payload.consultationFee, license_number: payload.licenseNumber, license_issuer: payload.licenseIssuer || null,
    license_expiry: payload.licenseExpiry || null, bank_code: payload.bankCode || null, bank_account: payload.bankAccount || null,
    currency: payload.currency || null, payout_method: payload.payoutMethod,
    mobile_money_operator: payload.mobileMoneyOperator || null, mobile_money_number: payload.mobileMoneyNumber || null,
    license_verified: true,
    created_at: new Date().toISOString()
  }
  const { error: authInsertError } = await supabase.from('doctors_auth').insert(authRow)
  if (authInsertError) return res.status(500).json({ error: authInsertError.message })
  await supabase.from('doctors').insert(doctor)
  const emailResult = await sendDoctorApprovalEmail(authRow).catch((error) => ({ sent: false, reason: error.message }))
  res.status(201).json({ doctor: sanitizeDoctorForResponse({ ...doctor, ...authRow }), email: emailResult, message: 'Doctor added and approved' })
})

app.delete('/api/admin/doctors/:doctorId', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  await supabase.from('doctors').delete().eq('id', req.params.doctorId)
  await supabase.from('doctors_auth').delete().eq('id', req.params.doctorId)
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
    bank_code: payload.bankCode || null,
    bank_account: payload.bankAccount || null,
    currency: payload.currency || null,
  }
  if (payload.email) authUpdates.email = payload.email
  if (payload.password) authUpdates.password = payload.password
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
  }
  const { data: authRow, error: authError } = await supabase.from('doctors_auth').update(authUpdates).eq('id', req.params.doctorId).select('*').maybeSingle()
  if (authError) return res.status(500).json({ error: authError.message })
  const { data: profile, error: profileError } = await supabase.from('doctors').update(profileUpdates).eq('id', req.params.doctorId).select('*').maybeSingle()
  if (profileError) return res.status(500).json({ error: profileError.message })
  res.json({ doctor: sanitizeDoctorForResponse({ ...profile, ...authRow }), message: 'Doctor updated' })
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
  const { data: profile, error: profileError } = await supabase
    .from('doctors')
    .update({ verified: true, license_verified: true, is_online: false })
    .eq('id', req.params.doctorId)
    .select('*')
    .maybeSingle()
  if (profileError) return res.status(500).json({ error: profileError.message })
  if (!authRow && !profile) return res.status(404).json({ error: 'Doctor not found' })
  const doctor = sanitizeDoctorForResponse({ ...profile, ...authRow, approved_at: approvedAt })
  const emailResult = await sendDoctorApprovalEmail(doctor).catch((error) => ({ sent: false, reason: error.message }))
  res.json({ doctor, email: emailResult, message: 'Doctor approved and access granted' })
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

// ---------- ADMIN: REFERRALS (legacy specialty referrals) ----------
app.post('/api/admin/referrals', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const { patientId, fromSpecialty, toSpecialty, reason, notes } = req.body
  const id = generateId('ref')
  res.status(201).json({ referral: { id, patientId, fromSpecialty, toSpecialty, reason, notes, status: 'pending' }, message: 'Referral created' })
})

app.get('/api/admin/referrals', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  res.json({ referrals: [] })
})

app.post('/api/patients/referrals', async (req, res) => {
  const { patientId, fromSpecialty, toSpecialty, reason, notes } = req.body
  res.status(201).json({ referral: { id: generateId('ref'), patientId, fromSpecialty, toSpecialty, reason, notes, status: 'pending' }, message: 'Referral request submitted' })
})

app.get('/api/patients/:patientId/referrals', async (req, res) => {
  res.json({ referrals: [] })
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
  const { data: patient } = await supabase.from('patients').select('*').eq('id', req.params.patientId).maybeSingle()
  if (!patient) return res.status(404).json({ error: 'Patient not found' })
  res.json({ patient: sanitizePatientForResponse(patient) })
})

// ---------- PATIENT RECORD AGGREGATION ----------
app.get('/api/patients/:patientId/record', async (req, res) => {
  const { patientId } = req.params
  const { data: patient } = await supabase.from('patients').select('*').eq('id', patientId).maybeSingle()
  if (!patient) return res.status(404).json({ error: 'Patient not found' })

  const [tokens, files, appointments, consultations, labOrders, labPayments] = await Promise.all([
    supabase.from('patient_tokens').select('balance').eq('patient_id', patientId).maybeSingle(),
    supabase.from('patient_files').select('*').eq('patient_id', patientId),
    supabase.from('appointments').select('*').eq('patient_id', patientId),
    supabase.from('consultations_ng').select('*').eq('patient_id', patientId),
    supabase.from('lab_orders').select('*').eq('patient_id', patientId),
    supabase.from('lab_payments').select('*').in('order_id', (await supabase.from('lab_orders').select('id').eq('patient_id', patientId)).data?.map(o => o.id) || [])
  ])

  res.json({
    patient: sanitizePatientForResponse(patient),
    tokens: { balance: tokens.data?.balance || 0, transactions: [] },
    files: files.data || [],
    referrals: { specialty: [], facility: [] },
    appointments: appointments.data || [],
    consultations_ng: consultations.data || [],
    labs: { orders: labOrders.data || [], payments: labPayments.data || [] }
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
  res.status(201).json({ facility: { id, type, name, state, lga, address, phone, email, referral_payout_ngn: referral_payout_ngn || 0, pin: facilityPin }, message: 'Facility created' })
})

app.get('/api/facilities', async (req, res) => {
  const type = req.query.type
  let query = supabase.from('facilities').select('*, facility_wallets(balance_ngn)')
  if (type) query = query.eq('type', type)
  const { data } = await query
  const result = (data || []).map(f => ({ ...f, wallet_balance_ngn: f.facility_wallets?.[0]?.balance_ngn || 0 }))
  res.json({ facilities: result })
})

app.post('/api/facilities/auth', async (req, res) => {
  const { facilityId, pin } = req.body
  const { data: facility } = await supabase.from('facilities').select('*').eq('id', facilityId).eq('pin', pin).maybeSingle()
  if (!facility) return res.status(401).json({ error: 'Invalid credentials' })
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
  res.json({ facilityId, balance_ngn: wallet.balance_ngn, message: 'Wallet funded' })
})

// ---------- CONSULTATIONS (NGN) ----------
app.post('/api/consultations/start', async (req, res) => {
  const { patientId, doctorId, channel, track, facilityId, facilityPin, durationMin } = req.body
  const allowedChannels = ['direct_home', 'facility_private', 'facility_phc']
  if (!patientId || !doctorId || !allowedChannels.includes(channel)) return res.status(400).json({ error: 'patientId, doctorId, and valid channel required' })

  const doctor = await getDoctorProfile(doctorId)
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' })

  if (channel !== 'direct_home') {
    if (!facilityId || !facilityPin) return res.status(400).json({ error: 'facilityId and facilityPin required' })
    const facility = await getFacilityById(facilityId)
    if (!facility || facility.pin !== facilityPin) return res.status(401).json({ error: 'Invalid facility credentials' })
    if ((channel === 'facility_private' && facility.type !== 'private_clinic') ||
        (channel === 'facility_phc' && facility.type !== 'phc')) {
      return res.status(400).json({ error: 'Facility type mismatch' })
    }
  }

  const split = calculateConsultationSplitNgn({ channel, track: track || 'economy', durationMin: durationMin || 15 })
  const id = generateId('cng')
  const consultation = {
    id, patient_id: patientId, doctor_id: doctorId, facility_id: facilityId,
    channel: split.channel, track: split.track, duration_min: split.durationMin,
    blocks: split.blocks, total_ngn: split.total_ngn, status: 'in_progress',
    created_at: new Date().toISOString()
  }
  await supabase.from('consultations_ng').insert(consultation)

  res.status(201).json({ consultation, split })
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
  const split = calculateConsultationSplitNgn({
    channel: consultation.channel,
    track: consultation.track,
    durationMin: finalDurationMin
  })

  if (split.channel === 'facility_phc' && consultation.facility_id) {
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

  if (consultation.facility_id && split.facility_ngn > 0) {
    await creditFacilityWallet(consultation.facility_id, split.facility_ngn, {
      reason: 'Facility share from consultation',
      ref_type: 'consultation', ref_id: consultationId
    })
  }

  if (split.doctor_ngn > 0) {
    await updateDoctorEarnings(consultation.doctor_id, split.doctor_ngn)
  }

  const platformDelta = split.platform_ngn || 0
  const dataDelta = split.data_fee_ngn || 0
  await updatePlatformBalance(platformDelta, dataDelta)

  const revenueSplit = {
    id: generateId('rsng'),
    consultation_id: consultationId,
    channel: split.channel, track: split.track,
    total_ngn: split.total_ngn, doctor_ngn: split.doctor_ngn, platform_ngn: split.platform_ngn,
    facility_ngn: split.facility_ngn || 0, data_fee_ngn: split.data_fee_ngn || 0,
    patient_copay_ngn: split.patient_copay_ngn || 0, facility_topup_ngn: split.facility_topup_ngn || 0,
    created_at: new Date().toISOString()
  }
  await supabase.from('revenue_splits_ng').insert(revenueSplit)

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
  const referral = {
    id: generateId('fref'), code, from_doctor_id: doctorId, patient_id: patientId,
    facility_id: facilityId, facility_type: facility.type, reason, notes: notes || null,
    payout_ngn: facility.referral_payout_ngn || 0, status: 'pending',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }
  await supabase.from('facility_referrals').insert(referral)

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

  await supabase.from('facility_referrals').update({ status: 'redeemed', redeemed_at: new Date().toISOString() }).eq('id', referral.id)

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
  res.json({ referral: { ...referral, status: 'redeemed' }, wallet_balance_ngn: wallet.balance_ngn, message: 'Referral redeemed' })
})

// ---------- LAB ORDERS & PAYMENTS ----------
app.post('/api/labs/order', async (req, res) => {
  const { consultationId, patientId, doctorId, facilityId, tests, total_price_ngn } = req.body
  if (!patientId || !doctorId || !facilityId || !tests?.length || !total_price_ngn) return res.status(400).json({ error: 'Missing fields' })

  const facility = await getFacilityById(facilityId)
  if (!facility || facility.type !== 'lab') return res.status(400).json({ error: 'facilityId must be a lab' })

  const order = {
    id: generateId('labord'),
    consultation_id: consultationId || null, patient_id: patientId, doctor_id: doctorId,
    facility_id: facilityId, tests, total_price_ngn: Math.round(total_price_ngn),
    status: 'ordered', created_at: new Date().toISOString()
  }
  await supabase.from('lab_orders').insert(order)
  res.status(201).json({ order, message: 'Lab order created' })
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
  if (audience && audience !== 'all') query = query.eq('audience', audience)
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
  res.status(201).json({ announcement: { id, audience, severity, title, message }, message: 'Announcement published' })
})

app.delete('/api/admin/announcements/:announcementId', async (req, res) => {
  if (!await isPlatformAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  await supabase.from('announcements').delete().eq('id', req.params.announcementId)
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
  const reference = `kora-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  await supabase.from('payments').insert({
    id: reference, amount: amount, currency: currency || 'USD', description,
    customer, metadata, status: 'pending', provider: 'kora', reference, created_at: new Date().toISOString()
  })
  res.json({ reference, checkout_url: `https://kora-pay.com/pay/${reference}`, message: 'Payment initialized (mock)' })
})

app.get('/api/payments/kora/verify/:reference', async (req, res) => {
  const { reference } = req.params
  const { data: payment } = await supabase.from('payments').select('*').eq('reference', reference).maybeSingle()
  if (!payment) return res.status(404).json({ error: 'Payment not found' })

  if (payment.type === 'token_purchase' && payment.status !== 'success') {
    const { metadata } = payment
    if (metadata?.patientId && metadata?.tokensExpected) {
      await creditPatientTokens(metadata.patientId, metadata.tokensExpected, 'Token purchase via Kora')
    }
    await supabase.from('payments').update({ status: 'success' }).eq('id', payment.id)
  }
  res.json({ status: 'success', credited: true, payment })
})

app.post('/api/webhooks/kora', async (req, res) => {
  res.sendStatus(200)
})

// ---------- VIDEO TOKEN ----------
app.get('/api/video/token', (req, res) => {
  const channelName = req.query.channelName
  if (!channelName) return res.status(400).json({ error: 'channelName required' })
  if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) return res.status(500).json({ error: 'Video SDK not configured' })
  const token = RtcTokenBuilder.buildTokenWithUid(AGORA_APP_ID, AGORA_APP_CERTIFICATE, channelName, 0, RtcRole.PUBLISHER, Math.floor(Date.now() / 1000) + 3600)
  res.json({ token, appId: AGORA_APP_ID })
})

// ---------- VITAL PARAMETERS (placeholder) ----------
app.post('/api/vital-parameters', async (req, res) => {
  res.status(200).json({ message: 'Vital parameter recorded (mock)' })
})

// ---------- EXPORT ----------
const port = process.env.PORT || 4000
export default app

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`)
  })
}
