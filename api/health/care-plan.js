import { clean, db, jsonError, makeId, tryAudit } from '../_healthCore.js'

async function attachTasks(supabase, plans) {
  const rows = Array.isArray(plans) ? plans : []
  if (!rows.length) return rows
  const ids = rows.map((plan) => plan.id).filter(Boolean)
  const { data, error } = await supabase.from('care_plan_tasks').select('*').in('care_plan_id', ids).order('created_at', { ascending: true })
  if (error) return rows.map((plan) => ({ ...plan, tasks: [], task_error: error.message }))
  const grouped = (data || []).reduce((acc, task) => {
    if (!acc[task.care_plan_id]) acc[task.care_plan_id] = []
    acc[task.care_plan_id].push(task)
    return acc
  }, {})
  return rows.map((plan) => ({ ...plan, tasks: grouped[plan.id] || [] }))
}

export default async function handler(req, res) {
  const supabase = db()
  if (!supabase) return jsonError(res, 500, 'Supabase is not configured.')

  if (req.method === 'GET') {
    const patientId = clean(req.query?.patientId, 160)
    if (!patientId) return jsonError(res, 400, 'patientId is required.')
    const { data, error } = await supabase.from('patient_care_plans').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(50)
    if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase1-health-os.sql in Supabase.' })
    const plans = await attachTasks(supabase, data || [])
    return res.json({ carePlans: plans })
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    const patientId = clean(body.patientId, 160)
    const title = clean(body.title, 220)
    if (!patientId || !title) return jsonError(res, 400, 'patientId and title are required.')

    const now = new Date().toISOString()
    const plan = {
      id: makeId('careplan'),
      patient_id: patientId,
      doctor_id: clean(body.doctorId, 160) || null,
      consultation_id: clean(body.consultationId, 160) || null,
      title,
      diagnosis: clean(body.diagnosis, 500) || null,
      goals: clean(body.goals, 3000) || null,
      instructions: clean(body.instructions, 6000) || null,
      red_flags: clean(body.redFlags, 3000) || null,
      follow_up_date: body.followUpDate || null,
      status: clean(body.status, 40) || 'active',
      created_by_type: clean(body.createdByType, 40) || 'system',
      created_by_id: clean(body.createdById, 160) || clean(body.doctorId, 160) || patientId,
      created_at: now,
      updated_at: now,
    }

    const { data, error } = await supabase.from('patient_care_plans').insert(plan).select('*').maybeSingle()
    if (error) return jsonError(res, 500, error.message, { migrationRequired: 'Run server/phase1-health-os.sql in Supabase.' })

    const tasks = (Array.isArray(body.tasks) ? body.tasks : []).map((task) => ({
      id: makeId('task'),
      care_plan_id: plan.id,
      patient_id: patientId,
      task_type: clean(task.taskType || task.type, 80) || 'instruction',
      title: clean(task.title, 220),
      details: clean(task.details, 2000) || null,
      due_at: task.dueAt || null,
      completed: false,
      created_at: now,
    })).filter((task) => task.title)

    if (tasks.length) await supabase.from('care_plan_tasks').insert(tasks)
    await supabase.from('health_passport_events').insert({
      id: makeId('hpe'),
      patient_id: patientId,
      event_type: 'care_plan',
      title: plan.title,
      summary: plan.instructions || plan.goals || '',
      source_table: 'patient_care_plans',
      source_id: plan.id,
      event_at: now,
      metadata: { diagnosis: plan.diagnosis, taskCount: tasks.length },
      created_at: now,
    }).then(() => null, () => null)

    await tryAudit(supabase, {
      actorId: plan.created_by_id,
      actorType: plan.created_by_type,
      action: 'care_plan_created',
      resourceType: 'patient_care_plans',
      resourceId: plan.id,
      riskLevel: 'medium',
      metadata: { patientId, diagnosis: plan.diagnosis },
    })

    return res.status(201).json({ carePlan: { ...(data || plan), tasks }, message: 'Care plan created.' })
  }

  res.setHeader('Allow', 'GET, POST')
  return jsonError(res, 405, 'Method not allowed.')
}
