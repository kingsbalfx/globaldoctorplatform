import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import axios from 'axios'
import { RtcTokenBuilder, RtcRole } from 'agora-access-token'
import crypto from 'crypto'

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
  { email: 'SHAFIUABDULLAHI.SA3@GMAIL.COM', password: '014/Pt/014', name: 'System Admin' }
]
const doctorsAuth = [] // In production, use a proper database
const referrals = [] // Patient referrals
const uploadedFiles = [] // File management
const patients = [] // Patient management
const patientFiles = []
const appointments = []
const notifications = []
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

function getApiOrigin(req) {
  const configured = process.env.APP_BASE_URL || process.env.VITE_APP_BASE || process.env.VITE_API_BASE
  if (configured && configured.trim()) return configured.replace(/\/+$/, '')
  const proto = (req.headers['x-forwarded-proto'] || 'http').toString().split(',')[0].trim()
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toString().split(',')[0].trim()
  if (!host) return ''
  return `${proto}://${host}`
}

function safeNumber(value) {
  const parsed = typeof value === 'string' ? Number(value) : value
  return Number.isFinite(parsed) ? parsed : null
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
  const { specialty, minRating, availability, query, online } = req.query
  const filtered = doctors.filter((doctor) => {
    const matchesSpecialty = !specialty || doctor.specialty === specialty
    const matchesRating = !minRating || doctor.rating >= Number(minRating)
    const matchesAvailability = !availability || doctor.availability.toLowerCase().includes(String(availability).toLowerCase())
    const matchesQuery = !query || [doctor.name, doctor.location, doctor.specialty].some((field) => field.toLowerCase().includes(String(query).toLowerCase()))
    const matchesOnline = online === undefined || online === '' || String(doctor.isOnline) === String(online)
    return matchesSpecialty && matchesRating && matchesAvailability && matchesQuery && matchesOnline
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

// For local development, keep the listen call
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`)
  })
}
