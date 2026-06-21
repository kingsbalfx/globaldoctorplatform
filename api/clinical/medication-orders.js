import { clean, db, jsonError, makeId, tryAudit } from '../_healthCore.js'

function listFrom(value) {
  if (Array.isArray(value)) return value.map((item) => clean(item, 160)).filter(Boolean)
  return String(value || '').split(',').map((item) => clean(item, 160)).filter(Boolean)
}

function medicineName(item) {
  return clean(item?.medicineName || item?.medicine_name || item?.drugName || item?.name, 180)
}

function patientCode() {
  return `PHC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

function pinHash(pin) {
  const text = String(pin || '')
  let hash = 0
  for (let i = 0; i < text.length; i += 1) hash = ((hash << 5) - hash) + text.charCodeAt(i)
  return `pin_${Math.abs(hash)}_${text.length}`
}

function buildChecks(items, allergies, currentMeds, pregnancyStatus, patientAge) {
  const checks = []
  const allergyText = allergies.join(' ').toLowerCase()
  const current = currentMeds.map((item) => item.toLowerCase())
  const names = items.map((item) => medicineName(item).toLowerCase()).filter(Boolean)
  items.forEach((item, index) => {
    const name = medicineName(item)
    const lower = name.toLowerCase()
    if (!name) return
    if (allergyText && allergyText.includes(lower)) checks.push({ checkType: 'allergy_match', severity: 'critical', message: `${name} appears to match a recorded allergy. Clinician must review before issuing.`, itemIndex: index })
    if (current.includes(lower)) checks.push({ checkType: 'duplicate_current_medicine', severity: 'warning', message: `${name} also appears in current medicines. Confirm duplication is intended.`, itemIndex: index })
    if (!clean(item.dose, 120)) checks.push({ checkType: 'missing_dose', severity: 'warning', message: `${name} has no dose entered.`, itemIndex: index })
    if (!clean(item.frequency, 120)) checks.push({ checkType: 'missing_frequency', severity: 'warning', message: `${name} has no frequency entered.`, itemIndex: index })
  })
  Array.from(new Set(names.filter((name, index) => names.indexOf(name) !== index))).forEach((name) => checks.push({ checkType: 'duplicate_order_item', severity: 'warning', message: `${name} appears more than once in this order.` }))
  if (String(pregnancyStatus || '').toLowerCase().includes('preg')) checks.push({ checkType: 'pregnancy_review', severity: 'warning', message: 'Pregnancy status was marked. A licensed clinician must confirm medicine safety before issuing.' })
  const ageNumber = Number(patientAge)
  if (ageNumber > 0 && ageNumber < 12) checks.push({ checkType: 'pediatric_review', severity: 'warning', message: 'Patient age appears pediatric. Confirm age/weight-based dosing before issuing.' })
  if (!checks.length) checks.push({ checkType: 'basic_completeness', severity: 'info', message: 'No basic warning detected. This is not a full drug interaction engine.' })
  return checks
}

function buildPatientSummary(body) {
  const rows = [['Main issue', body.diagnosis], ['Treatment', body.treatmentGiven], ['Medicines', body.medicationSummary], ['Tests/labs', body.labSummary], ['Follow-up', body.followUpPlan], ['Urgent warning signs', body.redFlags]]
  return rows.map(([label, value]) => clean(value, 1200) ? `${label}: ${clean(value, 1200)}` : '').filter(Boolean).join('\n') || 'Your consultation summary is ready. Follow your clinician instructions and seek urgent care if symptoms worsen.'
}

async function passportEvent(supabase, patientId, code, type, title, summary, table, id) {
  if (!patientId && !code) return null
  return supabase.from('health_passport_events').insert({ id: makeId('hpe'), patient_id: patientId || code, event_type: type, title, summary, source_table: table, source_id: id, event_at: new Date().toISOString(), metadata: { patientCode: code }, created_at: new Date().toISOString() }).then(() => null, () => null)
}

async function hydrateOrders(supabase, rows) {
  const orders = Array.isArray(rows) ? rows : []
  if (!orders.length) return orders
  const ids = orders.map((order) => order.id)
  const [items, checks] = await Promise.all([
    supabase.from('medication_order_items').select('*').in('order_id', ids).order('created_at', { ascending: true }),
    supabase.from('medication_order_checks').select('*').in('order_id', ids).order('created_at', { ascending: true }),
  ])
  const group = (values = []) => values.reduce((acc, row) => { if (!acc[row.order_id]) acc[row.order_id] = []; acc[row.order_id].push(row); return acc }, {})
  const itemMap = group(items.data || [])
  const checkMap = group(checks.data || [])
  return orders.map((order) => ({ ...order, items: itemMap[order.id] || [], safetyChecks: checkMap[order.id] || [] }))
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
  return res.json({ medicationOrders: await hydrateOrders(supabase, data || []) })
}

async function getSimpleTable(supabase, req, res, table, key) {
  const patientId = clean(req.query?.patientId, 160)
  const code = clean(req.query?.patientCode, 160)
  const facilityId = clean(req.query?.facilityId, 160)
  let query = supabase.from(table).select('*').order('created_at', { ascending: false }).limit(80)
  if (patientId) query = query.eq('patient_id', patientId)
  if (code) query = query.eq('patient_code', code)
  if (facilityId && ['phc_patients', 'facility_queue_entries', 'pharmacy_dispense_records', 'lab_workflow_orders'].includes(table)) query = query.eq('facility_id', facilityId)
  const { data, error } = await query
  if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run phase migrations in Supabase.' })
  return res.json({ [key]: data || [] })
}

async function getOperations(supabase, req, res) {
  const facilityId = clean(req.query?.facilityId, 160)
  const code = clean(req.query?.patientCode, 160)
  if (!facilityId && !code) return jsonError(res, 400, 'facilityId or patientCode is required.')
  const tables = ['phc_patients', 'facility_queue_entries', 'facility_referrals', 'pharmacy_dispense_records', 'lab_workflow_orders']
  const queries = tables.map((table) => {
    const q = supabase.from(table).select('*').order('created_at', { ascending: false }).limit(80)
    if (facilityId && table !== 'facility_referrals') q.eq('facility_id', facilityId)
    if (code) q.eq('patient_code', code)
    return q
  })
  const [patients, queue, referrals, pharmacy, labOrders] = await Promise.all(queries)
  const errors = [patients.error, queue.error, referrals.error, pharmacy.error, labOrders.error].filter(Boolean).map((error) => error.message)
  if (errors.length) return jsonError(res, 500, errors.join(' | '), { migrationRequired: 'Run server/phase3-hospital-phc.sql in Supabase.' })
  return res.json({ phcPatients: patients.data || [], queue: queue.data || [], referrals: referrals.data || [], pharmacy: pharmacy.data || [], labOrders: labOrders.data || [] })
}

async function createMedicationOrder(supabase, body, res) {
  const patientId = clean(body.patientId, 160)
  const doctorId = clean(body.doctorId, 160)
  const items = Array.isArray(body.items) ? body.items : []
  if (!patientId || !doctorId || !items.length) return jsonError(res, 400, 'patientId, doctorId, and at least one medicine item are required.')
  const now = new Date().toISOString()
  const verificationCode = makeId('rxv').toUpperCase()
  const order = { id: makeId('medorder'), patient_id: patientId, doctor_id: doctorId, consultation_id: clean(body.consultationId, 160) || null, diagnosis: clean(body.diagnosis, 800) || null, patient_age: clean(body.patientAge, 80) || null, pregnancy_status: clean(body.pregnancyStatus, 80) || null, allergies: listFrom(body.allergies), current_medications: listFrom(body.currentMedications), status: clean(body.status, 40) || 'draft', verification_code: verificationCode, verification_url: `/verify-medication-order?code=${encodeURIComponent(verificationCode)}`, expires_at: body.expiresAt || null, issued_at: body.status === 'issued' ? now : null, metadata: body.metadata || {}, created_at: now, updated_at: now }
  const cleanItems = items.map((item) => ({ id: makeId('meditem'), order_id: order.id, medicine_name: medicineName(item), dose: clean(item.dose, 120) || null, route: clean(item.route, 120) || null, frequency: clean(item.frequency, 120) || null, duration: clean(item.duration, 120) || null, quantity: clean(item.quantity, 120) || null, instructions: clean(item.instructions, 1000) || null, allow_substitution: Boolean(item.allowSubstitution), refill_count: Number(item.refillCount || 0), created_at: now })).filter((item) => item.medicine_name)
  if (!cleanItems.length) return jsonError(res, 400, 'At least one medicine name is required.')
  const checkDrafts = buildChecks(items, order.allergies, order.current_medications, order.pregnancy_status, order.patient_age)
  const result = await supabase.from('medication_orders').insert(order).select('*').maybeSingle()
  if (result.error) return jsonError(res, 500, result.error.message, { migrationRequired: 'Run server/phase2-clinical-safety.sql in Supabase.' })
  await supabase.from('medication_order_items').insert(cleanItems)
  const checks = checkDrafts.map((check) => ({ id: makeId('medcheck'), order_id: order.id, check_type: check.checkType, severity: check.severity, message: check.message, item_id: typeof check.itemIndex === 'number' ? cleanItems[check.itemIndex]?.id || null : null, created_at: now }))
  await supabase.from('medication_order_checks').insert(checks)
  await passportEvent(supabase, patientId, null, 'medication_order', 'Medication order created', order.diagnosis || 'Structured medication order added', 'medication_orders', order.id)
  await tryAudit(supabase, { actorId: doctorId, actorType: 'doctor', action: 'medication_order_created', resourceType: 'medication_orders', resourceId: order.id, riskLevel: checks.some((check) => check.severity === 'critical') ? 'critical' : 'high', metadata: { patientId, warningCount: checks.length } })
  return res.status(201).json({ medicationOrder: { ...(result.data || order), items: cleanItems, safetyChecks: checks }, message: 'Medication order saved with safety checks.' })
}

async function createLabResult(supabase, body, res) {
  const patientId = clean(body.patientId, 160)
  const testName = clean(body.testName, 240)
  if (!patientId || !testName) return jsonError(res, 400, 'patientId and testName are required.')
  const now = new Date().toISOString()
  const row = { id: makeId('labres'), patient_id: patientId, doctor_id: clean(body.doctorId, 160) || null, lab_order_id: clean(body.labOrderId, 160) || null, test_name: testName, result_text: clean(body.resultText, 8000) || null, abnormal_flag: Boolean(body.abnormalFlag), critical_flag: Boolean(body.criticalFlag), status: 'uploaded', uploaded_by_type: clean(body.uploadedByType, 80) || 'facility', uploaded_by_id: clean(body.uploadedById, 160) || null, metadata: body.metadata || {}, created_at: now, updated_at: now }
  const { data, error } = await supabase.from('lab_results').insert(row).select('*').maybeSingle()
  if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase2-clinical-safety.sql in Supabase.' })
  await passportEvent(supabase, patientId, null, row.critical_flag ? 'critical_lab_result' : row.abnormal_flag ? 'abnormal_lab_result' : 'lab_result', row.test_name, row.result_text || 'Lab result uploaded', 'lab_results', row.id)
  return res.status(201).json({ labResult: data || row, message: 'Lab result saved.' })
}

async function createSummary(supabase, body, res) {
  const patientId = clean(body.patientId, 160)
  const doctorId = clean(body.doctorId, 160)
  if (!patientId || !doctorId) return jsonError(res, 400, 'patientId and doctorId are required.')
  const now = new Date().toISOString()
  const status = clean(body.status, 40) || 'draft'
  const row = { id: makeId('summary'), consultation_id: clean(body.consultationId, 160) || null, patient_id: patientId, doctor_id: doctorId, diagnosis: clean(body.diagnosis, 1000) || null, treatment_given: clean(body.treatmentGiven, 4000) || null, medication_summary: clean(body.medicationSummary, 4000) || null, lab_summary: clean(body.labSummary, 4000) || null, follow_up_plan: clean(body.followUpPlan, 4000) || null, red_flags: clean(body.redFlags, 4000) || null, patient_friendly_summary: clean(body.patientFriendlySummary, 8000) || buildPatientSummary(body), status, finalized_at: status === 'final' ? now : null, metadata: body.metadata || {}, created_at: now, updated_at: now }
  const { data, error } = await supabase.from('consultation_summaries').insert(row).select('*').maybeSingle()
  if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase2-clinical-safety.sql in Supabase.' })
  await passportEvent(supabase, patientId, null, status === 'final' ? 'final_consultation_summary' : 'consultation_summary', row.diagnosis ? `Consultation summary: ${row.diagnosis}` : 'Consultation summary', row.patient_friendly_summary, 'consultation_summaries', row.id)
  return res.status(201).json({ summary: data || row, message: 'Consultation summary saved.' })
}

async function createPhcPatient(supabase, body, res) {
  const fullName = clean(body.fullName || body.name, 180)
  const pin = clean(body.pin, 40)
  if (!fullName || pin.length < 4) return jsonError(res, 400, 'fullName and PIN are required.')
  const now = new Date().toISOString()
  const row = { id: makeId('phcpatient'), patient_code: patientCode(), facility_id: clean(body.facilityId, 160) || null, full_name: fullName, phone: clean(body.phone, 80) || null, gender: clean(body.gender, 80) || null, pin_hash: pinHash(pin), consent_given: Boolean(body.consentGiven), notes: clean(body.notes, 2000) || null, created_by_type: clean(body.createdByType, 80) || 'facility', created_by_id: clean(body.createdById, 160) || null, created_at: now, updated_at: now }
  const { data, error } = await supabase.from('phc_patients').insert(row).select('*').maybeSingle()
  if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase3-hospital-phc.sql in Supabase.' })
  await tryAudit(supabase, { actorId: row.created_by_id || row.facility_id || 'facility', actorType: row.created_by_type, action: 'phc_patient_created', resourceType: 'phc_patients', resourceId: row.id, riskLevel: 'medium', metadata: { patientCode: row.patient_code } })
  return res.status(201).json({ phcPatient: data || row, patientCode: row.patient_code, message: 'PHC patient created.' })
}

async function createOperationRow(supabase, body, res, table, row, responseKey, eventType, title) {
  const { data, error } = await supabase.from(table).insert(row).select('*').maybeSingle()
  if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase3-hospital-phc.sql in Supabase.' })
  await passportEvent(supabase, row.patient_id, row.patient_code, eventType, title, row.reason || row.status || row.quantity || row.test_name || '', table, row.id)
  return res.status(201).json({ [responseKey]: data || row, message: `${title} saved.` })
}

async function createPhase3Operation(supabase, body, res) {
  const now = new Date().toISOString()
  if (body.module === 'queue') return createOperationRow(supabase, body, res, 'facility_queue_entries', { id: makeId('queue'), facility_id: clean(body.facilityId, 160), patient_id: clean(body.patientId, 160) || null, patient_code: clean(body.patientCode, 160) || null, queue_type: clean(body.queueType, 80) || 'triage', priority: clean(body.priority, 80) || 'normal', reason: clean(body.reason, 2000) || null, vitals: body.vitals || {}, status: 'waiting', checked_in_at: now, metadata: body.metadata || {}, created_at: now, updated_at: now }, 'queueEntry', 'facility_queue', 'Queue entry')
  if (body.module === 'referral') return createOperationRow(supabase, body, res, 'facility_referrals', { id: makeId('referral'), patient_id: clean(body.patientId, 160) || null, patient_code: clean(body.patientCode, 160) || null, from_facility_id: clean(body.fromFacilityId || body.facilityId, 160) || null, to_facility_id: clean(body.toFacilityId, 160) || null, specialty: clean(body.specialty, 180) || null, reason: clean(body.reason, 4000), urgency: clean(body.urgency, 80) || 'routine', status: 'pending', referred_by_type: 'facility', created_at: now, updated_at: now }, 'referral', 'facility_referral', 'Referral')
  if (body.module === 'pharmacy') return createOperationRow(supabase, body, res, 'pharmacy_dispense_records', { id: makeId('dispense'), facility_id: clean(body.facilityId, 160) || null, patient_id: clean(body.patientId, 160) || null, patient_code: clean(body.patientCode, 160) || null, medication_order_id: clean(body.medicationOrderId, 160) || null, medicine_name: clean(body.medicineName, 180), quantity: clean(body.quantity, 120) || null, status: 'dispensed', dispensed_at: now, created_at: now, updated_at: now }, 'dispenseRecord', 'pharmacy_dispense', 'Pharmacy dispense')
  if (body.module === 'lab_workflow') return createOperationRow(supabase, body, res, 'lab_workflow_orders', { id: makeId('labflow'), facility_id: clean(body.facilityId, 160) || null, patient_id: clean(body.patientId, 160) || null, patient_code: clean(body.patientCode, 160) || null, doctor_id: clean(body.doctorId, 160) || null, test_name: clean(body.testName, 240), specimen_type: clean(body.specimenType, 160) || null, status: clean(body.status, 80) || 'requested', priority: clean(body.priority, 80) || 'routine', created_at: now, updated_at: now }, 'labWorkflow', 'lab_workflow', 'Lab workflow')
  return jsonError(res, 400, 'Unknown module.')
}

export default async function handler(req, res) {
  const supabase = db()
  if (!supabase) return jsonError(res, 500, 'Supabase is not configured.')
  if (req.method === 'GET') {
    const module = clean(req.query?.module, 80)
    if (module === 'lab_results') return getSimpleTable(supabase, req, res, 'lab_results', 'labResults')
    if (module === 'summaries') return getSimpleTable(supabase, req, res, 'consultation_summaries', 'summaries')
    if (module === 'operations') return getOperations(supabase, req, res)
    return getMedicationOrders(supabase, req, res)
  }
  if (req.method === 'POST') {
    const body = req.body || {}
    if (body.module === 'lab_result') return createLabResult(supabase, body, res)
    if (body.module === 'consultation_summary') return createSummary(supabase, body, res)
    if (body.module === 'phc_patient') return createPhcPatient(supabase, body, res)
    if (['queue', 'referral', 'pharmacy', 'lab_workflow'].includes(body.module)) return createPhase3Operation(supabase, body, res)
    return createMedicationOrder(supabase, body, res)
  }
  res.setHeader('Allow', 'GET, POST')
  return jsonError(res, 405, 'Method not allowed.')
}
