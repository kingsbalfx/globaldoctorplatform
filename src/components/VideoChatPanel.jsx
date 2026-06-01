import { useEffect, useRef, useState } from 'react'
import VitalParametersMonitor from './VitalParametersMonitor'
import { apiFetch } from '../lib/apiFetch'
import { useError } from './ErrorHandler'

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }]
const CALLER_TYPES = new Set(['patient', 'facility', 'admin'])

function VideoChatPanel({ consultationId, userId, userType, patientId, doctorId, autoStart = false }) {
  const { addError } = useError()
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerRef = useRef(null)
  const streamRef = useRef(null)
  const pendingIceRef = useRef([])
  const lastSignalSeqRef = useRef(0)
  const processedSignalsRef = useRef(new Set())
  const [callStarted, setCallStarted] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [audioMuted, setAudioMuted] = useState(false)
  const [videoMuted, setVideoMuted] = useState(false)
  const [status, setStatus] = useState('Ready')

  const roomId = String(consultationId || '').trim()
  const participantId = String(userId || doctorId || patientId || userType || '').trim()
  const shouldCreateOffer = CALLER_TYPES.has(String(userType || '').toLowerCase())

  const isClosedPeer = (peer) => {
    return !peer || peer.signalingState === 'closed' || peer.connectionState === 'closed'
  }

  const resetPeerOnly = () => {
    peerRef.current?.close()
    peerRef.current = null
    pendingIceRef.current = []
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
  }

  const flushPendingIce = async (peer) => {
    if (!peer?.remoteDescription) return
    const candidates = pendingIceRef.current.splice(0)
    for (const candidate of candidates) {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate))
      } catch {
        // Ignore stale ICE candidates from previous browser attempts.
      }
    }
  }

  const sendSignal = async (type, payload) => {
    if (!roomId || !participantId) return
    await apiFetch('/api/video-signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, senderId: participantId, senderType: userType, type, payload }),
    })
  }

  const attachLocalStream = async () => {
    if (streamRef.current) return streamRef.current
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    streamRef.current = stream
    if (localVideoRef.current) localVideoRef.current.srcObject = stream
    return stream
  }

  const createPeer = async () => {
    if (peerRef.current && !isClosedPeer(peerRef.current)) return peerRef.current
    resetPeerOnly()
    const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS })
    peerRef.current = peer

    peer.onicecandidate = (event) => {
      if (event.candidate) void sendSignal('ice', event.candidate)
    }
    peer.ontrack = (event) => {
      const [remoteStream] = event.streams
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream
        setStatus('Connected')
      }
    }
    peer.onconnectionstatechange = () => {
      const state = peer.connectionState
      if (state === 'connected') setStatus('Connected')
      if (state === 'failed' || state === 'disconnected') setStatus('Reconnecting')
      if (state === 'closed') setStatus('Closed')
    }

    const stream = await attachLocalStream()
    stream.getTracks().forEach((track) => {
      if (!isClosedPeer(peer)) peer.addTrack(track, stream)
    })
    return peer
  }

  const createOffer = async () => {
    const peer = await createPeer()
    if (isClosedPeer(peer)) return
    const offer = await peer.createOffer()
    await peer.setLocalDescription(offer)
    await sendSignal('offer', offer)
    setStatus('Waiting for other participant')
  }

  const handleSignal = async (signal) => {
    if (!signal?.id || processedSignalsRef.current.has(signal.id)) return
    processedSignalsRef.current.add(signal.id)
    const peer = await createPeer()
    if (isClosedPeer(peer)) return

    if (signal.type === 'offer') {
      if (peer.signalingState !== 'stable') {
        await peer.setLocalDescription({ type: 'rollback' }).catch(() => null)
      }
      await peer.setRemoteDescription(new RTCSessionDescription(signal.payload))
      const answer = await peer.createAnswer()
      await peer.setLocalDescription(answer)
      await sendSignal('answer', answer)
      await flushPendingIce(peer)
      setStatus('Answer sent')
      return
    }

    if (signal.type === 'answer' && peer.signalingState === 'have-local-offer') {
      await peer.setRemoteDescription(new RTCSessionDescription(signal.payload))
      await flushPendingIce(peer)
      setStatus('Connected')
      return
    }

    if (signal.type === 'ice') {
      if (!peer.remoteDescription) {
        pendingIceRef.current.push(signal.payload)
        return
      }
      try {
        await peer.addIceCandidate(new RTCIceCandidate(signal.payload))
      } catch {
        // Candidate may belong to an already-closed negotiation attempt.
      }
    }
  }

  const pollSignals = async () => {
    if (!roomId || !participantId || !callStarted) return
    const response = await apiFetch(`/api/video-signal?roomId=${encodeURIComponent(roomId)}&senderId=${encodeURIComponent(participantId)}&since=${lastSignalSeqRef.current}`)
    const data = await response.json().catch(() => ({}))
    const signals = Array.isArray(data.signals) ? data.signals : []
    for (const signal of signals) {
      lastSignalSeqRef.current = Math.max(lastSignalSeqRef.current, Number(signal.seq || 0))
      await handleSignal(signal)
    }
  }

  const startCall = async () => {
    if (!roomId) {
      addError('Select or start a consultation before opening video.', 'warning')
      return
    }
    if (!participantId) {
      addError('Missing participant identity for video call.', 'warning')
      return
    }

    setConnecting(true)
    try {
      await createPeer()
      setCallStarted(true)
      setStatus(shouldCreateOffer ? 'Creating room' : 'Waiting for patient or facility')
      if (shouldCreateOffer) await createOffer()
      addError('Secure video room opened. Allow camera and microphone access when prompted.', 'success')
    } catch (error) {
      addError(error.message || 'Unable to start the video call.', 'error')
      setStatus('Could not start')
    } finally {
      setConnecting(false)
    }
  }

  const endCall = () => {
    peerRef.current?.close()
    peerRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (localVideoRef.current) localVideoRef.current.srcObject = null
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    setCallStarted(false)
    setAudioMuted(false)
    setVideoMuted(false)
    setStatus('Closed')
  }

  useEffect(() => {
    lastSignalSeqRef.current = 0
    processedSignalsRef.current = new Set()
    if (peerRef.current) {
      resetPeerOnly()
      setCallStarted(false)
      setStatus('Ready')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, participantId])

  const toggleAudio = () => {
    const next = !audioMuted
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !next
    })
    setAudioMuted(next)
  }

  const toggleVideo = () => {
    const next = !videoMuted
    streamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !next
    })
    setVideoMuted(next)
  }

  useEffect(() => {
    if (autoStart && !callStarted && !connecting && roomId && participantId) {
      void startCall()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, roomId, participantId])

  useEffect(() => {
    if (!callStarted) return undefined
    const interval = window.setInterval(() => {
      void pollSignals().catch(() => null)
    }, 1200)
    void pollSignals().catch(() => null)
    return () => window.clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStarted, roomId, participantId])

  useEffect(() => () => endCall(), [])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Embedded Video Consultation</h2>
            <p className="text-sm text-slate-500">Native browser video, audio, and voice call for this consultation room.</p>
            <p className="mt-2 text-xs font-semibold text-slate-500">Room: {roomId || 'No consultation selected'} | Status: {status}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startCall}
              disabled={connecting || callStarted}
              className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {callStarted ? 'Room open' : connecting ? 'Opening...' : 'Open Video Room'}
            </button>
            {callStarted && (
              <>
                <button type="button" onClick={toggleAudio} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                  {audioMuted ? 'Unmute' : 'Mute'}
                </button>
                <button type="button" onClick={toggleVideo} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                  {videoMuted ? 'Camera on' : 'Camera off'}
                </button>
                <button type="button" onClick={endCall} className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700">
                  End Call
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl bg-slate-950 shadow-lg shadow-slate-200/40">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">Remote participant</div>
          <video ref={remoteVideoRef} autoPlay playsInline className="aspect-video w-full bg-slate-950 object-cover" />
        </div>
        <div className="overflow-hidden rounded-3xl bg-slate-950 shadow-lg shadow-slate-200/40">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">You</div>
          <video ref={localVideoRef} autoPlay playsInline muted className="aspect-video w-full bg-slate-950 object-cover" />
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
