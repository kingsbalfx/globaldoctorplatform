import { clean, db, jsonError, makeId, tryAudit } from '../_healthCore.js'

export default async function handler(req, res) {
  const supabase = db()
  if (!supabase) return jsonError(res, 500, 'Supabase is not configured.')

  if (req.method === 'GET') {
    const patientId = clean(req.query?.patientId, 160)
    const doctorId = clean(req.query?.doctorId, 160)
    const labOrderId = clean(req.query?.labOrderId, 160)
    if (!patientId && !doctorId && !labOrderId) return jsonError(res, 400, 'patientId, doctorId, or labOrderId is required.')
    let query = supabase.from('lab_results').select('*').order('created_at', { ascending: false }).limit(80)
    if (patientId) query = query.eq('patient_id', patientId)
    if (doctorId) query = query.eq('doctor_id', doctorId)
    if (labOrderId) query = query.eq('lab_order_id', labOrderId)
    const { data, error } = await query
    if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase2-clinical-safety.sql in Supabase.' })
    return res.json({ labResults: data || [] })
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    const patientId = clean(body.patientId, 160)
    const testName = clean(body.testName, 240)
    if (!patientId || !testName) return jsonError(res, 400, 'patientId and testName are required.')
    const now = new Date().toISOString()
    const result = {
      id: makeId('labres'),
      lab_order_id: clean(body.labOrderId, 160) || null,
      patient_id: patientId,
      doctor_id: clean(body.doctorId, 160) || null,
      facility_id: clean(body.facilityId, 160) || null,
      test_name: testName,
      result_text: clean(body.resultText, 8000) || null,
      result_value: clean(body.resultValue, 240) || null,
      unit: clean(body.unit, 80) || null,
      reference_range: clean(body.referenceRange, 240) || null,
      abnormal_flag: Boolean(body.abnormalFlag),
      critical_flag: Boolean(body.criticalFlag),
      doctor_acknowledged: false,
      status: clean(body.status, 80) || 'uploaded',
      uploaded_by_type: clean(body.uploadedByType, 80) || 'facility',
      uploaded_by_id: clean(body.uploadedById, 160) || null,
      metadata: body.metadata || {},
      created_at: now,
      updated_at: now,
    }
    const { data, error } = await supabase.from('lab_results').insert(result).select('*').maybeSingle()
    if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase2-clinical-safety.sql in Supabase.' })
    await supabase.from('health_passport_events').insert({ id: makeId('hpe'), patient_id: patientId, event_type: result.critical_flag ? 'critical_lab_result' : result.abnormal_flag ? 'abnormal_lab_result' : 'lab_result', title: result.test_name, summary: result.result_text || result.result_value || 'Lab result uploaded', source_table: 'lab_results', source_id: result.id, event_at: now, metadata: { abnormal: result.abnormal_flag, critical: result.critical_flag, doctorId: result.doctor_id }, created_at: now }).then(() => null, () => null)
    await tryAudit(supabase, { actorId: result.uploaded_by_id || result.facility_id || 'system', actorType: result.uploaded_by_type, action: result.critical_flag ? 'critical_lab_result_uploaded' : 'lab_result_uploaded', resourceType: 'lab_results', resourceId: result.id, riskLevel: result.critical_flag ? 'critical' : result.abnormal_flag ? 'high' : 'medium', metadata: { patientId, doctorId: result.doctor_id, testName } })
    return res.status(201).json({ labResult: data || result, message: 'Lab result saved.' })
  }

  if (req.method === 'PATCH') {
    const body = req.body || {}
    const resultId = clean(body.resultId, 160)
    if (!resultId) return jsonError(res, 400, 'resultId is required.')
    const updates = { updated_at: new Date().toISOString() }
    if (body.doctorAcknowledged !== undefined) {
      updates.doctor_acknowledged = Boolean(body.doctorAcknowledged)
      updates.acknowledged_at = updates.doctor_acknowledged ? new Date().toISOString() : null
      updates.status = updates.doctor_acknowledged ? 'acknowledged' : 'uploaded'
    }
    if (body.status) updates.status = clean(body.status, 80)
    const { data, error } = await supabase.from('lab_results').update(updates).eq('id', resultId).select('*').maybeSingle()
    if (error) return jsonError(res, 500, error.message)
    await tryAudit(supabase, { actorId: clean(body.actorId, 160) || 'system', actorType: clean(body.actorType, 80) || 'doctor', action: 'lab_result_updated', resourceType: 'lab_results', resourceId: resultId, riskLevel: 'medium', metadata: updates })
    return res.json({ labResult: data, message: 'Lab result updated.' })
  }

  res.setHeader('Allow', 'GET, POST, PATCH')
  return jsonError(res, 405, 'Method not allowed.')
}
