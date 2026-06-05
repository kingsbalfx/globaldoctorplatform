import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'
import { useError } from './ErrorHandler'

function AdminSettings() {
  const { addError } = useError()
  const [settings, setSettings] = useState({ minimumSubscriptionUSD: 5 })
  const [onlineStatus, setOnlineStatus] = useState({ doctors: [], patients: [], emergencyRequests: [] })
  const [loading, setLoading] = useState(true)
  const [minPrice, setMinPrice] = useState(settings.minimumSubscriptionUSD)

  useEffect(() => {
    fetchAdminSettings()
    fetchOnlineStatus()
  }, [])

  const fetchAdminSettings = async () => {
    try {
      const response = await apiFetch(`/api/settings`)
      if (!response.ok) throw new Error('Failed to load settings')
      const data = await response.json()
      setSettings(data.settings)
      setMinPrice(data.settings.minimumSubscriptionUSD)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchOnlineStatus = async () => {
    try {
      const response = await apiFetch(`/api/online/status`)
      if (!response.ok) throw new Error('Failed to load online status')
      const data = await response.json()
      setOnlineStatus(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      const response = await apiFetch(`/api/admin/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minimumSubscriptionUSD: Number(minPrice) }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save settings')
      }
      const data = await response.json().catch(() => ({}))
      setSettings(data.settings)
      addError('Settings updated successfully.', 'success')
    } catch (error) {
      addError(error.message, 'error')
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">Platform Settings</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-6">
            <p className="text-sm text-slate-600">Minimum subscription cost in USD.</p>
            <input
              type="number"
              min="1"
              step="1"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
            />
            <button
              onClick={handleSaveSettings}
              className="mt-5 rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Save Minimum Subscription
            </button>
          </div>

          <div className="rounded-3xl bg-slate-50 p-6">
            <p className="text-sm text-slate-600">Current minimum subscription value used across the patient portal.</p>
            <p className="mt-4 text-3xl font-semibold text-brand-700">${settings.minimumSubscriptionUSD}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">Online Health Team</h3>
            <p className="text-sm text-slate-500">See which doctors and patients are currently online.</p>
          </div>
          <button
            onClick={fetchOnlineStatus}
            className="rounded-2xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-slate-600">Loading online status...</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-6">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">Online Doctors</h4>
              {onlineStatus.doctors.length === 0 ? (
                <p className="text-sm text-slate-500">No doctors are online right now.</p>
              ) : (
                <ul className="space-y-3">
                  {onlineStatus.doctors.map((doctor) => (
                    <li key={doctor.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-900">{doctor.name}</p>
                        <p className="text-sm text-slate-500">{doctor.specialty}</p>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Online
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-3xl bg-slate-50 p-6">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">Online Patients</h4>
              {onlineStatus.patients.length === 0 ? (
                <p className="text-sm text-slate-500">No patients are online right now.</p>
              ) : (
                <ul className="space-y-3">
                  {onlineStatus.patients.map((patient) => (
                    <li key={patient.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-900">{patient.name}</p>
                        <p className="text-sm text-slate-500">{patient.email}</p>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Online
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
        <h3 className="text-2xl font-semibold text-slate-900 mb-4">Emergency Requests</h3>
        {onlineStatus.emergencyRequests.length === 0 ? (
          <p className="text-sm text-slate-500">No emergency requests at the moment.</p>
        ) : (
          <div className="space-y-4">
            {onlineStatus.emergencyRequests.map((request) => (
              <div key={request.id} className="rounded-3xl border border-red-100 bg-red-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{request.patientName}</p>
                    <p className="text-sm text-slate-500">{request.reason}</p>
                  </div>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase text-red-700">Emergency</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Requested at {new Date(request.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminSettings
