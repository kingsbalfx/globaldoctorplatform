import { createClient } from '@supabase/supabase-js'

const SUPPORT_BUCKET = process.env.SUPPORT_BUCKET || 'support-documents'

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

async function attachFiles(supabase, tickets) {
  const rows = Array.isArray(tickets) ? tickets : []
  if (rows.length === 0) return rows

  const ids = rows.map((ticket) => ticket.id).filter(Boolean)
  if (ids.length === 0) return rows.map((ticket) => ({ ...ticket, support_files: [] }))

  const { data: files, error } = await supabase
    .from('support_files')
    .select('*')
    .in('ticket_id', ids)
    .order('created_at', { ascending: true })

  if (error) {
    return rows.map((ticket) => ({ ...ticket, support_files: [], support_files_error: error.message }))
  }

  const enhancedFiles = []
  for (const file of files || []) {
    let fileUrl = file.file_url || null
    const bucket = file.storage_bucket || SUPPORT_BUCKET
    if (file.file_path) {
      const signed = await supabase.storage.from(bucket).createSignedUrl(file.file_path, 60 * 60 * 24 * 7)
      if (!signed.error && signed.data?.signedUrl) fileUrl = signed.data.signedUrl
    }
    enhancedFiles.push({ ...file, file_url: fileUrl })
  }

  const grouped = enhancedFiles.reduce((acc, file) => {
    const key = file.ticket_id
    if (!acc[key]) acc[key] = []
    acc[key].push(file)
    return acc
  }, {})

  return rows.map((ticket) => ({ ...ticket, support_files: grouped[ticket.id] || [] }))
}

export default async function handler(req, res) {
  const supabase = getSupabaseClient()
  if (!supabase) return res.status(500).json({ error: 'Supabase is not configured.' })

  if (req.method === 'GET') {
    const { caseId, email, status } = req.query || {}
    let query = supabase.from('support_tickets').select('*').order('created_at', { ascending: false })

    if (caseId) query = query.eq('id', String(caseId).trim())
    if (email) {
      if (!isValidEmail(email)) return res.status(400).json({ error: 'Valid email required.' })
      query = query.eq('email', String(email).trim().toLowerCase())
    }
    if (status && status !== 'all') query = query.eq('status', String(status).trim())

    const { data, error } = await query.limit(100)
    if (error) return res.status(500).json({ error: error.message })

    const tickets = await attachFiles(supabase, data || [])
    return res.json({ tickets })
  }

  if (req.method === 'PATCH') {
    const { caseId, status, notes, assignedTo } = req.body || {}
    if (!caseId) return res.status(400).json({ error: 'caseId is required.' })
    const updates = { updated_at: new Date().toISOString() }
    if (status) updates.status = String(status).trim()
    if (notes !== undefined) updates.notes = String(notes || '').trim()
    if (assignedTo !== undefined) updates.assigned_to = String(assignedTo || '').trim()

    const { data, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', String(caseId).trim())
      .select('*')
      .maybeSingle()

    if (error) return res.status(500).json({ error: error.message })
    const [ticket] = await attachFiles(supabase, data ? [data] : [])
    return res.json({ ticket: ticket || data, message: 'Ticket updated.' })
  }

  res.setHeader('Allow', 'GET, PATCH')
  return res.status(405).json({ error: 'Method not allowed' })
}
