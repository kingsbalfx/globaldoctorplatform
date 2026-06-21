import { clean, db, jsonError, safeSelect, tryAudit } from '../_healthCore.js'

function normalizeTimelineItem(item) {
  return {
    id: item.id,
    type: item.event_type || item.type || 'event',
    title: item.title || item.subject || item.file_name || item.original_filename || item.status || 'Health event',
    summary: item.summary || item.complaint || item.description || item.diagnosis || item.notes || '',
    at: item.event_at || item.created_at || item.updated_at || item.scheduled_date || item.scheduledDate || new Date().toISOString(),
    source: item.source_table || item.source || '',
    metadata: item.metadata || {},
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return jsonError(res, 405, 'Method not allowed.')
  }

  const supabase = db()
  if (!supabase) return jsonError(res, 500, 'Supabase is not configured.')

  const patientId = clean(req.query?.patientId, 160)
  if (!patientId) return jsonError(res, 400, 'patientId is required.')

  const [patientResult, consultationsResult, filesResult, prescriptionsResult, labsResult, consentsResult, carePlansResult, notesResult, eventsResult, triageResult] = await Promise.all([
    safeSelect(supabase, 'patients', (q) => q.select('id,name,email,phone,country,gender,date_of_birth,language_preference,medical_history,allergies,current_medications,chronic_conditions,created_at').eq('id', patientId).maybeSingle(), null),
    safeSelect(supabase, 'consultations', (q) => q.select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(20)),
    safeSelect(supabase, 'files', (q) => q.select('*').eq('uploaded_by', patientId).order('created_at', { ascending: false }).limit(20)),
    safeSelect(supabase, 'prescriptions', (q) => q.select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(20)),
    safeSelect(supabase, 'lab_orders', (q) => q.select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(20)),
    safeSelect(supabase, 'patient_consents', (q) => q.select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(50)),
    safeSelect(supabase, 'patient_care_plans', (q) => q.select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(20)),
    safeSelect(supabase, 'clinical_soap_notes', (q) => q.select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(20)),
    safeSelect(supabase, 'health_passport_events', (q) => q.select('*').eq('patient_id', patientId).order('event_at', { ascending: false }).limit(50)),
    safeSelect(supabase, 'clinical_triage_events', (q) => q.select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(20)),
  ])

  const timeline = [
    ...(eventsResult.data || []).map(normalizeTimelineItem),
    ...(consultationsResult.data || []).map((item) => normalizeTimelineItem({ ...item, event_type: 'consultation', title: item.consultation_type || item.channel || 'Consultation', summary: item.status || item.description, event_at: item.scheduled_date || item.created_at, source_table: 'consultations' })),
    ...(filesResult.data || []).map((item) => normalizeTimelineItem({ ...item, event_type: 'document', title: item.original_filename || item.file_name || 'Uploaded document', summary: item.upload_type || item.mime_type, event_at: item.created_at, source_table: 'files' })),
    ...(prescriptionsResult.data || []).map((item) => normalizeTimelineItem({ ...item, event_type: 'prescription', title: 'Prescription issued', summary: item.medications || item.prescription_text || item.notes, event_at: item.issued_at || item.created_at, source_table: 'prescriptions' })),
    ...(labsResult.data || []).map((item) => normalizeTimelineItem({ ...item, event_type: 'lab_request', title: 'Lab / imaging request', summary: Array.isArray(item.tests) ? item.tests.join(', ') : item.status, event_at: item.created_at, source_table: 'lab_orders' })),
    ...(triageResult.data || []).map((item) => normalizeTimelineItem({ ...item, event_type: item.emergency_recommended ? 'emergency_triage' : 'triage', title: item.emergency_recommended ? 'Emergency red flag check' : 'Symptom triage', summary: item.recommended_action, event_at: item.created_at, source_table: 'clinical_triage_events', metadata: { redFlags: item.red_flags } })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 80)

  await tryAudit(supabase, { actorId: patientId, actorType: 'patient', action: 'health_passport_viewed', resourceType: 'patient', resourceId: patientId, riskLevel: 'medium', metadata: { timelineCount: timeline.length } })

  return res.json({
    patient: patientResult.data || null,
    timeline,
    consultations: consultationsResult.data || [],
    files: filesResult.data || [],
    prescriptions: prescriptionsResult.data || [],
    labOrders: labsResult.data || [],
    consents: consentsResult.data || [],
    carePlans: carePlansResult.data || [],
    clinicalNotes: notesResult.data || [],
    triageEvents: triageResult.data || [],
    warnings: [consultationsResult, filesResult, prescriptionsResult, labsResult, consentsResult, carePlansResult, notesResult, eventsResult, triageResult].map((result) => result.error).filter(Boolean),
  })
}
