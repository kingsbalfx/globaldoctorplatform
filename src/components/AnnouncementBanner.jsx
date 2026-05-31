import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'

const SEVERITY_STYLES = {
  info: {
    wrapper: 'border-cyan-200 bg-[linear-gradient(110deg,#ecfeff,#ffffff,#dbeafe,#f0f9ff)] text-slate-950 shadow-cyan-900/10',
    badge: 'bg-cyan-700 text-white',
    label: 'Public Notice',
  },
  warning: {
    wrapper: 'border-amber-200 bg-[linear-gradient(110deg,#fffbeb,#ffffff,#fef3c7,#fff7ed)] text-amber-950 shadow-amber-900/10',
    badge: 'bg-amber-500 text-white',
    label: 'Featured',
  },
  urgent: {
    wrapper: 'border-rose-200 bg-[linear-gradient(110deg,#fff1f2,#ffffff,#ffe4e6,#fdf2f8)] text-rose-950 shadow-rose-900/10',
    badge: 'bg-rose-700 text-white',
    label: 'Breaking',
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
    <div className={`relative mb-6 overflow-hidden rounded-[2rem] border px-5 py-4 shadow-2xl ${style.wrapper}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-white/40 blur-2xl" />
      <div className="flex items-center gap-4">
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] shadow-lg ${style.badge}`}>
          {style.label}
        </span>

        <div className="relative flex-1 overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-marquee">
            <span className="text-base font-black uppercase tracking-wide sm:text-lg">{top.title}</span>
            <span className="mx-5 opacity-50">|</span>
            <span className="text-sm font-bold opacity-95 sm:text-base">{top.message}</span>
            <span className="mx-5 opacity-50">|</span>
            <span className="text-base font-black uppercase tracking-wide sm:text-lg">{top.title}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-slate-800 ring-1 ring-white/80 hover:bg-white"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default AnnouncementBanner
