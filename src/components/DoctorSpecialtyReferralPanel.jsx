import { useEffect, useState } from 'react'
import { getSpecialtyInfo } from '../lib/specialtyRegistry'
import { apiFetch } from '../lib/apiFetch'

const specialties = [
  'General Practitioner',
  'Cardiology',
  'Dermatology',
  'Psychiatry',
  'Pediatrics',
  'Oncology',
  'Orthopedics',
  'Neurology',
  'Urology',
  'Gynaecologist',
  'Obstetrics & Gynecology',
  'Ophthalmology',
]

function DoctorSpecialtyReferralPanel({ doctor, patient, consultationId, onCreated }) {
  const currentSpecialty = doctor?.specialty || 'General Practitioner'
  const [targetSpecialty, setTargetSpecialty] = useState(() => specialties.find((item) => item !== currentSpecialty) || 'Urology')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [targetDoctors, setTargetDoctors] = useState([])
  const [targetDoctorId, setTargetDoctorId] = useState('')
  const [appointmentAt, setAppointmentAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [message, setMessage] = useState('')
  const [created, setCreated] = useState(null)

  const currentInfo = getSpecialtyInfo(currentSpecialty)
  const targetInfo = getSpecialtyInfo(targetSpecialty)

  const loadTargetDoctors = async () => {
    if (!targetSpecialty) return
    setLoadingDoctors(true)
    try {
      const params = new URLSearchParams({
        specialty: targetSpecialty,
        excludeDoctorId: doctor?.id || '',
      })
      const response = await apiFetch(`/api/referrals/specialty/doctors?${params.toString()}`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to load specialists')
      const rows = Array.isArray(data.doctors) ? data.doctors : []
      setTargetDoctors(rows)
      setTargetDoctorId((current) => rows.some((item) => item.id === current) ? current : rows[0]?.id || '')
    } catch (error) {
      setTargetDoctors([])
      setTargetDoctorId('')
      setMessage(error.message)
    } finally {
      setLoadingDoctors(false)
    }
  }

  useEffect(() => {
    void loadTargetDoctors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetSpecialty, doctor?.id])

  const submit = async (event) => {
    event.preventDefault()
    if (!doctor?.id || !patient?.id || !targetSpecialty || !reason.trim()) {
      setMessage('Select a specialty and enter the clinical reason.')
      return
    }

    setLoading(true)
    setMessage('')
    setCreated(null)
    try {
      const response = await apiFetch('/api/referrals/specialty/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctor.id,
          patientId: patient.id,
          consultationId,
          fromSpecialty: currentSpecialty,
          toSpecialty: targetSpecialty,
          targetDoctorId: targetDoctorId || undefined,
          appointmentAt: appointmentAt || undefined,
          reason: reason.trim(),
          notes: notes.trim(),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to create specialty referral')
      setCreated(data.referral || null)
      setReason('')
      setNotes('')
      setAppointmentAt('')
      setMessage(data.appointment ? 'Referral created and appointment sent to patient.' : 'Referral created. The selected specialist and patient were notified.')
      onCreated?.(data.referral)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">From</p>
          <p className="mt-2 text-lg font-bold text-slate-900">{currentInfo.logo} {currentSpecialty}</p>
        </div>
        <div className="rounded-2xl border border-brand-100 p-4" style={{ backgroundColor: targetInfo.bgColor }}>
          <p className="text-xs font-black uppercase tracking-[0.16em]" style={{ color: targetInfo.color }}>To</p>
          <p className="mt-2 text-lg font-bold text-slate-900">{targetInfo.logo} {targetSpecialty}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-100">
        The referral attaches the patient profile, consultation history, reviews, vitals, clinical notes, files, prescriptions, and lab history.
      </div>

      <form onSubmit={submit} className="grid gap-4">
        <label className="text-sm font-semibold text-slate-700">
          Target specialty
          <select
            value={targetSpecialty}
            onChange={(event) => setTargetSpecialty(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
          >
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
        </label>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900">Select specialist</p>
              <p className="mt-1 text-xs text-slate-500">Online specialists are shown first. Offline specialists can still receive notifications and appointments.</p>
            </div>
            <button
              type="button"
              onClick={loadTargetDoctors}
              disabled={loadingDoctors}
              className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 disabled:opacity-50"
            >
              {loadingDoctors ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {targetDoctors.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-600">No verified {targetSpecialty} doctors found yet.</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {targetDoctors.map((item) => {
                const online = Boolean(item.isOnline || item.is_online)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTargetDoctorId(item.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      targetDoctorId === item.id ? 'border-brand-400 bg-white shadow-sm' : 'border-slate-200 bg-white/70 hover:border-brand-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Dr. {item.name || item.id}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.location || 'Location not set'} | Rating {Number(item.rating || 0).toFixed(1)}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${online ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        {online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <label className="text-sm font-semibold text-slate-700">
          Optional appointment time for patient
          <input
            type="datetime-local"
            value={appointmentAt}
            onChange={(event) => setAppointmentAt(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
          />
          <span className="mt-2 block text-xs text-slate-500">If set, the patient will see the specialist appointment in their portal.</span>
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Clinical reason
          <input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
            placeholder="e.g. recurrent urinary symptoms, specialist urology review needed"
          />
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Handover notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
            placeholder="Summarize findings, red flags, tests already done, and what the specialist should review."
          />
        </label>

        {message && (
          <p className={`rounded-2xl px-4 py-3 text-sm ${created ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-700'}`}>
            {message}
          </p>
        )}

        {created?.id && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Referral ID</p>
            <p className="mt-1 break-all text-sm font-bold text-slate-900">{created.id}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {loading ? 'Creating referral...' : `Refer to ${targetSpecialty}`}
        </button>
      </form>
    </div>
  )
}

export default DoctorSpecialtyReferralPanel
