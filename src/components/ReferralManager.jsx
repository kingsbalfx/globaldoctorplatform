import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'
import { useError } from './ErrorHandler'

function ReferralManager() {
  const { addError } = useError()
  const [showReferralForm, setShowReferralForm] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [selectedPatientName, setSelectedPatientName] = useState('')
  const [referralsList, setReferralsList] = useState([])
  const [loading, setLoading] = useState(false)
  const [referralData, setReferralData] = useState({
    reason: '',
    targetSpecialty: 'Cardiology',
    notes: '',
  })

  const specialties = ['Cardiology', 'Dermatology', 'Psychiatry', 'Pediatrics', 'Oncology', 'Orthopedics', 'Neurology', 'Urology', 'Gynaecologist', 'Obstetrics & Gynecology', 'Ophthalmology', 'General Practitioner']

  const loadReferrals = async () => {
    try {
      const response = await apiFetch(`/api/admin/referrals`)
      if (!response.ok) {
        throw new Error('Unable to load referrals')
      }
      const data = await response.json()
      setReferralsList(data.referrals || [])
    } catch (error) {
      console.error('Referral load failed:', error)
      setReferralsList([])
    }
  }

  useEffect(() => {
    loadReferrals()
  }, [])

  const handleCreateReferral = async (event) => {
    event.preventDefault()
    if (!selectedPatientId || !selectedPatientName) {
      addError('Please provide the patient ID and patient name.', 'warning')
      return
    }

    setLoading(true)
    try {
      const response = await apiFetch(`/api/admin/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          fromSpecialty: 'General Practitioner',
          toSpecialty: referralData.targetSpecialty,
          reason: referralData.reason,
          notes: referralData.notes,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to create referral')
      }

      await loadReferrals()
      addError('Referral created successfully.', 'success')
      setShowReferralForm(false)
      setSelectedPatientId('')
      setSelectedPatientName('')
      setReferralData({ reason: '', targetSpecialty: 'Cardiology', notes: '' })
    } catch (error) {
      addError('Error: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Patient Referrals</h2>
        <button
          onClick={() => setShowReferralForm(!showReferralForm)}
          className="rounded-full bg-brand-700 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          {showReferralForm ? 'Cancel' : '+ New Referral'}
        </button>
      </div>

      {showReferralForm && (
        <form onSubmit={handleCreateReferral} className="mb-8 rounded-3xl bg-slate-50 p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Patient ID</label>
              <input
                type="text"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                placeholder="patient-123"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Patient Name</label>
              <input
                type="text"
                value={selectedPatientName}
                onChange={(e) => setSelectedPatientName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reason for Referral</label>
              <input
                type="text"
                placeholder="e.g., Follow-up care, Second opinion"
                value={referralData.reason}
                onChange={(e) => setReferralData({ ...referralData, reason: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Specialty</label>
              <select
                value={referralData.targetSpecialty}
                onChange={(e) => setReferralData({ ...referralData, targetSpecialty: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
              >
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Clinical Notes</label>
            <textarea
              value={referralData.notes}
              onChange={(e) => setReferralData({ ...referralData, notes: e.target.value })}
              placeholder="Add detailed notes for the referral..."
              rows={4}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? 'Creating Referral...' : 'Create Referral'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {referralsList.length > 0 ? (
          referralsList.map((referral) => (
            <div key={referral.id} className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Referral ID</p>
                  <p className="text-lg font-semibold text-slate-900">{referral.id}</p>
                </div>
                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase text-brand-700">{referral.status}</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">Patient: {referral.patientId}</p>
              <p className="text-sm text-slate-600">From: {referral.fromSpecialty} → To: {referral.toSpecialty}</p>
              <p className="mt-2 text-sm text-slate-600">{referral.reason}</p>
            </div>
          ))
        ) : (
          <div className="bg-slate-50 rounded-2xl p-6 text-center">
            <p className="text-slate-600">Referral system ready. Patient referrals will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReferralManager
