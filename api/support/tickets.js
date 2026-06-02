import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

export default async function handler(req, res) {
  const supabase = getSupabaseClient()
  if (!supabase) return res.status(500).json({ error: 'Supabase is not configured.' })

  if (req.method === 'GET') {
    const { caseId, email, status } = req.query || {}
    let query = supabase.from('support_tickets').select('*, support_files(*)').order('created_at', { ascending: false })

    if (caseId) query = query.eq('id', String(caseId).trim())
    if (email) {
      if (!isValidEmail(email)) return res.status(400).json({ error: 'Valid email required.' })
      query = query.eq('email', String(email).trim().toLowerCase())
    }
    if (status && status !== 'all') query = query.eq('status', String(status).trim())

    const { data, error } = await query.limit(100)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ tickets: data || [] })
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
      .select('*, support_files(*)')
      .maybeSingle()

    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ticket: data, message: 'Ticket updated.' })
  }

  res.setHeader('Allow', 'GET, PATCH')
  return res.status(405).json({ error: 'Method not allowed' })
}
