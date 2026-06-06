import { useEffect, useState } from 'react'
import { apiFetch, readApiJson } from '../lib/apiFetch'

function NotificationCenter({ userId, userType }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userId && userType) {
      loadNotifications()
    }
  }, [userId, userType])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const response = await apiFetch(`/api/notifications?userId=${encodeURIComponent(userId)}&userType=${encodeURIComponent(userType)}`)
      const data = await readApiJson(response)
      if (!response.ok) throw new Error(data.error || 'Failed to load notifications')
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error('Failed to load notifications', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (notificationId) => {
    try {
      const response = await apiFetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error('Unable to mark notification read')
      await loadNotifications()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Notifications</h2>
            <p className="text-sm text-slate-500">See all alerts for appointments, messages, and prescription updates.</p>
          </div>
          <span className="rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700">{notifications.filter((item) => !item.is_read).length} unread</span>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40 text-slate-600">No notifications yet. All clear!</div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className={`rounded-3xl border p-5 shadow-sm transition ${notification.is_read ? 'border-slate-200 bg-slate-50' : 'border-brand-200 bg-white'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                  <p className="mt-2 text-sm text-slate-600 whitespace-pre-line">{notification.message}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{String(notification.notification_type || notification.type || 'notice').replace(/_/g, ' ')}</p>
                  <p className="mt-2 text-xs text-slate-500">{new Date(notification.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {notification.related_resource_type && notification.related_resource_id && (
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
                    {String(notification.related_resource_type).replace(/_/g, ' ')}: {notification.related_resource_id}
                  </span>
                )}
                {!notification.is_read && (
                  <button
                    onClick={() => handleMarkRead(notification.id)}
                    className="rounded-full bg-brand-700 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
