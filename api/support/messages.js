import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const AGENT_EMAIL = 'globaldoctorconnect@gmail.com'

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function safeText(value, max = 4000) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, max)
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

async function notifyUser(ticket, message) {
  const smtp = getSmtpSettings()
  if (!smtp.user || !smtp.pass || !ticket?.email) return { sent: false }
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
  })
  const info = await transporter.sendMail({
    from: `"${smtp.fromName}" <${smtp.from}>`,
    to: ticket.email,
    replyTo: AGENT_EMAIL,
    subject: `Update on your GlobalDoc request ${ticket.id}`,
    text: `Hello ${ticket.full_name || ''},\n\n${message}\n\nRequest ID: ${ticket.id}\n\nGlobalDoc Connect`,
    html: `<p>Hello ${ticket.full_name || ''},</p><p>${message.replace(/\n/g, '<br />')}</p><p><strong>Request ID:</strong> ${ticket.id}</p><p>GlobalDoc Connect</p>`,
  })
  return { sent: true, messageId: info.messageId || null }
}

export default async function handler(req, res) {
  const supabase = getSupabaseClient()
  if (!supabase) return res.status(500).json({ error: 'Supabase is not configured.' })

  if (req.method === 'GET') {
    const caseId = safeText(req.query?.caseId, 120)
    if (!caseId) return res.status(400).json({ error: 'caseId is required.' })
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', caseId)
      .order('created_at', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ messages: data || [] })
  }

  if (req.method === 'POST') {
    const caseId = safeText(req.body?.caseId, 120)
    const message = safeText(req.body?.message, 5000)
    const senderType = safeText(req.body?.senderType, 60) || 'agent'
    const senderEmail = safeText(req.body?.senderEmail, 180) || AGENT_EMAIL
    const shouldEmailUser = req.body?.emailUser !== false

    if (!caseId || !message) return res.status(400).json({ error: 'caseId and message are required.' })

    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', caseId)
      .maybeSingle()

    if (ticketError) return res.status(500).json({ error: ticketError.message })
    if (!ticket) return res.status(404).json({ error: 'Request not found.' })

    const row = {
      id: `${caseId}-msg-${Math.random().toString(36).slice(2, 10)}`,
      ticket_id: caseId,
      sender_type: senderType,
      sender_email: senderEmail,
      message,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from('support_messages').insert(row).select('*').maybeSingle()
    if (error) return res.status(500).json({ error: error.message })

    await supabase.from('support_tickets').update({ status: 'open', updated_at: new Date().toISOString() }).eq('id', caseId).catch(() => null)
    await supabase.from('support_notifications').insert({
      id: `${caseId}-notif-${Math.random().toString(36).slice(2, 10)}`,
      ticket_id: caseId,
      notification_type: 'agent_reply',
      recipient_email: ticket.email,
      is_read: false,
      created_at: new Date().toISOString(),
    }).catch(() => null)

    let emailResult = { sent: false }
    if (shouldEmailUser) {
      try {
        emailResult = await notifyUser(ticket, message)
      } catch {
        emailResult = { sent: false }
      }
    }

    return res.status(201).json({ message: data, emailResult })
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}
