import { useState } from 'react'
import { getSpecialtyInfo } from '../lib/specialtyRegistry'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
const specialties = ['Cardiology', 'Dermatology', 'Psychiatry', 'Pediatrics', 'Oncology', 'Orthopedics', 'Neurology', 'Obstetrics & Gynecology', 'Ophthalmology', 'General Practice']

function PatientReferralPanel({ patient, currentDoctor, onReferralSubmitted }) {
  const [reason, setReason] = useState('')
  const [targetSpecialty, setTargetSpecialty] = useState('Cardiology')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const currentSpecialty = currentDoctor?.specialty || 'General Practice'
  const currentInfo = getSpecialtyInfo(currentSpecialty)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!patient || !reason || !targetSpecialty) {
      setMessage('Please fill in the referral reason and target specialty.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${API_BASE}/api/patients/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          fromSpecialty: currentSpecialty,
          toSpecialty: targetSpecialty,
          reason,
          notes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit referral')
      }

      setMessage('Referral request sent successfully. A specialist will be notified soon.')
      setReason('')
      setNotes('')
      setTargetSpecialty('Cardiology')
      if (onReferralSubmitted) onReferralSubmitted()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
      <div className="rounded-3xl bg-gradient-to-r from-slate-50 to-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-2xl">
            {currentInfo.icon}
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Current specialty</p>
            <p className="text-xl font-semibold text-slate-900">{currentSpecialty}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Referral reason</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why do you need a specialist?"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Target specialty</label>
          <select
            value={targetSpecialty}
            onChange={(e) => setTargetSpecialty(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
          >
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Additional notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any important details for the referral..."
            rows={4}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
          />
        </div>

        {message && <p className="text-sm text-slate-600">{message}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {loading ? 'Sending referral...' : `Refer to ${targetSpecialty}`}
        </button>
      </div>
    </div>
  )
}

export default PatientReferralPanel
