import { clean, db, jsonError, makeId, tryAudit } from '../_healthCore.js'

function makePatientCode() {
  return `PHC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

function hashPin(pin) {
  const text = String(pin || '')
  let hash = 0
  for (let index = 0; index < text.length; index += 1) hash = ((hash << 5) - hash) + text.charCodeAt(index)
  return `pin_${Math.abs(hash)}_${text.length}`
}

async function passportEvent(supabase, patientId, patientCode, type, title, summary, table, sourceId) {
  if (!patientId && !patientCode) return null
  return supabase.from('health_passport_events').insert({
    id: makeId('hpe'),
    patient_id: patientId || patientCode,
    event_type: type,
    title,
    summary,
    source_table: table,
    source_id: sourceId,
    event_at: new Date().toISOString(),
    metadata: { patientCode },
    created_at: new Date().toISOString(),
  }).then(() => null, () => null)
}

async function dashboard(supabase, req, res) {
  const facilityId = clean(req.query?.facilityId, 160)
  const patientCode = clean(req.query?.patientCode, 160)
  if (!facilityId && !patientCode) return jsonError(res, 400, 'facilityId or patientCode is required.')
  const patients = supabase.from('phc_patients').select('*').order('created_at', { ascending: false }).limit(50)
  const queue = supabase.from('facility_queue_entries').select('*').order('created_at', { ascending: false }).limit(80)
  const referrals = supabase.from('facility_referrals').select('*').order('created_at', { ascending: false }).limit(80)
  const pharmacy = supabase.from('pharmacy_dispense_records').select('*').order('created_at', { ascending: false }).limit(80)
  const lab = supabase.from('lab_workflow_orders').select('*').order('created_at', { ascending: false }).limit(80)
  if (facilityId) {
    patients.eq('facility_id', facilityId)
    queue.eq('facility_id', facilityId)
    pharmacy.eq('facility_id', facilityId)
    lab.eq('facility_id', facilityId)
  }
  if (patientCode) {
    patients.eq('patient_code', patientCode)
    queue.eq('patient_code', patientCode)
    referrals.eq('patient_code', patientCode)
    pharmacy.eq('patient_code', patientCode)
    lab.eq('patient_code', patientCode)
  }
  const result = await Promise.all([patients, queue, referrals, pharmacy, lab])
  const errors = result.map((item) => item.error).filter(Boolean).map((item) => item.message)
  if (errors.length) return jsonError(res, 500, errors.join(' | '), { migrationRequired: 'Run server/phase3-hospital-phc.sql in Supabase.' })
  return res.json({ phcPatients: result[0].data || [], queue: result[1].data || [], referrals: result[2].data || [], pharmacy: result[3].data || [], labOrders: result[4].data || [] })
}

async function createPatient(supabase, body, res) {
  const fullName = clean(body.fullName || body.name, 180)
  const pin = clean(body.pin, 40)
  if (!fullName || pin.length < 4) return jsonError(res, 400, 'fullName and PIN are required.')
  const now = new Date().toISOString()
  const row = { id: makeId('phcpatient'), patient_code: makePatientCode(), facility_id: clean(body.facilityId, 160) || null, full_name: fullName, phone: clean(body.phone, 80) || null, gender: clean(body.gender, 80) || null, pin_hash: hashPin(pin), consent_given: Boolean(body.consentGiven), notes: clean(body.notes, 2000) || null, created_by_type: clean(body.createdByType, 80) || 'facility', created_by_id: clean(body.createdById, 160) || null, created_at: now, updated_at: now }
  const { data, error } = await supabase.from('phc_patients').insert(row).select('*').maybeSingle()
  if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase3-hospital-phc.sql in Supabase.' })
  await tryAudit(supabase, { actorId: row.created_by_id || row.facility_id || 'facility', actorType: row.created_by_type, action: 'phc_patient_created', resourceType: 'phc_patients', resourceId: row.id, riskLevel: 'medium', metadata: { patientCode: row.patient_code } })
  return res.status(201).json({ phcPatient: data || row, patientCode: row.patient_code, message: 'PHC patient created.' })
}

async function createQueue(supabase, body, res) {
  const facilityId = clean(body.facilityId, 160)
  if (!facilityId) return jsonError(res, 400, 'facilityId is required.')
  const now = new Date().toISOString()
  const row = { id: makeId('queue'), facility_id: facilityId, patient_id: clean(body.patientId, 160) || null, patient_code: clean(body.patientCode, 160) || null, queue_type: clean(body.queueType, 80) || 'triage', priority: clean(body.priority, 80) || 'normal', reason: clean(body.reason, 2000) || null, vitals: body.vitals || {}, assigned_to: clean(body.assignedTo, 160) || null, status: clean(body.status, 80) || 'waiting', checked_in_at: now, metadata: body.metadata || {}, created_at: now, updated_at: now }
  const { data, error } = await supabase.from('facility_queue_entries').insert(row).select('*').maybeSingle()
  if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase3-hospital-phc.sql in Supabase.' })
  await passportEvent(supabase, row.patient_id, row.patient_code, 'facility_queue', `${row.queue_type} queue`, row.reason || row.status, 'facility_queue_entries', row.id)
  return res.status(201).json({ queueEntry: data || row, message: 'Queue entry created.' })
}

async function createReferral(supabase, body, res) {
  const reason = clean(body.reason, 4000)
  if (!reason) return jsonError(res, 400, 'Referral reason is required.')
  const now = new Date().toISOString()
  const row = { id: makeId('referral'), patient_id: clean(body.patientId, 160) || null, patient_code: clean(body.patientCode, 160) || null, from_facility_id: clean(body.fromFacilityId || body.facilityId, 160) || null, to_facility_id: clean(body.toFacilityId, 160) || null, specialty: clean(body.specialty, 180) || null, reason, urgency: clean(body.urgency, 80) || 'routine', status: 'pending', referred_by_type: clean(body.referredByType, 80) || 'facility', referred_by_id: clean(body.referredById, 160) || null, notes: clean(body.notes, 2000) || null, created_at: now, updated_at: now }
  const { data, error } = await supabase.from('facility_referrals').insert(row).select('*').maybeSingle()
  if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase3-hospital-phc.sql in Supabase.' })
  await passportEvent(supabase, row.patient_id, row.patient_code, 'facility_referral', `Referral to ${row.specialty || row.to_facility_id || 'care team'}`, row.reason, 'facility_referrals', row.id)
  return res.status(201).json({ referral: data || row, message: 'Referral created.' })
}

async function createPharmacy(supabase, body, res) {
  const medicineName = clean(body.medicineName, 180)
  if (!medicineName) return jsonError(res, 400, 'medicineName is required.')
  const now = new Date().toISOString()
  const row = { id: makeId('dispense'), facility_id: clean(body.facilityId, 160) || null, patient_id: clean(body.patientId, 160) || null, patient_code: clean(body.patientCode, 160) || null, medication_order_id: clean(body.medicationOrderId, 160) || null, medicine_name: medicineName, quantity: clean(body.quantity, 120) || null, dispensed_by: clean(body.dispensedBy, 160) || null, status: 'dispensed', notes: clean(body.notes, 2000) || null, dispensed_at: now, created_at: now, updated_at: now }
  const { data, error } = await supabase.from('pharmacy_dispense_records').insert(row).select('*').maybeSingle()
  if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase3-hospital-phc.sql in Supabase.' })
  await passportEvent(supabase, row.patient_id, row.patient_code, 'pharmacy_dispense', `Medicine dispensed: ${medicineName}`, row.quantity || row.status, 'pharmacy_dispense_records', row.id)
  return res.status(201).json({ dispenseRecord: data || row, message: 'Pharmacy dispense record saved.' })
}

async function createLab(supabase, body, res) {
  const testName = clean(body.testName, 240)
  if (!testName) return jsonError(res, 400, 'testName is required.')
  const now = new Date().toISOString()
  const row = { id: makeId('labflow'), facility_id: clean(body.facilityId, 160) || null, patient_id: clean(body.patientId, 160) || null, patient_code: clean(body.patientCode, 160) || null, doctor_id: clean(body.doctorId, 160) || null, test_name: testName, specimen_type: clean(body.specimenType, 160) || null, status: clean(body.status, 80) || 'requested', priority: clean(body.priority, 80) || 'routine', requested_by: clean(body.requestedBy, 160) || null, notes: clean(body.notes, 2000) || null, created_at: now, updated_at: now }
  const { data, error } = await supabase.from('lab_workflow_orders').insert(row).select('*').maybeSingle()
  if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase3-hospital-phc.sql in Supabase.' })
  await passportEvent(supabase, row.patient_id, row.patient_code, 'lab_workflow', `Lab workflow: ${testName}`, row.status, 'lab_workflow_orders', row.id)
  return res.status(201).json({ labWorkflow: data || row, message: 'Lab workflow record saved.' })
}

export default async function handler(req, res) {
  const supabase = db()
  if (!supabase) return jsonError(res, 500, 'Supabase is not configured.')
  if (req.method === 'GET') return dashboard(supabase, req, res)
  if (req.method === 'POST') {
    const body = req.body || {}
    if (body.module === 'phc_patient') return createPatient(supabase, body, res)
    if (body.module === 'queue') return createQueue(supabase, body, res)
    if (body.module === 'referral') return createReferral(supabase, body, res)
    if (body.module === 'pharmacy') return createPharmacy(supabase, body, res)
    if (body.module === 'lab_workflow') return createLab(supabase, body, res)
    return jsonError(res, 400, 'Unknown module.')
  }
  res.setHeader('Allow', 'GET, POST')
  return jsonError(res, 405, 'Method not allowed.')
}
