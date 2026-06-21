import { useState } from 'react'
import { apiFetch } from '../lib/apiFetch'

function OperationsOS() {
  const [facilityId, setFacilityId] = useState('')
  const [patientCode, setPatientCode] = useState('')
  const [fullName, setFullName] = useState('')
  const [pin, setPin] = useState('')
  const [reason, setReason] = useState('')
  const [output, setOutput] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function callApi(body) {
    setLoading(true)
    setError('')
    setOutput(null)
    try {
      const response = await apiFetch('/api/operations/hospital', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Action failed')
      setOutput(data)
      if (data.patientCode) setPatientCode(data.patientCode)
    } catch (err) {
      setError(err.message || 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  async function loadDashboard() {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (facilityId) params.set('facilityId', facilityId)
      if (patientCode) params.set('patientCode', patientCode)
      const response = await apiFetch(`/api/operations/hospital?${params.toString()}`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not load')
      setOutput(data)
    } catch (err) {
      setError(err.message || 'Could not load')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
      <section className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/20">
        <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-brand-50">Phase 3</p>
        <h1 className="mt-4 text-4xl font-black">Hospital / PHC Operations OS</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">Clinic operations foundation: local registration, queue, referral, pharmacy dispense and lab workflow.</p>
      </section>

      {error && <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
        <div className="grid gap-3 md:grid-cols-2">
          <input value={facilityId} onChange={(event) => setFacilityId(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" placeholder="Facility ID" />
          <input value={patientCode} onChange={(event) => setPatientCode(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" placeholder="Patient Code" />
        </div>
        <button type="button" onClick={loadDashboard} disabled={loading} className="mt-4 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white disabled:bg-slate-300">Load operations</button>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
          <h2 className="text-xl font-black text-slate-900">Local registration</h2>
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" placeholder="Full name" />
          <input value={pin} onChange={(event) => setPin(event.target.value)} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" placeholder="Access PIN" />
          <button type="button" onClick={() => callApi({ module: 'phc_patient', facilityId, fullName, pin, consentGiven: true })} disabled={loading} className="mt-4 w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300">Create local patient</button>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
          <h2 className="text-xl font-black text-slate-900">Queue / referral</h2>
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={5} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" placeholder="Reason" />
          <button type="button" onClick={() => callApi({ module: 'queue', facilityId, patientCode, reason, queueType: 'triage', priority: 'normal' })} disabled={loading} className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300">Add to queue</button>
          <button type="button" onClick={() => callApi({ module: 'referral', fromFacilityId: facilityId, patientCode, reason, urgency: 'routine' })} disabled={loading} className="mt-3 w-full rounded-2xl bg-blue-700 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300">Create referral</button>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
          <h2 className="text-xl font-black text-slate-900">Pharmacy / lab</h2>
          <input value={reason} onChange={(event) => setReason(event.target.value)} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" placeholder="Medicine or test name" />
          <button type="button" onClick={() => callApi({ module: 'pharmacy', facilityId, patientCode, medicineName: reason, quantity: '1' })} disabled={loading} className="mt-4 w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300">Save dispense</button>
          <button type="button" onClick={() => callApi({ module: 'lab_workflow', facilityId, patientCode, testName: reason, status: 'requested' })} disabled={loading} className="mt-3 w-full rounded-2xl bg-amber-600 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300">Save lab workflow</button>
        </section>
      </div>

      {output && <pre className="mt-8 max-h-[420px] overflow-auto rounded-3xl bg-slate-950 p-5 text-xs text-slate-100">{JSON.stringify(output, null, 2)}</pre>}
    </main>
  )
}

export default OperationsOS
