import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import { apiFetch, readApiJson } from '../lib/apiFetch'
import { useError } from './ErrorHandler'

function mergeCommunityMessages(current, incoming) {
  const byId = new Map(current.map((message) => [String(message.id), message]))
  incoming.forEach((message) => {
    if (message?.id != null) byId.set(String(message.id), message)
  })
  return Array.from(byId.values()).sort((a, b) => {
    const left = a.createdAt || a.created_at
    const right = b.createdAt || b.created_at
    return new Date(left) - new Date(right)
  })
}

function DoctorCommunityChat({ sender }) {
  const { addError } = useError()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [initialLoading, setInitialLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messageViewportRef = useRef(null)
  const requestInFlightRef = useRef(false)
  const stickToBottomRef = useRef(true)
  const forceScrollRef = useRef(true)

  const loadMessages = useCallback(async ({ initial = false } = {}) => {
    if (requestInFlightRef.current) return
    requestInFlightRef.current = true
    if (initial) setInitialLoading(true)
    try {
      const response = await apiFetch(`/api/doctors/community/messages`)
      const data = await readApiJson(response)
      if (!response.ok) throw new Error(data.error || 'Failed to load community messages')
      const rows = Array.isArray(data.messages) ? data.messages.slice().reverse() : []
      setMessages((current) => {
        const merged = mergeCommunityMessages(current, rows)
        if (merged.length === current.length && merged.every((item, index) => String(item.id) === String(current[index]?.id))) {
          return current
        }
        return merged
      })
    } catch (error) {
      console.error('Failed to load community messages', error)
    } finally {
      requestInFlightRef.current = false
      if (initial) setInitialLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadMessages({ initial: true })
    const id = window.setInterval(() => void loadMessages(), 10000)
    return () => window.clearInterval(id)
  }, [loadMessages])

  useEffect(() => {
    const viewport = messageViewportRef.current
    if (!viewport || (!forceScrollRef.current && !stickToBottomRef.current)) return
    const frame = window.requestAnimationFrame(() => {
      viewport.scrollTop = viewport.scrollHeight
      forceScrollRef.current = false
    })
    return () => window.cancelAnimationFrame(frame)
  }, [messages.length])

  const handleScroll = () => {
    const viewport = messageViewportRef.current
    if (!viewport) return
    stickToBottomRef.current = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 72
  }

  const sendMessage = async (event) => {
    event.preventDefault()
    const message = draft.trim()
    if (!message || !sender?.id || sending) return
    setSending(true)
    try {
      const response = await apiFetch(`/api/doctors/community/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: sender.id,
          senderName: sender.name,
          senderType: sender.type,
          phone: sender.phone,
          message,
        }),
      })
      const data = await readApiJson(response)
      if (!response.ok) throw new Error(data.error || 'Message failed')
      setDraft('')
      forceScrollRef.current = true
      if (data.communityMessage) {
        setMessages((current) => mergeCommunityMessages(current, [data.communityMessage]))
      } else {
        void loadMessages()
      }
    } catch (error) {
      addError(error.message, 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Doctor Community Chat</h2>
          <p className="text-sm text-slate-600">Registered doctors and platform admin share updates here.</p>
        </div>
      </div>

      <div
        ref={messageViewportRef}
        onScroll={handleScroll}
        className="mt-6 h-[420px] space-y-3 overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-slate-100 p-4"
      >
        {initialLoading && messages.length === 0 ? (
          <p className="text-center text-sm text-slate-500">Loading community chat...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-slate-500">No community messages yet.</p>
        ) : (
          messages.map((item) => {
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
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{item.message}</p>
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
          disabled={sending || !draft.trim()}
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
