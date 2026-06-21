import { clean, db, jsonError, makeId, tryAudit } from '../_healthCore.js'

export default async function handler(req, res) {
  const supabase = db()
  if (!supabase) return jsonError(res, 500, 'Supabase is not configured.')

  if (req.method === 'GET') {
    const patientId = clean(req.query?.patientId, 160)
    const doctorId = clean(req.query?.doctorId, 160)
    const consultationId = clean(req.query?.consultationId, 160)
    if (!patientId && !doctorId && !consultationId) return jsonError(res, 400, 'patientId, doctorId, or consultationId is required.')
    let query = supabase.from('clinical_soap_notes').select('*').order('created_at', { ascending: false }).limit(50)
    if (patientId) query = query.eq('patient_id', patientId)
    if (doctorId) query = query.eq('doctor_id', doctorId)
    if (consultationId) query = query.eq('consultation_id', consultationId)
    const { data, error } = await query
    if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase1-health-os.sql in Supabase.' })
    return res.json({ notes: data || [] })
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    const patientId = clean(body.patientId, 160)
    const doctorId = clean(body.doctorId, 160)
    if (!patientId || !doctorId) return jsonError(res, 400, 'patientId and doctorId are required.')
    const now = new Date().toISOString()
    const note = {
      id: makeId('note'),
      patient_id: patientId,
      doctor_id: doctorId,
      consultation_id: clean(body.consultationId, 160) || null,
      subjective: clean(body.subjective, 6000) || null,
      objective: clean(body.objective, 6000) || null,
      assessment: clean(body.assessment, 6000) || null,
      plan: clean(body.plan, 6000) || null,
      diagnosis: clean(body.diagnosis, 800) || null,
      follow_up: clean(body.followUp, 2000) || null,
      status: clean(body.status, 40) || 'draft',
      signed_at: body.status === 'signed' ? now : null,
      metadata: body.metadata || {},
      created_at: now,
      updated_at: now,
    }
    if (!note.subjective && !note.objective && !note.assessment && !note.plan) return jsonError(res, 400, 'At least one note field is required.')
    const { data, error } = await supabase.from('clinical_soap_notes').insert(note).select('*').maybeSingle()
    if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase1-health-os.sql in Supabase.' })
    await supabase.from('health_passport_events').insert({
      id: makeId('hpe'), patient_id: patientId, event_type: 'clinical_note',
      title: note.diagnosis ? `Care note: ${note.diagnosis}` : 'Care note added',
      summary: [note.assessment, note.plan].filter(Boolean).join('\n\n'),
      source_table: 'clinical_soap_notes', source_id: note.id, event_at: now,
      metadata: { doctorId, consultationId: note.consultation_id, status: note.status }, created_at: now,
    }).then(() => null, () => null)
    await tryAudit(supabase, { actorId: doctorId, actorType: 'doctor', action: 'care_note_saved', resourceType: 'clinical_soap_notes', resourceId: note.id, riskLevel: 'high', metadata: { patientId, consultationId: note.consultation_id } })
    return res.status(201).json({ note: data || note, message: 'Care note saved.' })
  }

  res.setHeader('Allow', 'GET, POST')
  return jsonError(res, 405, 'Method not allowed.')
}
