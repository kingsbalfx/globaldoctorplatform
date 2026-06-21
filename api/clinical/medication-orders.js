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
  const group = (rowsToGroup = [], key = 'order_id') => rowsToGroup.reduce((acc, row) => {
    if (!acc[row[key]]) acc[row[key]] = []
    acc[row[key]].push(row)
    return acc
  }, {})
  const groupedItems = group(itemsResult.data || [])
  const groupedChecks = group(checksResult.data || [])
  return rows.map((order) => ({ ...order, items: groupedItems[order.id] || [], safetyChecks: groupedChecks[order.id] || [] }))
}

export default async function handler(req, res) {
  const supabase = db()
  if (!supabase) return jsonError(res, 500, 'Supabase is not configured.')

  if (req.method === 'GET') {
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

  if (req.method === 'POST') {
    const body = req.body || {}
    const patientId = clean(body.patientId, 160)
    const doctorId = clean(body.doctorId, 160)
    const items = Array.isArray(body.items) ? body.items : []
    if (!patientId || !doctorId || items.length === 0) return jsonError(res, 400, 'patientId, doctorId, and at least one medicine item are required.')
    const now = new Date().toISOString()
    const verificationCode = makeId('rxv').toUpperCase()
    const order = {
      id: makeId('medorder'),
      patient_id: patientId,
      doctor_id: doctorId,
      consultation_id: clean(body.consultationId, 160) || null,
      diagnosis: clean(body.diagnosis, 800) || null,
      patient_age: clean(body.patientAge, 80) || null,
      pregnancy_status: clean(body.pregnancyStatus, 80) || null,
      allergies: listFrom(body.allergies),
      current_medications: listFrom(body.currentMedications),
      status: clean(body.status, 40) || 'draft',
      verification_code: verificationCode,
      verification_url: `/verify-medication-order?code=${encodeURIComponent(verificationCode)}`,
      expires_at: body.expiresAt || null,
      issued_at: body.status === 'issued' ? now : null,
      metadata: body.metadata || {},
      created_at: now,
      updated_at: now,
    }
    const cleanItems = items.map((item) => ({
      id: makeId('meditem'),
      order_id: order.id,
      medicine_name: clean(item.medicineName || item.medicine_name || item.drugName || item.name, 180),
      dose: clean(item.dose, 120) || null,
      route: clean(item.route, 120) || null,
      frequency: clean(item.frequency, 120) || null,
      duration: clean(item.duration, 120) || null,
      quantity: clean(item.quantity, 120) || null,
      instructions: clean(item.instructions, 1000) || null,
      allow_substitution: Boolean(item.allowSubstitution),
      refill_count: Number(item.refillCount || 0),
      created_at: now,
    })).filter((item) => item.medicine_name)
    if (!cleanItems.length) return jsonError(res, 400, 'At least one medicine name is required.')

    const checkDrafts = buildChecks(items, order.allergies, order.current_medications, order.pregnancy_status, order.patient_age)
    const { data, error } = await supabase.from('medication_orders').insert(order).select('*').maybeSingle()
    if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase2-clinical-safety.sql in Supabase.' })
    await supabase.from('medication_order_items').insert(cleanItems)
    const checks = checkDrafts.map((check) => ({
      id: makeId('medcheck'),
      order_id: order.id,
      check_type: check.checkType,
      severity: check.severity,
      message: check.message,
      item_id: typeof check.itemIndex === 'number' ? cleanItems[check.itemIndex]?.id || null : null,
      created_at: now,
    }))
    await supabase.from('medication_order_checks').insert(checks)
    await supabase.from('health_passport_events').insert({ id: makeId('hpe'), patient_id: patientId, event_type: 'medication_order', title: 'Medication order created', summary: order.diagnosis || 'Structured medication order added', source_table: 'medication_orders', source_id: order.id, event_at: now, metadata: { doctorId, itemCount: cleanItems.length, warningCount: checks.filter((check) => check.severity !== 'info').length }, created_at: now }).then(() => null, () => null)
    await tryAudit(supabase, { actorId: doctorId, actorType: 'doctor', action: 'medication_order_created', resourceType: 'medication_orders', resourceId: order.id, riskLevel: checks.some((check) => check.severity === 'critical') ? 'critical' : 'high', metadata: { patientId, warningCount: checks.length } })
    return res.status(201).json({ medicationOrder: { ...(data || order), items: cleanItems, safetyChecks: checks }, message: 'Medication order saved with safety checks.' })
  }

  res.setHeader('Allow', 'GET, POST')
  return jsonError(res, 405, 'Method not allowed.')
}
