import { useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../lib/apiBase'

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

  const [selectedAudience, setSelectedAudience] = useState('landing')
  const [severity, setSeverity] = useState('info')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [expiresHours, setExpiresHours] = useState(24)

  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState(null)

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

  useEffect(() => {
    if (!adminSession) return
    void loadConfig()
    void loadAnnouncements(selectedAudience)
  }, [adminSession, selectedAudience])

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
            <p className="mt-2 text-slate-200">Signed in as {admin.name} ({admin.email})</p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-full bg-white/10 hover:bg-white/15 px-6 py-3 text-sm font-semibold text-white transition"
          >
            Logout
          </button>
        </div>
      </div>

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
    </section>
  )
}

export default PlatformAdminDashboard

