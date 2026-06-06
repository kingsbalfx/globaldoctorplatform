import { useEffect, useRef, useState } from 'react'
import { ChevronUp, MessageCircle, Send } from 'lucide-react'
import { apiFetch } from '../lib/apiFetch'
import { useError } from './ErrorHandler'

function DoctorCommunityChat({ sender }) {
  const { addError } = useError()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [visibleCount, setVisibleCount] = useState(6)
  const messageViewportRef = useRef(null)

  const loadMessages = async () => {
    try {
      const response = await apiFetch(`/api/doctors/community/messages`)
      const data = await response.json().catch(() => ({}))
      const rows = Array.isArray(data.messages) ? data.messages : []
      setMessages(rows.slice().reverse())
    } catch {
      setMessages([])
    }
  }

  useEffect(() => {
    void loadMessages()
    const id = window.setInterval(loadMessages, 10000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const viewport = messageViewportRef.current
    if (viewport) viewport.scrollTop = viewport.scrollHeight
  }, [messages.length])

  const sendMessage = async (event) => {
    event.preventDefault()
    if (!draft.trim() || !sender?.id) return
    setLoading(true)
    try {
      const response = await apiFetch(`/api/doctors/community/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: sender.id,
          senderName: sender.name,
          senderType: sender.type,
          phone: sender.phone,
          message: draft.trim(),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Message failed')
      setDraft('')
      await loadMessages()
    } catch (error) {
      addError(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const visibleMessages = messages.slice(-visibleCount)
  const hiddenMessageCount = Math.max(0, messages.length - visibleMessages.length)

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Doctor Community Chat</h2>
            <p className="text-sm text-slate-600">Registered doctors and platform admin share updates here.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadMessages}
          className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          Refresh
        </button>
      </div>

      <div ref={messageViewportRef} className="mt-6 h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-100 p-4">
        {hiddenMessageCount > 0 && (
          <div className="sticky top-0 z-10 flex justify-center pb-2">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 6)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-md ring-1 ring-slate-200"
            >
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
              Load {Math.min(6, hiddenMessageCount)} older messages
            </button>
          </div>
        )}
        {messages.length === 0 ? (
          <p className="text-center text-sm text-slate-500">No community messages yet.</p>
        ) : (
          visibleMessages.map((item) => {
            const senderId = item.senderId || item.sender_id
            const senderName = item.senderName || item.sender_name
            const senderType = item.senderType || item.sender_type
            const createdAt = item.createdAt || item.created_at
            const mine = String(senderId) === String(sender?.id)
            return (
              <div key={item.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm ${mine ? 'bg-brand-700 text-white' : 'bg-white text-slate-800'}`}>
                  <div className="flex flex-wrap items-center gap-2 text-xs opacity-80">
                    <span className="font-semibold">{senderName}</span>
                    <span>{senderType === 'admin' ? 'Admin' : 'Doctor'}</span>
                    {item.phone && <span>{item.phone}</span>}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{item.message}</p>
                  <p className="mt-2 text-[10px] opacity-70">{new Date(createdAt).toLocaleString()}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <form onSubmit={sendMessage} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="min-h-[52px] flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
          placeholder="Share a clinical update, referral note, or admin announcement..."
        />
        <button
          type="submit"
          disabled={loading || !draft.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          Send
        </button>
      </form>
    </div>
  )
}

export default DoctorCommunityChat
