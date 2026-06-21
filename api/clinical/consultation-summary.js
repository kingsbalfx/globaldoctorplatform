import { clean, db, jsonError, makeId, tryAudit } from '../_healthCore.js'

function patientSummary(body) {
  const parts = []
  if (body.diagnosis) parts.push(`Main issue: ${clean(body.diagnosis, 800)}`)
  if (body.treatmentGiven) parts.push(`Treatment: ${clean(body.treatmentGiven, 1200)}`)
  if (body.medicationSummary) parts.push(`Medicines: ${clean(body.medicationSummary, 1200)}`)
  if (body.labSummary) parts.push(`Tests/labs: ${clean(body.labSummary, 1200)}`)
  if (body.followUpPlan) parts.push(`Follow-up: ${clean(body.followUpPlan, 1200)}`)
  if (body.redFlags) parts.push(`Seek urgent care if: ${clean(body.redFlags, 1200)}`)
  return parts.join('\n') || 'Your consultation summary is ready. Please follow your doctor instructions and seek urgent care if symptoms worsen.'
}

export default async function handler(req, res) {
  const supabase = db()
  if (!supabase) return jsonError(res, 500, 'Supabase is not configured.')

  if (req.method === 'GET') {
    const patientId = clean(req.query?.patientId, 160)
    const doctorId = clean(req.query?.doctorId, 160)
    const consultationId = clean(req.query?.consultationId, 160)
    if (!patientId && !doctorId && !consultationId) return jsonError(res, 400, 'patientId, doctorId, or consultationId is required.')
    let query = supabase.from('consultation_summaries').select('*').order('created_at', { ascending: false }).limit(50)
    if (patientId) query = query.eq('patient_id', patientId)
    if (doctorId) query = query.eq('doctor_id', doctorId)
    if (consultationId) query = query.eq('consultation_id', consultationId)
    const { data, error } = await query
    if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase2-clinical-safety.sql in Supabase.' })
    return res.json({ summaries: data || [] })
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    const patientId = clean(body.patientId, 160)
    const doctorId = clean(body.doctorId, 160)
    if (!patientId || !doctorId) return jsonError(res, 400, 'patientId and doctorId are required.')
    const now = new Date().toISOString()
    const status = clean(body.status, 40) || 'draft'
    const summary = {
      id: makeId('summary'),
      consultation_id: clean(body.consultationId, 160) || null,
      patient_id: patientId,
      doctor_id: doctorId,
      reason_for_visit: clean(body.reasonForVisit, 2000) || null,
      clinical_findings: clean(body.clinicalFindings, 4000) || null,
      diagnosis: clean(body.diagnosis, 1000) || null,
      treatment_given: clean(body.treatmentGiven, 4000) || null,
      medication_summary: clean(body.medicationSummary, 4000) || null,
      lab_summary: clean(body.labSummary, 4000) || null,
      follow_up_plan: clean(body.followUpPlan, 4000) || null,
      red_flags: clean(body.redFlags, 4000) || null,
      patient_friendly_summary: clean(body.patientFriendlySummary, 8000) || patientSummary(body),
      status,
      finalized_at: status === 'final' ? now : null,
      metadata: body.metadata || {},
      created_at: now,
      updated_at: now,
    }
    const { data, error } = await supabase.from('consultation_summaries').insert(summary).select('*').maybeSingle()
    if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase2-clinical-safety.sql in Supabase.' })
    await supabase.from('health_passport_events').insert({ id: makeId('hpe'), patient_id: patientId, event_type: status === 'final' ? 'final_consultation_summary' : 'consultation_summary', title: summary.diagnosis ? `Consultation summary: ${summary.diagnosis}` : 'Consultation summary', summary: summary.patient_friendly_summary, source_table: 'consultation_summaries', source_id: summary.id, event_at: now, metadata: { doctorId, consultationId: summary.consultation_id, status }, created_at: now }).then(() => null, () => null)
    await tryAudit(supabase, { actorId: doctorId, actorType: 'doctor', action: status === 'final' ? 'consultation_summary_finalized' : 'consultation_summary_created', resourceType: 'consultation_summaries', resourceId: summary.id, riskLevel: 'high', metadata: { patientId, consultationId: summary.consultation_id } })
    return res.status(201).json({ summary: data || summary, message: 'Consultation summary saved.' })
  }

  res.setHeader('Allow', 'GET, POST')
  return jsonError(res, 405, 'Method not allowed.')
}
