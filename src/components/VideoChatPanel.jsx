import { useEffect, useMemo, useState } from 'react'
import VitalParametersMonitor from './VitalParametersMonitor'
import { useError } from './ErrorHandler'

const DEFAULT_ROOM_URL = 'https://demo.daily.co/meeting-room'

function normalizeRoomUrl(value) {
  const room = String(value || '').trim()
  if (!room) return ''
  try {
    const url = new URL(room)
    if (url.protocol !== 'https:') return ''
    return url.toString()
  } catch {
    return ''
  }
}

function VideoChatPanel({ consultationId, userType, patientId, doctorId, autoStart = false }) {
  const { addError } = useError()
  const [roomUrl, setRoomUrl] = useState(DEFAULT_ROOM_URL)
  const [loading, setLoading] = useState(false)
  const [callStarted, setCallStarted] = useState(false)

  const normalizedRoomUrl = useMemo(() => normalizeRoomUrl(roomUrl), [roomUrl])

  useEffect(() => {
    if (autoStart && consultationId && normalizedRoomUrl) {
      setCallStarted(true)
    }
  }, [autoStart, consultationId, normalizedRoomUrl])

  const startCall = async () => {
    if (!normalizedRoomUrl) {
      addError('Enter a valid HTTPS video room URL before starting the call.', 'warning')
      return
    }

    setLoading(true)
    try {
      setCallStarted(true)
      addError('Video room opened. Allow camera and microphone access when prompted.', 'success')
    } catch (error) {
      addError(error.message || 'Unable to start the video call.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const endCall = () => {
    setCallStarted(false)
    addError('Video call closed.', 'info')
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Video Consultation</h2>
            <p className="text-sm text-slate-500">Secure browser video room for live telehealth consultations.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startCall}
              disabled={loading || callStarted}
              className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {callStarted ? 'Call started' : loading ? 'Starting...' : 'Start Video Call'}
            </button>
            {callStarted && (
              <button
                type="button"
                onClick={endCall}
                className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                End Call
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-slate-50 p-6 shadow-lg shadow-slate-200/40">
        <label className="block text-sm font-medium text-slate-700 mb-2">Video Room URL</label>
        <input
          type="url"
          value={roomUrl}
          onChange={(e) => setRoomUrl(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
        />
        <p className="mt-3 text-sm text-slate-500">Use a Daily room URL or another embeddable HTTPS video room.</p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">
        <div className="h-[420px] overflow-hidden rounded-3xl bg-slate-950">
          {callStarted ? (
            <iframe
              title="Video consultation room"
              src={normalizedRoomUrl}
              allow="camera; microphone; fullscreen; speaker; display-capture"
              className="h-full w-full border-0"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-slate-300">
              <div>
                <p className="text-lg font-semibold text-white">Video room ready</p>
                <p className="mt-2 max-w-md text-sm">Start the call to open the secure consultation room inside this panel.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {callStarted && (
        <VitalParametersMonitor
          consultationId={consultationId}
          patientId={patientId}
          doctorId={doctorId}
          userType={userType}
        />
      )}
    </div>
  )
}

export default VideoChatPanel
