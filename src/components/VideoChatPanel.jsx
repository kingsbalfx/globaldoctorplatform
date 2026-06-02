import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'
import { useError } from './ErrorHandler'

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }]
const CALLER_TYPES = new Set(['patient', 'facility', 'admin'])
const CLEAN_AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: false,
  channelCount: { ideal: 1, max: 1 },
  sampleRate: { ideal: 48000 },
}

function VideoChatPanel({ consultationId, userId, userType, patientId, doctorId, autoStart = false }) {
  const { addError } = useError()
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerRef = useRef(null)
  const streamRef = useRef(null)
  const audioContextRef = useRef(null)
  const rawAudioTracksRef = useRef([])
  const pendingIceRef = useRef([])
  const lastSignalSeqRef = useRef(0)
  const processedSignalsRef = useRef(new Set())
  const makingOfferRef = useRef(false)
  const ignoreOfferRef = useRef(false)
  const callStartedRef = useRef(false)
  const remoteAudioMutedRef = useRef(true)
  const [callStarted, setCallStarted] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [audioMuted, setAudioMuted] = useState(false)
  const [remoteAudioMuted, setRemoteAudioMuted] = useState(true)
  const [videoMuted, setVideoMuted] = useState(false)
  const [status, setStatus] = useState('Ready')
  const [connectionState, setConnectionState] = useState('new')
  const [iceState, setIceState] = useState('new')
  const [remoteSeen, setRemoteSeen] = useState(false)
  const [joinRequests, setJoinRequests] = useState([])

  const roomId = String(consultationId || '').trim()
  const participantId = String(userId || doctorId || patientId || userType || '').trim()
  const shouldCreateOffer = CALLER_TYPES.has(String(userType || '').toLowerCase())
  const politePeer = !shouldCreateOffer

  const isClosedPeer = (peer) => {
    return !peer || peer.signalingState === 'closed' || peer.connectionState === 'closed'
  }

  const resetPeerOnly = () => {
    peerRef.current?.close()
    peerRef.current = null
    pendingIceRef.current = []
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    setConnectionState('new')
    setIceState('new')
    setRemoteSeen(false)
  }

  const normalizeSignalPayload = (payload) => {
    if (!payload) return {}
    if (typeof payload.toJSON === 'function') return payload.toJSON()
    if (typeof RTCSessionDescription !== 'undefined' && payload instanceof RTCSessionDescription) {
      return { type: payload.type, sdp: payload.sdp }
    }
    if (typeof RTCIceCandidate !== 'undefined' && payload instanceof RTCIceCandidate) {
      return payload.toJSON()
    }
    return typeof payload === 'object' ? { ...payload } : { value: payload }
  }

  const cleanSessionDescription = (payload) => ({
    type: payload?.type,
    sdp: payload?.sdp,
  })

  const cleanIceCandidate = (payload) => ({
    candidate: payload?.candidate,
    sdpMid: payload?.sdpMid ?? null,
    sdpMLineIndex: payload?.sdpMLineIndex ?? null,
    usernameFragment: payload?.usernameFragment,
  })

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
    const signalPayload = normalizeSignalPayload(payload)
    await apiFetch('/api/video-signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        senderId: participantId,
        senderType: userType,
        type,
        payload: {
          ...signalPayload,
          roomId,
          senderId: participantId,
          sentAt: new Date().toISOString(),
        },
      }),
    })
  }

  const announceJoin = async () => {
    await sendSignal('join_request', {
      requestedAt: new Date().toISOString(),
      userType,
      patientId,
      doctorId,
    })
  }

  const acceptJoin = async () => {
    await sendSignal('join_accept', {
      acceptedAt: new Date().toISOString(),
      doctorId,
      patientId,
    })
    await startCall()
  }

  const createManagedAudioTrack = (stream) => {
    const [rawAudioTrack] = stream.getAudioTracks()
    if (!rawAudioTrack) return null
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext
    if (!AudioContextCtor) return rawAudioTrack

    try {
      const audioContext = new AudioContextCtor()
      const source = audioContext.createMediaStreamSource(new MediaStream([rawAudioTrack]))
      const highPass = audioContext.createBiquadFilter()
      highPass.type = 'highpass'
      highPass.frequency.value = 120

      const compressor = audioContext.createDynamicsCompressor()
      compressor.threshold.value = -36
      compressor.knee.value = 18
      compressor.ratio.value = 8
      compressor.attack.value = 0.006
      compressor.release.value = 0.2

      const gain = audioContext.createGain()
      gain.gain.value = 0.82

      const destination = audioContext.createMediaStreamDestination()
      source.connect(highPass)
      highPass.connect(compressor)
      compressor.connect(gain)
      gain.connect(destination)
      audioContextRef.current = audioContext
      rawAudioTracksRef.current = [rawAudioTrack]
      return destination.stream.getAudioTracks()[0] || rawAudioTrack
    } catch {
      return rawAudioTrack
    }
  }

  const attachLocalStream = async () => {
    if (streamRef.current) return streamRef.current
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'user' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 24, max: 30 },
      },
      audio: CLEAN_AUDIO_CONSTRAINTS,
    })
    stream.getAudioTracks().forEach((track) => {
      track.applyConstraints?.(CLEAN_AUDIO_CONSTRAINTS).catch(() => null)
    })
    const managedAudioTrack = createManagedAudioTrack(stream)
    const managedStream = new MediaStream([
      ...stream.getVideoTracks(),
      ...(managedAudioTrack ? [managedAudioTrack] : stream.getAudioTracks()),
    ])
    streamRef.current = managedStream
    if (localVideoRef.current) localVideoRef.current.srcObject = managedStream
    return managedStream
  }

  const refreshFrontCamera = async () => {
    if (!callStarted) return
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'user' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 24, max: 30 },
        },
        audio: false,
      })
      const [nextVideoTrack] = nextStream.getVideoTracks()
      if (!nextVideoTrack) return

      const oldVideoTracks = streamRef.current?.getVideoTracks?.() || []
      const peer = peerRef.current
      const sender = peer?.getSenders?.().find((item) => item.track?.kind === 'video')
      if (sender) await sender.replaceTrack(nextVideoTrack)

      const audioTracks = streamRef.current?.getAudioTracks?.() || []
      const combinedStream = new MediaStream([...audioTracks, nextVideoTrack])
      oldVideoTracks.forEach((track) => track.stop())
      streamRef.current = combinedStream
      if (localVideoRef.current) localVideoRef.current.srcObject = combinedStream
      setVideoMuted(false)
      setStatus((current) => (current === 'Closed' ? 'Ready' : current))
    } catch (error) {
      addError(error.message || 'Could not switch back to the front camera.', 'warning')
    }
  }

  const createPeer = async () => {
    if (peerRef.current && !isClosedPeer(peerRef.current)) return peerRef.current
    resetPeerOnly()
    const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS })
    peerRef.current = peer

    peer.onicecandidate = (event) => {
      if (event.candidate) void sendSignal('ice', event.candidate.toJSON?.() || event.candidate)
    }
    peer.onnegotiationneeded = async () => {
      if (!callStartedRef.current || !shouldCreateOffer) return
      await createOffer()
    }
    peer.ontrack = (event) => {
      const [remoteStream] = event.streams
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream
        remoteVideoRef.current.muted = remoteAudioMutedRef.current
        remoteVideoRef.current.volume = remoteAudioMutedRef.current ? 0 : 0.82
        setRemoteSeen(true)
        setStatus('Connected')
      }
    }
    peer.onconnectionstatechange = () => {
      const state = peer.connectionState
      setConnectionState(state || 'unknown')
      if (state === 'connected') setStatus('Connected')
      if (state === 'failed' || state === 'disconnected') {
        setStatus('Reconnecting')
        window.setTimeout(() => {
          if (callStartedRef.current && shouldCreateOffer && peerRef.current?.connectionState !== 'connected') {
            resetPeerOnly()
            void createOffer().catch(() => setStatus('Reconnect failed'))
          }
        }, 900)
      }
      if (state === 'closed') setStatus('Closed')
    }
    peer.oniceconnectionstatechange = () => {
      setIceState(peer.iceConnectionState || 'unknown')
      if (peer.iceConnectionState === 'failed') {
        setStatus('Repairing connection')
        peer.restartIce?.()
        if (shouldCreateOffer) void createOffer().catch(() => setStatus('Reconnect failed'))
      }
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
    if (makingOfferRef.current) return
    try {
      makingOfferRef.current = true
      if (peer.signalingState !== 'stable') {
        await peer.setLocalDescription({ type: 'rollback' }).catch(() => null)
      }
      const offer = await peer.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
      await peer.setLocalDescription(offer)
      await sendSignal('offer', peer.localDescription || offer)
      setStatus('Waiting for other participant')
    } finally {
      makingOfferRef.current = false
    }
  }

  const handleSignal = async (signal) => {
    if (!signal?.id || processedSignalsRef.current.has(signal.id)) return
    processedSignalsRef.current.add(signal.id)

    if ((signal.type === 'join_accept' || signal.type === 'ready') && shouldCreateOffer && callStarted) {
      resetPeerOnly()
      await createOffer()
      setStatus('Doctor joined. Reconnecting remote video')
      return
    }

    if (signal.type === 'join_request' || signal.type === 'join_accept' || signal.type === 'ready') return

    const peer = await createPeer()
    if (isClosedPeer(peer)) return

    if (signal.type === 'offer') {
      const offerCollision = makingOfferRef.current || peer.signalingState !== 'stable'
      ignoreOfferRef.current = !politePeer && offerCollision
      if (ignoreOfferRef.current) return

      if (offerCollision) {
        await peer.setLocalDescription({ type: 'rollback' }).catch(() => null)
      }
      await peer.setRemoteDescription(new RTCSessionDescription(cleanSessionDescription(signal.payload)))
      const answer = await peer.createAnswer()
      await peer.setLocalDescription(answer)
      await sendSignal('answer', peer.localDescription || answer)
      await flushPendingIce(peer)
      setStatus('Answer sent')
      return
    }

    if (signal.type === 'answer' && peer.signalingState === 'have-local-offer') {
      await peer.setRemoteDescription(new RTCSessionDescription(cleanSessionDescription(signal.payload)))
      await flushPendingIce(peer)
      setStatus('Connected')
      return
    }

    if (signal.type === 'ice') {
      if (!signal.payload?.candidate) return
      if (!peer.remoteDescription) {
        pendingIceRef.current.push(cleanIceCandidate(signal.payload))
        return
      }
      try {
        await peer.addIceCandidate(new RTCIceCandidate(cleanIceCandidate(signal.payload)))
      } catch {
        if (!ignoreOfferRef.current) {
          // Candidate may belong to an already-closed negotiation attempt.
        }
      }
    }
  }

  const pollJoinRequests = async () => {
    if (!roomId || !participantId || callStarted || shouldCreateOffer) return
    const response = await apiFetch(`/api/video-signal?roomId=${encodeURIComponent(roomId)}&senderId=${encodeURIComponent(participantId)}&since=0&type=join_request`)
    const data = await response.json().catch(() => ({}))
    const signals = Array.isArray(data.signals) ? data.signals : []
    const latestBySender = new Map()
    signals.forEach((signal) => latestBySender.set(signal.sender_id, signal))
    setJoinRequests([...latestBySender.values()].sort((a, b) => Number(b.seq || 0) - Number(a.seq || 0)))
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
      callStartedRef.current = true
      setCallStarted(true)
      await sendSignal('ready', {
        readyAt: new Date().toISOString(),
        doctorId,
        patientId,
      })
      setStatus(shouldCreateOffer ? 'Creating room' : 'Waiting for patient or facility')
      if (shouldCreateOffer) {
        await announceJoin()
        await createOffer()
      }
      addError('Secure video room opened. Allow camera and microphone access when prompted.', 'success')
    } catch (error) {
      callStartedRef.current = false
      setCallStarted(false)
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
    rawAudioTracksRef.current.forEach((track) => track.stop())
    rawAudioTracksRef.current = []
    audioContextRef.current?.close?.().catch(() => null)
    audioContextRef.current = null
    if (localVideoRef.current) localVideoRef.current.srcObject = null
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    setCallStarted(false)
    callStartedRef.current = false
    setAudioMuted(false)
    setRemoteAudioMuted(true)
    remoteAudioMutedRef.current = true
    setVideoMuted(false)
    setStatus('Closed')
  }

  useEffect(() => {
    lastSignalSeqRef.current = 0
    processedSignalsRef.current = new Set()
    if (peerRef.current) {
      resetPeerOnly()
      callStartedRef.current = false
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

  const toggleRemoteAudio = () => {
    const next = !remoteAudioMuted
    remoteAudioMutedRef.current = next
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = next
      remoteVideoRef.current.volume = next ? 0 : 0.82
    }
    setRemoteAudioMuted(next)
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

  useEffect(() => {
    if (callStarted || shouldCreateOffer || !roomId || !participantId) return undefined
    const interval = window.setInterval(() => {
      void pollJoinRequests().catch(() => null)
    }, 3000)
    void pollJoinRequests().catch(() => null)
    return () => window.clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStarted, shouldCreateOffer, roomId, participantId])

  useEffect(() => () => endCall(), [])

  useEffect(() => {
    const handleVitalCameraFinished = () => {
      void refreshFrontCamera()
    }
    window.addEventListener('globaldoc:vital-camera-finished', handleVitalCameraFinished)
    return () => window.removeEventListener('globaldoc:vital-camera-finished', handleVitalCameraFinished)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStarted])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-700">Secure browser video room</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Video and audio consultation</h2>
            <p className="mt-2 text-sm text-slate-500">Remote sound starts muted to prevent feedback. Enable sound only when you are ready.</p>
            <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
              <span className="rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">Room: {roomId || 'None'}</span>
              <span className="rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">Status: {status}</span>
              <span className="rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">Peer: {connectionState}</span>
              <span className="rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">ICE: {iceState}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {!shouldCreateOffer && !callStarted && joinRequests.length > 0 && (
              <button
                type="button"
                onClick={() => acceptJoin().catch((error) => addError(error.message, 'error'))}
                disabled={connecting}
                className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Accept patient in room
              </button>
            )}
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
                <button type="button" onClick={toggleRemoteAudio} className="rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-200">
                  {remoteAudioMuted ? 'Enable sound' : 'Mute sound'}
                </button>
                <button type="button" onClick={endCall} className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700">
                  End Call
                </button>
              </>
            )}
          </div>
        </div>
        {!shouldCreateOffer && !callStarted && joinRequests.length > 0 && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            A patient or facility is waiting in this room. Press <span className="font-bold">Accept patient in room</span> to join.
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="overflow-hidden rounded-3xl bg-slate-950 shadow-xl shadow-slate-200/50 ring-1 ring-slate-800">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">
            <span>Remote participant</span>
            <span className={`rounded-full px-3 py-1 text-xs ${remoteSeen ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-100'}`}>
              {remoteSeen ? 'Remote connected' : 'Waiting for remote'}
            </span>
          </div>
          <video ref={remoteVideoRef} autoPlay playsInline muted={remoteAudioMuted} className="aspect-video w-full bg-slate-950 object-cover" />
        </div>
        <div className="overflow-hidden rounded-3xl bg-slate-950 shadow-xl shadow-slate-200/50 ring-1 ring-slate-800">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">You</div>
          <video ref={localVideoRef} autoPlay playsInline muted className="aspect-video w-full bg-slate-950 object-cover" />
        </div>
      </div>
    </div>
  )
}

export default VideoChatPanel
