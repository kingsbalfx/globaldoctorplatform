import { clean, db, jsonError, makeId, tryAudit } from '../_healthCore.js'

const RED_FLAG_RULES = [
  { key: 'chest_pain', label: 'Chest pain or pressure', terms: ['chest pain', 'chest tightness', 'heart pain', 'pressure in chest'] },
  { key: 'breathing', label: 'Severe breathing difficulty', terms: ['cannot breathe', 'difficulty breathing', 'shortness of breath', 'breathless', 'gasping'] },
  { key: 'stroke', label: 'Possible stroke symptoms', terms: ['face droop', 'slurred speech', 'one side weakness', 'stroke', 'cannot move arm'] },
  { key: 'unconscious', label: 'Unconsciousness or confusion', terms: ['unconscious', 'passed out', 'confused', 'not responding', 'fainted'] },
  { key: 'bleeding', label: 'Severe bleeding', terms: ['heavy bleeding', 'severe bleeding', 'bleeding too much', 'blood loss'] },
  { key: 'pregnancy', label: 'Pregnancy danger sign', terms: ['pregnant bleeding', 'pregnancy bleeding', 'severe pregnancy pain', 'no fetal movement'] },
  { key: 'seizure', label: 'Convulsion or seizure', terms: ['convulsion', 'seizure', 'fits', 'jerking'] },
  { key: 'suicide', label: 'Self-harm or suicide risk', terms: ['suicide', 'kill myself', 'self harm', 'end my life'] },
  { key: 'poisoning', label: 'Poisoning or overdose', terms: ['poison', 'overdose', 'drank chemical', 'took too many'] },
  { key: 'child_danger', label: 'Child danger sign', terms: ['baby not feeding', 'child convulsion', 'blue lips', 'very weak child'] },
]

function detectRedFlags(text, severity, pregnancyStatus) {
  const lower = String(text || '').toLowerCase()
  const flags = RED_FLAG_RULES.filter((rule) => rule.terms.some((term) => lower.includes(term))).map((rule) => ({ key: rule.key, label: rule.label }))
  if (String(severity || '').toLowerCase() === 'severe') flags.push({ key: 'severe_symptom', label: 'Patient marked symptom as severe' })
  if (String(pregnancyStatus || '').toLowerCase().includes('preg') && (lower.includes('bleeding') || lower.includes('severe pain'))) flags.push({ key: 'pregnancy_high_risk', label: 'Pregnancy with bleeding or severe pain' })
  const seen = new Set()
  return flags.filter((flag) => {
    if (seen.has(flag.key)) return false
    seen.add(flag.key)
    return true
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return jsonError(res, 405, 'Method not allowed.')
  }

  const supabase = db()
  if (!supabase) return jsonError(res, 500, 'Supabase is not configured.')

  const body = req.body || {}
  const patientId = clean(body.patientId, 160)
  const patientName = clean(body.patientName || body.name, 160)
  const symptoms = clean(body.symptoms, 6000)
  const duration = clean(body.duration, 200)
  const severity = clean(body.severity, 80) || 'unknown'
  const pregnancyStatus = clean(body.pregnancyStatus, 80)
  const age = clean(body.age, 60)

  if (!symptoms) return jsonError(res, 400, 'Symptoms are required.')

  const redFlags = detectRedFlags(symptoms, severity, pregnancyStatus)
  const emergencyRecommended = redFlags.length > 0
  const recommendedAction = emergencyRecommended
    ? 'This may be an emergency. Call local emergency services or go to the nearest hospital immediately. Do not wait for online consultation.'
    : 'No emergency red flag was detected from this intake. Continue with telehealth consultation or support routing, and seek urgent care if symptoms worsen.'

  const row = {
    id: makeId('triage'),
    patient_id: patientId || null,
    patient_name: patientName || null,
    symptoms,
    duration,
    severity,
    pregnancy_status: pregnancyStatus || null,
    age: age || null,
    red_flags: redFlags,
    emergency_recommended: emergencyRecommended,
    recommended_action: recommendedAction,
    source: clean(body.source, 80) || 'ai_health_os',
    created_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from('clinical_triage_events').insert(row).select('*').maybeSingle()
  if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase1-health-os.sql in Supabase.' })

  await tryAudit(supabase, {
    actorId: patientId || 'anonymous',
    actorType: patientId ? 'patient' : 'anonymous',
    action: emergencyRecommended ? 'emergency_triage_red_flag' : 'triage_completed',
    resourceType: 'clinical_triage_events',
    resourceId: row.id,
    riskLevel: emergencyRecommended ? 'critical' : 'medium',
    metadata: { redFlags, severity },
  })

  return res.status(201).json({ triage: data || row, emergencyRecommended, redFlags, recommendedAction })
}
