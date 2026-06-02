import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

function PatientRecordReview({ initialPatientId = '', autoLoad = false }) {
  const [patientId, setPatientId] = useState(initialPatientId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [record, setRecord] = useState(null)

  const load = async (nextPatientId = patientId) => {
    if (!nextPatientId.trim()) {
      setError('Enter a patient ID.')
      return
    }
    setLoading(true)
    setError('')
    setRecord(null)
    try {
      const response = await apiFetch(`/api/patients/${encodeURIComponent(nextPatientId.trim())}/record`)
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

  useEffect(() => {
    setPatientId(initialPatientId)
    if (autoLoad && initialPatientId) void load(initialPatientId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPatientId, autoLoad])

  const downloadFile = async (file) => {
    const response = await apiFetch(`/api/patients/files/${encodeURIComponent(file.id)}/download?patientId=${encodeURIComponent(patient.id)}`)
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Download failed')
    const blob = new Blob([Uint8Array.from(atob(data.contentBase64), (c) => c.charCodeAt(0))], { type: data.mimeType })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = data.name || file.name
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const printPatientReviewPdf = () => {
    const html = `<!doctype html><html><head><title>Patient Review - ${patient?.name || patient?.id}</title><style>body{font-family:Arial,sans-serif;color:#0f172a;padding:30px}h1{color:#0f766e}.box{border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin:10px 0}.label{font-size:11px;color:#64748b;text-transform:uppercase}.value{font-weight:700;margin-top:5px}table{width:100%;border-collapse:collapse;margin-top:12px}td,th{border:1px solid #e2e8f0;padding:8px;text-align:left}</style></head><body><h1>GlobalDoc Patient Review</h1><div class="box"><p class="label">Patient</p><p class="value">${patient?.name || ''} (${patient?.id || ''})</p></div><h2>Clinical Continuation Notes</h2>${(record?.clinical_notes || []).map((n) => `<div class="box"><p class="label">${new Date(n.created_at).toLocaleString()}</p><p class="value">Diagnosis</p><p>${n.diagnosis || ''}</p><p class="value">Plan</p><p>${n.plan || ''}</p><p>${n.follow_up || ''}</p></div>`).join('')}<h2>Vitals</h2><table><tr><th>Vital</th><th>Value</th><th>Source</th><th>Date</th></tr>${(record?.vitals || []).map((v) => `<tr><td>${v.parameter_name}</td><td>${v.parameter_value} ${v.unit || ''}</td><td>${v.source || ''}</td><td>${new Date(v.measured_at || v.created_at).toLocaleString()}</td></tr>`).join('')}</table><h2>Specialty Referrals</h2>${(record?.referrals?.specialty || []).map((r) => `<div class="box"><p class="value">${r.from_specialty || ''} to ${r.to_specialty || ''} - ${r.status}</p><p>${r.reason || ''}</p><p>${r.notes || ''}</p></div>`).join('')}<h2>Facility Referrals</h2>${(record?.referrals?.facility || []).map((r) => `<div class="box"><p class="value">${r.code} - ${r.status}</p><p>${r.reason || ''}</p><p>${r.notes || ''}</p></div>`).join('')}<h2>Reviews</h2>${(record?.reviews || []).map((r) => `<div class="box"><p class="value">${r.rating}/5</p><p>${r.comment || ''}</p></div>`).join('')}<h2>Files</h2>${(record?.files || []).map((f) => `<div class="box">${f.name}</div>`).join('')}</body></html>`
    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    win.focus()
    win.print()
  }

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
        {patient && (
          <button type="button" onClick={printPatientReviewPdf} className="mt-4 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Download patient review as PDF
          </button>
        )}
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
            <StatCard label="Specialty Referrals" value={record?.referrals?.specialty?.length ?? 0} />
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
                    <button type="button" onClick={() => downloadFile(f).catch((err) => setError(err.message))} className="mt-3 rounded-full bg-brand-700 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600">
                      Download file
                    </button>
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
              {(record.referrals?.specialty || []).slice(0, 10).map((r) => (
                <div key={r.id} className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">{r.from_specialty || 'Specialty'} to {r.to_specialty}</p>
                  <p className="mt-1 text-xs text-slate-600">{r.reason}</p>
                  <p className="mt-1 text-xs text-slate-500">Status: {r.status}</p>
                </div>
              ))}
              {(record.referrals?.facility || []).slice(0, 10).map((r) => (
                <div key={r.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">{r.code}</p>
                  <p className="mt-1 text-xs text-slate-600">{r.reason}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Status: {r.status} • Payout: ₦{r.payout_ngn || 0}
                  </p>
                </div>
              ))}
              {(record.referrals?.facility || []).length === 0 && (record.referrals?.specialty || []).length === 0 && (
                <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">No referrals.</div>
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
            <StatCard label="Vitals" value={record.vitals?.length ?? 0} />
            <StatCard label="Reviews" value={record.reviews?.length ?? 0} />
            <StatCard label="Prescriptions" value={record.prescriptions?.length ?? 0} />
            <StatCard label="Clinical Notes" value={record.clinical_notes?.length ?? 0} />
          </div>
        </div>
      )}

      {patient && (
        <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
          <h3 className="text-lg font-semibold text-slate-900">Clinical continuation notes</h3>
          {(record.clinical_notes || []).length === 0 ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-6 text-slate-600">No clinical notes saved yet.</div>
          ) : (
            <div className="mt-4 space-y-3">
              {(record.clinical_notes || []).slice(0, 10).map((note) => (
                <div key={note.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">{new Date(note.created_at).toLocaleString()}</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">Diagnosis</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{note.diagnosis}</p>
                  <p className="mt-3 text-sm font-bold text-slate-900">Plan</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{note.plan}</p>
                  {note.follow_up && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{note.follow_up}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PatientRecordReview
