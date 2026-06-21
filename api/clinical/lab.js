import { clean, db, jsonError, makeId, tryAudit } from '../_healthCore.js'

export default async function handler(req, res) {
  const supabase = db()
  if (!supabase) return jsonError(res, 500, 'Supabase is not configured.')

  if (req.method === 'GET') {
    const patientId = clean(req.query?.patientId, 160)
    if (!patientId) return jsonError(res, 400, 'patientId is required.')
    const { data, error } = await supabase.from('lab_results').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(50)
    if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase2-clinical-safety.sql in Supabase.' })
    return res.json({ labResults: data || [] })
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    const patientId = clean(body.patientId, 160)
    const testName = clean(body.testName, 240)
    if (!patientId || !testName) return jsonError(res, 400, 'patientId and testName are required.')
    const now = new Date().toISOString()
    const row = {
      id: makeId('report'),
      patient_id: patientId,
      doctor_id: clean(body.doctorId, 160) || null,
      lab_order_id: clean(body.labOrderId, 160) || null,
      test_name: testName,
      result_text: clean(body.resultText, 8000) || null,
      abnormal_flag: Boolean(body.abnormalFlag),
      critical_flag: Boolean(body.criticalFlag),
      status: 'uploaded',
      uploaded_by_type: clean(body.uploadedByType, 80) || 'facility',
      uploaded_by_id: clean(body.uploadedById, 160) || null,
      metadata: body.metadata || {},
      created_at: now,
      updated_at: now,
    }
    const result = await supabase.from('lab_results').insert(row).select('*').maybeSingle()
    if (result.error) return jsonError(res, 500, result.error.message, { migrationRequired: 'Run server/phase2-clinical-safety.sql in Supabase.' })
    await tryAudit(supabase, { actorId: row.uploaded_by_id || 'system', actorType: row.uploaded_by_type, action: 'clinical_report_saved', resourceType: 'lab_results', resourceId: row.id, riskLevel: row.critical_flag ? 'critical' : row.abnormal_flag ? 'high' : 'medium', metadata: { patientId, testName } })
    return res.status(201).json({ labResult: result.data || row, message: 'Clinical report saved.' })
  }

  res.setHeader('Allow', 'GET, POST')
  return jsonError(res, 405, 'Method not allowed.')
}
