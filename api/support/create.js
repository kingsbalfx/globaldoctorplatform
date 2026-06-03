import { createClient } from '@supabase/supabase-js'

const AGENT_EMAIL = 'globaldoctorconnect@gmail.com'
const BUCKET = process.env.SUPPORT_BUCKET || 'support-documents'
const MAX_FILES = 5
const MAX_FILE_BYTES = 2 * 1024 * 1024

function okEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

function clean(value, max = 4000) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, max)
}

function getDb() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function caseId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `GDC-${date}-${rand}`
}

function toFile(file) {
  const raw = String(file?.base64 || '').split(',').pop() || ''
  const content = Buffer.from(raw, 'base64')
  if (!raw || !content.length) return null
  if (content.length > MAX_FILE_BYTES) {
    const err = new Error(`${clean(file?.name, 120) || 'File'} is larger than 2MB`)
    err.statusCode = 413
    throw err
  }
  return {
    name: clean(file?.name, 180) || 'file',
    type: clean(file?.type, 120) || 'application/octet-stream',
    size: content.length,
    content,
  }
}

async function storeFile(db, id, file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 140)
  const path = `${id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`
  const upload = await db.storage.from(BUCKET).upload(path, file.content, { contentType: file.type, upsert: false })
  if (upload.error) return { path: null, url: null, status: `storage_failed: ${upload.error.message}` }
  const signed = await db.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 14)
  return { path, url: signed.data?.signedUrl || null, status: signed.error ? 'stored_no_signed_url' : 'stored' }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const db = getDb()
    if (!db) return res.status(500).json({ error: 'Supabase is not configured.' })

    const body = req.body || {}
    const fullName = clean(body.fullName, 160)
    const email = String(body.email || '').trim().toLowerCase()
    const country = clean(body.country, 120)
    const language = clean(body.language, 80) || 'English'
    const subject = clean(body.subject, 180) || 'Support request'
    const details = clean(body.complaint, 5000)
    const preferredContact = clean(body.preferredContact, 80) || 'Email'

    if (!fullName || !okEmail(email) || !details) {
      return res.status(400).json({ error: 'Full name, valid email, and request details are required.' })
    }

    const id = caseId()
    const now = new Date().toISOString()
    const { error: ticketError } = await db.from('support_tickets').insert({
      id,
      full_name: fullName,
      email,
      country,
      language,
      subject,
      complaint: details,
      preferred_contact: preferredContact,
      status: 'new',
      source: 'ai_assistant',
      agent_email: AGENT_EMAIL,
      created_at: now,
      updated_at: now,
    })
    if (ticketError) return res.status(500).json({ error: ticketError.message })

    const files = (Array.isArray(body.files) ? body.files.slice(0, MAX_FILES) : []).map(toFile).filter(Boolean)
    const rows = []
    for (const file of files) {
      const stored = await storeFile(db, id, file)
      rows.push({
        id: `${id}-${Math.random().toString(36).slice(2, 8)}`,
        ticket_id: id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: stored.url,
        file_path: stored.path,
        storage_bucket: BUCKET,
        storage_status: stored.status,
        created_at: now,
      })
    }
    if (rows.length) await db.from('support_files').insert(rows)
    await db.from('support_notifications').insert({
      id: `${id}-notif-${Math.random().toString(36).slice(2, 8)}`,
      ticket_id: id,
      notification_type: 'new_support_request',
      recipient_email: AGENT_EMAIL,
      is_read: false,
      created_at: now,
    })

    return res.status(201).json({ caseId: id, stored: true, emailSent: false, message: 'Request saved.' })
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || 'Request failed' })
  }
}
