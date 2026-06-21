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
  const [medicine, setMedicine] = useState({ name: '', dose: '', frequency: '', allergies: '', current: '', diagnosis: '' })

  const activePatientId = patientId.trim()
  const activeDoctorId = doctorId.trim()

  async function saveMedicine(event) {
    event.preventDefault()
    if (!activePatientId || !activeDoctorId || !medicine.name.trim()) return setError('Patient ID, Doctor ID, and medicine name are required.')
    setLoading(true)
    setError('')
    setMessage('')
    setOutput(null)
    try {
      const response = await apiFetch('/api/clinical/medication-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: activePatientId,
          doctorId: activeDoctorId,
          diagnosis: medicine.diagnosis,
          allergies: splitLines(medicine.allergies),
          currentMedications: splitLines(medicine.current),
          items: [{ medicineName: medicine.name, dose: medicine.dose, frequency: medicine.frequency }],
          status: 'draft',
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Medication order could not be saved.')
      setMessage('Medication order saved with safety checks.')
      setOutput(data)
    } catch (err) {
      setError(err.message || 'Medication order could not be saved.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
      <section className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/20">
        <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-brand-50">Phase 2</p>
        <h1 className="mt-4 text-4xl font-black">Clinical Safety OS</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">Structured medication order safety checks are active. This supports clinicians and does not replace licensed medical judgment.</p>
      </section>

      {error && <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
      {message && <p className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p>}

      <form onSubmit={saveMedicine} className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
        <h2 className="text-xl font-black text-slate-900">Medication order safety check</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm font-bold text-slate-700">Patient ID<input value={patientId} onChange={(event) => setPatientId(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400" /></label>
          <label className="text-sm font-bold text-slate-700">Doctor ID<input value={doctorId} onChange={(event) => setDoctorId(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400" /></label>
        </div>
        <input value={medicine.diagnosis} onChange={(event) => setMedicine((current) => ({ ...current, diagnosis: event.target.value }))} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Diagnosis / issue" />
        <input value={medicine.name} onChange={(event) => setMedicine((current) => ({ ...current, name: event.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Medicine name" />
        <input value={medicine.dose} onChange={(event) => setMedicine((current) => ({ ...current, dose: event.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Dose" />
        <input value={medicine.frequency} onChange={(event) => setMedicine((current) => ({ ...current, frequency: event.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Frequency" />
        <textarea value={medicine.allergies} onChange={(event) => setMedicine((current) => ({ ...current, allergies: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Allergies, one per line" />
        <textarea value={medicine.current} onChange={(event) => setMedicine((current) => ({ ...current, current: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Current medicines, one per line" />
        <button type="submit" disabled={loading} className="mt-4 w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:bg-slate-300">{loading ? 'Saving...' : 'Save medication order'}</button>
      </form>

      {output && <pre className="mt-8 max-h-[360px] overflow-auto rounded-3xl bg-slate-950 p-5 text-xs text-slate-100">{JSON.stringify(output, null, 2)}</pre>}
    </main>
  )
}

export default ClinicalSafetyOS
