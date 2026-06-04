import { useState } from 'react'
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
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [created, setCreated] = useState(null)

  const currentInfo = getSpecialtyInfo(currentSpecialty)
  const targetInfo = getSpecialtyInfo(targetSpecialty)

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
          reason: reason.trim(),
          notes: notes.trim(),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to create specialty referral')
      setCreated(data.referral || null)
      setReason('')
      setNotes('')
      setMessage('Referral created. The specialist will receive the patient record snapshot.')
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
