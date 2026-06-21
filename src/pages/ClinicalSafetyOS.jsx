import { useMemo, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'

function loadSession() {
  if (typeof window === 'undefined') return { role: '', user: null }
  try {
    const doctor = JSON.parse(window.localStorage.getItem('gd_doctor_session') || 'null')
    if (doctor?.id) return { role: 'doctor', user: doctor }
  } catch {
    // ignore
  }
  try {
    const patient = JSON.parse(window.localStorage.getItem('gd_patient_session') || 'null')
    if (patient?.id) return { role: 'patient', user: patient }
  } catch {
    // ignore
  }
  return { role: '', user: null }
}

function splitLines(value) {
  return String(value || '').split('\n').map((item) => item.trim()).filter(Boolean)
}

function ClinicalSafetyOS() {
  const session = useMemo(loadSession, [])
  const [patientId, setPatientId] = useState(session.role === 'patient' ? session.user.id : '')
  const [doctorId, setDoctorId] = useState(session.role === 'doctor' ? session.user.id : '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [output, setOutput] = useState(null)
  const [medicine, setMedicine] = useState({ name: '', dose: '', frequency: '', allergies: '', current: '', diagnosis: '', status: 'draft' })
  const [lab, setLab] = useState({ testName: '', resultText: '', abnormalFlag: false, criticalFlag: false })
  const [summary, setSummary] = useState({ diagnosis: '', treatmentGiven: '', medicationSummary: '', labSummary: '', followUpPlan: '', redFlags: '', status: 'draft' })

  const activePatientId = patientId.trim()
  const activeDoctorId = doctorId.trim()

  async function runAction(label, body) {
    setLoading(true)
    setError('')
    setMessage('')
    setOutput(null)
    try {
      const response = await apiFetch('/api/clinical/medication-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || `${label} could not be saved.`)
      setMessage(`${label} saved successfully.`)
      setOutput(data)
    } catch (err) {
      setError(err.message || `${label} could not be saved.`)
    } finally {
      setLoading(false)
    }
  }

  function saveMedicine(event) {
    event.preventDefault()
    if (!activePatientId || !activeDoctorId || !medicine.name.trim()) return setError('Patient ID, Doctor ID, and medicine name are required.')
    return runAction('Medication order', {
      patientId: activePatientId,
      doctorId: activeDoctorId,
      diagnosis: medicine.diagnosis,
      allergies: splitLines(medicine.allergies),
      currentMedications: splitLines(medicine.current),
      items: [{ medicineName: medicine.name, dose: medicine.dose, frequency: medicine.frequency }],
      status: medicine.status,
    })
  }

  function saveLab(event) {
    event.preventDefault()
    if (!activePatientId || !lab.testName.trim()) return setError('Patient ID and test name are required.')
    return runAction('Lab result', {
      module: 'lab_result',
      patientId: activePatientId,
      doctorId: activeDoctorId || undefined,
      testName: lab.testName,
      resultText: lab.resultText,
      abnormalFlag: lab.abnormalFlag,
      criticalFlag: lab.criticalFlag,
      uploadedByType: session.role || 'facility',
      uploadedById: session.user?.id,
    })
  }

  function saveSummary(event) {
    event.preventDefault()
    if (!activePatientId || !activeDoctorId) return setError('Patient ID and Doctor ID are required.')
    return runAction('Visit summary', {
      module: 'consultation_summary',
      patientId: activePatientId,
      doctorId: activeDoctorId,
      diagnosis: summary.diagnosis,
      treatmentGiven: summary.treatmentGiven,
      medicationSummary: summary.medicationSummary,
      labSummary: summary.labSummary,
      followUpPlan: summary.followUpPlan,
      redFlags: summary.redFlags,
      status: summary.status,
    })
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
      <section className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/20">
        <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-brand-50">Phase 2</p>
        <h1 className="mt-4 text-4xl font-black">Clinical Safety OS</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">Structured medication checks, lab result workflow, and final visit summaries are active. These tools support clinicians and do not replace licensed medical judgment.</p>
      </section>

      {error && <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
      {message && <p className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p>}

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-bold text-slate-700">Patient ID<input value={patientId} onChange={(event) => setPatientId(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400" /></label>
          <label className="text-sm font-bold text-slate-700">Doctor ID<input value={doctorId} onChange={(event) => setDoctorId(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400" /></label>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <form onSubmit={saveMedicine} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
          <h2 className="text-xl font-black text-slate-900">Medication order safety check</h2>
          <p className="mt-1 text-sm text-slate-500">Creates structured order, verification code, and basic safety warnings.</p>
          <input value={medicine.diagnosis} onChange={(event) => setMedicine((current) => ({ ...current, diagnosis: event.target.value }))} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Diagnosis / issue" />
          <input value={medicine.name} onChange={(event) => setMedicine((current) => ({ ...current, name: event.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Medicine name" />
          <input value={medicine.dose} onChange={(event) => setMedicine((current) => ({ ...current, dose: event.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Dose" />
          <input value={medicine.frequency} onChange={(event) => setMedicine((current) => ({ ...current, frequency: event.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Frequency" />
          <textarea value={medicine.allergies} onChange={(event) => setMedicine((current) => ({ ...current, allergies: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Allergies, one per line" />
          <textarea value={medicine.current} onChange={(event) => setMedicine((current) => ({ ...current, current: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Current medicines, one per line" />
          <select value={medicine.status} onChange={(event) => setMedicine((current) => ({ ...current, status: event.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"><option>draft</option><option>issued</option></select>
          <button type="submit" disabled={loading} className="mt-4 w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:bg-slate-300">{loading ? 'Saving...' : 'Save medication order'}</button>
        </form>

        <form onSubmit={saveLab} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
          <h2 className="text-xl font-black text-slate-900">Lab result workflow</h2>
          <p className="mt-1 text-sm text-slate-500">Stores lab result, abnormal/critical flags, audit record, and Health Passport event.</p>
          <input value={lab.testName} onChange={(event) => setLab((current) => ({ ...current, testName: event.target.value }))} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Test name" />
          <textarea value={lab.resultText} onChange={(event) => setLab((current) => ({ ...current, resultText: event.target.value }))} rows={6} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Result details" />
          <label className="mt-3 flex gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-700"><input type="checkbox" checked={lab.abnormalFlag} onChange={(event) => setLab((current) => ({ ...current, abnormalFlag: event.target.checked }))} /> Abnormal result</label>
          <label className="mt-3 flex gap-2 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700"><input type="checkbox" checked={lab.criticalFlag} onChange={(event) => setLab((current) => ({ ...current, criticalFlag: event.target.checked }))} /> Critical result</label>
          <button type="submit" disabled={loading} className="mt-4 w-full rounded-2xl bg-amber-600 px-4 py-3 text-sm font-bold text-white hover:bg-amber-700 disabled:bg-slate-300">{loading ? 'Saving...' : 'Save lab result'}</button>
        </form>

        <form onSubmit={saveSummary} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
          <h2 className="text-xl font-black text-slate-900">Final visit summary</h2>
          <p className="mt-1 text-sm text-slate-500">Creates patient-friendly visit conclusion with follow-up and danger signs.</p>
          <input value={summary.diagnosis} onChange={(event) => setSummary((current) => ({ ...current, diagnosis: event.target.value }))} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Diagnosis" />
          <textarea value={summary.treatmentGiven} onChange={(event) => setSummary((current) => ({ ...current, treatmentGiven: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Treatment given" />
          <textarea value={summary.medicationSummary} onChange={(event) => setSummary((current) => ({ ...current, medicationSummary: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Medication summary" />
          <textarea value={summary.labSummary} onChange={(event) => setSummary((current) => ({ ...current, labSummary: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Lab summary" />
          <textarea value={summary.followUpPlan} onChange={(event) => setSummary((current) => ({ ...current, followUpPlan: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Follow-up plan" />
          <textarea value={summary.redFlags} onChange={(event) => setSummary((current) => ({ ...current, redFlags: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Danger signs" />
          <select value={summary.status} onChange={(event) => setSummary((current) => ({ ...current, status: event.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"><option>draft</option><option>final</option></select>
          <button type="submit" disabled={loading} className="mt-4 w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:bg-slate-300">{loading ? 'Saving...' : 'Save summary'}</button>
        </form>
      </div>

      {output && <pre className="mt-8 max-h-[360px] overflow-auto rounded-3xl bg-slate-950 p-5 text-xs text-slate-100">{JSON.stringify(output, null, 2)}</pre>}
    </main>
  )
}

export default ClinicalSafetyOS
