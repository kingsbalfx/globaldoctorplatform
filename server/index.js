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

// ============ In‑memory stores ============
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
const doctorsAuth = []
const referrals = []
const uploadedFiles = []
const patients = []
const patientFiles = []
const appointments = []
const notifications = []
const announcements = []
const facilities = []
const facilityWallets = []
const facilityWalletTx = []
const facilityReferrals = []
const consultationsNg = []
const revenueSplitsNg = []
const labOrders = []
const labPayments = []
const auditLogs = []
let platformBalanceNgn = 0
let dataFundBalanceNgn = 0
const chatMessages = []
const communityMessages = []
const appointmentReminders = []
const emergencyRequests = []
const serverSettings = {
  minimumSubscriptionUSD: 10,
  patientMinimumDepositUSD: 10,
  tokenPerUSDFirstPurchase: 10,
  tokenPerUSDRepeatPurchase: 7.5,
  tokenToUSD: 10,
  doctorMinimumWithdrawalUSD: 5,
}
const patientTokens = []
const subscriptions = []
const payments = []
const payouts = []

const KORA_SECRET_KEY = process.env.KORA_SECRET_KEY
const KORA_BASE_URL = process.env.KORA_BASE_URL || 'https://api.korapay.com'

// Utility functions
function normalizeAppBaseUrl(rawValue) { /* ... keep existing function ... */ }
function getApiOrigin(req) { /* ... */ }
function safeNumber(value) { /* ... */ }
function isPlatformAdminRequest(req) { /* ... */ }
function auditLog({ event, actor_type, actor_id, entity_type, entity_id, meta }) { /* ... */ }
function getFacilityById(facilityId) { /* ... */ }
function getOrCreateFacilityWallet(facilityId) { /* ... */ }
function recordFacilityWalletTx({ facilityId, direction, amountNgn, reason, ref_type, ref_id, meta }) { /* ... */ }
function creditFacilityWallet(facilityId, amountNgn, details = {}) { /* ... */ }
function debitFacilityWallet(facilityId, amountNgn, details = {}) { /* ... */ }
function creditDoctorEarningsNgn(doctorId, amountNgn) { /* ... */ }
function roundMoney(amount) { /* ... */ }
function getPatientTokenRecord(patientId) { /* ... */ }
function getOrCreatePatientProfile(patientId, seed = {}) { /* ... */ }
function getOrCreateDoctorProfile(doctorId, seed = {}) { /* ... */ }
function hasPatientPurchasedTokens(patientId) { /* ... */ }
function resolveDoctor(doctorId) { /* ... */ }
function updateDoctorEverywhere(doctorId, patch) { /* ... */ }
function guessCurrencyFromLocation(location) { /* ... */ }
function generateSixDigitPin() { /* ... */ }
function isFacilityAuthValid(facilityId, pin) { /* ... */ }
function requireFacilityAuth(req, res) { /* ... */ }
function sanitizePatientForResponse(patient) { /* ... */ }

// ============ ROUTES (ALL OF THEM) ============
app.get('/api/health', (_req, res) => { res.json({ status: 'ok' }) })
app.get('/api/config', (req, res) => { /* ... */ })

// Announcements
app.get('/api/announcements', (req, res) => { /* ... */ })
app.post('/api/admin/announcements', (req, res) => { /* ... */ })
app.delete('/api/admin/announcements/:announcementId', (req, res) => { /* ... */ })

// Facilities
app.post('/api/facilities', (req, res) => { /* ... */ })
app.get('/api/facilities', (req, res) => { /* ... */ })
app.post('/api/facilities/auth', (req, res) => { /* ... */ })
app.post('/api/admin/facilities/:facilityId/fund', (req, res) => { /* ... */ })
app.get('/api/admin/audit-logs', (req, res) => { /* ... */ })

// Consultations (NGN)
app.post('/api/consultations/start', (req, res) => { /* ... */ })
app.post('/api/consultations/end', (req, res) => { /* ... */ })

// Facility referrals
app.post('/api/referrals/facility/create', (req, res) => { /* ... */ })
app.get('/api/referrals/facility', (req, res) => { /* ... */ })
app.post('/api/referrals/facility/redeem', (req, res) => { /* ... */ })

// Lab orders
app.post('/api/labs/order', (req, res) => { /* ... */ })
app.post('/api/labs/pay', (req, res) => { /* ... */ })

// Video token
app.get('/api/video/token', (req, res) => { /* ... */ })

// Doctor auth (with admin login)
app.post('/api/doctors/register', (req, res) => { /* ... */ })
app.post('/api/doctors/login', (req, res) => { /* ... */ })

// OAuth bridge
app.post('/api/auth/oauth/bridge', (req, res) => { /* ... */ })

// Patient auth (email & facility)
app.post('/api/patients/register', (req, res) => { /* ... */ })
app.post('/api/patients/login', (req, res) => { /* ... */ })
app.post('/api/patients/facility/register', (req, res) => { /* ... */ })
app.post('/api/patients/facility/login', (req, res) => { /* ... */ })

// Tokens & subscriptions
app.get('/api/patients/:patientId/tokens', (req, res) => { /* ... */ })
app.get('/api/patients/:patientId/tokens/history', (req, res) => { /* ... */ })
app.get('/api/patients/:patientId/record', (req, res) => { /* ... */ })
app.post('/api/patients/:patientId/tokens/purchase/initialize', async (req, res) => { /* ... */ })
app.patch('/api/doctors/:doctorId/payout-details', (req, res) => { /* ... */ })
app.post('/api/doctors/:doctorId/withdraw', async (req, res) => { /* ... */ })
app.post('/api/patients/:patientId/tokens/add', (req, res) => { /* ... */ })
app.get('/api/patients/:patientId/subscription', (req, res) => { /* ... */ })
app.post('/api/subscriptions', (req, res) => { /* ... */ })
app.get('/api/settings', (req, res) => { /* ... */ })
app.get('/api/online/status', (req, res) => { /* ... */ })

// Community chat
app.get('/api/doctors/community/messages', (req, res) => { /* ... */ })
app.post('/api/doctors/community/messages', (req, res) => { /* ... */ })

// Emergency
app.post('/api/emergency/call', (req, res) => { /* ... */ })

// Admin settings
app.patch('/api/admin/settings', (req, res) => { /* ... */ })

// Doctor/patient status
app.patch('/api/doctors/:doctorId/status', (req, res) => { /* ... */ })
app.patch('/api/patients/:patientId/status', (req, res) => { /* ... */ })

// Payments
app.post('/api/payments/kora/initialize', async (req, res) => { /* ... */ })
app.get('/api/payments/kora/verify/:reference', async (req, res) => { /* ... */ })
app.post('/api/webhooks/kora', (req, res) => { /* ... */ })

// Doctor availability
app.get('/api/doctors/:doctorId/availability', (req, res) => { /* ... */ })
app.get('/api/doctors', (req, res) => { /* ... */ })

// Reviews
app.post('/api/reviews', (req, res) => { /* ... */ })
app.post('/api/payments', async (req, res) => { /* ... */ })

// Patient files
app.post('/api/patients/files/upload', async (req, res) => { /* ... */ })
app.get('/api/patients/files', (req, res) => { /* ... */ })
app.get('/api/patients/files/:fileId/download', (req, res) => { /* ... */ })

// Appointments
app.post('/api/appointments', (req, res) => { /* ... */ })
app.get('/api/appointments', (req, res) => { /* ... */ })

// Notifications
app.get('/api/notifications', (req, res) => { /* ... */ })
app.patch('/api/notifications/:notificationId/read', (req, res) => { /* ... */ })

// Chat
app.post('/api/chat/messages', (req, res) => { /* ... */ })
app.get('/api/chat/messages', (req, res) => { /* ... */ })

// Admin management
app.post('/api/admin/doctors', (req, res) => { /* ... */ })
app.delete('/api/admin/doctors/:doctorId', (req, res) => { /* ... */ })
app.patch('/api/admin/doctors/:doctorId/verify', (req, res) => { /* ... */ })
app.get('/api/admin/reviews', (req, res) => { /* ... */ })
app.patch('/api/admin/reviews/:reviewId/verify', (req, res) => { /* ... */ })
app.patch('/api/admin/reviews/:reviewId/reject', (req, res) => { /* ... */ })
app.post('/api/admin/referrals', (req, res) => { /* ... */ })
app.get('/api/admin/referrals', (req, res) => { /* ... */ })
app.post('/api/patients/referrals', (req, res) => { /* ... */ })
app.get('/api/patients/:patientId/referrals', (req, res) => { /* ... */ })
app.post('/api/admin/files/upload', (req, res) => { /* ... */ })
app.get('/api/admin/files', (req, res) => { /* ... */ })
app.delete('/api/admin/files/:fileId', (req, res) => { /* ... */ })
app.get('/api/admin/patients', (req, res) => { /* ... */ })
app.get('/api/admin/patients/:patientId', (req, res) => { /* ... */ })

// Vital parameters
app.post('/api/vital-parameters', (req, res) => { /* ... */ })

const port = process.env.PORT || 4000
export default app

const isDirectRun = Boolean(process.argv?.[1]) && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isDirectRun) {
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`)
  })
}