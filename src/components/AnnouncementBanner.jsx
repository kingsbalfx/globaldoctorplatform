import { useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../lib/apiBase'

const SEVERITY_STYLES = {
  info: {
    wrapper: 'border-brand-200 bg-brand-50 text-brand-900',
    badge: 'bg-brand-700 text-white',
    label: 'Info',
  },
  warning: {
    wrapper: 'border-amber-200 bg-amber-50 text-amber-900',
    badge: 'bg-amber-600 text-white',
    label: 'Warning',
  },
  urgent: {
    wrapper: 'border-red-200 bg-red-50 text-red-900',
    badge: 'bg-red-600 text-white',
    label: 'Urgent',
  },
}

function AnnouncementBanner({ audience }) {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(false)

  const dismissKey = useMemo(() => `gd_announcement_dismissed_${audience}`, [audience])
  const dismissedId = useMemo(() => {
    try {
      return window.localStorage.getItem(dismissKey) || ''
    } catch {
      return ''
    }
  }, [dismissKey])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE}/api/announcements?audience=${encodeURIComponent(audience)}`)
        const data = await response.json().catch(() => ({}))
        if (cancelled) return
        setAnnouncements(Array.isArray(data.announcements) ? data.announcements : [])
      } catch {
        if (!cancelled) setAnnouncements([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (audience) void load()
    return () => {
      cancelled = true
    }
  }, [audience])

  const visible = announcements.filter((item) => item && item.id && item.id !== dismissedId)
  if (loading && visible.length === 0) return null
  if (visible.length === 0) return null

  const top = visible[0]
  const style = SEVERITY_STYLES[top.severity] || SEVERITY_STYLES.info

  const dismiss = () => {
    try {
      window.localStorage.setItem(dismissKey, String(top.id))
    } catch {
      // ignore
    }
    setAnnouncements((prev) => prev.filter((item) => item.id !== top.id))
  }

  return (
    <div className={`mb-6 rounded-3xl border px-5 py-4 shadow-sm ${style.wrapper}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>
            {style.label}
          </span>
          <div>
            <p className="text-sm font-semibold">{top.title}</p>
            <p className="mt-1 text-sm whitespace-pre-line opacity-90">{top.message}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="self-start rounded-full bg-white/60 px-4 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/60 hover:bg-white"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

export default AnnouncementBanner

