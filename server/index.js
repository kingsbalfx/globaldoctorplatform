import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import axios from 'axios'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { resolve } from 'path'
import { calculateConsultationSplitNgn, calculateLabCommissionNgn } from '../src/lib/ngPricing.js'
import pkg from 'agora-access-token'
const { RtcTokenBuilder, RtcRole } = pkg

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const AGORA_APP_ID = process.env.AGORA_APP_ID
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE

const doctors = [
  {
    id: 'doc-001',
    name: 'Dr. Amina Yusuf',
    specialty: 'Cardiology',
    location: 'Nairobi, Kenya',
    languages: ['English', 'Swahili'],
    rating: 4.9,
    availability: 'Available now',
    verified: true,
    isOnline: true,
    fee: 35,
    price: { basic: 50, premium: 100 },
    licenseVerified: true,
  },
  {
    id: 'doc-002',
    name: 'Dr. James Park',
    specialty: 'Dermatology',
    location: 'Seoul, South Korea',
    languages: ['English', 'Korean'],
    rating: 4.8,
    availability: 'Book for tomorrow',
    verified: true,
    isOnline: false,
    fee: 40,
    price: { basic: 60, premium: 120 },
    licenseVerified: true,
  },
  {
    id: 'doc-003',
    name: 'Dr. Priya Singh',
    specialty: 'Pediatrics',
    location: 'London, UK',
    languages: ['English', 'Hindi'],
    rating: 4.7,
    availability: 'Available now',
    verified: false,
    isOnline: true,
    fee: 30,
    price: { basic: 45, premium: 90 },
    licenseVerified: false,
  },
]

const reviews = []
const admins = [
  {
    email: String(process.env.ADMIN_EMAIL || 'shafiuabdullahi.sa3@gmail.com').trim(),
    password: String(process.env.ADMIN_PASSWORD || '014/Pt/014').trim(),
    name: 'System Admin',
  },
]
const doctorsAuth = [] // In production, use a proper database
const referrals = [] // Patient referrals
const uploadedFiles = [] // File management
const patients = [] // Patient management
const patientFiles = []
const appointments = []
const notifications = []
const announcements = [] // Broadcast messages (landing/patient/doctor)
const facilities = [] // Facilities: private clinics, PHCs, labs
const facilityWallets = [] // Facility NGN wallets
const facilityWalletTx = [] // Facility wallet transactions
const facilityReferrals = [] // Referral codes redeemed by facilities
const consultationsNg = [] // NGN consultations (hospital pack)
const revenueSplitsNg = [] // NGN revenue splits per consultation
const labOrders = [] // Lab orders
const labPayments = [] // Lab payments + commissions
const auditLogs = [] // Audit trail for all money/critical ops
let platformBalanceNgn = 0
let dataFundBalanceNgn = 0
const chatMessages = []
const appointmentReminders = []
const emergencyRequests = []
const serverSettings = {
  minimumSubscriptionUSD: 10,
  // Token rules
  patientMinimumDepositUSD: 10,
  tokenPerUSDFirstPurchase: 10,
  tokenPerUSDRepeatPurchase: 7.5,
  tokenToUSD: 10, // 10 tokens = $1 (100 tokens = $10)
  doctorMinimumWithdrawalUSD: 5,
}
const patientTokens = [] // Token balances
const subscriptions = [] // Subscription management
const payments = [] // Payment transactions
const payouts = [] // Doctor withdrawals / payouts

const KORA_SECRET_KEY = process.env.KORA_SECRET_KEY
const KORA_BASE_URL = process.env.KORA_BASE_URL || 'https://api.korapay.com'

function normalizeAppBaseUrl(rawValue) {
  const value = String(rawValue || '').trim().replace(/\/+$/, '')
  if (!value) return ''

  // Never trust localhost in deployed environments (it's a common misconfiguration on Vercel).
  if (value.includes('localhost') || value.includes('127.0.0.1')) return ''

  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`
  try {
    const url = new URL(candidate)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return url.origin
  } catch {
    return ''
  }
}

function getApiOrigin(req) {
  const configured =
    process.env.APP_BASE_URL ||
    process.env.VITE_APP_BASE ||
    process.env.VITE_API_BASE ||
    process.env.VERCEL_URL

  const normalized = normalizeAppBaseUrl(configured)
  if (normalized) return normalized

  const proto = (req.headers['x-forwarded-proto'] || 'http').toString().split(',')[0].trim()
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toString().split(',')[0].trim()
  if (!host) return ''
  return `${proto}://${host}`
}

function safeNumber(value) {
  const parsed = typeof value === 'string' ? Number(value) : value
  return Number.isFinite(parsed) ? parsed : null
}

function isPlatformAdminRequest(req) {
  const email = String(req.headers['x-admin-email'] || '').trim()
  const password = String(req.headers['x-admin-password'] || '').trim()
  if (!email || !password) return false
  return admins.some((admin) => admin.email === email && admin.password === password)
}

function auditLog({ event, actor_type, actor_id, entity_type, entity_id, meta }) {
  auditLogs.unshift({
    id: `audit-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    event: String(event || '').trim(),
    actor_type: actor_type ? String(actor_type) : null,
    actor_id: actor_id ? String(actor_id) : null,
    entity_type: entity_type ? String(entity_type) : null,
    entity_id: entity_id ? String(entity_id) : null,
    meta: meta && typeof meta === 'object' ? meta : null,
    created_at: new Date().toISOString(),
  })
}

function getFacilityById(facilityId) {
  return facilities.find((f) => f.id === facilityId) || null
}

function getOrCreateFacilityWallet(facilityId) {
  let wallet = facilityWallets.find((w) => w.facility_id === facilityId)
  if (!wallet) {
    wallet = { facility_id: facilityId, balance_ngn: 0, updated_at: new Date().toISOString() }
    facilityWallets.push(wallet)
  }
  return wallet
}

function recordFacilityWalletTx({ facilityId, direction, amountNgn, reason, ref_type, ref_id, meta }) {
  const amount = Math.max(0, Math.round(Number(amountNgn) || 0))
  facilityWalletTx.unshift({
    id: `fwtx-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    facility_id: facilityId,
    direction, // 'credit' | 'debit'
    amount_ngn: amount,
    reason: String(reason || '').trim() || null,
    ref_type: ref_type ? String(ref_type) : null,
    ref_id: ref_id ? String(ref_id) : null,
    meta: meta && typeof meta === 'object' ? meta : null,
    created_at: new Date().toISOString(),
  })
}

function creditFacilityWallet(facilityId, amountNgn, details = {}) {
  const wallet = getOrCreateFacilityWallet(facilityId)
  const amount = Math.max(0, Math.round(Number(amountNgn) || 0))
  wallet.balance_ngn += amount
  wallet.updated_at = new Date().toISOString()
  recordFacilityWalletTx({ facilityId, direction: 'credit', amountNgn: amount, ...details })
  auditLog({
    event: 'facility_wallet_credited',
    actor_type: 'system',
    actor_id: null,
    entity_type: 'facility_wallet',
    entity_id: facilityId,
    meta: {
      facility_id: facilityId,
      direction: 'credit',
      amount_ngn: amount,
      balance_ngn: wallet.balance_ngn,
      reason: details?.reason ? String(details.reason) : null,
      ref_type: details?.ref_type ? String(details.ref_type) : null,
      ref_id: details?.ref_id ? String(details.ref_id) : null,
      meta: details?.meta && typeof details.meta === 'object' ? details.meta : null,
    },
  })
  return wallet.balance_ngn
}

function debitFacilityWallet(facilityId, amountNgn, details = {}) {
  const wallet = getOrCreateFacilityWallet(facilityId)
  const amount = Math.max(0, Math.round(Number(amountNgn) || 0))
  if (wallet.balance_ngn < amount) {
    return { ok: false, balance_ngn: wallet.balance_ngn, required_ngn: amount }
  }
  wallet.balance_ngn -= amount
  wallet.updated_at = new Date().toISOString()
  recordFacilityWalletTx({ facilityId, direction: 'debit', amountNgn: amount, ...details })
  auditLog({
    event: 'facility_wallet_debited',
    actor_type: 'system',
    actor_id: null,
    entity_type: 'facility_wallet',
    entity_id: facilityId,
    meta: {
      facility_id: facilityId,
      direction: 'debit',
      amount_ngn: amount,
      balance_ngn: wallet.balance_ngn,
      reason: details?.reason ? String(details.reason) : null,
      ref_type: details?.ref_type ? String(details.ref_type) : null,
      ref_id: details?.ref_id ? String(details.ref_id) : null,
      meta: details?.meta && typeof details.meta === 'object' ? details.meta : null,
    },
  })
  return { ok: true, balance_ngn: wallet.balance_ngn }
}

function creditDoctorEarningsNgn(doctorId, amountNgn) {
  const amount = Math.max(0, Math.round(Number(amountNgn) || 0))
  const updated = updateDoctorEverywhere(doctorId, {
    earningsNGN: Math.max(0, Math.round(Number(resolveDoctor(doctorId)?.earningsNGN || 0))) + amount,
    updatedAt: new Date().toISOString(),
  })
  auditLog({
    event: 'doctor_earnings_credited',
    actor_type: 'system',
    actor_id: null,
    entity_type: 'doctor',
    entity_id: doctorId,
    meta: { amount_ngn: amount, earnings_ngn: updated?.earningsNGN ?? null },
  })
  return updated?.earningsNGN ?? 0
}

function roundMoney(amount) {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

function getPatientTokenRecord(patientId) {
  let tokenRecord = patientTokens.find(t => t.patientId === patientId)
  if (!tokenRecord) {
    tokenRecord = { patientId, balance: 0, transactions: [] }
    patientTokens.push(tokenRecord)
  }
  return tokenRecord
}

function hasPatientPurchasedTokens(patientId) {
  const tokenRecord = patientTokens.find(t => t.patientId === patientId)
  return Boolean(tokenRecord?.transactions?.some(txn => txn.type === 'purchase'))
}

function resolveDoctor(doctorId) {
  return doctorsAuth.find(d => d.id === doctorId) || doctors.find(d => d.id === doctorId)
}

function updateDoctorEverywhere(doctorId, patch) {
  const authDoc = doctorsAuth.find(d => d.id === doctorId)
  const profileDoc = doctors.find(d => d.id === doctorId)
  if (authDoc) Object.assign(authDoc, patch)
  if (profileDoc) Object.assign(profileDoc, patch)
  return authDoc || profileDoc || null
}

function guessCurrencyFromLocation(location) {
  const country = String(location || '').split(',').pop()?.trim()?.toLowerCase()
  const map = {
    nigeria: 'NGN',
    kenya: 'KES',
    ghana: 'GHS',
    'south africa': 'ZAR',
    cameroon: 'XAF',
    'cote d’ivoire': 'XOF',
    "cote d'ivoire": 'XOF',
    egypt: 'EGP',
    usa: 'USD',
    'united states': 'USD',
    uk: 'GBP',
    'united kingdom': 'GBP',
  }
  return map[country] || null
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/config', (req, res) => {
  const origin = getApiOrigin(req)
  res.json({
    status: 'ok',
    origin,
    configured: {
      kora: Boolean(KORA_SECRET_KEY),
      agora: Boolean(AGORA_APP_ID && AGORA_APP_CERTIFICATE),
      adminEnv: Boolean(process.env.ADMIN_EMAIL || process.env.ADMIN_PASSWORD),
    },
  })
})

// ============ ANNOUNCEMENTS (BROADCAST MESSAGES) ============

app.get('/api/announcements', (req, res) => {
  const audience = String(req.query.audience || 'all').trim().toLowerCase()
  const now = Date.now()

  const items = announcements
    .filter((item) => {
      if (item.is_active === false) return false
      if (item.expires_at && new Date(item.expires_at).getTime() <= now) return false
      if (!audience || audience === 'all') return true
      return item.audience === audience
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  res.json({ announcements: items })
})

app.post('/api/admin/announcements', (req, res) => {
  if (!isPlatformAdminRequest(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const title = String(req.body?.title || '').trim()
  const message = String(req.body?.message || '').trim()
  const audience = String(req.body?.audience || '').trim().toLowerCase()
  const severity = String(req.body?.severity || 'info').trim().toLowerCase()
  const expiresAtRaw = req.body?.expires_at ?? req.body?.expiresAt ?? null

  const allowedAudiences = new Set(['landing', 'patient', 'doctor'])
  const allowedSeverities = new Set(['info', 'warning', 'urgent'])

  if (!title || !message) {
    return res.status(400).json({ error: 'title and message are required' })
  }
  if (!allowedAudiences.has(audience)) {
    return res.status(400).json({ error: 'audience must be one of: landing, patient, doctor' })
  }
  if (!allowedSeverities.has(severity)) {
    return res.status(400).json({ error: 'severity must be one of: info, warning, urgent' })
  }

  let expires_at = null
  if (expiresAtRaw) {
    const parsed = new Date(expiresAtRaw)
    if (Number.isNaN(parsed.getTime())) {
      return res.status(400).json({ error: 'expires_at must be a valid date (ISO string)' })
    }
    expires_at = parsed.toISOString()
  }

  const announcement = {
    id: `ann-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    audience,
    severity,
    title,
    message,
    is_active: true,
    created_at: new Date().toISOString(),
    expires_at,
  }

  announcements.unshift(announcement)
  res.status(201).json({ announcement, message: 'Announcement published' })
})

app.delete('/api/admin/announcements/:announcementId', (req, res) => {
  if (!isPlatformAdminRequest(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { announcementId } = req.params
  const index = announcements.findIndex((item) => item.id === announcementId)
  if (index === -1) return res.status(404).json({ error: 'Announcement not found' })

  const removed = announcements.splice(index, 1)
  res.json({ announcement: removed[0], message: 'Announcement deleted' })
})

// ============ NIGERIA HOSPITAL PACK (FACILITIES + SPLITS + LABS) ============

function generateSixDigitPin() {
  const pin = crypto.randomInt(0, 1000000).toString().padStart(6, '0')
  return pin
}

function isFacilityAuthValid(facilityId, pin) {
  const facility = getFacilityById(facilityId)
  if (!facility) return false
  if (!facility.pin) return false
  return String(facility.pin) === String(pin)
}

function requireFacilityAuth(req, res) {
  const facilityId = String(req.headers['x-facility-id'] || '').trim()
  const pin = String(req.headers['x-facility-pin'] || '').trim()
  if (!facilityId || !pin || !isFacilityAuthValid(facilityId, pin)) {
    res.status(401).json({ error: 'Unauthorized facility' })
    return null
  }
  return { facilityId }
}

app.post('/api/facilities', (req, res) => {
  if (!isPlatformAdminRequest(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const type = String(req.body?.type || '').trim().toLowerCase()
  const name = String(req.body?.name || '').trim()
  const state = String(req.body?.state || '').trim()
  const lga = String(req.body?.lga || '').trim()
  const address = String(req.body?.address || '').trim()
  const phone = String(req.body?.phone || '').trim()
  const email = String(req.body?.email || '').trim()
  const referralPayout = Math.max(0, Math.round(Number(req.body?.referral_payout_ngn ?? req.body?.referralPayoutNgn ?? 0) || 0))

  const allowed = new Set(['private_clinic', 'phc', 'lab'])
  if (!allowed.has(type)) {
    return res.status(400).json({ error: 'type must be one of: private_clinic, phc, lab' })
  }
  if (!name) return res.status(400).json({ error: 'name is required' })

  const facility = {
    id: `fac-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    type,
    name,
    state: state || null,
    lga: lga || null,
    address: address || null,
    phone: phone || null,
    email: email || null,
    pin: String(req.body?.pin || '').trim() || generateSixDigitPin(),
    referral_payout_ngn:
      referralPayout ||
      (type === 'private_clinic' ? 500 : type === 'phc' ? 200 : 0),
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  facilities.unshift(facility)
  getOrCreateFacilityWallet(facility.id)

  auditLog({
    event: 'facility_created',
    actor_type: 'platform_admin',
    actor_id: String(req.headers['x-admin-email'] || ''),
    entity_type: 'facility',
    entity_id: facility.id,
    meta: { type: facility.type, name: facility.name },
  })

  return res.status(201).json({ facility, message: 'Facility created' })
})

app.get('/api/facilities', (req, res) => {
  const type = String(req.query?.type || '').trim().toLowerCase()
  const filtered = type ? facilities.filter((f) => f.type === type) : facilities.slice()

  const isAdmin = isPlatformAdminRequest(req)
  const result = filtered.map((f) => {
    const wallet = getOrCreateFacilityWallet(f.id)
    return {
      ...f,
      pin: isAdmin ? f.pin : undefined,
      wallet_balance_ngn: wallet.balance_ngn,
    }
  })

  res.json({ facilities: result })
})

app.post('/api/facilities/auth', (req, res) => {
  const facilityId = String(req.body?.facilityId || '').trim()
  const pin = String(req.body?.pin || '').trim()
  if (!facilityId || !pin) return res.status(400).json({ error: 'facilityId and pin are required' })
  if (!isFacilityAuthValid(facilityId, pin)) return res.status(401).json({ error: 'Invalid facility credentials' })

  const facility = getFacilityById(facilityId)
  const wallet = getOrCreateFacilityWallet(facilityId)
  const tx = facilityWalletTx.filter((t) => t.facility_id === facilityId).slice(0, 20)
  return res.json({ facility: { ...facility, pin: undefined }, wallet, transactions: tx })
})

app.post('/api/admin/facilities/:facilityId/fund', (req, res) => {
  if (!isPlatformAdminRequest(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { facilityId } = req.params
  const facility = getFacilityById(facilityId)
  if (!facility) return res.status(404).json({ error: 'Facility not found' })

  const amountNgn = Math.max(0, Math.round(Number(req.body?.amount_ngn ?? req.body?.amountNgn ?? 0) || 0))
  if (amountNgn <= 0) return res.status(400).json({ error: 'amount_ngn must be > 0' })

  creditFacilityWallet(facilityId, amountNgn, {
    reason: 'Admin funding',
    ref_type: 'admin_fund',
    ref_id: String(req.headers['x-admin-email'] || ''),
  })

  auditLog({
    event: 'facility_wallet_funded',
    actor_type: 'platform_admin',
    actor_id: String(req.headers['x-admin-email'] || ''),
    entity_type: 'facility_wallet',
    entity_id: facilityId,
    meta: { amount_ngn: amountNgn },
  })

  return res.json({ facilityId, balance_ngn: getOrCreateFacilityWallet(facilityId).balance_ngn, message: 'Wallet funded' })
})

app.get('/api/admin/audit-logs', (req, res) => {
  if (!isPlatformAdminRequest(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  res.json({ auditLogs: auditLogs.slice(0, 500) })
})

app.post('/api/consultations/start', (req, res) => {
  const patientId = String(req.body?.patientId || '').trim()
  const doctorId = String(req.body?.doctorId || '').trim()
  const channel = String(req.body?.channel || '').trim()
  const track = String(req.body?.track || '').trim().toLowerCase()
  const facilityId = req.body?.facilityId ? String(req.body.facilityId).trim() : null
  const facilityPin = String(req.body?.facilityPin || req.body?.pin || '').trim()
  const durationMin = safeNumber(req.body?.durationMin) ?? 15

  const allowedChannels = new Set(['direct_home', 'facility_private', 'facility_phc'])
  if (!patientId || !doctorId || !allowedChannels.has(channel)) {
    return res.status(400).json({ error: 'patientId, doctorId and valid channel are required' })
  }

  const patient = patients.find((p) => p.id === patientId) || null
  if (!patient) return res.status(404).json({ error: 'Patient not found' })

  const doctor = resolveDoctor(doctorId)
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' })

  if (channel === 'direct_home' && !['economy', 'premium'].includes(track)) {
    return res.status(400).json({ error: 'track must be economy or premium for direct_home' })
  }

  if (channel !== 'direct_home') {
    if (!facilityId) return res.status(400).json({ error: 'facilityId is required for facility channels' })
    if (!facilityPin) return res.status(400).json({ error: 'facilityPin is required for facility channels' })
    if (!isFacilityAuthValid(facilityId, facilityPin)) {
      return res.status(401).json({ error: 'Invalid facility credentials' })
    }
    const facility = getFacilityById(facilityId)
    if (!facility) return res.status(404).json({ error: 'Facility not found' })
    if (channel === 'facility_private' && facility.type !== 'private_clinic') {
      return res.status(400).json({ error: 'facilityId must be a private_clinic for facility_private' })
    }
    if (channel === 'facility_phc' && facility.type !== 'phc') {
      return res.status(400).json({ error: 'facilityId must be a phc for facility_phc' })
    }
  }

  const split = calculateConsultationSplitNgn({ channel, track, durationMin })

  const consultation = {
    id: `cng-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    patient_id: patientId,
    doctor_id: doctorId,
    facility_id: facilityId,
    channel: split.channel,
    track: split.track,
    duration_min: split.durationMin,
    blocks: split.blocks,
    total_ngn: split.total_ngn,
    status: 'in_progress',
    created_at: new Date().toISOString(),
    completed_at: null,
  }

  consultationsNg.unshift(consultation)

  auditLog({
    event: 'consultation_started',
    actor_type: 'system',
    actor_id: null,
    entity_type: 'consultation',
    entity_id: consultation.id,
    meta: { channel: consultation.channel, track: consultation.track, total_ngn: consultation.total_ngn },
  })

  res.status(201).json({ consultation, split })
})

app.post('/api/consultations/end', (req, res) => {
  const consultationId = String(req.body?.consultationId || '').trim()
  if (!consultationId) return res.status(400).json({ error: 'consultationId is required' })

  const consultation = consultationsNg.find((c) => c.id === consultationId)
  if (!consultation) return res.status(404).json({ error: 'Consultation not found' })
  if (consultation.status === 'completed') return res.json({ consultation, message: 'Already completed' })

  // Facility-linked consultations require facility PIN to close (prevents unauthorized wallet movements).
  if (consultation.facility_id) {
    const facilityPin = String(req.body?.facilityPin || req.body?.pin || '').trim()
    if (!facilityPin) return res.status(400).json({ error: 'facilityPin is required to complete facility consultations' })
    if (!isFacilityAuthValid(consultation.facility_id, facilityPin)) {
      return res.status(401).json({ error: 'Invalid facility credentials' })
    }
  }

  // Recalculate in case duration changed at end.
  const finalDurationMin = safeNumber(req.body?.durationMin) ?? consultation.duration_min
  const split = calculateConsultationSplitNgn({
    channel: consultation.channel,
    track: consultation.track,
    durationMin: finalDurationMin,
  })

  // PHC topup is funded from PHC wallet (pre-funded by admin/state).
  if (split.channel === 'facility_phc' && consultation.facility_id) {
    const debitResult = debitFacilityWallet(consultation.facility_id, split.facility_topup_ngn, {
      reason: 'PHC consult topup funding',
      ref_type: 'consultation',
      ref_id: consultation.id,
      meta: { patient_copay_ngn: split.patient_copay_ngn },
    })
    if (!debitResult.ok) {
      return res.status(400).json({
        error: 'PHC wallet has insufficient balance for topup funding',
        facility_id: consultation.facility_id,
        balance_ngn: debitResult.balance_ngn,
        required_ngn: debitResult.required_ngn,
      })
    }
  }

  // Credit facility share (if any).
  if (consultation.facility_id && split.facility_ngn > 0) {
    creditFacilityWallet(consultation.facility_id, split.facility_ngn, {
      reason: 'Facility share from consultation',
      ref_type: 'consultation',
      ref_id: consultation.id,
      meta: { channel: split.channel },
    })
  }

  // Credit doctor earnings.
  if (split.doctor_ngn > 0) {
    creditDoctorEarningsNgn(consultation.doctor_id, split.doctor_ngn)
  }

  // Platform + data fund ledgers.
  platformBalanceNgn += Math.max(0, split.platform_ngn || 0)
  dataFundBalanceNgn += Math.max(0, split.data_fee_ngn || 0)

  const revenueSplit = {
    id: `rsng-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    consultation_id: consultation.id,
    channel: split.channel,
    track: split.track,
    total_ngn: split.total_ngn,
    doctor_ngn: split.doctor_ngn,
    platform_ngn: split.platform_ngn,
    facility_ngn: split.facility_ngn || 0,
    data_fee_ngn: split.data_fee_ngn,
    patient_copay_ngn: split.patient_copay_ngn || 0,
    facility_topup_ngn: split.facility_topup_ngn || 0,
    created_at: new Date().toISOString(),
  }

  revenueSplitsNg.unshift(revenueSplit)

  consultation.status = 'completed'
  consultation.duration_min = split.durationMin
  consultation.blocks = split.blocks
  consultation.total_ngn = split.total_ngn
  consultation.completed_at = new Date().toISOString()

  auditLog({
    event: 'consultation_completed',
    actor_type: 'system',
    actor_id: null,
    entity_type: 'consultation',
    entity_id: consultation.id,
    meta: revenueSplit,
  })

  res.json({
    consultation,
    split: revenueSplit,
    ledgers: { platformBalanceNgn, dataFundBalanceNgn },
    message: 'Consultation completed and split recorded',
  })
})

app.post('/api/referrals/facility/create', (req, res) => {
  const doctorId = String(req.body?.doctorId || '').trim()
  const patientId = String(req.body?.patientId || '').trim()
  const facilityId = String(req.body?.facilityId || '').trim()
  const reason = String(req.body?.reason || '').trim()
  const notes = String(req.body?.notes || '').trim()

  if (!doctorId || !patientId || !facilityId || !reason) {
    return res.status(400).json({ error: 'doctorId, patientId, facilityId and reason are required' })
  }

  const facility = getFacilityById(facilityId)
  if (!facility) return res.status(404).json({ error: 'Facility not found' })

  const code = `GD-${facility.type.toUpperCase().slice(0, 3)}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

  const referral = {
    id: `fref-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    code,
    from_doctor_id: doctorId,
    patient_id: patientId,
    facility_id: facilityId,
    facility_type: facility.type,
    reason,
    notes: notes || null,
    payout_ngn: facility.referral_payout_ngn || 0,
    status: 'pending',
    created_at: new Date().toISOString(),
    redeemed_at: null,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }

  facilityReferrals.unshift(referral)

  auditLog({
    event: 'facility_referral_created',
    actor_type: 'doctor',
    actor_id: doctorId,
    entity_type: 'facility_referral',
    entity_id: referral.id,
    meta: { code, facility_id: facilityId, payout_ngn: referral.payout_ngn },
  })

  res.status(201).json({ referral, referralCode: code, message: 'Facility referral created' })
})

app.get('/api/referrals/facility', (req, res) => {
  const doctorId = req.query?.doctorId ? String(req.query.doctorId).trim() : ''
  const facilityId = req.query?.facilityId ? String(req.query.facilityId).trim() : ''
  const patientId = req.query?.patientId ? String(req.query.patientId).trim() : ''

  let items = facilityReferrals.slice()
  if (doctorId) items = items.filter((r) => r.from_doctor_id === doctorId)
  if (facilityId) items = items.filter((r) => r.facility_id === facilityId)
  if (patientId) items = items.filter((r) => r.patient_id === patientId)

  res.json({ referrals: items.slice(0, 200) })
})

app.post('/api/referrals/facility/redeem', (req, res) => {
  const facilityId = String(req.body?.facilityId || '').trim()
  const pin = String(req.body?.pin || '').trim()
  const code = String(req.body?.code || '').trim().toUpperCase()

  if (!facilityId || !pin || !code) return res.status(400).json({ error: 'facilityId, pin and code are required' })
  if (!isFacilityAuthValid(facilityId, pin)) return res.status(401).json({ error: 'Invalid facility credentials' })

  const referral = facilityReferrals.find((r) => r.code === code)
  if (!referral) return res.status(404).json({ error: 'Referral code not found' })
  if (referral.status !== 'pending') return res.status(400).json({ error: `Referral is ${referral.status}` })
  if (referral.facility_id !== facilityId) return res.status(403).json({ error: 'Referral code is not assigned to this facility' })

  if (referral.expires_at && new Date(referral.expires_at).getTime() <= Date.now()) {
    referral.status = 'expired'
    return res.status(400).json({ error: 'Referral code has expired' })
  }

  referral.status = 'redeemed'
  referral.redeemed_at = new Date().toISOString()

  if (referral.payout_ngn > 0) {
    creditFacilityWallet(facilityId, referral.payout_ngn, {
      reason: 'Referral payout',
      ref_type: 'facility_referral',
      ref_id: referral.id,
      meta: { code: referral.code, from_doctor_id: referral.from_doctor_id, patient_id: referral.patient_id },
    })
    platformBalanceNgn = Math.max(0, platformBalanceNgn - referral.payout_ngn)
  }

  auditLog({
    event: 'facility_referral_redeemed',
    actor_type: 'facility',
    actor_id: facilityId,
    entity_type: 'facility_referral',
    entity_id: referral.id,
    meta: { code: referral.code, payout_ngn: referral.payout_ngn },
  })

  res.json({
    referral,
    wallet_balance_ngn: getOrCreateFacilityWallet(facilityId).balance_ngn,
    message: 'Referral redeemed successfully',
  })
})

app.post('/api/labs/order', (req, res) => {
  const consultationId = String(req.body?.consultationId || '').trim()
  const patientId = String(req.body?.patientId || '').trim()
  const doctorId = String(req.body?.doctorId || '').trim()
  const facilityId = String(req.body?.facilityId || '').trim() // lab facility id
  const tests = Array.isArray(req.body?.tests) ? req.body.tests.map((t) => String(t).trim()).filter(Boolean) : []
  const totalPriceNgn = Math.max(0, Math.round(Number(req.body?.total_price_ngn ?? req.body?.totalPriceNgn ?? 0) || 0))

  if (!patientId || !doctorId || !facilityId || tests.length === 0 || totalPriceNgn <= 0) {
    return res.status(400).json({ error: 'patientId, doctorId, facilityId, tests[], total_price_ngn are required' })
  }

  const facility = getFacilityById(facilityId)
  if (!facility || facility.type !== 'lab') return res.status(400).json({ error: 'facilityId must be a lab facility' })

  const order = {
    id: `labord-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    consultation_id: consultationId || null,
    patient_id: patientId,
    doctor_id: doctorId,
    facility_id: facilityId,
    tests,
    total_price_ngn: totalPriceNgn,
    status: 'ordered',
    created_at: new Date().toISOString(),
    paid_at: null,
  }

  labOrders.unshift(order)

  auditLog({
    event: 'lab_order_created',
    actor_type: 'doctor',
    actor_id: doctorId,
    entity_type: 'lab_order',
    entity_id: order.id,
    meta: { facility_id: facilityId, total_price_ngn: totalPriceNgn, tests },
  })

  res.status(201).json({ order, message: 'Lab order created' })
})

app.post('/api/labs/pay', (req, res) => {
  const orderId = String(req.body?.orderId || '').trim()
  const amountPaidNgn = Math.max(0, Math.round(Number(req.body?.amount_paid_ngn ?? req.body?.amountPaidNgn ?? 0) || 0))
  const method = String(req.body?.method || 'cash').trim().toLowerCase()

  if (!orderId || amountPaidNgn <= 0) return res.status(400).json({ error: 'orderId and amount_paid_ngn are required' })

  const order = labOrders.find((o) => o.id === orderId)
  if (!order) return res.status(404).json({ error: 'Lab order not found' })
  if (order.status === 'paid') return res.json({ order, message: 'Already paid' })

  const commission = calculateLabCommissionNgn(amountPaidNgn)

  platformBalanceNgn += commission.platform_commission_ngn
  creditFacilityWallet(order.facility_id, commission.facility_net_ngn, {
    reason: 'Lab payment (net)',
    ref_type: 'lab_order',
    ref_id: order.id,
    meta: { method },
  })

  const payment = {
    id: `labpay-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    order_id: order.id,
    facility_id: order.facility_id,
    amount_paid_ngn: commission.total_ngn,
    platform_commission_ngn: commission.platform_commission_ngn,
    facility_net_ngn: commission.facility_net_ngn,
    method,
    created_at: new Date().toISOString(),
  }

  labPayments.unshift(payment)
  order.status = 'paid'
  order.paid_at = payment.created_at

  auditLog({
    event: 'lab_payment_recorded',
    actor_type: 'system',
    actor_id: null,
    entity_type: 'lab_payment',
    entity_id: payment.id,
    meta: payment,
  })

  res.json({ order, payment, message: 'Lab payment recorded' })
})

// ============ VIDEO SDK ENDPOINT ============
app.get('/api/video/token', (req, res) => {
  const channelName = req.query.channelName
  if (!channelName) return res.status(400).json({ error: 'channelName is required' })
  if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
    return res.status(500).json({ error: 'Video SDK not configured on server' })
  }

  const uid = 0
  const role = RtcRole.PUBLISHER
  const expirationTimeInSeconds = 3600
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

  const token = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  )
  res.json({ token, appId: AGORA_APP_ID })
})

app.post('/api/doctors/register', (req, res) => {
  const { email, password, name, specialty, location, licenseNumber } = req.body

  if (!email || !password || !name || !specialty || !location || !licenseNumber) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  // Check if doctor already exists
  const existingDoctor = doctorsAuth.find(d => d.email === email)
  if (existingDoctor) {
    return res.status(409).json({ error: 'Doctor already exists' })
  }

  const inferredCurrency = guessCurrencyFromLocation(location) || 'USD'

  const newDoctor = {
    id: `doc-${doctorsAuth.length + 1}`,
    email,
    password, // In production, hash this!
    name,
    specialty,
    location,
    licenseNumber,
    payoutMethod: 'bank_account',
    currency: inferredCurrency,
    earningsTokens: 0,
    verified: false,
    createdAt: new Date().toISOString(),
  }

  doctorsAuth.push(newDoctor)

  // Create doctor profile in the main doctors array
  const doctorProfile = {
    id: newDoctor.id,
    name,
    specialty,
    location,
    languages: ['English'], // Default
    rating: 0,
    rating_count: 0,
    availability: 'Available upon request',
    verified: false,
    licenseVerified: false,
    fee: 50, // Default fee
    payoutMethod: 'bank_account',
    currency: inferredCurrency,
    earningsTokens: 0,
    created_at: newDoctor.createdAt,
  }

  doctors.push(doctorProfile)

  // Remove password from response
  const { password: _, ...doctorResponse } = newDoctor
  res.status(201).json({ doctor: doctorResponse, message: 'Registration successful' })
})

app.post('/api/doctors/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  // Check if it's an admin login
  const admin = admins.find(a => a.email === email && a.password === password)
  if (admin) {
    return res.json({ 
      admin: { email: admin.email, name: admin.name, role: 'admin' }, 
      message: 'Admin login successful' 
    })
  }

  const doctor = doctorsAuth.find(d => d.email === email && d.password === password)
  if (!doctor) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  doctor.isOnline = true

  // Remove password from response
  const { password: _, ...doctorResponse } = doctor
  res.json({ doctor: doctorResponse, message: 'Login successful' })
})

// OAuth bridge (client-auth via Supabase/Google -> local in-memory profile)
// NOTE: This is a lightweight bridge for the current in-memory demo. When moving fully to Supabase,
// replace this with server-side JWT verification and profile reads from Supabase tables.
app.post('/api/auth/oauth/bridge', (req, res) => {
  const role = String(req.body?.role || '').trim().toLowerCase()
  const email = String(req.body?.email || '').trim().toLowerCase()
  const name = String(req.body?.name || '').trim()

  if (!email) return res.status(400).json({ error: 'email is required' })
  if (!['patient', 'doctor'].includes(role)) return res.status(400).json({ error: 'role must be patient or doctor' })

  if (role === 'patient') {
    let patient = patients.find((p) => (p.email || '').toLowerCase() === email) || null
    if (!patient) {
      patient = {
        id: `patient-${patients.length + 1}`,
        email,
        password: null,
        portal_pin: null,
        name: name || email.split('@')[0],
        dateOfBirth: null,
        phone: null,
        country: 'NG',
        language: 'English',
        tokens: 0,
        isOnline: true,
        registered_via: 'oauth',
        facility_id: null,
        facility_type: null,
        createdAt: new Date().toISOString(),
      }
      patients.push(patient)

      // Ensure token wallet exists
      getPatientTokenRecord(patient.id)

      auditLog({
        event: 'patient_oauth_bridged',
        actor_type: 'system',
        actor_id: null,
        entity_type: 'patient',
        entity_id: patient.id,
        meta: { email },
      })
    } else {
      patient.isOnline = true
    }

    return res.json({ patient: sanitizePatientForResponse(patient), message: 'Patient session ready' })
  }

  // doctor
  let doctor = doctorsAuth.find((d) => (d.email || '').toLowerCase() === email) || null
  if (!doctor) {
    doctor = {
      id: `doc-${doctorsAuth.length + 1}`,
      email,
      password: null,
      name: name || email.split('@')[0],
      specialty: 'General Practitioner',
      location: 'Nigeria',
      licenseNumber: 'PENDING',
      payoutMethod: 'bank_account',
      currency: 'NGN',
      earningsTokens: 0,
      earningsNGN: 0,
      verified: false,
      isOnline: true,
      createdAt: new Date().toISOString(),
    }
    doctorsAuth.push(doctor)

    auditLog({
      event: 'doctor_oauth_bridged',
      actor_type: 'system',
      actor_id: null,
      entity_type: 'doctor',
      entity_id: doctor.id,
      meta: { email },
    })
  } else {
    doctor.isOnline = true
  }

  const { password: _pw, ...doctorResponse } = doctor
  return res.json({ doctor: doctorResponse, message: 'Doctor session ready' })
})

// ============ PATIENT AUTHENTICATION ENDPOINTS ============

app.post('/api/patients/register', (req, res) => {
  const { email, password, name, dateOfBirth, phone, country, language } = req.body

  if (!email || !password || !name || !dateOfBirth || !phone || !country) {
    return res.status(400).json({ error: 'All required fields must be provided' })
  }

  // Check if patient already exists
  const existingPatient = patients.find(p => p.email === email)
  if (existingPatient) {
    return res.status(409).json({ error: 'Patient already exists with this email' })
  }

  const newPatient = {
    id: `patient-${patients.length + 1}`,
    email,
    password, // In production, hash this!
    name,
    dateOfBirth,
    phone,
    country,
    language: language || 'English',
    tokens: 0,
    isOnline: true,
    createdAt: new Date().toISOString(),
  }

  patients.push(newPatient)

  // Initialize token balance
  patientTokens.push({
    patientId: newPatient.id,
    balance: 0,
    transactions: [{
      id: `txn-${Date.now()}`,
      type: 'account_created',
      amount: 0,
      description: 'Token wallet created',
      createdAt: new Date().toISOString(),
    }],
  })

  // Remove password from response
  const { password: _, ...patientResponse } = newPatient
  res.status(201).json({ patient: patientResponse, message: 'Registration successful' })
})

app.post('/api/patients/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const patient = patients.find(p => p.email === email && p.password === password)
  if (!patient) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  patient.isOnline = true

  // Remove password from response
  const { password: _, ...patientResponse } = patient
  res.json({ patient: patientResponse, message: 'Login successful' })
})

function sanitizePatientForResponse(patient) {
  if (!patient) return null
  const { password: _password, portal_pin: _portalPin, ...rest } = patient
  return rest
}

// Facility-registered patients (PHC/Clinic): no email required, login with a 6-digit PIN.
app.post('/api/patients/facility/register', (req, res) => {
  const facilityId = String(req.body?.facilityId || '').trim()
  const facilityPin = String(req.body?.facilityPin || req.body?.pin || '').trim()
  const fullName = String(req.body?.name || req.body?.fullName || '').trim()
  const patientPin = String(req.body?.patientPin || req.body?.portalPin || '').trim()
  const phone = String(req.body?.phone || '').trim()

  if (!facilityId || !facilityPin) return res.status(400).json({ error: 'facilityId and facilityPin are required' })
  if (!isFacilityAuthValid(facilityId, facilityPin)) return res.status(401).json({ error: 'Invalid facility credentials' })
  if (!fullName) return res.status(400).json({ error: 'name is required' })
  if (!/^[0-9]{6}$/.test(patientPin)) return res.status(400).json({ error: 'patientPin must be a 6-digit number' })

  const existing = patients.find((p) => p.portal_pin === patientPin && p.name?.toLowerCase?.() === fullName.toLowerCase())
  if (existing) {
    return res.status(409).json({ error: 'Patient already exists with this name and PIN. Use login.' })
  }

  const facility = getFacilityById(facilityId)
  const newPatient = {
    id: `patient-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    email: null,
    password: null,
    portal_pin: patientPin,
    name: fullName,
    dateOfBirth: null,
    phone: phone || null,
    country: 'NG',
    language: 'English',
    tokens: 0,
    isOnline: false,
    registered_via: 'facility',
    facility_id: facilityId,
    facility_type: facility?.type || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  patients.push(newPatient)

  // Initialize token balance
  patientTokens.push({
    patientId: newPatient.id,
    balance: 0,
    transactions: [
      {
        id: `txn-${Date.now()}`,
        type: 'account_created',
        amount: 0,
        description: 'Token wallet created',
        createdAt: new Date().toISOString(),
      },
    ],
  })

  auditLog({
    event: 'patient_registered_via_facility',
    actor_type: 'facility',
    actor_id: facilityId,
    entity_type: 'patient',
    entity_id: newPatient.id,
    meta: { name: fullName, facility_type: facility?.type || null },
  })

  return res.status(201).json({
    patient: sanitizePatientForResponse(newPatient),
    login: { patientId: newPatient.id, pin: patientPin },
    message: 'Patient registered via facility',
  })
})

app.post('/api/patients/facility/login', (req, res) => {
  const patientId = String(req.body?.patientId || '').trim()
  const fullName = String(req.body?.name || req.body?.fullName || '').trim()
  const patientPin = String(req.body?.patientPin || req.body?.pin || '').trim()

  if (!patientPin || !/^[0-9]{6}$/.test(patientPin)) {
    return res.status(400).json({ error: 'pin must be a 6-digit number' })
  }

  let patient = null
  if (patientId) {
    patient = patients.find((p) => p.id === patientId && String(p.portal_pin || '') === patientPin) || null
  } else if (fullName) {
    const matches = patients.filter(
      (p) => p.name?.toLowerCase?.() === fullName.toLowerCase() && String(p.portal_pin || '') === patientPin
    )
    if (matches.length > 1) {
      return res.status(409).json({ error: 'Multiple matches. Please use patientId to login.' })
    }
    patient = matches[0] || null
  }

  if (!patient) return res.status(401).json({ error: 'Invalid credentials' })

  patient.isOnline = true

  auditLog({
    event: 'patient_logged_in_facility_mode',
    actor_type: 'patient',
    actor_id: patient.id,
    entity_type: 'patient',
    entity_id: patient.id,
    meta: { registered_via: patient.registered_via || null, facility_id: patient.facility_id || null },
  })

  return res.json({ patient: sanitizePatientForResponse(patient), message: 'Login successful' })
})

// ============ TOKEN MANAGEMENT ENDPOINTS ============

app.get('/api/patients/:patientId/tokens', (req, res) => {
  const { patientId } = req.params
  const tokenRecord = patientTokens.find(t => t.patientId === patientId)

  if (!tokenRecord) {
    return res.status(404).json({ error: 'Token record not found' })
  }

  res.json({ tokens: tokenRecord.balance })
})

app.get('/api/patients/:patientId/tokens/history', (req, res) => {
  const { patientId } = req.params
  const tokenRecord = patientTokens.find(t => t.patientId === patientId)
  if (!tokenRecord) {
    return res.status(404).json({ error: 'Token record not found' })
  }
  res.json({ transactions: tokenRecord.transactions || [] })
})

// Patient record aggregation for doctor/facility review (in-memory today; future-ready for Supabase).
app.get('/api/patients/:patientId/record', (req, res) => {
  const { patientId } = req.params
  const patient = patients.find((p) => p.id === patientId)
  if (!patient) return res.status(404).json({ error: 'Patient not found' })

  const tokenRecord = patientTokens.find((t) => t.patientId === patientId) || { balance: 0, transactions: [] }
  const files = patientFiles.filter((f) => f.patientId === patientId)
  const specialtyReferrals = referrals.filter((r) => r.patientId === patientId)
  const facilityReferralHistory = facilityReferrals.filter((r) => r.patient_id === patientId)
  const appointmentHistory = appointments.filter((a) => a.patientId === patientId)
  const consultations = consultationsNg.filter((c) => c.patient_id === patientId)
  const labOrderHistory = labOrders.filter((o) => o.patient_id === patientId)
  const labPaymentHistory = labPayments.filter((p) => {
    const order = labOrders.find((o) => o.id === p.order_id)
    return order?.patient_id === patientId
  })

  return res.json({
    patient: sanitizePatientForResponse(patient),
    tokens: { balance: tokenRecord.balance || 0, transactions: tokenRecord.transactions || [] },
    files,
    referrals: { specialty: specialtyReferrals, facility: facilityReferralHistory },
    appointments: appointmentHistory,
    consultations_ng: consultations,
    labs: { orders: labOrderHistory, payments: labPaymentHistory },
  })
})

app.post('/api/patients/:patientId/tokens/purchase/initialize', async (req, res) => {
  const { patientId } = req.params
  const amountUSD = safeNumber(req.body?.amountUSD)

  const patient = patients.find(p => p.id === patientId)
  if (!patient) return res.status(404).json({ error: 'Patient not found' })

  if (amountUSD === null || amountUSD < serverSettings.patientMinimumDepositUSD) {
    return res.status(400).json({ error: `Minimum deposit is $${serverSettings.patientMinimumDepositUSD}` })
  }

  // Korapay expects an integer amount. Enforce whole-dollar deposits for now.
  if (!Number.isInteger(amountUSD)) {
    return res.status(400).json({ error: 'Deposit amount must be a whole number (USD)' })
  }

  const purchasedBefore = hasPatientPurchasedTokens(patientId)
  const rate = purchasedBefore ? serverSettings.tokenPerUSDRepeatPurchase : serverSettings.tokenPerUSDFirstPurchase
  const tokensExpected = Math.round(amountUSD * rate)

  const reference = `kora-token-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const origin = getApiOrigin(req)

  const paymentRecord = {
    id: reference,
    reference,
    amount: amountUSD,
    currency: 'USD',
    description: 'Token purchase',
    customer: { email: patient.email, name: patient.name, phone: patient.phone },
    metadata: { purpose: 'token_purchase', patientId, tokensExpected },
    status: 'pending',
    provider: 'kora',
    kind: 'token_purchase',
    tokensExpected,
    patientId,
    credited: false,
    createdAt: new Date().toISOString(),
  }

  payments.push(paymentRecord)

  // If no secret key is configured, return a mock checkout URL.
  if (!KORA_SECRET_KEY) {
    return res.json({
      reference,
      tokensExpected,
      rate,
      checkout_url: `https://kora-pay.com/pay/${reference}`,
      message: 'Payment initialized (mock). Configure KORA_SECRET_KEY for live checkout.',
    })
  }

  try {
    const response = await axios.post(
      `${KORA_BASE_URL}/merchant/api/v1/charges/initialize`,
      {
        amount: amountUSD,
        currency: 'USD',
        reference,
        redirect_url: origin ? `${origin}/payment-success?reference=${encodeURIComponent(reference)}` : undefined,
        notification_url: origin ? `${origin}/api/webhooks/kora` : undefined,
        narration: `Token purchase (${tokensExpected} tokens)`,
        customer: {
          email: patient.email,
          name: patient.name,
        },
        metadata: {
          purpose: 'token_purchase',
          patientId,
        },
      },
      {
        headers: { Authorization: `Bearer ${KORA_SECRET_KEY}` },
      }
    )

    const checkoutUrl = response.data?.data?.checkout_url || response.data?.data?.checkoutUrl
    return res.json({
      reference,
      tokensExpected,
      rate,
      checkout_url: checkoutUrl,
      message: response.data?.message || 'Payment initialized successfully',
    })
  } catch (error) {
    console.error('Kora initialization error:', error?.response?.data || error)
    return res.status(500).json({ error: 'Failed to initialize Kora payment' })
  }
})

app.patch('/api/doctors/:doctorId/payout-details', (req, res) => {
  const { doctorId } = req.params
  const doctor = resolveDoctor(doctorId)
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' })

  const bankCode = req.body?.bankCode ? String(req.body.bankCode).trim() : ''
  const bankAccount = req.body?.bankAccount ? String(req.body.bankAccount).trim() : ''
  const currency = req.body?.currency ? String(req.body.currency).trim().toUpperCase() : ''

  const payoutMethod = req.body?.payoutMethod ? String(req.body.payoutMethod).trim() : 'bank_account'
  const mobileMoneyOperator = req.body?.mobileMoneyOperator ? String(req.body.mobileMoneyOperator).trim() : ''
  const mobileMoneyNumber = req.body?.mobileMoneyNumber ? String(req.body.mobileMoneyNumber).trim() : ''

  if (payoutMethod !== 'bank_account' && payoutMethod !== 'mobile_money') {
    return res.status(400).json({ error: 'Invalid payoutMethod' })
  }

  if (payoutMethod === 'bank_account') {
    if (!bankCode || !bankAccount) {
      return res.status(400).json({ error: 'bankCode and bankAccount are required for bank payouts' })
    }
  } else {
    if (!mobileMoneyOperator || !mobileMoneyNumber) {
      return res.status(400).json({ error: 'mobileMoneyOperator and mobileMoneyNumber are required for mobile money payouts' })
    }
  }

  const updated = updateDoctorEverywhere(doctorId, {
    bankCode: bankCode || undefined,
    bankAccount: bankAccount || undefined,
    currency: currency || undefined,
    payoutMethod,
    mobileMoneyOperator: payoutMethod === 'mobile_money' ? mobileMoneyOperator : undefined,
    mobileMoneyNumber: payoutMethod === 'mobile_money' ? mobileMoneyNumber : undefined,
    updatedAt: new Date().toISOString(),
  })

  res.json({ doctor: updated, message: 'Payout details updated' })
})

app.post('/api/doctors/:doctorId/withdraw', async (req, res) => {
  const { doctorId } = req.params
  const doctor = resolveDoctor(doctorId)
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' })

  const availableTokens = safeNumber(doctor.earningsTokens ?? 0) ?? 0
  const requestedTokens = req.body?.tokens === undefined ? null : safeNumber(req.body.tokens)
  const tokensToWithdraw = requestedTokens === null ? availableTokens : requestedTokens

  if (tokensToWithdraw === null || tokensToWithdraw <= 0) {
    return res.status(400).json({ error: 'Valid token amount is required' })
  }

  if (tokensToWithdraw > availableTokens) {
    return res.status(400).json({ error: 'Requested tokens exceed available balance' })
  }

  const minTokens = serverSettings.doctorMinimumWithdrawalUSD * serverSettings.tokenToUSD
  if (tokensToWithdraw < minTokens) {
    return res.status(400).json({ error: `Minimum withdrawal is ${minTokens} tokens ($${serverSettings.doctorMinimumWithdrawalUSD})` })
  }

  const payoutMethod = doctor.payoutMethod || 'bank_account'
  if (payoutMethod === 'bank_account') {
    if (!doctor.bankAccount || !doctor.bankCode) {
      return res.status(400).json({ error: 'Please update your bank details in your profile first' })
    }
  } else if (payoutMethod === 'mobile_money') {
    if (!doctor.mobileMoneyOperator || !doctor.mobileMoneyNumber) {
      return res.status(400).json({ error: 'Please update your mobile money details in your profile first' })
    }
  } else {
    return res.status(400).json({ error: 'Unsupported payout method' })
  }

  const amountUSD = roundMoney(tokensToWithdraw / serverSettings.tokenToUSD)

  const supportedCurrencies = new Set(['USD', 'NGN', 'KES', 'ZAR', 'GHS', 'XOF', 'XAF', 'EGP', 'GBP'])
  let payoutCurrency = (doctor.currency || guessCurrencyFromLocation(doctor.location) || 'USD').toUpperCase()
  if (!supportedCurrencies.has(payoutCurrency)) payoutCurrency = 'USD'

  let payoutAmount = amountUSD
  let conversion = null

  if (payoutCurrency !== 'USD' && KORA_SECRET_KEY) {
    try {
      const rateResp = await axios.post(
        `${KORA_BASE_URL}/api/v1/conversions/rates`,
        {
          amount: amountUSD,
          from_currency: 'USD',
          to_currency: payoutCurrency,
          reference: doctorId,
        },
        { headers: { Authorization: `Bearer ${KORA_SECRET_KEY}` } }
      )
      const data = rateResp.data?.data
      if (typeof data?.to_amount === 'number') {
        payoutAmount = roundMoney(data.to_amount)
        conversion = { from: 'USD', to: payoutCurrency, rate: data.rate, from_amount: data.from_amount, to_amount: data.to_amount }
      }
    } catch (error) {
      console.error('Kora exchange rate error:', error?.response?.data || error)
      payoutCurrency = 'USD'
      payoutAmount = amountUSD
    }
  }

  const reference = `kora-wd-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const origin = getApiOrigin(req)

  const payoutRecord = {
    id: reference,
    reference,
    doctorId,
    tokens: tokensToWithdraw,
    amountUSD,
    payoutAmount,
    currency: payoutCurrency,
    method: payoutMethod,
    status: 'pending',
    conversion,
    createdAt: new Date().toISOString(),
  }
  payouts.push(payoutRecord)

  // Immediately debit tokens locally; if payout fails, the client can retry and an admin can reconcile.
  const remaining = roundMoney((availableTokens - tokensToWithdraw) * 1000) / 1000
  updateDoctorEverywhere(doctorId, { earningsTokens: remaining })

  if (!KORA_SECRET_KEY) {
    payoutRecord.status = 'success'
    return res.json({
      message: `Withdrawal of $${amountUSD.toFixed(2)} initiated (mock)`,
      reference,
      amountUSD,
      payoutAmount,
      currency: payoutCurrency,
      tokensDebited: tokensToWithdraw,
      remainingTokens: remaining,
      conversion,
    })
  }

  try {
    const destination =
      payoutMethod === 'bank_account'
        ? {
            type: 'bank_account',
            amount: payoutAmount,
            currency: payoutCurrency,
            narration: `Doctor withdrawal (${doctorId})`,
            bank_account: {
              bank: doctor.bankCode,
              account: doctor.bankAccount,
            },
            customer: {
              email: doctor.email || 'doctor@globaldocconnect.com',
              name: doctor.name,
            },
          }
        : {
            type: 'mobile_money',
            amount: payoutAmount,
            currency: payoutCurrency,
            narration: `Doctor withdrawal (${doctorId})`,
            mobile_money: {
              operator: doctor.mobileMoneyOperator,
              mobile_number: doctor.mobileMoneyNumber,
            },
            customer: {
              email: doctor.email || 'doctor@globaldocconnect.com',
              name: doctor.name,
            },
          }

    const response = await axios.post(
      `${KORA_BASE_URL}/merchant/api/v1/transactions/disburse`,
      {
        reference,
        destination,
        metadata: {
          purpose: 'doctor_withdrawal',
          doctorId,
        },
      },
      {
        headers: { Authorization: `Bearer ${KORA_SECRET_KEY}` },
      }
    )

    payoutRecord.gatewayResponse = response.data

    return res.json({
      message: 'Withdrawal initiated successfully',
      reference,
      amountUSD,
      payoutAmount,
      currency: payoutCurrency,
      tokensDebited: tokensToWithdraw,
      remainingTokens: remaining,
      conversion,
    })
  } catch (error) {
    console.error('Kora payout error:', error?.response?.data || error)
    updateDoctorEverywhere(doctorId, { earningsTokens: availableTokens })
    payoutRecord.status = 'failed'
    payoutRecord.error = error?.response?.data || String(error?.message || error)
    return res.status(500).json({ error: 'Failed to initiate payout. Please try again later.' })
  }
})

app.post('/api/patients/:patientId/tokens/add', (req, res) => {
  const { patientId } = req.params
  const amount = safeNumber(req.body?.amount)

  if (amount === null || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required' })
  }

  const tokenRecord = getPatientTokenRecord(patientId)
  tokenRecord.balance += amount
  tokenRecord.transactions.push({
    id: `txn-${Date.now()}`,
    type: 'purchase',
    amount,
    description: `Token purchase: ${amount} tokens`,
    createdAt: new Date().toISOString(),
  })

  res.json({ tokens: tokenRecord.balance, message: 'Tokens added successfully' })
})

// ============ SUBSCRIPTION MANAGEMENT ENDPOINTS ============

app.get('/api/patients/:patientId/subscription', (req, res) => {
  const { patientId } = req.params
  const subscription = subscriptions.find(s => s.patientId === patientId && s.status === 'active')

  if (!subscription) {
    return res.json({ subscription: null })
  }

  res.json({ subscription })
})

app.post('/api/subscriptions', (req, res) => {
  const { plan, patientId, price, tokensIncluded } = req.body

  if (!plan || !patientId || !price || !tokensIncluded) {
    return res.status(400).json({ error: 'Missing subscription details' })
  }

  // Check if patient already has an active subscription
  const existingSubscription = subscriptions.find(s => s.patientId === patientId && s.status === 'active')
  if (existingSubscription) {
    return res.status(409).json({ error: 'Patient already has an active subscription' })
  }

  const subscription = {
    id: `sub-${subscriptions.length + 1}`,
    patientId,
    plan,
    price,
    tokensIncluded,
    status: 'active',
    createdAt: new Date().toISOString(),
    expiresAt: plan === 'monthly'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  }

  subscriptions.push(subscription)

  // Add tokens to patient balance
  let tokenRecord = patientTokens.find(t => t.patientId === patientId)
  if (!tokenRecord) {
    tokenRecord = {
      patientId,
      balance: 0,
      transactions: [],
    }
    patientTokens.push(tokenRecord)
  }

  tokenRecord.balance += tokensIncluded
  tokenRecord.transactions.push({
    id: `txn-${Date.now()}`,
    type: 'subscription',
    amount: tokensIncluded,
    description: `${plan} subscription: ${tokensIncluded} tokens`,
    createdAt: new Date().toISOString(),
  })

  res.status(201).json({ subscription, message: 'Subscription activated successfully' })
})

app.get('/api/settings', (req, res) => {
  res.json({ settings: serverSettings })
})

app.get('/api/online/status', (req, res) => {
  const onlineDoctors = doctors.filter((doctor) => doctor.isOnline)
  const onlinePatients = patients.filter((patient) => patient.isOnline)
  res.json({ doctors: onlineDoctors, patients: onlinePatients, emergencyRequests })
})

app.post('/api/emergency/call', (req, res) => {
  const { patientId, patientName, reason } = req.body
  if (!patientId || !patientName || !reason) {
    return res.status(400).json({ error: 'Missing emergency request information' })
  }

  const emergencyRequest = {
    id: `emergency-${emergencyRequests.length + 1}`,
    patientId,
    patientName,
    reason,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  emergencyRequests.push(emergencyRequest)

  notifications.push({
    id: `notification-${notifications.length + 1}`,
    user_id: patientId,
    user_type: 'patient',
    notification_type: 'emergency_request',
    title: 'Emergency request submitted',
    message: 'Your emergency request has been sent to available doctors.',
    related_resource_type: 'emergency',
    related_resource_id: emergencyRequest.id,
    is_read: false,
    notification_channels: ['in_app', 'email'],
    created_at: new Date().toISOString(),
  })

  return res.status(201).json({ emergencyRequest, message: 'Emergency request created successfully' })
})

app.patch('/api/admin/settings', (req, res) => {
  const { minimumSubscriptionUSD } = req.body
  if (typeof minimumSubscriptionUSD !== 'number' || minimumSubscriptionUSD < 1) {
    return res.status(400).json({ error: 'Invalid minimum subscription value' })
  }
  serverSettings.minimumSubscriptionUSD = minimumSubscriptionUSD
  res.json({ settings: serverSettings, message: 'Settings updated successfully' })
})

app.patch('/api/doctors/:doctorId/status', (req, res) => {
  const { doctorId } = req.params
  const { isOnline } = req.body
  const doctor = doctors.find((item) => item.id === doctorId)
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' })
  }
  doctor.isOnline = Boolean(isOnline)
  res.json({ doctor, message: 'Doctor status updated' })
})

app.patch('/api/patients/:patientId/status', (req, res) => {
  const { patientId } = req.params
  const { isOnline } = req.body
  const patient = patients.find((item) => item.id === patientId)
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' })
  }
  patient.isOnline = Boolean(isOnline)
  res.json({ patient, message: 'Patient status updated' })
})

// ============ PAYMENT INTEGRATION ENDPOINTS ============

app.post('/api/payments/kora/initialize', async (req, res) => {
  const { amount, currency, description, customer, metadata } = req.body

  try {
    const reference = `kora-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Kora API initialization (Production would use actual Kora endpoint)
    // Example: https://api.korapay.com/merchant/api/v1/charges/initialize
    
    const paymentRecord = {
      id: reference,
      amount,
      currency: currency || 'USD',
      description,
      customer,
      metadata,
      status: 'pending',
      provider: 'kora',
      createdAt: new Date().toISOString(),
    }

    payments.push(paymentRecord)

    // In a real scenario, you'd call the Kora API here:
    /*
    const response = await axios.post('https://api.korapay.com/merchant/api/v1/charges/initialize', {
      amount,
      currency,
      reference,
      customer,
      description,
      notification_url: `${process.env.VITE_API_BASE}/api/webhooks/kora`,
      redirect_url: `${process.env.VITE_API_BASE}/payment-success`,
    }, {
      headers: { Authorization: `Bearer ${process.env.KORA_SECRET_KEY}` }
    })
    return res.json(response.data.data)
    */

    res.json({
      reference,
      checkout_url: `https://kora-pay.com/pay/${reference}`, // Mock URL
      message: 'Payment initialized successfully'
    })
  } catch (error) {
    console.error('Kora initialization error:', error)
    res.status(500).json({ error: 'Failed to initialize Kora payment' })
  }
})

app.get('/api/payments/kora/verify/:reference', async (req, res) => {
  const { reference } = req.params
  const payment = payments.find(p => p.reference === reference || p.id === reference)
  if (!payment) return res.status(404).json({ error: 'Payment reference not found' })

  if (payment.status === 'success' && payment.credited) {
    const tokenRecord = patientTokens.find(t => t.patientId === payment.patientId)
    return res.json({ status: 'success', credited: true, tokens: tokenRecord?.balance || 0, payment })
  }

  // In non-configured environments, treat as successful (mock) once verified.
  if (!KORA_SECRET_KEY) {
    if (payment.kind === 'token_purchase' && !payment.credited) {
      const tokenRecord = getPatientTokenRecord(payment.patientId)
      tokenRecord.balance += payment.tokensExpected
      tokenRecord.transactions.push({
        id: `txn-${Date.now()}`,
        type: 'purchase',
        amount: payment.tokensExpected,
        description: `Token purchase: ${payment.tokensExpected} tokens`,
        createdAt: new Date().toISOString(),
        reference,
      })
      payment.status = 'success'
      payment.credited = true
    }
    const tokenRecord = patientTokens.find(t => t.patientId === payment.patientId)
    return res.json({ status: payment.status, credited: payment.credited, tokens: tokenRecord?.balance || 0, payment })
  }

  try {
    const response = await axios.get(`${KORA_BASE_URL}/merchant/api/v1/charges/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${KORA_SECRET_KEY}` },
    })

    const status = response.data?.data?.status || response.data?.data?.transaction_status || response.data?.data?.transactionStatus
    payment.gatewayStatus = status

    if (status === 'success' && payment.kind === 'token_purchase' && !payment.credited) {
      const tokenRecord = getPatientTokenRecord(payment.patientId)
      tokenRecord.balance += payment.tokensExpected
      tokenRecord.transactions.push({
        id: `txn-${Date.now()}`,
        type: 'purchase',
        amount: payment.tokensExpected,
        description: `Token purchase: ${payment.tokensExpected} tokens`,
        createdAt: new Date().toISOString(),
        reference,
      })
      payment.status = 'success'
      payment.credited = true
    }

    const tokenRecord = patientTokens.find(t => t.patientId === payment.patientId)
    return res.json({ status: status || payment.status, credited: payment.credited, tokens: tokenRecord?.balance || 0, payment })
  } catch (error) {
    console.error('Kora verify error:', error?.response?.data || error)
    return res.status(500).json({ error: 'Failed to verify Kora payment' })
  }
})

app.post('/api/webhooks/kora', (req, res) => {
  try {
    if (KORA_SECRET_KEY) {
      const signature = String(req.headers['x-korapay-signature'] || '')
      const computed = crypto
        .createHmac('sha256', KORA_SECRET_KEY)
        .update(JSON.stringify(req.body?.data ?? {}))
        .digest('hex')

      if (!signature || signature !== computed) {
        return res.sendStatus(200)
      }
    }

    const event = req.body?.event
    const data = req.body?.data || {}
    const reference = data.reference || data.payment_reference

    if (!reference) return res.sendStatus(200)

    // Token purchase crediting
    if (event === 'charge.success') {
      const payment = payments.find(p => p.reference === reference || p.id === reference)
      if (payment?.kind === 'token_purchase' && !payment.credited) {
        const tokenRecord = getPatientTokenRecord(payment.patientId)
        tokenRecord.balance += payment.tokensExpected
        tokenRecord.transactions.push({
          id: `txn-${Date.now()}`,
          type: 'purchase',
          amount: payment.tokensExpected,
          description: `Token purchase: ${payment.tokensExpected} tokens`,
          createdAt: new Date().toISOString(),
          reference,
        })
        payment.status = 'success'
        payment.credited = true
      }
    }

    // Doctor payout status tracking
    if (event === 'transfer.success' || event === 'transfer.failed') {
      const payout = payouts.find(p => p.reference === reference || p.id === reference)
      if (payout) {
        const nextStatus = event === 'transfer.success' ? 'success' : 'failed'
        payout.status = nextStatus
        payout.updatedAt = new Date().toISOString()

        if (nextStatus === 'failed' && !payout.tokensRestored) {
          const doctor = resolveDoctor(payout.doctorId)
          const current = safeNumber(doctor?.earningsTokens ?? 0) ?? 0
          updateDoctorEverywhere(payout.doctorId, { earningsTokens: roundMoney((current + payout.tokens) * 1000) / 1000 })
          payout.tokensRestored = true
        }
      }
    }

    return res.sendStatus(200)
  } catch (error) {
    console.error('Kora webhook error:', error)
    return res.sendStatus(200)
  }
})

// ============ DOCTOR AVAILABILITY ENDPOINTS ============

app.get('/api/doctors/:doctorId/availability', (req, res) => {
  const { doctorId } = req.params
  const { date } = req.query

  if (!date) {
    return res.status(400).json({ error: 'Date parameter is required' })
  }

  // Mock availability - in production, check actual doctor schedule
  const slots = {}
  const requestedDate = new Date(date)
  const dayOfWeek = requestedDate.getDay()

  // Doctors work Monday-Friday, 9 AM - 5 PM
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots[timeStr] = Math.random() > 0.3 // 70% availability
      }
    }
  }

  res.json({ slots })
})

app.get('/api/doctors', (req, res) => {
  const { specialty, minRating, availability, query, online, language } = req.query
  const filtered = doctors.filter((doctor) => {
    const matchesSpecialty = !specialty || doctor.specialty === specialty
    const matchesLanguage = !language || (Array.isArray(doctor.languages) && doctor.languages.includes(String(language)))
    const matchesRating = !minRating || doctor.rating >= Number(minRating)
    const matchesAvailability = !availability || doctor.availability.toLowerCase().includes(String(availability).toLowerCase())
    const matchesQuery = !query || [doctor.name, doctor.location, doctor.specialty].some((field) => field.toLowerCase().includes(String(query).toLowerCase()))
    const matchesOnline = online === undefined || online === '' || String(doctor.isOnline) === String(online)
    return matchesSpecialty && matchesLanguage && matchesRating && matchesAvailability && matchesQuery && matchesOnline
  })
  res.json({ doctors: filtered })
})

app.post('/api/reviews', (req, res) => {
  const { doctorId, patientId, rating, comment, verifiedPatient } = req.body
  if (!doctorId || !patientId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Invalid review payload' })
  }

  if (!verifiedPatient) {
    return res.status(403).json({ error: 'Only verified patients may submit reviews' })
  }

  const doctor = doctors.find((item) => item.id === doctorId)
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' })
  }

  const review = {
    id: `review-${reviews.length + 1}`,
    doctorId,
    patientId,
    rating,
    comment,
    verified: true,
    createdAt: new Date().toISOString(),
  }

  reviews.push(review)
  const doctorReviews = reviews.filter((item) => item.doctorId === doctorId)
  const average = doctorReviews.reduce((sum, item) => sum + item.rating, 0) / doctorReviews.length
  doctor.rating = Number(average.toFixed(2))

  return res.status(201).json({ review, doctor })
})

app.post('/api/payments', async (req, res) => {
  const { patientId, doctorId, amount, type } = req.body
  if (!patientId || !doctorId || !amount || !type) {
    return res.status(400).json({ error: 'Missing payment information' })
  }

  const allowedTypes = ['priority_access', 'telehealth_consultation']
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ error: 'Unsupported payment type' })
  }

  try {
    const reference = `kora-${Date.now()}`
    
    const transaction = {
      id: reference,
      patientId,
      doctorId,
      amount,
      type,
      status: 'pending',
      provider: 'kora',
      description: `${type.replace('_', ' ')} with doctor ${doctorId}`,
      createdAt: new Date().toISOString(),
    }

    payments.push(transaction)

    return res.status(201).json({
      transaction,
      checkout_url: `https://kora-pay.com/pay/${reference}`,
      message: 'Payment intent created successfully'
    })
  } catch (error) {
    console.error('Kora payment error:', error)
    return res.status(500).json({ error: 'Payment processing failed' })
  }
})

// Patient file upload
app.post('/api/patients/files/upload', async (req, res) => {
  const { patientId, name, mimeType, size, contentBase64 } = req.body
  if (!patientId || !name || !mimeType || !size || !contentBase64) {
    return res.status(400).json({ error: 'Missing file upload data' })
  }

  const file = {
    id: `patient-file-${patientFiles.length + 1}`,
    patientId,
    name,
    mimeType,
    size,
    contentBase64,
    createdAt: new Date().toISOString(),
  }

  patientFiles.push(file)
  notifications.push({
    id: `notification-${notifications.length + 1}`,
    user_id: patientId,
    user_type: 'patient',
    notification_type: 'file_uploaded',
    title: 'Health record uploaded',
    message: `Your file ${name} is now available in your patient portal.`,
    related_resource_type: 'file',
    related_resource_id: file.id,
    is_read: false,
    notification_channels: ['in_app', 'email'],
    created_at: new Date().toISOString(),
  })

  res.status(201).json({ file, message: 'File uploaded successfully' })
})

app.get('/api/patients/files', (req, res) => {
  const { patientId } = req.query
  if (!patientId) {
    return res.status(400).json({ error: 'patientId query is required' })
  }

  const files = patientFiles.filter((file) => file.patientId === patientId)
  res.json({ files })
})

app.get('/api/patients/files/:fileId/download', (req, res) => {
  const { fileId } = req.params
  const { patientId } = req.query
  const file = patientFiles.find((item) => item.id === fileId && item.patientId === patientId)

  if (!file) {
    return res.status(404).json({ error: 'File not found' })
  }

  res.json({
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    contentBase64: file.contentBase64,
  })
})

// Appointment scheduling and reminders
app.post('/api/appointments', (req, res) => {
  const { patientId, doctorId, scheduledDate, consultationType, notes, subscriptionType, tokensRequired } = req.body
  if (!patientId || !doctorId || !scheduledDate || !consultationType) {
    return res.status(400).json({ error: 'Missing appointment details' })
  }

  const doctor = doctors.find((item) => item.id === doctorId)
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' })
  }

  // Check token balance
  const tokenRecord = patientTokens.find(t => t.patientId === patientId)
  const currentTokens = tokenRecord?.balance || 0
  
  // Pricing Logic: GP = 20, Specialist = 40, Referral = 15
  let requiredTokens = tokensRequired;
  if (!requiredTokens) {
    if (consultationType === 'referral') requiredTokens = 15;
    else requiredTokens = ((doctor.specialty === 'General Practitioner' || doctor.specialty === 'General Practice') ? 20 : 40);
  }

  if (currentTokens < requiredTokens) {
    return res.status(402).json({ error: 'Insufficient tokens. Please purchase more tokens.' })
  }

  // Deduct tokens and calculate revenue split
  if (tokenRecord) {
    tokenRecord.balance -= requiredTokens
    tokenRecord.transactions.push({
      id: `txn-${Date.now()}`,
      type: 'appointment',
      amount: -requiredTokens,
      description: `Appointment with ${doctor.name}: ${requiredTokens} tokens`,
      createdAt: new Date().toISOString(),
    })

    // Revenue Split: Admin 40%, Doctor 35%, Company 25%
    const adminShare = requiredTokens * 0.40;
    const doctorShare = requiredTokens * 0.35;
    // Remaining 25% stays with the platform/company

    // Update doctor's earnings
    const authDoc = doctorsAuth.find(d => d.id === doctorId);
    if (authDoc) {
      authDoc.earningsTokens = (authDoc.earningsTokens || 0) + doctorShare;
    }
    doctor.earningsTokens = (doctor.earningsTokens || 0) + doctorShare;
  }

  const appointment = {
    id: `appointment-${appointments.length + 1}`,
    patientId,
    doctorId,
    doctorName: doctor.name,
    consultationType,
    scheduledDate,
    notes,
    subscriptionType,
    tokensCharged: requiredTokens,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }
  appointments.push(appointment)

  const date = new Date(scheduledDate)
  const reminder24h = {
    id: `reminder-${appointment.id}-24h`,
    appointmentId: appointment.id,
    reminderType: '24_hours',
    shouldSendTo: ['doctor', 'patient'],
    notificationChannels: ['in_app', 'email'],
    scheduledSendTime: new Date(date.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    is_sent: false,
    createdAt: new Date().toISOString(),
  }
  const reminder1h = {
    id: `reminder-${appointment.id}-1h`,
    appointmentId: appointment.id,
    reminderType: '1_hour',
    shouldSendTo: ['doctor', 'patient'],
    notificationChannels: ['in_app', 'email'],
    scheduledSendTime: new Date(date.getTime() - 60 * 60 * 1000).toISOString(),
    is_sent: false,
    createdAt: new Date().toISOString(),
  }

  appointmentReminders.push(reminder24h, reminder1h)

  const appointmentNotification = {
    id: `notification-${notifications.length + 1}`,
    user_id: patientId,
    user_type: 'patient',
    notification_type: 'appointment_confirmed',
    title: 'Appointment confirmed',
    message: `Your appointment with ${doctor.name} is scheduled for ${new Date(scheduledDate).toLocaleString()}.`,
    related_resource_type: 'appointment',
    related_resource_id: appointment.id,
    is_read: false,
    notification_channels: ['in_app', 'email'],
    created_at: new Date().toISOString(),
  }

  const doctorNotification = {
    id: `notification-${notifications.length + 2}`,
    user_id: doctorId,
    user_type: 'doctor',
    notification_type: 'appointment_confirmed',
    title: 'New appointment booked',
    message: `You have a new appointment with a patient on ${new Date(scheduledDate).toLocaleString()}.`,
    related_resource_type: 'appointment',
    related_resource_id: appointment.id,
    is_read: false,
    notification_channels: ['in_app', 'email'],
    created_at: new Date().toISOString(),
  }

  notifications.push(appointmentNotification, doctorNotification)

  res.status(201).json({ appointment, message: 'Appointment scheduled successfully' })
})

app.get('/api/appointments', (req, res) => {
  const { patientId, doctorId } = req.query
  const filtered = appointments.filter((appointment) => {
    if (patientId && appointment.patientId !== patientId) return false
    if (doctorId && appointment.doctorId !== doctorId) return false
    return true
  })
  res.json({ appointments: filtered })
})

// Notifications
app.get('/api/notifications', (req, res) => {
  const { userId, userType } = req.query
  if (!userId || !userType) {
    return res.status(400).json({ error: 'userId and userType are required' })
  }
  const userNotifications = notifications
    .filter((notification) => notification.user_id === userId && notification.user_type === userType)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  res.json({ notifications: userNotifications })
})

app.patch('/api/notifications/:notificationId/read', (req, res) => {
  const { notificationId } = req.params
  const notification = notifications.find((item) => item.id === notificationId)
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' })
  }
  notification.is_read = true
  notification.read_at = new Date().toISOString()
  res.json({ notification, message: 'Notification marked as read' })
})

// Chat
app.post('/api/chat/messages', (req, res) => {
  const { consultationId, senderId, senderType, recipientId, recipientType, messageType, messageContent } = req.body
  if (!consultationId || !senderId || !senderType || !recipientId || !recipientType || !messageContent) {
    return res.status(400).json({ error: 'Missing chat message fields' })
  }

  const message = {
    id: `chat-${chatMessages.length + 1}`,
    consultation_id: consultationId,
    sender_id: senderId,
    sender_type: senderType,
    recipient_id: recipientId,
    recipient_type: recipientType,
    message_type: messageType || 'text',
    message_content: messageContent,
    is_read: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  chatMessages.push(message)
  notifications.push({
    id: `notification-${notifications.length + 1}`,
    user_id: recipientId,
    user_type: recipientType,
    notification_type: 'new_message',
    title: 'New message received',
    message: `You have a new message from ${senderType}.`,
    related_resource_type: 'message',
    related_resource_id: message.id,
    is_read: false,
    notification_channels: ['in_app', 'email'],
    created_at: new Date().toISOString(),
  })

  res.status(201).json({ chatMessage: message, message: 'Chat message sent successfully' })
})

app.get('/api/chat/messages', (req, res) => {
  const { consultationId } = req.query
  if (!consultationId) {
    return res.status(400).json({ error: 'consultationId query is required' })
  }
  const messages = chatMessages
    .filter((item) => item.consultation_id === consultationId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  res.json({ messages })
})

// ============ ADMIN ENDPOINTS ============

// Add Doctor (Admin)
app.post('/api/admin/doctors', (req, res) => {
  const {
    name,
    specialty,
    location,
    languages,
    consultation_fee,
    licenseNumber,
    licenseIssuer,
    licenseExpiry,
    bankCode,
    bankAccount,
    currency,
    payoutMethod,
    mobileMoneyOperator,
    mobileMoneyNumber,
  } = req.body

  if (!name || !specialty || !location || !licenseNumber) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const newDoctor = {
    id: `doc-${doctors.length + 1000}`,
    name,
    specialty,
    location,
    languages: Array.isArray(languages) ? languages : ['English'],
    rating: 0,
    availability: 'Available upon request',
    verified: false,
    isOnline: false,
    fee: consultation_fee || 50,
    license_number: licenseNumber,
    license_issuer: licenseIssuer,
    license_expiry: licenseExpiry,
    bankCode: bankCode || undefined,
    bankAccount: bankAccount || undefined,
    currency: currency || undefined,
    payoutMethod: payoutMethod || 'bank_account',
    mobileMoneyOperator: mobileMoneyOperator || undefined,
    mobileMoneyNumber: mobileMoneyNumber || undefined,
    created_at: new Date().toISOString(),
  }

  doctors.push(newDoctor)
  res.status(201).json({ doctor: newDoctor, message: 'Doctor added successfully' })
})

// Delete Doctor (Admin)
app.delete('/api/admin/doctors/:doctorId', (req, res) => {
  const { doctorId } = req.params
  const index = doctors.findIndex(d => d.id === doctorId)

  if (index === -1) {
    return res.status(404).json({ error: 'Doctor not found' })
  }

  const deletedDoctor = doctors.splice(index, 1)
  res.json({ doctor: deletedDoctor[0], message: 'Doctor deleted successfully' })
})

// Verify Doctor (Admin)
app.patch('/api/admin/doctors/:doctorId/verify', (req, res) => {
  const { doctorId } = req.params
  const doctor = doctors.find(d => d.id === doctorId)

  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' })
  }

  doctor.verified = true
  doctor.license_verified = true
  res.json({ doctor, message: 'Doctor verified successfully' })
})

// Get All Reviews (Admin)
app.get('/api/admin/reviews', (req, res) => {
  const reviewsWithDetails = reviews.map(review => {
    const doctor = doctors.find(d => d.id === review.doctorId)
    return {
      ...review,
      doctor_name: doctor?.name || 'Unknown',
      doctor_specialty: doctor?.specialty || 'Unknown',
    }
  })

  res.json({ reviews: reviewsWithDetails, total: reviews.length })
})

// Verify Review (Admin)
app.patch('/api/admin/reviews/:reviewId/verify', (req, res) => {
  const { reviewId } = req.params
  const review = reviews.find(r => r.id === reviewId)

  if (!review) {
    return res.status(404).json({ error: 'Review not found' })
  }

  review.verified = true
  res.json({ review, message: 'Review verified' })
})

// Reject Review (Admin)
app.patch('/api/admin/reviews/:reviewId/reject', (req, res) => {
  const { reviewId } = req.params
  const index = reviews.findIndex(r => r.id === reviewId)

  if (index === -1) {
    return res.status(404).json({ error: 'Review not found' })
  }

  const rejectedReview = reviews.splice(index, 1)
  res.json({ review: rejectedReview[0], message: 'Review rejected' })
})

// Create Referral (Admin)
app.post('/api/admin/referrals', (req, res) => {
  const { patientId, fromSpecialty, toSpecialty, reason, notes } = req.body

  if (!patientId || !fromSpecialty || !toSpecialty || !reason) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const referral = {
    id: `ref-${referrals.length + 1}`,
    patientId,
    fromSpecialty,
    toSpecialty,
    reason,
    notes,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  referrals.push(referral)
  res.status(201).json({ referral, message: 'Referral created successfully' })
})

// Get all referrals (Admin)
app.get('/api/admin/referrals', (req, res) => {
  res.json({ referrals })
})

// Create Referral request (Patient)
app.post('/api/patients/referrals', (req, res) => {
  const { patientId, fromSpecialty, toSpecialty, reason, notes } = req.body

  if (!patientId || !fromSpecialty || !toSpecialty || !reason) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const referral = {
    id: `ref-${referrals.length + 1}`,
    patientId,
    fromSpecialty,
    toSpecialty,
    reason,
    notes,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  referrals.push(referral)
  res.status(201).json({ referral, message: 'Referral request submitted successfully' })
})

// Get patient referrals
app.get('/api/patients/:patientId/referrals', (req, res) => {
  const { patientId } = req.params
  const patientReferrals = referrals.filter((referral) => referral.patientId === patientId)
  res.json({ referrals: patientReferrals })
})

// File Upload (Admin)
app.post('/api/admin/files/upload', (req, res) => {
  // Mock file upload - in production, integrate with S3/cloud storage
  const mockFiles = [
    {
      id: `file-${uploadedFiles.length + 1}`,
      name: 'Sample Document.pdf',
      size: '2.4 MB',
      type: 'application/pdf',
      uploadedAt: new Date().toISOString(),
    },
  ]

  uploadedFiles.push(...mockFiles)
  res.status(201).json({ files: mockFiles, message: 'Files uploaded successfully' })
})

// Get All Files (Admin)
app.get('/api/admin/files', (req, res) => {
  res.json({ files: uploadedFiles, total: uploadedFiles.length })
})

// Delete File (Admin)
app.delete('/api/admin/files/:fileId', (req, res) => {
  const { fileId } = req.params
  const index = uploadedFiles.findIndex(f => f.id === fileId)

  if (index === -1) {
    return res.status(404).json({ error: 'File not found' })
  }

  const deletedFile = uploadedFiles.splice(index, 1)
  res.json({ file: deletedFile[0], message: 'File deleted successfully' })
})

// Get All Patients (Admin)
app.get('/api/admin/patients', (req, res) => {
  res.json({ patients, total: patients.length })
})

// Get Patient Details (Admin)
app.get('/api/admin/patients/:patientId', (req, res) => {
  const { patientId } = req.params
  const patient = patients.find(p => p.id === patientId)

  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' })
  }

  res.json({ patient })
})

const port = process.env.PORT || 4000

// For Vercel serverless functions, export the app
export default app

// For local development, keep the listen call (only when executed directly)
const isDirectRun = Boolean(process.argv?.[1]) && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isDirectRun) {
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`)
  })
}
