import { createClient } from '@supabase/supabase-js'

export function db() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export function clean(value, max = 4000) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, max)
}

export function makeId(prefix = 'item') {
  const stamp = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 10)
  return `${prefix}-${stamp}-${rand}`
}

export function okEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

export function jsonError(res, status, message, extra = {}) {
  return res.status(status).json({ error: message, ...extra })
}

export async function tryAudit(supabase, event = {}) {
  if (!supabase) return null
  const now = new Date().toISOString()
  const base = {
    id: makeId('audit'),
    actor_id: clean(event.actorId || event.userId || 'system', 160) || 'system',
    actor_type: clean(event.actorType || event.userType || 'system', 40) || 'system',
    action: clean(event.action || 'health_os_event', 120),
    resource_type: clean(event.resourceType || 'health_os', 120),
    resource_id: clean(event.resourceId || '', 180) || null,
    risk_level: clean(event.riskLevel || 'info', 40),
    metadata: event.metadata || {},
    created_at: now,
  }

  const advanced = await supabase.from('advanced_audit_events').insert(base)
  if (!advanced.error) return advanced

  return supabase.from('audit_logs').insert({
    id: base.id,
    user_id: base.actor_id,
    user_type: ['doctor', 'patient', 'admin', 'system'].includes(base.actor_type) ? base.actor_type : 'system',
    action: base.action,
    action_category: 'health_os',
    resource_type: base.resource_type,
    resource_id: base.resource_id,
    changes: base.metadata,
    sensitive_data_involved: true,
    personal_data_involved: true,
    health_data_involved: true,
    result: 'success',
    created_at: now,
  })
}

export async function safeSelect(supabase, table, builder, fallback = []) {
  try {
    const result = await builder(supabase.from(table))
    if (result.error) return { data: fallback, error: result.error.message }
    return { data: result.data || fallback, error: null }
  } catch (error) {
    return { data: fallback, error: error.message }
  }
}
