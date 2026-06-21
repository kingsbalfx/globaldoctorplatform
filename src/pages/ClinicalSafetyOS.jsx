import { useMemo, useState } from 'react'
import { AlertTriangle, ClipboardCheck, FileText, Loader2, RefreshCw, ShieldCheck, Stethoscope } from 'lucide-react'
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
  return String(value || '').split('\n').map((line) => line.trim()).filter(Boolean)
}

function safeDate(value) {
  if (!value) return 'No date'
  try { return new Date(value).toLocaleString() } catch { return String(value) }
}

function ClinicalSafetyOS() {
  const session = useMemo(loadSession, [])
  const [patientId, setPatientId] = useState(session.role === 'patient' ? session.user.id : '')
  const [doctorId, setDoctorId] = useState(session.role === 'doctor' ? session.user.id : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [lastOrder, setLastOrder] = useState(null)
  const [lastLab, setLastLab] = useState(null)
  const [lastSummary, setLastSummary] = useState(null)
  const [orders, setOrders] = useState([])
  const [labResults, setLabResults] = useState([])
  const [summaries, setSummaries] = useState([])

  const [med, setMed] = useState({ consultationId: '', diagnosis: '', patientAge: '', pregnancyStatus: '', allergies: '', currentMedications: '', medicineName: '', dose: '', route: '', frequency: '', duration: '', quantity: '', instructions: '', status: 'draft' })
  const [lab, setLab] = useState({ labOrderId: '', testName: '', resultText: '', resultValue: '', unit: '', referenceRange: '', abnormalFlag: false, criticalFlag: false })
  const [summary, setSummary] = useState({ consultationId: '', reasonForVisit: '', clinicalFindings: '', diagnosis: '', treatmentGiven: '', medicationSummary: '', labSummary: '', followUpPlan: '', redFlags: '', status: 'draft' })

  const activePatientId = patientId.trim()
  const activeDoctorId = doctorId.trim()

  const loadClinicalData = async () => {
    if (!activePatientId) return setError('Enter patient ID first.')
    setLoading(true)
    setError('')
    try {
      const [orderRes, labRes, summaryRes] = await Promise.all([
        apiFetch(`/api/clinical/medication-orders?patientId=${encodeURIComponent(activePatientId)}`),
        apiFetch(`/api/clinical/lab-results?patientId=${encodeURIComponent(activePatientId)}`),
        apiFetch(`/api/clinical/consultation-summary?patientId=${encodeURIComponent(activePatientId)}`),
      ])
      const [orderData, labData, summaryData] = await Promise.all([orderRes.json().catch(() => ({})), labRes.json().catch(() => ({})), summaryRes.json().catch(() => ({}))])
      if (!orderRes.ok) throw new Error(orderData.error || 'Could not load medication orders.')
      if (!labRes.ok) throw new Error(labData.error || 'Could not load lab results.')
      if (!summaryRes.ok) throw new Error(summaryData.error || 'Could not load summaries.')
      setOrders(orderData.medicationOrders || [])
      setLabResults(labData.labResults || [])
      setSummaries(summaryData.summaries || [])
    } catch (err) {
      setError(err.message || 'Could not load clinical safety data.')
    } finally {
      setLoading(false)
    }
  }

  const createMedicationOrder = async (event) => {
    event.preventDefault()
    if (!activePatientId || !activeDoctorId || !med.medicineName.trim()) return setError('Patient ID, doctor ID, and medicine name are required.')
    setLoading(true)
    setError('')
    setNotice('')
    setLastOrder(null)
    try {
      const response = await apiFetch('/api/clinical/medication-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: activePatientId,
          doctorId: activeDoctorId,
          consultationId: med.consultationId,
          diagnosis: med.diagnosis,
          patientAge: med.patientAge,
          pregnancyStatus: med.pregnancyStatus,
          allergies: splitLines(med.allergies),
          currentMedications: splitLines(med.currentMedications),
          status: med.status,
          items: [{ medicineName: med.medicineName, dose: med.dose, route: med.route, frequency: med.frequency, duration: med.duration, quantity: med.quantity, instructions: med.instructions }],
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Medication order could not be saved.')
      setLastOrder(data.medicationOrder)
      setNotice('Medication order saved with safety checks.')
      await loadClinicalData()
    } catch (err) {
      setError(err.message || 'Medication order could not be saved.')
    } finally {
      setLoading(false)
    }
  }

  const uploadLabResult = async (event) => {
    event.preventDefault()
    if (!activePatientId || !lab.testName.trim()) return setError('Patient ID and test name are required.')
    setLoading(true)
    setError('')
    setNotice('')
    setLastLab(null)
    try {
      const response = await apiFetch('/api/clinical/lab-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: activePatientId, doctorId: activeDoctorId || undefined, uploadedByType: session.role || 'facility', uploadedById: session.user?.id, ...lab }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Lab result could not be saved.')
      setLastLab(data.labResult)
      setNotice('Lab result saved.')
      await loadClinicalData()
    } catch (err) {
      setError(err.message || 'Lab result could not be saved.')
    } finally {
      setLoading(false)
    }
  }

  const createSummary = async (event) => {
    event.preventDefault()
    if (!activePatientId || !activeDoctorId) return setError('Patient ID and doctor ID are required.')
    setLoading(true)
    setError('')
    setNotice('')
    setLastSummary(null)
    try {
      const response = await apiFetch('/api/clinical/consultation-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: activePatientId, doctorId: activeDoctorId, ...summary }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Consultation summary could not be saved.')
      setLastSummary(data.summary)
      setNotice('Consultation summary saved.')
      await loadClinicalData()
    } catch (err) {
      setError(err.message || 'Consultation summary could not be saved.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-brand-900 to-slate-900 p-8 text-white shadow-2xl shadow-slate-900/20">
        <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-brand-50">Phase 2 Clinical Safety</p>
        <h1 className="mt-4 text-4xl font-black">Structured Medication, Lab Result Review, and Final Visit Summary</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">This layer adds structured clinical workflow and safety checks. It does not replace clinician judgment; all orders and summaries must be reviewed by a licensed clinician.</p>
      </section>

      {error && <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
      {notice && <p className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{notice}</p>}

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <label className="text-sm font-bold text-slate-700">Patient ID<input value={patientId} onChange={(event) => setPatientId(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400" placeholder="patient id" /></label>
          <label className="text-sm font-bold text-slate-700">Doctor ID<input value={doctorId} onChange={(event) => setDoctorId(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400" placeholder="doctor id" /></label>
          <button type="button" onClick={loadClinicalData} disabled={loading || !activePatientId} className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:bg-slate-300">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Load</button>
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <form onSubmit={createMedicationOrder} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
          <div className="flex items-start gap-3"><ShieldCheck className="h-5 w-5 text-brand-700" /><div><h2 className="font-black text-slate-900">Structured medication order</h2><p className="text-sm text-slate-500">Includes basic completeness, allergy, duplicate, pediatric, and pregnancy review warnings.</p></div></div>
          <input value={med.consultationId} onChange={(event) => setMed((current) => ({ ...current, consultationId: event.target.value }))} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Consultation ID" />
          <input value={med.diagnosis} onChange={(event) => setMed((current) => ({ ...current, diagnosis: event.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Diagnosis / issue" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2"><input value={med.patientAge} onChange={(event) => setMed((current) => ({ ...current, patientAge: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Age" /><input value={med.pregnancyStatus} onChange={(event) => setMed((current) => ({ ...current, pregnancyStatus: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Pregnancy status" /></div>
          <textarea value={med.allergies} onChange={(event) => setMed((current) => ({ ...current, allergies: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Allergies, one per line" />
          <textarea value={med.currentMedications} onChange={(event) => setMed((current) => ({ ...current, currentMedications: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Current medicines, one per line" />
          <input value={med.medicineName} onChange={(event) => setMed((current) => ({ ...current, medicineName: event.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Medicine name" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2"><input value={med.dose} onChange={(event) => setMed((current) => ({ ...current, dose: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Dose" /><input value={med.frequency} onChange={(event) => setMed((current) => ({ ...current, frequency: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Frequency" /><input value={med.route} onChange={(event) => setMed((current) => ({ ...current, route: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Route" /><input value={med.duration} onChange={(event) => setMed((current) => ({ ...current, duration: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Duration" /></div>
          <textarea value={med.instructions} onChange={(event) => setMed((current) => ({ ...current, instructions: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Instructions" />
          <select value={med.status} onChange={(event) => setMed((current) => ({ ...current, status: event.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"><option>draft</option><option>issued</option></select>
          <button type="submit" disabled={loading} className="mt-4 w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:bg-slate-300">Save medication order</button>
          {lastOrder?.safetyChecks?.length > 0 && <div className="mt-4 space-y-2">{lastOrder.safetyChecks.map((check) => <div key={check.id} className={`rounded-2xl p-3 text-xs font-semibold ${check.severity === 'critical' ? 'bg-red-50 text-red-700' : check.severity === 'warning' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-600'}`}>{check.message}</div>)}</div>}
        </form>

        <form onSubmit={uploadLabResult} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
          <div className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-amber-600" /><div><h2 className="font-black text-slate-900">Lab result workflow</h2><p className="text-sm text-slate-500">Upload result, flag abnormal/critical, and push it into the Health Passport.</p></div></div>
          <input value={lab.labOrderId} onChange={(event) => setLab((current) => ({ ...current, labOrderId: event.target.value }))} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Lab order ID" />
          <input value={lab.testName} onChange={(event) => setLab((current) => ({ ...current, testName: event.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Test name" />
          <textarea value={lab.resultText} onChange={(event) => setLab((current) => ({ ...current, resultText: event.target.value }))} rows={4} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Result details" />
          <div className="mt-3 grid gap-3 sm:grid-cols-3"><input value={lab.resultValue} onChange={(event) => setLab((current) => ({ ...current, resultValue: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Value" /><input value={lab.unit} onChange={(event) => setLab((current) => ({ ...current, unit: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Unit" /><input value={lab.referenceRange} onChange={(event) => setLab((current) => ({ ...current, referenceRange: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Reference" /></div>
          <label className="mt-3 flex gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={lab.abnormalFlag} onChange={(event) => setLab((current) => ({ ...current, abnormalFlag: event.target.checked }))} /> Abnormal result</label>
          <label className="mt-3 flex gap-3 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700"><input type="checkbox" checked={lab.criticalFlag} onChange={(event) => setLab((current) => ({ ...current, criticalFlag: event.target.checked }))} /> Critical result</label>
          <button type="submit" disabled={loading} className="mt-4 w-full rounded-2xl bg-amber-600 px-4 py-3 text-sm font-bold text-white hover:bg-amber-700 disabled:bg-slate-300">Save lab result</button>
          {lastLab && <p className="mt-4 rounded-2xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700">Saved: {lastLab.test_name} · {safeDate(lastLab.created_at)}</p>}
        </form>

        <form onSubmit={createSummary} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
          <div className="flex items-start gap-3"><ClipboardCheck className="h-5 w-5 text-emerald-700" /><div><h2 className="font-black text-slate-900">Final visit summary</h2><p className="text-sm text-slate-500">Create a patient-friendly consultation conclusion and follow-up plan.</p></div></div>
          <input value={summary.consultationId} onChange={(event) => setSummary((current) => ({ ...current, consultationId: event.target.value }))} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Consultation ID" />
          <textarea value={summary.reasonForVisit} onChange={(event) => setSummary((current) => ({ ...current, reasonForVisit: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Reason for visit" />
          <textarea value={summary.clinicalFindings} onChange={(event) => setSummary((current) => ({ ...current, clinicalFindings: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Clinical findings" />
          <input value={summary.diagnosis} onChange={(event) => setSummary((current) => ({ ...current, diagnosis: event.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Diagnosis" />
          <textarea value={summary.treatmentGiven} onChange={(event) => setSummary((current) => ({ ...current, treatmentGiven: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Treatment given" />
          <textarea value={summary.medicationSummary} onChange={(event) => setSummary((current) => ({ ...current, medicationSummary: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Medication summary" />
          <textarea value={summary.labSummary} onChange={(event) => setSummary((current) => ({ ...current, labSummary: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Lab summary" />
          <textarea value={summary.followUpPlan} onChange={(event) => setSummary((current) => ({ ...current, followUpPlan: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Follow-up plan" />
          <textarea value={summary.redFlags} onChange={(event) => setSummary((current) => ({ ...current, redFlags: event.target.value }))} rows={2} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Danger signs / red flags" />
          <select value={summary.status} onChange={(event) => setSummary((current) => ({ ...current, status: event.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"><option>draft</option><option>final</option></select>
          <button type="submit" disabled={loading} className="mt-4 w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:bg-slate-300">Save visit summary</button>
          {lastSummary && <p className="mt-4 rounded-2xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700">Summary saved: {lastSummary.status}</p>}
        </form>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="font-black text-slate-900">Medication orders</h3><div className="mt-3 space-y-2">{orders.length === 0 && <p className="text-sm text-slate-500">No orders loaded.</p>}{orders.map((order) => <div key={order.id} className="rounded-2xl bg-slate-50 p-3 text-sm"><p className="font-bold">{order.diagnosis || order.id}</p><p className="text-xs text-slate-500">{order.status} · {order.verification_code}</p></div>)}</div></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="font-black text-slate-900">Lab results</h3><div className="mt-3 space-y-2">{labResults.length === 0 && <p className="text-sm text-slate-500">No results loaded.</p>}{labResults.map((item) => <div key={item.id} className={`rounded-2xl p-3 text-sm ${item.critical_flag ? 'bg-red-50 text-red-800' : item.abnormal_flag ? 'bg-amber-50 text-amber-800' : 'bg-slate-50 text-slate-700'}`}><p className="font-bold">{item.test_name}</p><p className="text-xs">{item.status} · {safeDate(item.created_at)}</p></div>)}</div></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="font-black text-slate-900">Visit summaries</h3><div className="mt-3 space-y-2">{summaries.length === 0 && <p className="text-sm text-slate-500">No summaries loaded.</p>}{summaries.map((item) => <div key={item.id} className="rounded-2xl bg-slate-50 p-3 text-sm"><p className="font-bold">{item.diagnosis || item.id}</p><p className="text-xs text-slate-500">{item.status} · {safeDate(item.created_at)}</p></div>)}</div></div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50"><div className="flex items-start gap-3"><Stethoscope className="h-5 w-5 text-brand-700" /><div><h2 className="font-black text-slate-900">Safety rule</h2><p className="mt-1 text-sm leading-6 text-slate-600">The checks here are basic safety prompts only. They are not a full medicine interaction database and do not replace licensed clinical judgment.</p></div></div></section>
    </main>
  )
}

export default ClinicalSafetyOS
