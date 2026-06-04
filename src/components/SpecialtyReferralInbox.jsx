import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'
import { getSpecialtyInfo } from '../lib/specialtyRegistry'

function SpecialtyReferralInbox({ doctor, onAcceptReferral }) {
  const [referrals, setReferrals] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState('')

  const loadReferrals = async () => {
    if (!doctor?.specialty) return
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        specialty: doctor.specialty,
        targetDoctorId: doctor.id,
      })
      const response = await apiFetch(`/api/referrals/specialty?${params.toString()}`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to load specialty referrals')
      const rows = Array.isArray(data.referrals) ? data.referrals : []
      setReferrals(rows)
      setSelected((current) => current || rows[0] || null)
    } catch (err) {
      setReferrals([])
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadReferrals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor?.specialty])

  const record = selected?.record_snapshot || {}
  const patient = selected?.patient_snapshot || record.patient || {}
  const specialtyInfo = getSpecialtyInfo(doctor?.specialty || selected?.to_specialty || 'General Practitioner')

  const acceptReferral = async () => {
    if (!selected?.id || !doctor?.id) return
    setAccepting(true)
    setError('')
    try {
      const response = await apiFetch(`/api/referrals/specialty/${encodeURIComponent(selected.id)}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: doctor.id }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to accept referral')
      setSelected(data.referral || selected)
      setReferrals((rows) => rows.map((row) => row.id === selected.id ? (data.referral || row) : row))
      onAcceptReferral?.({
        patient: data.patient || patient,
        consultation: data.consultation,
        referral: data.referral || selected,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setAccepting(false)
    }
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: specialtyInfo.color }}>
            {doctor?.specialty || 'Specialty'} referrals
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Specialty Referral Inbox</h2>
          <p className="mt-2 text-sm text-slate-600">
            Referrals sent to {doctor?.specialty || 'your specialty'} arrive here with the patient record attached.
          </p>
        </div>
        <button
          type="button"
          onClick={loadReferrals}
          disabled={loading}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh referrals'}
        </button>
      </div>

      {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
        <div className="space-y-3">
          {referrals.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">No specialty referrals yet.</div>
          ) : (
            referrals.map((referral) => (
              <button
                key={referral.id}
                type="button"
                onClick={() => setSelected(referral)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selected?.id === referral.id ? 'border-brand-300 bg-brand-50' : 'border-slate-200 bg-slate-50 hover:border-brand-200'
                }`}
              >
                <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">{referral.status || 'pending'}</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{referral.patient_snapshot?.name || referral.patient_id}</p>
                <p className="mt-1 text-xs text-slate-500">{referral.from_specialty || 'Unknown specialty'} to {referral.to_specialty}</p>
                {referral.target_doctor_id && (
                  <p className="mt-1 text-xs font-semibold text-brand-700">Assigned to you</p>
                )}
                <p className="mt-2 line-clamp-2 text-xs text-slate-600">{referral.reason}</p>
              </button>
            ))
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          {!selected ? (
            <p className="text-sm text-slate-600">Select a referral to review the patient handover.</p>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Patient</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">{patient.name || selected.patient_id}</h3>
                <p className="mt-1 text-sm text-slate-500">{selected.patient_id}</p>
              </div>

              <button
                type="button"
                onClick={acceptReferral}
                disabled={accepting || selected.status === 'accepted'}
                className="w-full rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: specialtyInfo.color }}
              >
                {selected.status === 'accepted' ? 'Referral accepted' : accepting ? 'Opening consultation...' : 'Accept referral and open consultation'}
              </button>
              {selected.status === 'accepted' && selected.consultation_id && (
                <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                  Room opened: {selected.consultation_id}
                </p>
              )}

              <div className="rounded-2xl bg-brand-50 p-4">
                <p className="text-sm font-bold text-slate-900">Referral reason</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{selected.reason}</p>
                {selected.notes && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{selected.notes}</p>}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Stat label="Vitals" value={record.vitals?.length || 0} />
                <Stat label="Reviews" value={record.reviews?.length || 0} />
                <Stat label="Notes" value={record.clinical_notes?.length || 0} />
                <Stat label="Files" value={record.files?.length || 0} />
                <Stat label="Prescriptions" value={record.prescriptions?.length || 0} />
                <Stat label="Labs" value={record.labs?.orders?.length || 0} />
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">Recent clinical notes</p>
                {(record.clinical_notes || []).slice(0, 3).map((note) => (
                  <div key={note.id} className="mt-3 rounded-xl bg-white p-3 ring-1 ring-slate-100">
                    <p className="text-xs font-semibold text-slate-500">{new Date(note.created_at).toLocaleString()}</p>
                    <p className="mt-1 text-sm text-slate-700">{note.diagnosis}</p>
                    <p className="mt-1 text-xs text-slate-500">{note.plan}</p>
                  </div>
                ))}
                {(record.clinical_notes || []).length === 0 && <p className="mt-2 text-sm text-slate-500">No clinical notes attached.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
    </div>
  )
}

export default SpecialtyReferralInbox
