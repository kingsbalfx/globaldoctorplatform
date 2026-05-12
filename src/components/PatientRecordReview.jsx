import { useState } from 'react'
import { API_BASE } from '../lib/apiBase'

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

function PatientRecordReview() {
  const [patientId, setPatientId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [record, setRecord] = useState(null)

  const load = async () => {
    if (!patientId.trim()) {
      setError('Enter a patient ID.')
      return
    }
    setLoading(true)
    setError('')
    setRecord(null)
    try {
      const response = await fetch(`${API_BASE}/api/patients/${encodeURIComponent(patientId.trim())}/record`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to load patient record')
      setRecord(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const patient = record?.patient || null

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
        <h2 className="text-2xl font-bold text-slate-900">Patient Record Review</h2>
        <p className="mt-2 text-sm text-slate-600">
          Load a patient profile, files, referrals, consultations, and lab history.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none focus:border-brand-500"
            placeholder="patient-..."
          />
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="rounded-2xl bg-brand-700 px-6 py-4 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Load record'}
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>

      {patient && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900">Patient profile</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Name</p>
                <p className="mt-1 font-semibold text-slate-900">{patient.name || '—'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Patient ID</p>
                <p className="mt-1 font-semibold text-slate-900">{patient.id}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Phone</p>
                <p className="mt-1 font-semibold text-slate-900">{patient.phone || '—'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Registered via</p>
                <p className="mt-1 font-semibold text-slate-900">{patient.registered_via || '—'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <StatCard label="Tokens" value={record?.tokens?.balance ?? 0} />
            <StatCard label="Files" value={record?.files?.length ?? 0} />
            <StatCard label="Facility Referrals" value={record?.referrals?.facility?.length ?? 0} />
          </div>
        </div>
      )}

      {patient && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg font-semibold text-slate-900">Files & documents</h3>
            {record.files?.length ? (
              <div className="mt-4 space-y-3">
                {record.files.slice(0, 20).map((f) => (
                  <div key={f.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">{f.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(f.createdAt || f.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-slate-50 p-6 text-slate-600">No files uploaded yet.</div>
            )}
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg font-semibold text-slate-900">Referrals</h3>
            <div className="mt-4 space-y-3">
              {(record.referrals?.facility || []).slice(0, 10).map((r) => (
                <div key={r.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">{r.code}</p>
                  <p className="mt-1 text-xs text-slate-600">{r.reason}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Status: {r.status} • Payout: ₦{r.payout_ngn || 0}
                  </p>
                </div>
              ))}
              {(record.referrals?.facility || []).length === 0 && (
                <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">No facility referrals.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {patient && (
        <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
          <h3 className="text-lg font-semibold text-slate-900">Consultations & labs</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <StatCard label="Consultations (NG)" value={record.consultations_ng?.length ?? 0} />
            <StatCard label="Lab orders" value={record.labs?.orders?.length ?? 0} />
            <StatCard label="Lab payments" value={record.labs?.payments?.length ?? 0} />
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientRecordReview

