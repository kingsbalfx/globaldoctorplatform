import { useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../lib/apiBase'
import DoctorCommunityChat from '../components/DoctorCommunityChat'
import DoctorManagement from '../components/DoctorManagement'

const AUDIENCES = [
  { id: 'landing', label: 'Landing Page' },
  { id: 'patient', label: 'Patient Dashboard' },
  { id: 'doctor', label: 'Doctor Dashboard' },
]

const SEVERITIES = [
  { id: 'info', label: 'Info' },
  { id: 'warning', label: 'Warning' },
  { id: 'urgent', label: 'Urgent' },
]

function PlatformAdminDashboard({ adminSession, onLogout }) {
  const credentials = adminSession?.credentials || null
  const admin = adminSession?.admin || null

  const [activeSection, setActiveSection] = useState('doctors') // doctors | broadcasts | facilities | community | audit

  const [selectedAudience, setSelectedAudience] = useState('landing')
  const [severity, setSeverity] = useState('info')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [expiresHours, setExpiresHours] = useState(24)

  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState(null)

  const [facilities, setFacilities] = useState([])
  const [facilityFilter, setFacilityFilter] = useState('')
  const [facilityForm, setFacilityForm] = useState({
    type: 'phc',
    name: '',
    state: '',
    lga: '',
    address: '',
    phone: '',
    email: '',
    referral_payout_ngn: 0,
    pin: '',
  })
  const [funding, setFunding] = useState({ facilityId: '', amount_ngn: '' })

  const [auditLogs, setAuditLogs] = useState([])

  const headers = useMemo(() => {
    if (!credentials?.email || !credentials?.password) return null
    return {
      'Content-Type': 'application/json',
      'x-admin-email': credentials.email,
      'x-admin-password': credentials.password,
    }
  }, [credentials?.email, credentials?.password])

  const loadConfig = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/config`)
      const data = await response.json().catch(() => null)
      if (response.ok) setConfig(data)
    } catch {
      // ignore
    }
  }

  const loadAnnouncements = async (audience) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/announcements?audience=${encodeURIComponent(audience)}`)
      const data = await response.json().catch(() => ({}))
      setAnnouncements(Array.isArray(data.announcements) ? data.announcements : [])
    } catch {
      setAnnouncements([])
    } finally {
      setLoading(false)
    }
  }

  const publishAnnouncement = async (event) => {
    event.preventDefault()
    if (!headers) {
      alert('Missing admin credentials. Please log in again.')
      return
    }
    if (!title.trim() || !message.trim()) {
      alert('Title and message are required.')
      return
    }

    const expiresAt =
      expiresHours && Number(expiresHours) > 0
        ? new Date(Date.now() + Number(expiresHours) * 60 * 60 * 1000).toISOString()
        : null

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/admin/announcements`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          audience: selectedAudience,
          severity,
          title: title.trim(),
          message: message.trim(),
          expires_at: expiresAt,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to publish announcement')

      setTitle('')
      setMessage('')
      await loadAnnouncements(selectedAudience)
      alert('Announcement published.')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteAnnouncement = async (id) => {
    if (!headers) return
    if (!window.confirm('Delete this announcement?')) return
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/admin/announcements/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to delete announcement')
      await loadAnnouncements(selectedAudience)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadFacilities = async () => {
    if (!headers) return
    setLoading(true)
    try {
      const url = facilityFilter
        ? `${API_BASE}/api/facilities?type=${encodeURIComponent(facilityFilter)}`
        : `${API_BASE}/api/facilities`
      const response = await fetch(url, { headers })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to load facilities')
      setFacilities(Array.isArray(data.facilities) ? data.facilities : [])
    } catch {
      setFacilities([])
    } finally {
      setLoading(false)
    }
  }

  const createFacility = async (event) => {
    event.preventDefault()
    if (!headers) return
    if (!facilityForm.name.trim()) {
      alert('Facility name is required.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/facilities`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...facilityForm,
          name: facilityForm.name.trim(),
          referral_payout_ngn: Number(facilityForm.referral_payout_ngn) || 0,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to create facility')
      setFacilityForm((prev) => ({
        ...prev,
        name: '',
        state: '',
        lga: '',
        address: '',
        phone: '',
        email: '',
        referral_payout_ngn: 0,
        pin: '',
      }))
      await loadFacilities()
      alert(`Facility created. PIN: ${data.facility?.pin || '(hidden)'}`)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fundFacility = async (event) => {
    event.preventDefault()
    if (!headers) return
    if (!funding.facilityId) {
      alert('Select a facility to fund.')
      return
    }
    const amount = Math.round(Number(funding.amount_ngn) || 0)
    if (amount <= 0) {
      alert('Enter a valid NGN amount.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/admin/facilities/${encodeURIComponent(funding.facilityId)}/fund`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount_ngn: amount }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Funding failed')
      setFunding({ facilityId: '', amount_ngn: '' })
      await loadFacilities()
      alert('Wallet funded.')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadAuditLogs = async () => {
    if (!headers) return
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/admin/audit-logs`, { headers })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to load audit logs')
      setAuditLogs(Array.isArray(data.auditLogs) ? data.auditLogs : [])
    } catch {
      setAuditLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!adminSession) return
    void loadConfig()
    void loadAnnouncements(selectedAudience)
  }, [adminSession, selectedAudience])

  useEffect(() => {
    if (!adminSession) return
    if (activeSection === 'facilities') void loadFacilities()
    if (activeSection === 'audit') void loadAuditLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminSession, activeSection, facilityFilter])

  if (!adminSession || !admin || admin.role !== 'admin') {
    return (
      <section className="mx-auto mt-16 max-w-4xl px-6 pb-20 sm:px-8">
        <div className="rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/50 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
          <p className="text-slate-600 mt-2">Log in with the platform admin account to access this dashboard.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto mt-16 max-w-7xl px-6 pb-20 sm:px-8">
      <div className="rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-xl shadow-slate-900/20 mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Platform Admin</h1>
            <p className="mt-2 text-slate-200">
              Signed in as {admin.name} ({admin.email})
            </p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-full bg-white/10 hover:bg-white/15 px-6 py-3 text-sm font-semibold text-white transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {[
          { id: 'doctors', label: 'Doctors' },
          { id: 'broadcasts', label: 'Broadcasts' },
          { id: 'facilities', label: 'Facilities' },
          { id: 'community', label: 'Doctor Community' },
          { id: 'audit', label: 'Audit Logs' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              activeSection === tab.id
                ? 'bg-brand-700 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSection === 'doctors' && <DoctorManagement adminHeaders={headers} />}

      {activeSection === 'broadcasts' && (
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
            <h2 className="text-xl font-semibold text-slate-900">Broadcast Message</h2>
            <p className="mt-2 text-sm text-slate-600">
              Publish an announcement to the Landing Page, Patient Dashboard, or Doctor Dashboard.
            </p>

            <form onSubmit={publishAnnouncement} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">
                  Audience
                  <select
                    value={selectedAudience}
                    onChange={(e) => setSelectedAudience(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                  >
                    {AUDIENCES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Severity
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                  >
                    {SEVERITIES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="text-sm font-semibold text-slate-700">
                Title
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                  placeholder="Short headline (e.g., New clinic partnership in Kano)"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Message
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-2 min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                  placeholder="Write the announcement..."
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Auto-expire (hours)
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={expiresHours}
                  onChange={(e) => setExpiresHours(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                />
                <p className="mt-2 text-xs text-slate-500">Set to 0 to publish without auto-expiry.</p>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:opacity-50"
              >
                {loading ? 'Publishing...' : 'Publish announcement'}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">
              <h3 className="text-lg font-semibold text-slate-900">Environment status</h3>
              <div className="mt-4 grid gap-3 text-sm text-slate-700">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Origin</span>
                  <span className="font-semibold">{config?.origin || 'unknown'}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Kora configured</span>
                  <span className="font-semibold">{config?.configured?.kora ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Agora configured</span>
                  <span className="font-semibold">{config?.configured?.agora ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">Active announcements</h3>
                <button
                  type="button"
                  onClick={() => loadAnnouncements(selectedAudience)}
                  className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <p className="mt-4 text-sm text-slate-500">Loading...</p>
              ) : announcements.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No active announcements for this audience.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {announcements.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-1 text-xs text-slate-600 whitespace-pre-line">{item.message}</p>
                          <p className="mt-2 text-[11px] text-slate-500">
                            {item.severity.toUpperCase()} • {new Date(item.created_at).toLocaleString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteAnnouncement(item.id)}
                          className="rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'facilities' && (
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
            <h2 className="text-2xl font-bold text-slate-900">Create facility</h2>
            <p className="mt-2 text-sm text-slate-600">Add PHCs, private clinics, and labs (in-memory for now).</p>

            <form onSubmit={createFacility} className="mt-6 grid gap-4">
              <label className="text-sm font-semibold text-slate-700">
                Type
                <select
                  value={facilityForm.type}
                  onChange={(e) => setFacilityForm((p) => ({ ...p, type: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                >
                  <option value="phc">PHC</option>
                  <option value="private_clinic">Private clinic</option>
                  <option value="lab">Lab</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Name
                <input
                  value={facilityForm.name}
                  onChange={(e) => setFacilityForm((p) => ({ ...p, name: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                  placeholder="Facility name"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">
                  State
                  <input
                    value={facilityForm.state}
                    onChange={(e) => setFacilityForm((p) => ({ ...p, state: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                    placeholder="e.g., Kano"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  LGA
                  <input
                    value={facilityForm.lga}
                    onChange={(e) => setFacilityForm((p) => ({ ...p, lga: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                    placeholder="e.g., Tarauni"
                  />
                </label>
              </div>

              <label className="text-sm font-semibold text-slate-700">
                Referral payout (NGN)
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={facilityForm.referral_payout_ngn}
                  onChange={(e) => setFacilityForm((p) => ({ ...p, referral_payout_ngn: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Custom PIN (optional)
                <input
                  inputMode="numeric"
                  value={facilityForm.pin}
                  onChange={(e) => setFacilityForm((p) => ({ ...p, pin: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                  placeholder="6-digit PIN"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {loading ? 'Creating…' : 'Create facility'}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">Facilities</h3>
                <div className="flex items-center gap-2">
                  <select
                    value={facilityFilter}
                    onChange={(e) => setFacilityFilter(e.target.value)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="">All</option>
                    <option value="phc">PHC</option>
                    <option value="private_clinic">Private clinic</option>
                    <option value="lab">Lab</option>
                  </select>
                  <button
                    type="button"
                    onClick={loadFacilities}
                    className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {facilities.length === 0 ? (
                <div className="mt-4 rounded-2xl bg-slate-50 p-6 text-slate-600">No facilities yet.</div>
              ) : (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Wallet</th>
                        <th className="px-4 py-3">PIN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {facilities.slice(0, 100).map((f) => (
                        <tr key={f.id} className="bg-white">
                          <td className="px-4 py-3 font-semibold text-slate-900">{f.name}</td>
                          <td className="px-4 py-3 text-slate-700">{String(f.type || '').replace(/_/g, ' ')}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">₦{f.wallet_balance_ngn ?? 0}</td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-700">{f.pin || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">
              <h3 className="text-lg font-semibold text-slate-900">Fund PHC/Facility wallet</h3>
              <form onSubmit={fundFacility} className="mt-4 grid gap-3 sm:grid-cols-[1fr_0.7fr_auto] sm:items-end">
                <label className="text-sm font-semibold text-slate-700">
                  Facility
                  <select
                    value={funding.facilityId}
                    onChange={(e) => setFunding((p) => ({ ...p, facilityId: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                  >
                    <option value="">Select facility</option>
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({String(f.type || '').replace(/_/g, ' ')})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Amount (NGN)
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={funding.amount_ngn}
                    onChange={(e) => setFunding((p) => ({ ...p, amount_ngn: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                    placeholder="50000"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-emerald-700 px-6 py-4 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                >
                  Fund
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'audit' && (
        <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-slate-900">Audit logs</h2>
            <button
              type="button"
              onClick={loadAuditLogs}
              className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              Refresh
            </button>
          </div>

          {auditLogs.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-6 text-slate-600">No audit logs yet.</div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Entity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {auditLogs.slice(0, 200).map((log) => (
                    <tr key={log.id} className="bg-white">
                      <td className="px-4 py-3 text-slate-600">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{log.event}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {log.actor_type || '-'} {log.actor_id ? `• ${log.actor_id}` : ''}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {log.entity_type || '-'} {log.entity_id ? `• ${log.entity_id}` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeSection === 'community' && (
        <DoctorCommunityChat
          sender={{
            id: admin.email,
            name: admin.name || 'Platform Admin',
            type: 'admin',
            phone: '',
          }}
        />
      )}
    </section>
  )
}

export default PlatformAdminDashboard
