import { useEffect, useRef, useState } from 'react'
import { API_BASE } from '../lib/apiBase'
import VitalParametersMonitor from './VitalParametersMonitor'

const SDK_URL = 'https://unpkg.com/@daily-co/daily-js@0.22.1/dist/daily-js.min.js'

function VideoChatPanel({ consultationId, userId, userType, patientId, doctorId }) {
  const videoRef = useRef(null)
  const [roomUrl, setRoomUrl] = useState('https://demo.daily.co/meeting-room')
  const [loading, setLoading] = useState(false)
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const [callStarted, setCallStarted] = useState(false)
  const [dailyFrame, setDailyFrame] = useState(null)

  useEffect(() => {
    if (!window.DailyIframe) {
      const script = document.createElement('script')
      script.src = SDK_URL
      script.async = true
      script.onload = () => setSdkLoaded(true)
      script.onerror = () => console.error('Failed to load video SDK')
      document.body.appendChild(script)
    } else {
      setSdkLoaded(true)
    }

    return () => {
      if (dailyFrame) {
        dailyFrame.destroy()
      }
    }
  }, [dailyFrame])

  const startCall = async () => {
    if (!sdkLoaded || !videoRef.current) {
      alert('Video SDK is not loaded yet. Please try again.')
      return
    }

    setLoading(true)
    try {
      const DailyIframe = window.DailyIframe
      const frame = DailyIframe.createFrame(videoRef.current, {
        showLeaveButton: true,
        iframeStyle: {
          position: 'relative',
          width: '100%',
          height: '100%',
          border: '0',
          borderRadius: '24px',
        },
      })

      await frame.join({ url: roomUrl })
      setDailyFrame(frame)
      setCallStarted(true)
    } catch (error) {
      console.error('Video call failed to start', error)
      alert('Unable to start the video call.')
    } finally {
      setLoading(false)
    }
  }

  const endCall = () => {
    if (dailyFrame) {
      dailyFrame.leave()
      dailyFrame.destroy()
      setDailyFrame(null)
    }
    setCallStarted(false)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Video Consultation</h2>
            <p className="text-sm text-slate-500">Use the video SDK for secure telehealth consultations.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startCall}
              disabled={loading || callStarted}
              className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {callStarted ? 'Call started' : 'Start Video Call'}
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
          type="text"
          value={roomUrl}
          onChange={(e) => setRoomUrl(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
        />
        <p className="mt-3 text-sm text-slate-500">Use your Daily.co room URL or a valid video room URL to connect.</p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">
        <div ref={videoRef} className="h-[420px] rounded-3xl bg-slate-900/5 overflow-hidden" />
      </div>

      {/* Vital Parameters Monitor - Available during call */}
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
