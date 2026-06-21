import crypto from 'crypto'
import { clean, db, jsonError, makeId, tryAudit } from '../_healthCore.js'

function hashPin(pin) {
  return crypto.createHash('sha256').update(String(pin || '')).digest('hex')
}

function makePatientCode() {
  const stamp = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `PHC-${stamp}-${rand}`
}

async function createPassportEvent(supabase, patientId, patientCode, eventType, title, summary, sourceTable, sourceId, metadata = {}) {
  if (!patientId && !patientCode) return null
  return supabase.from('health_passport_events').insert({
    id: makeId('hpe'),
    patient_id: patientId || patientCode,
    event_type: eventType,
    title,
    summary,
    source_table: sourceTable,
    source_id: sourceId,
    event_at: new Date().toISOString(),
    metadata: { patientCode, ...metadata },
    created_at: new Date().toISOString(),
  }).then(() => null, () => null)
}

async function loadDashboard(supabase, req, res) {
  const facilityId = clean(req.query?.facilityId, 160)
  const patientCode = clean(req.query?.patientCode, 160)
  if (!facilityId && !patientCode) return jsonError(res, 400, 'facilityId or patientCode is required.')

  const patientsQuery = supabase.from('phc_patients').select('*').order('created_at', { ascending: false }).limit(50)
  const queueQuery = supabase.from('facility_queue_entries').select('*').order('created_at', { ascending: false }).limit(80)
  const referralQuery = supabase.from('facility_referrals').select('*').order('created_at', { ascending: false }).limit(80)
  const pharmacyQuery = supabase.from('pharmacy_dispense_records').select('*').order('created_at', { ascending: false }).limit(80)
  const labQuery = supabase.from('lab_workflow_orders').select('*').order('created_at', { ascending: false }).limit(80)

  if (facilityId) {
    patientsQuery.eq('facility_id', facilityId)
    queueQuery.eq('facility_id', facilityId)
    referralQuery.or(`from_facility_id.eq.${facilityId},to_facility_id.eq.${facilityId}`)
    pharmacyQuery.eq('facility_id', facilityId)
    labQuery.eq('facility_id', facilityId)
  }
  if (patientCode) {
    patientsQuery.eq('patient_code', patientCode)
    queueQuery.eq('patient_code', patientCode)
    referralQuery.eq('patient_code', patientCode)
    pharmacyQuery.eq('patient_code', patientCode)
    labQuery.eq('patient_code', patientCode)
  }

  const [patients, queue, referrals, pharmacy, labOrders] = await Promise.all([patientsQuery, queueQuery, referralQuery, pharmacyQuery, labQuery])
  const errors = [patients.error, queue.error, referrals.error, pharmacy.error, labOrders.error].filter(Boolean).map((error) => error.message)
  if (errors.length) return jsonError(res, 500, errors.join(' | '), { migrationRequired: 'Run server/phase3-hospital-phc.sql in Supabase.' })

  return res.json({
    phcPatients: patients.data || [],
    queue: queue.data || [],
    referrals: referrals.data || [],
    pharmacy: pharmacy.data || [],
    labOrders: labOrders.data || [],
  })
}

async function createPhcPatient(supabase, body, res) {
  const fullName = clean(body.fullName || body.name, 180)
  const pin = clean(body.pin, 40)
  if (!fullName || pin.length < 4) return jsonError(res, 400, 'fullName and a PIN of at least 4 characters are required.')
  const now = new Date().toISOString()
  const row = {
    id: makeId('phcpatient'),
    patient_code: makePatientCode(),
    facility_id: clean(body.facilityId, 160) || null,
    full_name: fullName,
    phone: clean(body.phone, 80) || null,
    email: clean(body.email, 180) || null,
    date_of_birth: clean(body.dateOfBirth, 80) || null,
    gender: clean(body.gender, 80) || null,
    pin_hash: hashPin(pin),
    consent_given: Boolean(body.consentGiven),
    emergency_contact: clean(body.emergencyContact, 240) || null,
    notes: clean(body.notes, 2000) || null,
    created_by_type: clean(body.createdByType, 80) || 'facility',
    created_by_id: clean(body.createdById, 160) || null,
    created_at: now,
    updated_at: now,
  }
  const { data, error } = await supabase.from('phc_patients').insert(row).select('*').maybeSingle()
  if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase3-hospital-phc.sql in Supabase.' })
  await tryAudit(supabase, { actorId: row.created_by_id || row.facility_id || 'facility', actorType: row.created_by_type, action: 'phc_patient_created', resourceType: 'phc_patients', resourceId: row.id, riskLevel: 'medium', metadata: { patientCode: row.patient_code, facilityId: row.facility_id } })
  return res.status(201).json({ phcPatient: data || row, patientCode: row.patient_code, message: 'PHC patient created. Give the patient their Patient Code and PIN.' })
}

async function createQueueEntry(supabase, body, res) {
  const facilityId = clean(body.facilityId, 160)
  if (!facilityId) return jsonError(res, 400, 'facilityId is required.')
  const now = new Date().toISOString()
  const row = {
    id: makeId('queue'),
    facility_id: facilityId,
    patient_id: clean(body.patientId, 160) || null,
    patient_code: clean(body.patientCode, 160) || null,
    queue_type: clean(body.queueType, 80) || 'triage',
    priority: clean(body.priority, 80) || 'normal',
    reason: clean(body.reason, 2000) || null,
    vitals: body.vitals || {},
    assigned_to: clean(body.assignedTo, 160) || null,
    status: clean(body.status, 80) || 'waiting',
    checked_in_at: now,
    metadata: body.metadata || {},
    created_at: now,
    updated_at: now,
  }
  const { data, error } = await supabase.from('facility_queue_entries').insert(row).select('*').maybeSingle()
  if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase3-hospital-phc.sql in Supabase.' })
  await createPassportEvent(supabase, row.patient_id, row.patient_code, 'facility_queue', `${row.queue_type} queue`, row.reason || row.status, 'facility_queue_entries', row.id, { facilityId })
  await tryAudit(supabase, { actorId: clean(body.actorId, 160) || facilityId, actorType: clean(body.actorType, 80) || 'facility', action: 'facility_queue_created', resourceType: 'facility_queue_entries', resourceId: row.id, riskLevel: row.priority === 'urgent' ? 'high' : 'medium', metadata: { patientCode: row.patient_code, queueType: row.queue_type } })
  return res.status(201).json({ queueEntry: data || row, message: 'Queue entry created.' })
}

async function createReferral(supabase, body, res) {
  const reason = clean(body.reason, 4000)
  if (!reason) return jsonError(res, 400, 'Referral reason is required.')
  const now = new Date().toISOString()
  const row = {
    id: makeId('referral'),
    patient_id: clean(body.patientId, 160) || null,
    patient_code: clean(body.patientCode, 160) || null,
    from_facility_id: clean(body.fromFacilityId || body.facilityId, 160) || null,
    to_facility_id: clean(body.toFacilityId, 160) || null,
    specialty: clean(body.specialty, 180) || null,
    reason,
    urgency: clean(body.urgency, 80) || 'routine',
    status: clean(body.status, 80) || 'pending',
    referred_by_type: clean(body.referredByType, 80) || 'facility',
    referred_by_id: clean(body.referredById, 160) || null,
    notes: clean(body.notes, 2000) || null,
    created_at: now,
    updated_at: now,
  }
  const { data, error } = await supabase.from('facility_referrals').insert(row).select('*').maybeSingle()
  if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase3-hospital-phc.sql in Supabase.' })
  await createPassportEvent(supabase, row.patient_id, row.patient_code, 'facility_referral', `Referral to ${row.specialty || row.to_facility_id || 'care team'}`, row.reason, 'facility_referrals', row.id, { urgency: row.urgency })
  await tryAudit(supabase, { actorId: row.referred_by_id || row.from_facility_id || 'facility', actorType: row.referred_by_type, action: 'facility_referral_created', resourceType: 'facility_referrals', resourceId: row.id, riskLevel: row.urgency === 'urgent' ? 'high' : 'medium', metadata: { patientCode: row.patient_code, specialty: row.specialty } })
  return res.status(201).json({ referral: data || row, message: 'Referral created.' })
}

async function createPharmacyRecord(supabase, body, res) {
  const medicineName = clean(body.medicineName, 180)
  if (!medicineName) return jsonError(res, 400, 'medicineName is required.')
  const now = new Date().toISOString()
  const row = {
    id: makeId('dispense'),
    facility_id: clean(body.facilityId, 160) || null,
    patient_id: clean(body.patientId, 160) || null,
    patient_code: clean(body.patientCode, 160) || null,
    medication_order_id: clean(body.medicationOrderId, 160) || null,
    medicine_name: medicineName,
    quantity: clean(body.quantity, 120) || null,
    dispensed_by: clean(body.dispensedBy, 160) || null,
    status: clean(body.status, 80) || 'dispensed',
    notes: clean(body.notes, 2000) || null,
    dispensed_at: now,
    created_at: now,
    updated_at: now,
  }
  const { data, error } = await supabase.from('pharmacy_dispense_records').insert(row).select('*').maybeSingle()
  if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase3-hospital-phc.sql in Supabase.' })
  await createPassportEvent(supabase, row.patient_id, row.patient_code, 'pharmacy_dispense', `Medicine dispensed: ${medicineName}`, row.quantity || row.status, 'pharmacy_dispense_records', row.id, { facilityId: row.facility_id })
  await tryAudit(supabase, { actorId: row.dispensed_by || row.facility_id || 'pharmacy', actorType: 'pharmacy', action: 'medicine_dispensed', resourceType: 'pharmacy_dispense_records', resourceId: row.id, riskLevel: 'medium', metadata: { patientCode: row.patient_code, medicineName } })
  return res.status(201).json({ dispenseRecord: data || row, message: 'Pharmacy dispense record saved.' })
}

async function createLabWorkflow(supabase, body, res) {
  const testName = clean(body.testName, 240)
  if (!testName) return jsonError(res, 400, 'testName is required.')
  const now = new Date().toISOString()
  const row = {
    id: makeId('labflow'),
    facility_id: clean(body.facilityId, 160) || null,
    patient_id: clean(body.patientId, 160) || null,
    patient_code: clean(body.patientCode, 160) || null,
    doctor_id: clean(body.doctorId, 160) || null,
    test_name: testName,
    specimen_type: clean(body.specimenType, 160) || null,
    status: clean(body.status, 80) || 'requested',
    priority: clean(body.priority, 80) || 'routine',
    requested_by: clean(body.requestedBy, 160) || null,
    notes: clean(body.notes, 2000) || null,
    created_at: now,
    updated_at: now,
  }
  if (row.status === 'collected') row.collected_at = now
  const { data, error } = await supabase.from('lab_workflow_orders').insert(row).select('*').maybeSingle()
  if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase3-hospital-phc.sql in Supabase.' })
  await createPassportEvent(supabase, row.patient_id, row.patient_code, 'lab_workflow', `Lab workflow: ${testName}`, row.status, 'lab_workflow_orders', row.id, { facilityId: row.facility_id, priority: row.priority })
  await tryAudit(supabase, { actorId: row.requested_by || row.facility_id || 'lab', actorType: 'lab', action: 'lab_workflow_created', resourceType: 'lab_workflow_orders', resourceId: row.id, riskLevel: row.priority === 'urgent' ? 'high' : 'medium', metadata: { patientCode: row.patient_code, testName } })
  return res.status(201).json({ labWorkflow: data || row, message: 'Lab workflow record saved.' })
}

export default async function handler(req, res) {
  const supabase = db()
  if (!supabase) return jsonError(res, 500, 'Supabase is not configured.')

  if (req.method === 'GET') return loadDashboard(supabase, req, res)

  if (req.method === 'POST') {
    const body = req.body || {}
    const module = clean(body.module, 80)
    if (module === 'phc_patient') return createPhcPatient(supabase, body, res)
    if (module === 'queue') return createQueueEntry(supabase, body, res)
    if (module === 'referral') return createReferral(supabase, body, res)
    if (module === 'pharmacy') return createPharmacyRecord(supabase, body, res)
    if (module === 'lab_workflow') return createLabWorkflow(supabase, body, res)
    return jsonError(res, 400, 'Unknown Phase 3 module.')
  }

  res.setHeader('Allow', 'GET, POST')
  return jsonError(res, 405, 'Method not allowed.')
}
