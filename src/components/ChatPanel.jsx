import { useCallback, useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { apiFetch, readApiJson } from '../lib/apiFetch'
import { useError } from './ErrorHandler'

function mergeMessages(current, incoming) {
  const byId = new Map(current.map((message) => [String(message.id), message]))
  incoming.forEach((message) => {
    if (message?.id != null) byId.set(String(message.id), message)
  })
  return Array.from(byId.values()).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
}

function messagesMatch(left, right) {
  if (left.length !== right.length) return false
  return left.every((message, index) => {
    const other = right[index]
    return String(message.id) === String(other?.id)
      && message.message_content === other?.message_content
      && message.is_read === other?.is_read
  })
}

function ChatPanel({ consultationId, userId, userType, recipientId, recipientType, patientId, doctorId }) {
  const { addError } = useError()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [initialLoading, setInitialLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messageViewportRef = useRef(null)
  const requestInFlightRef = useRef(false)
  const stickToBottomRef = useRef(true)
  const forceScrollRef = useRef(true)
  const conversationKey = consultationId || `${patientId || ''}:${doctorId || ''}`
  const canLoad = Boolean(consultationId || (patientId && doctorId))

  const loadMessages = useCallback(async ({ initial = false } = {}) => {
    if (!canLoad || requestInFlightRef.current) return
    requestInFlightRef.current = true
    if (initial) setInitialLoading(true)
    try {
      const params = new URLSearchParams()
      if (consultationId) params.set('consultationId', consultationId)
      if (patientId) params.set('patientId', patientId)
      if (doctorId) params.set('doctorId', doctorId)
      const response = await apiFetch(`/api/chat/messages?${params.toString()}`)
      const data = await readApiJson(response)
      if (!response.ok) throw new Error(data.error || 'Failed to load chat messages')
      const incoming = Array.isArray(data.messages) ? data.messages : []
      setMessages((current) => {
        const merged = mergeMessages(current, incoming)
        return messagesMatch(current, merged) ? current : merged
      })
    } catch (error) {
      console.error('Failed to load chat messages', error)
    } finally {
      requestInFlightRef.current = false
      if (initial) setInitialLoading(false)
    }
  }, [canLoad, consultationId, patientId, doctorId])

  useEffect(() => {
    setMessages([])
    setDraft('')
    setInitialLoading(canLoad)
    stickToBottomRef.current = true
    forceScrollRef.current = true
    if (!canLoad) return undefined
    void loadMessages({ initial: true })
    const interval = window.setInterval(() => void loadMessages(), 5000)
    return () => window.clearInterval(interval)
  }, [conversationKey, canLoad, loadMessages])

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

  const handleSend = async (event) => {
    event.preventDefault()
    const messageContent = draft.trim()
    if (!messageContent || !recipientId || sending) return

    setSending(true)
    try {
      const response = await apiFetch(`/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId,
          senderId: userId,
          senderType: userType,
          recipientId,
          recipientType,
          messageType: 'text',
          messageContent,
        }),
      })
      const data = await readApiJson(response)
      if (!response.ok) throw new Error(data.error || 'Failed to send message')

      setDraft('')
      forceScrollRef.current = true
      if (data.chatMessage) {
        setMessages((current) => mergeMessages(current, [data.chatMessage]))
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
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-lg shadow-slate-200/40">
        <h2 className="text-xl font-semibold text-slate-900">Doctor-Patient Chat</h2>
        <p className="text-sm text-slate-500">Send secure messages tied to your consultation.</p>
      </div>

      {!canLoad ? (
        <div className="rounded-2xl bg-white p-6 text-slate-600 shadow-lg shadow-slate-200/40">
          Select an appointment or consultation first to begin chat with your doctor.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40">
          <div
            ref={messageViewportRef}
            onScroll={handleScroll}
            className="h-[420px] overflow-y-auto overscroll-contain bg-slate-100 p-4"
          >
            {initialLoading && messages.length === 0 ? (
              <p className="text-sm text-slate-600">Loading chat...</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-slate-600">No messages yet. Send the first message to start.</p>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => {
                  const isMine = String(message.sender_id) === String(userId)
                  return (
                    <div key={message.id} className={`w-fit max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${isMine ? 'ml-auto bg-brand-700 text-white' : 'mr-auto bg-white text-slate-900'}`}>
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.message_content}</p>
                      <div className={`mt-2 flex items-center justify-between gap-4 text-[10px] ${isMine ? 'text-white/70' : 'text-slate-500'}`}>
                        <span>{isMine ? 'You' : message.sender_type === 'doctor' ? 'Doctor' : 'Patient'}</span>
                        <span>{new Date(message.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-end gap-3 border-t border-slate-200 bg-white p-4">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={2}
              className="max-h-28 min-h-[52px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
              placeholder="Type your message here..."
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white hover:bg-brand-600 disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default ChatPanel
