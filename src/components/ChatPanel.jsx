import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'
import { useError } from './ErrorHandler'

function ChatPanel({ consultationId, userId, userType, recipientId, recipientType, patientId, doctorId }) {
  const { addError } = useError()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (consultationId || (patientId && doctorId)) {
      loadMessages()
    }
  }, [consultationId, patientId, doctorId])

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

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Doctor-Patient Chat</h2>
            <p className="text-sm text-slate-500">Send secure messages tied to your consultation.</p>
          </div>
        </div>
      </div>

      {!consultationId && (!patientId || !doctorId) ? (
        <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40 text-slate-600">
          Select an appointment or consultation first to begin chat with your doctor.
        </div>
      ) : loading ? (
        <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">Loading chat...</div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-3xl bg-slate-50 p-4">
            {messages.length === 0 ? (
              <p className="text-sm text-slate-600">No messages yet. Send the first message to start.</p>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isMine = message.sender_id === userId
                  return (
                    <div key={message.id} className={`rounded-3xl p-4 ${isMine ? 'bg-brand-700 text-white self-end' : 'bg-white text-slate-900'} max-w-[85%]`}>
                      <p className="text-sm leading-6">{message.message_content}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>{message.sender_type === 'doctor' ? 'Doctor' : 'You'}</span>
                        <span>{new Date(message.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">
            <label className="block text-sm font-medium text-slate-700">Message</label>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
              placeholder="Type your message here..."
            />
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Send message
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default ChatPanel
