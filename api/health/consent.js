import { clean, db, jsonError, makeId, tryAudit } from '../_healthCore.js'

const CONSENT_TYPES = ['telehealth_consultation', 'medical_data_processing', 'ai_assistance', 'file_sharing', 'emergency_contact']

export default async function handler(req, res) {
  const supabase = db()
  if (!supabase) return jsonError(res, 500, 'Supabase is not configured.')

  if (req.method === 'GET') {
    const patientId = clean(req.query?.patientId, 160)
    if (!patientId) return jsonError(res, 400, 'patientId is required.')
    const { data, error } = await supabase
      .from('patient_consents')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
    if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase1-health-os.sql in Supabase.' })
    return res.json({ consents: data || [] })
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    const patientId = clean(body.patientId, 160)
    if (!patientId) return jsonError(res, 400, 'patientId is required.')
    const source = clean(body.source, 80) || 'health_os'
    const actorType = clean(body.actorType, 40) || 'patient'
    const actorId = clean(body.actorId, 160) || patientId
    const consentVersion = clean(body.consentVersion, 80) || 'phase1-v1'
    const submitted = Array.isArray(body.consents) ? body.consents : []
    const rows = submitted
      .map((item) => ({ type: clean(item.type || item.consent_type, 80), given: Boolean(item.given ?? item.consent_given) }))
      .filter((item) => CONSENT_TYPES.includes(item.type))
      .map((item) => ({
        id: makeId('consent'),
        patient_id: patientId,
        consent_type: item.type,
        consent_given: item.given,
        consent_version: consentVersion,
        source,
        actor_type: actorType,
        actor_id: actorId,
        ip_address: String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim() || null,
        user_agent: String(req.headers['user-agent'] || ''),
        metadata: body.metadata || {},
        created_at: new Date().toISOString(),
      }))

    if (rows.length === 0) return jsonError(res, 400, 'At least one valid consent is required.')
    const { data, error } = await supabase.from('patient_consents').insert(rows).select('*')
    if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase1-health-os.sql in Supabase.' })
    await tryAudit(supabase, {
      actorId,
      actorType,
      action: 'patient_consent_recorded',
      resourceType: 'patient_consents',
      resourceId: patientId,
      riskLevel: 'medium',
      metadata: { consentTypes: rows.map((row) => row.consent_type), source },
    })
    return res.status(201).json({ consents: data || rows, message: 'Consent recorded.' })
  }

  res.setHeader('Allow', 'GET, POST')
  return jsonError(res, 405, 'Method not allowed.')
}
