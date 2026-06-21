import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ClipboardCheck, FileText, Loader2, RefreshCw, ShieldCheck, Stethoscope } from 'lucide-react'
import { apiFetch } from '../lib/apiFetch'

const consentItems = [
  { type: 'telehealth_consultation', label: 'Telehealth consultation consent', help: 'I agree to receive care through digital consultation where appropriate.' },
  { type: 'medical_data_processing', label: 'Medical data processing', help: 'I agree that my health data can be used to support my care.' },
  { type: 'ai_assistance', label: 'AI assistant support', help: 'I understand AI may summarize or route my request, but it does not replace a licensed clinician.' },
  { type: 'file_sharing', label: 'Secure file sharing', help: 'I allow my uploaded records to be shared with assigned care team members.' },
  { type: 'emergency_contact', label: 'Emergency escalation', help: 'I allow emergency contact or urgent escalation where medically necessary.' },
]

function loadSession() {
  if (typeof window === 'undefined') return { role: '', user: null }
  try {
    const patient = JSON.parse(window.localStorage.getItem('gd_patient_session') || 'null')
    if (patient?.id) return { role: 'patient', user: patient }
  } catch {
    // ignore
  }
  try {
    const doctor = JSON.parse(window.localStorage.getItem('gd_doctor_session') || 'null')
    if (doctor?.id) return { role: 'doctor', user: doctor }
  } catch {
    // ignore
  }
  return { role: '', user: null }
}

function shortDate(value) {
  if (!value) return 'No date'
  try { return new Date(value).toLocaleString() } catch { return String(value) }
}

function AdvancedHealthOS() {
  const session = useMemo(loadSession, [])
  const [patientId, setPatientId] = useState(session.role === 'patient' ? session.user.id : '')
  const [passport, setPassport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [consents, setConsents] = useState(() => Object.fromEntries(consentItems.map((item) => [item.type, true])))
  const [triage, setTriage] = useState({ symptoms: '', duration: '', severity: 'mild', age: '', pregnancyStatus: '' })
  const [triageResult, setTriageResult] = useState(null)
  const [carePlan, setCarePlan] = useState({ title: '', diagnosis: '', goals: '', instructions: '', redFlags: '', followUpDate: '' })
  const [note, setNote] = useState({ patientId: '', consultationId: '', subjective: '', objective: '', assessment: '', plan: '', diagnosis: '', followUp: '', status: 'draft' })

  const activePatientId = session.role === 'patient' ? session.user.id : patientId.trim()

  const loadPassport = async () => {
    if (!activePatientId) return
    setLoading(true)
    setError('')
    try {
      const response = await apiFetch(`/api/health/passport?patientId=${encodeURIComponent(activePatientId)}`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to load health passport')
      setPassport(data)
    } catch (err) {
      setPassport(null)
      setError(err.message || 'Unable to load health passport')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activePatientId) void loadPassport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePatientId])

  const submitConsents = async () => {
    if (!activePatientId) return setError('Enter a patient ID first.')
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const response = await apiFetch('/api/health/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: activePatientId,
          actorType: session.role || 'patient',
          actorId: session.user?.id || activePatientId,
          consents: consentItems.map((item) => ({ type: item.type, given: Boolean(consents[item.type]) })),
          source: 'advanced_health_os_page',
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Consent could not be saved.')
      setNotice('Consent records saved.')
      await loadPassport()
    } catch (err) {
      setError(err.message || 'Consent could not be saved.')
    } finally {
      setLoading(false)
    }
  }

  const submitTriage = async (event) => {
    event.preventDefault()
    if (!triage.symptoms.trim()) return setError('Enter symptoms first.')
    setLoading(true)
    setError('')
    setTriageResult(null)
    try {
      const response = await apiFetch('/api/health/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: activePatientId || undefined, patientName: session.user?.name, ...triage, source: 'advanced_health_os_page' }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Triage failed.')
      setTriageResult(data)
      if (activePatientId) await loadPassport()
    } catch (err) {
      setError(err.message || 'Triage failed.')
    } finally {
      setLoading(false)
    }
  }

  const submitCarePlan = async (event) => {
    event.preventDefault()
    if (!activePatientId || !carePlan.title.trim()) return setError('Patient ID and care plan title are required.')
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const response = await apiFetch('/api/health/care-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: activePatientId,
          doctorId: session.role === 'doctor' ? session.user.id : undefined,
          createdByType: session.role || 'system',
          createdById: session.user?.id || activePatientId,
          ...carePlan,
          tasks: [
            carePlan.followUpDate ? { title: 'Attend follow-up', details: carePlan.instructions, dueAt: carePlan.followUpDate, taskType: 'follow_up' } : null,
            carePlan.redFlags ? { title: 'Watch for danger signs', details: carePlan.redFlags, taskType: 'safety' } : null,
          ].filter(Boolean),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Care plan could not be saved.')
      setCarePlan({ title: '', diagnosis: '', goals: '', instructions: '', redFlags: '', followUpDate: '' })
      setNotice('Care plan saved.')
      await loadPassport()
    } catch (err) {
      setError(err.message || 'Care plan could not be saved.')
    } finally {
      setLoading(false)
    }
  }

  const submitNote = async (event) => {
    event.preventDefault()
    if (session.role !== 'doctor') return setError('Only a doctor session can save structured care notes.')
    if (!note.patientId.trim()) return setError('Enter patient ID for the care note.')
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const response = await apiFetch('/api/health/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...note, doctorId: session.user.id }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Care note could not be saved.')
      setNotice('Structured care note saved.')
      setPatientId(note.patientId)
      setNote({ patientId: note.patientId, consultationId: '', subjective: '', objective: '', assessment: '', plan: '', diagnosis: '', followUp: '', status: 'draft' })
    } catch (err) {
      setError(err.message || 'Care note could not be saved.')
    } finally {
      setLoading(false)
    }
  }

  const timeline = passport?.timeline || []
  const carePlans = passport?.carePlans || []

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/20">
        <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">Phase 1 Advanced Health OS</p>
        <h1 className="mt-4 text-4xl font-black">Health Passport, Consent, Triage, Care Plans, and Clinical Notes</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">This is the safe foundation for making GlobalDoc more advanced: longitudinal patient memory, consent capture, emergency red-flag intake, care plans, and structured doctor notes.</p>
      </section>

      {error && <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
      {notice && <p className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{notice}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
            <div className="flex items-center justify-between gap-3"><div><h2 className="font-black text-slate-900">Current session</h2><p className="mt-1 text-sm text-slate-500">{session.role ? `${session.role}: ${session.user?.name || session.user?.email || session.user?.id}` : 'No patient or doctor session found.'}</p></div><button type="button" onClick={loadPassport} disabled={!activePatientId || loading} className="rounded-full bg-slate-100 p-3 text-slate-700 hover:bg-slate-200 disabled:opacity-40"><RefreshCw className="h-4 w-4" /></button></div>
            {session.role !== 'patient' && <label className="mt-4 block text-sm font-bold text-slate-700">Patient ID<input value={patientId} onChange={(event) => setPatientId(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400" placeholder="patient id" /></label>}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
            <div className="flex items-start gap-3"><ShieldCheck className="h-5 w-5 text-brand-700" /><div><h2 className="font-black text-slate-900">Consent center</h2><p className="text-sm text-slate-500">Capture versioned consent before advanced care workflows.</p></div></div>
            <div className="mt-4 space-y-3">{consentItems.map((item) => <label key={item.type} className="flex gap-3 rounded-2xl bg-slate-50 p-3 text-sm"><input type="checkbox" checked={Boolean(consents[item.type])} onChange={(event) => setConsents((current) => ({ ...current, [item.type]: event.target.checked }))} className="mt-1" /><span><span className="font-bold text-slate-900">{item.label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{item.help}</span></span></label>)}</div>
            <button type="button" onClick={submitConsents} disabled={!activePatientId || loading} className="mt-4 w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:bg-slate-300">Save consent</button>
          </div>

          <form onSubmit={submitTriage} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
            <div className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-red-600" /><div><h2 className="font-black text-slate-900">Emergency red-flag triage</h2><p className="text-sm text-slate-500">Detect urgent symptoms and route safely.</p></div></div>
            <textarea value={triage.symptoms} onChange={(event) => setTriage((current) => ({ ...current, symptoms: event.target.value }))} rows={4} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-400" placeholder="Describe symptoms, e.g. chest pain, breathing difficulty..." />
            <div className="mt-3 grid gap-3 sm:grid-cols-2"><input value={triage.duration} onChange={(event) => setTriage((current) => ({ ...current, duration: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Duration" /><select value={triage.severity} onChange={(event) => setTriage((current) => ({ ...current, severity: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"><option>mild</option><option>moderate</option><option>severe</option></select><input value={triage.age} onChange={(event) => setTriage((current) => ({ ...current, age: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Age" /><input value={triage.pregnancyStatus} onChange={(event) => setTriage((current) => ({ ...current, pregnancyStatus: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Pregnancy status if relevant" /></div>
            <button type="submit" disabled={loading} className="mt-4 w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:bg-slate-300">Check red flags</button>
            {triageResult && <div className={`mt-4 rounded-2xl p-4 text-sm ${triageResult.emergencyRecommended ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}><p className="font-black">{triageResult.emergencyRecommended ? 'Emergency warning' : 'No red flag detected'}</p><p className="mt-2 leading-6">{triageResult.recommendedAction}</p>{(triageResult.redFlags || []).length > 0 && <ul className="mt-2 list-disc pl-5">{triageResult.redFlags.map((flag) => <li key={flag.key}>{flag.label}</li>)}</ul>}</div>}
          </form>
        </aside>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
            <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><FileText className="h-5 w-5 text-brand-700" /><div><h2 className="font-black text-slate-900">Health Passport timeline</h2><p className="text-sm text-slate-500">Longitudinal patient memory from visits, files, prescriptions, labs, triage, and care plans.</p></div></div>{loading && <Loader2 className="h-5 w-5 animate-spin text-brand-700" />}</div>
            {passport?.warnings?.length > 0 && <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-semibold text-amber-700">Some tables are missing or not migrated yet: {passport.warnings.join(' | ')}</p>}
            <div className="mt-5 space-y-3">{timeline.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No passport events yet. Add consent, triage, a care plan, or complete a consultation.</p>}{timeline.map((event) => <div key={`${event.type}-${event.id}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-[0.14em] text-brand-700">{event.type}</p><p className="mt-1 font-bold text-slate-900">{event.title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{event.summary || 'No summary.'}</p><p className="mt-2 text-xs text-slate-400">{shortDate(event.at)}</p></div>)}</div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={submitCarePlan} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50"><div className="flex items-start gap-3"><ClipboardCheck className="h-5 w-5 text-emerald-700" /><div><h2 className="font-black text-slate-900">Care plan builder</h2><p className="text-sm text-slate-500">Create follow-up instructions after a consultation.</p></div></div><input value={carePlan.title} onChange={(event) => setCarePlan((current) => ({ ...current, title: event.target.value }))} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Plan title" /><input value={carePlan.diagnosis} onChange={(event) => setCarePlan((current) => ({ ...current, diagnosis: event.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Diagnosis / issue" /><textarea value={carePlan.goals} onChange={(event) => setCarePlan((current) => ({ ...current, goals: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Goals" /><textarea value={carePlan.instructions} onChange={(event) => setCarePlan((current) => ({ ...current, instructions: event.target.value }))} rows={3} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Instructions" /><textarea value={carePlan.redFlags} onChange={(event) => setCarePlan((current) => ({ ...current, redFlags: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Danger signs" /><input type="datetime-local" value={carePlan.followUpDate} onChange={(event) => setCarePlan((current) => ({ ...current, followUpDate: event.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" /><button type="submit" disabled={!activePatientId || loading} className="mt-4 w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:bg-slate-300">Save care plan</button></form>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50"><h2 className="font-black text-slate-900">Active care plans</h2><div className="mt-4 space-y-3">{carePlans.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No care plans yet.</p>}{carePlans.map((plan) => <div key={plan.id} className="rounded-2xl bg-slate-50 p-4"><p className="font-bold text-slate-900">{plan.title}</p><p className="mt-1 text-sm text-slate-600">{plan.diagnosis || 'No diagnosis listed'}</p><p className="mt-2 text-xs font-bold uppercase text-slate-400">{plan.status}</p></div>)}</div></div>
          </div>

          {session.role === 'doctor' && <form onSubmit={submitNote} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50"><div className="flex items-start gap-3"><ClipboardCheck className="h-5 w-5 text-violet-700" /><div><h2 className="font-black text-slate-900">Structured care note</h2><p className="text-sm text-slate-500">SOAP foundation for doctor documentation.</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><input value={note.patientId} onChange={(event) => setNote((current) => ({ ...current, patientId: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Patient ID" /><input value={note.consultationId} onChange={(event) => setNote((current) => ({ ...current, consultationId: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Consultation ID" /><select value={note.status} onChange={(event) => setNote((current) => ({ ...current, status: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"><option>draft</option><option>signed</option></select></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><textarea value={note.subjective} onChange={(event) => setNote((current) => ({ ...current, subjective: event.target.value }))} rows={3} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Subjective" /><textarea value={note.objective} onChange={(event) => setNote((current) => ({ ...current, objective: event.target.value }))} rows={3} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Objective" /><textarea value={note.assessment} onChange={(event) => setNote((current) => ({ ...current, assessment: event.target.value }))} rows={3} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Assessment" /><textarea value={note.plan} onChange={(event) => setNote((current) => ({ ...current, plan: event.target.value }))} rows={3} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Plan" /></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><input value={note.diagnosis} onChange={(event) => setNote((current) => ({ ...current, diagnosis: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Diagnosis" /><input value={note.followUp} onChange={(event) => setNote((current) => ({ ...current, followUp: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Follow-up" /></div><button type="submit" disabled={loading} className="mt-4 rounded-2xl bg-violet-700 px-5 py-3 text-sm font-bold text-white hover:bg-violet-600 disabled:bg-slate-300">Save care note</button></form>}
        </section>
      </div>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50"><div className="flex items-start gap-3"><Stethoscope className="h-5 w-5 text-brand-700" /><div><h2 className="font-black text-slate-900">Safety rule</h2><p className="mt-1 text-sm leading-6 text-slate-600">This Health OS assists routing, memory, consent, and documentation. It does not replace a licensed clinician, and emergency symptoms should be handled through local emergency services immediately.</p></div></div></section>
    </main>
  )
}

export default AdvancedHealthOS
