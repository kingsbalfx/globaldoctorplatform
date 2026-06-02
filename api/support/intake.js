import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const AGENT_EMAIL = 'globaldoctorconnect@gmail.com'
const MAX_FILES = 5
const MAX_FILE_BYTES = 2 * 1024 * 1024

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

function safeText(value, max = 4000) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, max)
}

function generateCaseId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `GDC-${date}-${random}`
}

function getSmtpSettings() {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.MAIL_USER || process.env.GMAIL_USER || ''
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || process.env.MAIL_PASS || process.env.GMAIL_APP_PASSWORD || ''
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com'
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587)
  const secure = process.env.SMTP_SECURE !== undefined ? String(process.env.SMTP_SECURE).toLowerCase() === 'true' : port === 465
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || user
  const fromName = process.env.SMTP_FROM_NAME || 'GlobalDoc Connect Support'
  return { user, pass, host, port, secure, from, fromName }
}

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function parseFile(file) {
  const name = safeText(file?.name, 180) || 'attachment'
  const type = safeText(file?.type, 120) || 'application/octet-stream'
  const rawBase64 = String(file?.base64 || '').split(',').pop() || ''
  const buffer = Buffer.from(rawBase64, 'base64')
  if (!rawBase64 || buffer.length === 0) return null
  if (buffer.length > MAX_FILE_BYTES) {
    const error = new Error(`${name} is larger than 2MB`)
    error.statusCode = 413
    throw error
  }
  return { filename: name, contentType: type, content: buffer, size: buffer.length }
}

async function maybeStoreTicket(ticket, files) {
  const supabase = getSupabaseClient()
  if (!supabase) return { stored: false, reason: 'Supabase not configured' }

  const { error: ticketError } = await supabase.from('support_tickets').insert({
    id: ticket.caseId,
    full_name: ticket.fullName,
    email: ticket.email,
    country: ticket.country,
    language: ticket.language,
    subject: ticket.subject,
    complaint: ticket.complaint,
    preferred_contact: ticket.preferredContact,
    status: 'new',
    source: 'ai_assistant',
    agent_email: AGENT_EMAIL,
    created_at: ticket.createdAt,
  })

  if (ticketError) return { stored: false, reason: ticketError.message }

  if (files.length > 0) {
    await supabase.from('support_files').insert(files.map((file) => ({
      id: `${ticket.caseId}-${Math.random().toString(36).slice(2, 8)}`,
      ticket_id: ticket.caseId,
      file_name: file.filename,
      file_type: file.contentType,
      file_size: file.size,
      storage_status: 'emailed_attachment',
      created_at: ticket.createdAt,
    }))).catch(() => null)
  }

  return { stored: true }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = req.body || {}
    const fullName = safeText(body.fullName, 160)
    const email = String(body.email || '').trim().toLowerCase()
    const country = safeText(body.country, 120)
    const language = safeText(body.language, 80) || 'English'
    const subject = safeText(body.subject, 180) || 'Patient support request'
    const complaint = safeText(body.complaint, 5000)
    const preferredContact = safeText(body.preferredContact, 80) || 'Email'

    if (!fullName || !isValidEmail(email) || !complaint) {
      return res.status(400).json({ error: 'Full name, valid email, and complaint are required.' })
    }

    const rawFiles = Array.isArray(body.files) ? body.files.slice(0, MAX_FILES) : []
    const attachments = rawFiles.map(parseFile).filter(Boolean)
    const caseId = generateCaseId()
    const createdAt = new Date().toISOString()
    const ticket = { caseId, fullName, email, country, language, subject, complaint, preferredContact, createdAt }
    const storageResult = await maybeStoreTicket(ticket, attachments)

    const fileSummary = attachments.length
      ? attachments.map((file, index) => `${index + 1}. ${file.filename} (${file.contentType}, ${Math.ceil(file.size / 1024)}KB)`).join('\n')
      : 'No files attached.'

    const text = [
      `New GlobalDoc support case: ${caseId}`,
      '',
      `Name: ${fullName}`,
      `Email: ${email}`,
      `Country: ${country || 'Not provided'}`,
      `Language: ${language}`,
      `Preferred contact: ${preferredContact}`,
      `Subject: ${subject}`,
      '',
      'Complaint / Request:',
      complaint,
      '',
      'Attachments:',
      fileSummary,
      '',
      `Database storage: ${storageResult.stored ? 'stored' : `not stored - ${storageResult.reason || 'unknown'}`}`,
    ].join('\n')

    const html = text.replace(/\n/g, '<br />')
    const smtp = getSmtpSettings()
    if (!smtp.user || !smtp.pass) {
      return res.status(202).json({
        caseId,
        emailSent: false,
        stored: storageResult.stored,
        message: 'Case captured, but SMTP credentials are not configured. Add SMTP_USER and SMTP_PASS/GMAIL_APP_PASSWORD.',
      })
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.pass },
    })

    const info = await transporter.sendMail({
      from: `"${smtp.fromName}" <${smtp.from}>`,
      to: AGENT_EMAIL,
      replyTo: email,
      subject: `[${caseId}] ${subject}`,
      text,
      html,
      attachments,
    })

    return res.status(201).json({
      caseId,
      emailSent: true,
      messageId: info.messageId || null,
      stored: storageResult.stored,
      message: 'Support case submitted successfully.',
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || 'Support intake failed' })
  }
}
