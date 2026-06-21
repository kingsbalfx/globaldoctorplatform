import { clean, db, jsonError, makeId, tryAudit } from '../_healthCore.js'

function listFrom(value) {
  if (Array.isArray(value)) return value.map((item) => clean(item, 120)).filter(Boolean)
  return String(value || '').split(',').map((item) => clean(item, 120)).filter(Boolean)
}

function buildChecks(items, allergies, currentMeds, pregnancyStatus, patientAge) {
  const checks = []
  const allergyText = allergies.join(' ').toLowerCase()
  const current = currentMeds.map((item) => item.toLowerCase())
  const names = items.map((item) => clean(item.medicineName || item.medicine_name || item.drugName || item.name, 180).toLowerCase()).filter(Boolean)
  items.forEach((item, index) => {
    const name = clean(item.medicineName || item.medicine_name || item.drugName || item.name, 180)
    const lower = name.toLowerCase()
    if (!name) return
    if (allergyText && allergyText.includes(lower)) checks.push({ checkType: 'allergy_match', severity: 'critical', message: `${name} appears to match a recorded allergy. Clinician must review before issuing.`, itemIndex: index })
    if (current.includes(lower)) checks.push({ checkType: 'duplicate_current_medicine', severity: 'warning', message: `${name} also appears in current medicines. Confirm duplication is intended.`, itemIndex: index })
    if (!clean(item.dose, 120)) checks.push({ checkType: 'missing_dose', severity: 'warning', message: `${name} has no dose entered.`, itemIndex: index })
    if (!clean(item.frequency, 120)) checks.push({ checkType: 'missing_frequency', severity: 'warning', message: `${name} has no frequency entered.`, itemIndex: index })
  })
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index)
  Array.from(new Set(duplicates)).forEach((name) => checks.push({ checkType: 'duplicate_order_item', severity: 'warning', message: `${name} appears more than once in this order.` }))
  if (String(pregnancyStatus || '').toLowerCase().includes('preg')) checks.push({ checkType: 'pregnancy_review', severity: 'warning', message: 'Pregnancy status was marked. A licensed clinician must confirm medicine safety before issuing.' })
  const ageNumber = Number(patientAge)
  if (ageNumber > 0 && ageNumber < 12) checks.push({ checkType: 'pediatric_review', severity: 'warning', message: 'Patient age appears pediatric. Confirm age/weight-based dosing before issuing.' })
  if (checks.length === 0) checks.push({ checkType: 'basic_completeness', severity: 'info', message: 'No basic allergy, duplicate, or completeness warning detected. This is not a full drug interaction engine.' })
  return checks
}

async function hydrateOrders(supabase, orders) {
  const rows = Array.isArray(orders) ? orders : []
  if (!rows.length) return rows
  const ids = rows.map((order) => order.id)
  const [itemsResult, checksResult] = await Promise.all([
    supabase.from('medication_order_items').select('*').in('order_id', ids).order('created_at', { ascending: true }),
    supabase.from('medication_order_checks').select('*').in('order_id', ids).order('created_at', { ascending: true }),
  ])
  const group = (items = [], key = 'order_id') => items.reduce((acc, row) => {
    if (!acc[row[key]]) acc[row[key]] = []
    acc[row[key]].push(row)
    return acc
  }, {})
  const groupedItems = group(itemsResult.data || [])
  const groupedChecks = group(checksResult.data || [])
  return rows.map((order) => ({ ...order, items: groupedItems[order.id] || [], safetyChecks: groupedChecks[order.id] || [] }))
}

function buildPatientText(body) {
  const parts = []
  const fields = [['Main issue', body.diagnosis], ['Treatment', body.treatmentGiven], ['Medicines', body.medicationSummary], ['Tests/labs', body.labSummary], ['Follow-up', body.followUpPlan], ['Urgent warning signs', body.redFlags]]
  fields.forEach(([label, value]) => {
    const text = clean(value, 1200)
    if (text) parts.push(`${label}: ${text}`)
  })
  return parts.join('\n') || 'Your consultation summary is ready. Follow your clinician instructions and seek urgent care if symptoms worsen.'
}

async function getMedicationOrders(supabase, req, res) {
  const patientId = clean(req.query?.patientId, 160)
  const doctorId = clean(req.query?.doctorId, 160)
  const code = clean(req.query?.code, 160)
  let query = supabase.from('medication_orders').select('*').order('created_at', { ascending: false }).limit(50)
  if (code) query = query.eq('verification_code', code)
  else if (patientId) query = query.eq('patient_id', patientId)
  else if (doctorId) query = query.eq('doctor_id', doctorId)
  else return jsonError(res, 400, 'patientId, doctorId, or code is required.')
  const { data, error } = await query
  if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase2-clinical-safety.sql in Supabase.' })
  const orders = await hydrateOrders(supabase, data || [])
  return res.json({ medicationOrders: orders })
}

async function getLabResults(supabase, req, res) {
  const patientId = clean(req.query?.patientId, 160)
  if (!patientId) return jsonError(res, 400, 'patientId is required.')
  const { data, error } = await supabase.from('lab_results').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(50)
  if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase2-clinical-safety.sql in Supabase.' })
  return res.json({ labResults: data || [] })
}

async function getSummaries(supabase, req, res) {
  const patientId = clean(req.query?.patientId, 160)
  if (!patientId) return jsonError(res, 400, 'patientId is required.')
  const { data, error } = await supabase.from('consultation_summaries').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(50)
  if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase2-clinical-safety.sql in Supabase.' })
  return res.json({ summaries: data || [] })
}

async function createLabResult(supabase, body, res) {
  const patientId = clean(body.patientId, 160)
  const testName = clean(body.testName, 240)
  if (!patientId || !testName) return jsonError(res, 400, 'patientId and testName are required.')
  const now = new Date().toISOString()
  const row = { id: makeId('labres'), patient_id: patientId, doctor_id: clean(body.doctorId, 160) || null, lab_order_id: clean(body.labOrderId, 160) || null, test_name: testName, result_text: clean(body.resultText, 8000) || null, result_value: clean(body.resultValue, 240) || null, unit: clean(body.unit, 80) || null, reference_range: clean(body.referenceRange, 240) || null, abnormal_flag: Boolean(body.abnormalFlag), critical_flag: Boolean(body.criticalFlag), status: 'uploaded', uploaded_by_type: clean(body.uploadedByType, 80) || 'facility', uploaded_by_id: clean(body.uploadedById, 160) || null, metadata: body.metadata || {}, created_at: now, updated_at: now }
  const result = await supabase.from('lab_results').insert(row).select('*').maybeSingle()
  if (result.error) return jsonError(res, 500, result.error.message, { migrationRequired: 'Run server/phase2-clinical-safety.sql in Supabase.' })
  await supabase.from('health_passport_events').insert({ id: makeId('hpe'), patient_id: patientId, event_type: row.critical_flag ? 'critical_lab_result' : row.abnormal_flag ? 'abnormal_lab_result' : 'lab_result', title: row.test_name, summary: row.result_text || row.result_value || 'Lab result uploaded', source_table: 'lab_results', source_id: row.id, event_at: now, metadata: { abnormal: row.abnormal_flag, critical: row.critical_flag, doctorId: row.doctor_id }, created_at: now }).then(() => null, () => null)
  await tryAudit(supabase, { actorId: row.uploaded_by_id || 'system', actorType: row.uploaded_by_type, action: 'lab_result_uploaded', resourceType: 'lab_results', resourceId: row.id, riskLevel: row.critical_flag ? 'critical' : row.abnormal_flag ? 'high' : 'medium', metadata: { patientId, testName } })
  return res.status(201).json({ labResult: result.data || row, message: 'Lab result saved.' })
}

async function createSummary(supabase, body, res) {
  const patientId = clean(body.patientId, 160)
  const doctorId = clean(body.doctorId, 160)
  if (!patientId || !doctorId) return jsonError(res, 400, 'patientId and doctorId are required.')
  const now = new Date().toISOString()
  const status = clean(body.status, 40) || 'draft'
  const row = { id: makeId('summary'), consultation_id: clean(body.consultationId, 160) || null, patient_id: patientId, doctor_id: doctorId, reason_for_visit: clean(body.reasonForVisit, 2000) || null, clinical_findings: clean(body.clinicalFindings, 4000) || null, diagnosis: clean(body.diagnosis, 1000) || null, treatment_given: clean(body.treatmentGiven, 4000) || null, medication_summary: clean(body.medicationSummary, 4000) || null, lab_summary: clean(body.labSummary, 4000) || null, follow_up_plan: clean(body.followUpPlan, 4000) || null, red_flags: clean(body.redFlags, 4000) || null, patient_friendly_summary: clean(body.patientFriendlySummary, 8000) || buildPatientText(body), status, finalized_at: status === 'final' ? now : null, metadata: body.metadata || {}, created_at: now, updated_at: now }
  const result = await supabase.from('consultation_summaries').insert(row).select('*').maybeSingle()
  if (result.error) return jsonError(res, 500, result.error.message, { migrationRequired: 'Run server/phase2-clinical-safety.sql in Supabase.' })
  await supabase.from('health_passport_events').insert({ id: makeId('hpe'), patient_id: patientId, event_type: status === 'final' ? 'final_consultation_summary' : 'consultation_summary', title: row.diagnosis ? `Consultation summary: ${row.diagnosis}` : 'Consultation summary', summary: row.patient_friendly_summary, source_table: 'consultation_summaries', source_id: row.id, event_at: now, metadata: { doctorId, consultationId: row.consultation_id, status }, created_at: now }).then(() => null, () => null)
  await tryAudit(supabase, { actorId: doctorId, actorType: 'doctor', action: status === 'final' ? 'consultation_summary_finalized' : 'consultation_summary_created', resourceType: 'consultation_summaries', resourceId: row.id, riskLevel: 'high', metadata: { patientId, consultationId: row.consultation_id } })
  return res.status(201).json({ summary: result.data || row, message: 'Consultation summary saved.' })
}

async function createMedicationOrder(supabase, body, res) {
  const patientId = clean(body.patientId, 160)
  const doctorId = clean(body.doctorId, 160)
  const items = Array.isArray(body.items) ? body.items : []
  if (!patientId || !doctorId || items.length === 0) return jsonError(res, 400, 'patientId, doctorId, and at least one medicine item are required.')
  const now = new Date().toISOString()
  const verificationCode = makeId('rxv').toUpperCase()
  const order = { id: makeId('medorder'), patient_id: patientId, doctor_id: doctorId, consultation_id: clean(body.consultationId, 160) || null, diagnosis: clean(body.diagnosis, 800) || null, patient_age: clean(body.patientAge, 80) || null, pregnancy_status: clean(body.pregnancyStatus, 80) || null, allergies: listFrom(body.allergies), current_medications: listFrom(body.currentMedications), status: clean(body.status, 40) || 'draft', verification_code: verificationCode, verification_url: `/verify-medication-order?code=${encodeURIComponent(verificationCode)}`, expires_at: body.expiresAt || null, issued_at: body.status === 'issued' ? now : null, metadata: body.metadata || {}, created_at: now, updated_at: now }
  const cleanItems = items.map((item) => ({ id: makeId('meditem'), order_id: order.id, medicine_name: clean(item.medicineName || item.medicine_name || item.drugName || item.name, 180), dose: clean(item.dose, 120) || null, route: clean(item.route, 120) || null, frequency: clean(item.frequency, 120) || null, duration: clean(item.duration, 120) || null, quantity: clean(item.quantity, 120) || null, instructions: clean(item.instructions, 1000) || null, allow_substitution: Boolean(item.allowSubstitution), refill_count: Number(item.refillCount || 0), created_at: now })).filter((item) => item.medicine_name)
  if (!cleanItems.length) return jsonError(res, 400, 'At least one medicine name is required.')
  const checkDrafts = buildChecks(items, order.allergies, order.current_medications, order.pregnancy_status, order.patient_age)
  const result = await supabase.from('medication_orders').insert(order).select('*').maybeSingle()
  if (result.error) return jsonError(res, 500, result.error.message, { migrationRequired: 'Run server/phase2-clinical-safety.sql in Supabase.' })
  await supabase.from('medication_order_items').insert(cleanItems)
  const checks = checkDrafts.map((check) => ({ id: makeId('medcheck'), order_id: order.id, check_type: check.checkType, severity: check.severity, message: check.message, item_id: typeof check.itemIndex === 'number' ? cleanItems[check.itemIndex]?.id || null : null, created_at: now }))
  await supabase.from('medication_order_checks').insert(checks)
  await supabase.from('health_passport_events').insert({ id: makeId('hpe'), patient_id: patientId, event_type: 'medication_order', title: 'Medication order created', summary: order.diagnosis || 'Structured medication order added', source_table: 'medication_orders', source_id: order.id, event_at: now, metadata: { doctorId, itemCount: cleanItems.length, warningCount: checks.filter((check) => check.severity !== 'info').length }, created_at: now }).then(() => null, () => null)
  await tryAudit(supabase, { actorId: doctorId, actorType: 'doctor', action: 'medication_order_created', resourceType: 'medication_orders', resourceId: order.id, riskLevel: checks.some((check) => check.severity === 'critical') ? 'critical' : 'high', metadata: { patientId, warningCount: checks.length } })
  return res.status(201).json({ medicationOrder: { ...(result.data || order), items: cleanItems, safetyChecks: checks }, message: 'Medication order saved with safety checks.' })
}

export default async function handler(req, res) {
  const supabase = db()
  if (!supabase) return jsonError(res, 500, 'Supabase is not configured.')
  if (req.method === 'GET') {
    const module = clean(req.query?.module, 80)
    if (module === 'lab_results') return getLabResults(supabase, req, res)
    if (module === 'summaries') return getSummaries(supabase, req, res)
    return getMedicationOrders(supabase, req, res)
  }
  if (req.method === 'POST') {
    const body = req.body || {}
    if (body.module === 'lab_result') return createLabResult(supabase, body, res)
    if (body.module === 'consultation_summary') return createSummary(supabase, body, res)
    return createMedicationOrder(supabase, body, res)
  }
  res.setHeader('Allow', 'GET, POST')
  return jsonError(res, 405, 'Method not allowed.')
}
