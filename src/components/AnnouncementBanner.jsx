import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'

const SEVERITY_STYLES = {
  info: {
    wrapper: 'border-blue-200 bg-gradient-to-r from-blue-50 to-white text-blue-900',
    badge: 'bg-blue-600 text-white',
    label: 'Info',
  },
  warning: {
    wrapper: 'border-amber-200 bg-gradient-to-r from-amber-50 to-white text-amber-900',
    badge: 'bg-amber-500 text-white',
    label: 'Warning',
  },
  urgent: {
    wrapper: 'border-red-200 bg-gradient-to-r from-red-50 to-white text-red-900',
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
        const response = await apiFetch(`/api/announcements?audience=${encodeURIComponent(audience)}`)
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
    <div className={`mb-6 overflow-hidden rounded-3xl border px-5 py-4 shadow-lg ${style.wrapper}`}>
      <div className="flex items-center gap-4">
        {/* Badge */}
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}>
          {style.label}
        </span>

        {/* Scrolling text */}
        <div className="relative flex-1 overflow-hidden whitespace-nowrap">
          <div className="marquee inline-block animate-marquee">
            <span className="text-sm font-semibold">{top.title}</span>
            <span className="mx-4 opacity-50">•</span>
            <span className="text-sm opacity-90">{top.message}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-white"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

export default AnnouncementBanner