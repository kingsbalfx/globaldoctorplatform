// This file is now located at /api/index.js to satisfy Vercel's function requirements
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

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
  minimumSubscriptionUSD: 5,
}
const patientTokens = [] // Token balances
const subscriptions = [] // Subscription management
const payments = [] // Payment transactions

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
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

  const newDoctor = {
    id: `doc-${doctorsAuth.length + 1}`,
    email,
    password, // In production, hash this!
    name,
    specialty,
    location,
    licenseNumber,
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
    tokens: 50, // Free welcome tokens
    isOnline: true,
    createdAt: new Date().toISOString(),
  }

  patients.push(newPatient)

  // Initialize token balance
  patientTokens.push({
    patientId: newPatient.id,
    balance: 50,
    transactions: [{
      id: `txn-${Date.now()}`,
      type: 'welcome_bonus',
      amount: 50,
      description: 'Welcome bonus tokens',
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

app.post('/api/doctors/:doctorId/withdraw', (req, res) => {
  const { doctorId } = req.params
  const doctor = doctorsAuth.find(d => d.id === doctorId) || doctors.find(d => d.id === doctorId)

  if (!doctor) return res.status(404).json({ error: 'Doctor not found' })
  
  const tokens = doctor.earningsTokens || 0
  // Minimum $5 (50 tokens)
  if (tokens < 50) {
    return res.status(400).json({ error: 'Minimum withdrawal is 50 tokens ($5)' })
  }

  if (!doctor.bankAccount || !doctor.bankCode) {
    return res.status(400).json({ error: 'Please update your bank details in your profile first' })
  }

  const amountInUSD = tokens / 10

  // Mock Kora Payout
  doctor.earningsTokens = 0
  res.json({ 
    message: `Withdrawal of $${amountInUSD.toFixed(2)} initiated successfully to ${doctor.bankAccount}`,
    amount: amountInUSD,
    reference: `WD-${Date.now()}`
  })
})

app.post('/api/patients/:patientId/tokens/add', (req, res) => {
  const { patientId } = req.params
  const { amount } = req.body

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required' })
  }

  let tokenRecord = patientTokens.find(t => t.patientId === patientId)
  if (!tokenRecord) {
    tokenRecord = {
      patientId,
      balance: 0,
      transactions: [],
    }
    patientTokens.push(tokenRecord)
  }

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
    else requiredTokens = (doctor.specialty === 'General Practitioner' ? 20 : 40);
  }

  if (currentTokens < requiredTokens) {
    return res.status(402).json({ error: 'Insufficient tokens. Please purchase more tokens.' })
  }

  // Deduct tokens
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
    const adminShare = requiredTokens * 0.40
    const doctorShare = requiredTokens * 0.35
    const companyShare = requiredTokens * 0.25

    // Update doctor's earnings (35%)
    const authDoc = doctorsAuth.find(d => d.id === doctorId)
    if (authDoc) {
      authDoc.earningsTokens = (authDoc.earningsTokens || 0) + doctorShare
    }
    doctor.earningsTokens = (doctor.earningsTokens || 0) + doctorShare
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
  const { name, specialty, location, languages, consultation_fee, licenseNumber, licenseIssuer, licenseExpiry } = req.body

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
