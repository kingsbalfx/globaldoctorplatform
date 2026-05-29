import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'

const FACILITY_TYPES = [
  { id: 'private_clinic', label: 'Private Clinic' },
  { id: 'phc', label: 'PHC (Primary Health Care)' },
  { id: 'lab', label: 'Laboratory' },
]

function FacilityReferralManager({ doctor }) {
  const doctorId = doctor?.id || ''

  const [facilityType, setFacilityType] = useState('private_clinic')
  const [facilitiesForType, setFacilitiesForType] = useState([])
  const [facilityIndex, setFacilityIndex] = useState([])
  const [facilityId, setFacilityId] = useState('')

  const [patientId, setPatientId] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [created, setCreated] = useState(null)
  const [history, setHistory] = useState([])

  const facilityMap = useMemo(() => {
    const map = new Map()
    for (const f of facilityIndex) map.set(f.id, f)
    return map
  }, [facilityIndex])

  const loadFacilities = async (type) => {
    try {
      const response = await apiFetch(`/api/facilities?type=${encodeURIComponent(type)}`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to load facilities')
      setFacilitiesForType(Array.isArray(data.facilities) ? data.facilities : [])
      setFacilityId('')
    } catch (err) {
      setFacilitiesForType([])
      setFacilityId('')
      setMessage(err.message)
    }
  }

  const loadFacilityIndex = async () => {
    try {
      const response = await apiFetch(`/api/facilities`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to load facilities')
      setFacilityIndex(Array.isArray(data.facilities) ? data.facilities : [])
    } catch {
      setFacilityIndex([])
    }
  }

  const loadHistory = async () => {
    if (!doctorId) return
    try {
      const response = await apiFetch(`/api/referrals/facility?doctorId=${encodeURIComponent(doctorId)}`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to load history')
      setHistory(Array.isArray(data.referrals) ? data.referrals : [])
    } catch (err) {
      setHistory([])
    }
  }

  useEffect(() => {
    void loadFacilities(facilityType)
  }, [facilityType])

  useEffect(() => {
    void loadHistory()
    void loadFacilityIndex()
  }, [doctorId])

  const createReferral = async (event) => {
    event.preventDefault()
    if (!doctorId) return
    if (!patientId.trim() || !facilityId || !reason.trim()) {
      setMessage('Patient ID, facility, and reason are required.')
      return
    }

    setLoading(true)
    setMessage('')
    setCreated(null)
    try {
      const response = await apiFetch(`/api/referrals/facility/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          patientId: patientId.trim(),
          facilityId,
          reason: reason.trim(),
          notes: notes.trim(),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to create referral')

      setCreated(data.referral || null)
      setPatientId('')
      setReason('')
      setNotes('')
      await loadHistory()
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = async () => {
    const code = created?.code
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setMessage('Referral code copied.')
      setTimeout(() => setMessage(''), 1500)
    } catch {
      setMessage('Could not copy. Please select and copy manually.')
    }
  }

  const selectedFacility = facilityMap.get(facilityId) || null

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
        <h2 className="text-2xl font-bold text-slate-900">Facility Referrals</h2>
        <p className="mt-2 text-sm text-slate-600">
          Create a referral code for a PHC/clinic/lab. The facility redeems the code in their portal.
        </p>

        <form onSubmit={createReferral} className="mt-6 grid gap-4 lg:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Patient ID
            <input
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
              placeholder="patient-123"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Facility type
            <select
              value={facilityType}
              onChange={(e) => setFacilityType(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
            >
              {FACILITY_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700 lg:col-span-2">
            Select facility
            <select
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
            >
              <option value="">Choose facility</option>
              {facilitiesForType.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} {f.state ? `- ${f.state}` : ''} {f.lga ? `(${f.lga})` : ''}
                </option>
              ))}
            </select>
            {selectedFacility && (
              <p className="mt-2 text-xs text-slate-500">
                Referral payout on redeem: <span className="font-semibold text-slate-700">₦{selectedFacility.referral_payout_ngn || 0}</span>
              </p>
            )}
          </label>

          <label className="text-sm font-semibold text-slate-700 lg:col-span-2">
            Reason
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
              placeholder="e.g., needs physical exam / malaria test / blood pressure check"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700 lg:col-span-2">
            Notes (optional)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
              placeholder="Add short clinical notes for the facility..."
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="lg:col-span-2 rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create referral code'}
          </button>

          {message && <p className="lg:col-span-2 text-sm text-slate-600">{message}</p>}
        </form>

        {created?.code && (
          <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-sm font-semibold text-emerald-900">Referral code</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="rounded-2xl bg-white px-4 py-4 text-xl font-bold tracking-wider text-slate-900 shadow-sm">
                {created.code}
              </p>
              <button
                type="button"
                onClick={copyCode}
                className="rounded-2xl bg-emerald-700 px-6 py-4 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Copy
              </button>
            </div>
            <p className="mt-3 text-xs text-emerald-900/80">
              Ask the patient to show this code to the facility staff. Facility redeems it in the Facility Portal.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-slate-900">Your recent facility referrals</h3>
          <button
            type="button"
            onClick={loadHistory}
            className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Refresh
          </button>
        </div>

        {history.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-slate-50 p-6 text-slate-600">No facility referrals yet.</div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Facility</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payout</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {history.slice(0, 50).map((r) => (
                  <tr key={r.id} className="bg-white">
                    <td className="px-4 py-3 font-semibold text-slate-900">{r.code}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {facilityMap.get(r.facility_id)?.name || r.facility_id}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                        r.status === 'redeemed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : r.status === 'expired'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">₦{r.payout_ngn || 0}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default FacilityReferralManager
