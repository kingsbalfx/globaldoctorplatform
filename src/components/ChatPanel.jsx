import { useEffect, useRef, useState } from 'react'
import { ChevronUp, Send } from 'lucide-react'
import { apiFetch } from '../lib/apiFetch'
import { useError } from './ErrorHandler'

function ChatPanel({ consultationId, userId, userType, recipientId, recipientType, patientId, doctorId }) {
  const { addError } = useError()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [visibleCount, setVisibleCount] = useState(6)
  const messageViewportRef = useRef(null)

  useEffect(() => {
    if (consultationId || (patientId && doctorId)) {
      void loadMessages()
      const interval = window.setInterval(loadMessages, 5000)
      return () => window.clearInterval(interval)
    }
  }, [consultationId, patientId, doctorId])

  useEffect(() => {
    const viewport = messageViewportRef.current
    if (viewport) viewport.scrollTop = viewport.scrollHeight
  }, [messages.length])

  const loadMessages = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (consultationId) params.set('consultationId', consultationId)
      if (patientId) params.set('patientId', patientId)
      if (doctorId) params.set('doctorId', doctorId)
      const response = await apiFetch(`/api/chat/messages?${params.toString()}`)
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Failed to load chat messages', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (event) => {
    event.preventDefault()
    if (!draft.trim() || !recipientId) return

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
          messageContent: draft.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setDraft('')
      await loadMessages()
    } catch (error) {
      addError(error.message, 'error')
    }
  }

  const visibleMessages = messages.slice(-visibleCount)
  const hiddenMessageCount = Math.max(0, messages.length - visibleMessages.length)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-lg shadow-slate-200/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Doctor-Patient Chat</h2>
            <p className="text-sm text-slate-500">Send secure messages tied to your consultation.</p>
          </div>
        </div>
      </div>

      {!consultationId && (!patientId || !doctorId) ? (
        <div className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/40 text-slate-600">
          Select an appointment or consultation first to begin chat with your doctor.
        </div>
      ) : loading ? (
        <div className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/40">Loading chat...</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40">
          <div ref={messageViewportRef} className="h-[420px] overflow-y-auto bg-slate-100 p-4">
            {hiddenMessageCount > 0 && (
              <div className="sticky top-0 z-10 mb-4 flex justify-center">
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
              <p className="text-sm text-slate-600">No messages yet. Send the first message to start.</p>
            ) : (
              <div className="space-y-3">
                {visibleMessages.map((message) => {
                  const isMine = message.sender_id === userId
                  return (
                    <div key={message.id} className={`w-fit max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${isMine ? 'ml-auto bg-brand-700 text-white' : 'mr-auto bg-white text-slate-900'}`}>
                      <p className="text-sm leading-6">{message.message_content}</p>
                      <div className={`mt-2 flex items-center justify-between gap-4 text-[10px] ${isMine ? 'text-white/70' : 'text-slate-500'}`}>
                        <span>{message.sender_type === 'doctor' ? 'Doctor' : 'You'}</span>
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
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              className="max-h-28 min-h-[52px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
              placeholder="Type your message here..."
            />
            <button
              type="submit"
              disabled={!draft.trim()}
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
