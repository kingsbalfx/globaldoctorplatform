import { r as reactExports, j as jsxRuntimeExports } from "./react-Bu4vr6vE.js";
import { u as useError, a as apiFetch } from "./index-DCY3-JaP.js";
const DEFAULT_ICE_SERVERS = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }];
const CALLER_TYPES = /* @__PURE__ */ new Set(["patient", "facility", "admin"]);
const RECONNECT_WINDOW_MS = 360 * 1e3;
const RECONNECT_INTERVAL_MS = 3e3;
const VIDEO_MAX_BITRATE = 25e5;
const VIDEO_MEDIUM_BITRATE = 135e4;
const VIDEO_LOW_BITRATE = 7e5;
const AUDIO_MAX_BITRATE = 72 * 1e3;
const CLEAN_AUDIO_CONSTRAINTS = {
  echoCancellation: { ideal: true },
  noiseSuppression: { ideal: true },
  autoGainControl: { ideal: true },
  channelCount: { ideal: 1, max: 1 },
  sampleRate: { ideal: 48e3 }
};
const REMOTE_SPEAKER_VOLUME = 0.72;
function VideoChatPanel({ consultationId, userId, userType, patientId, doctorId, autoStart = false }) {
  const { addError } = useError();
  const localVideoRef = reactExports.useRef(null);
  const remoteVideoRef = reactExports.useRef(null);
  const peerRef = reactExports.useRef(null);
  const videoSenderRef = reactExports.useRef(null);
  const streamRef = reactExports.useRef(null);
  const audioContextRef = reactExports.useRef(null);
  const remoteAudioContextRef = reactExports.useRef(null);
  const remoteAudioSourceRef = reactExports.useRef(null);
  const remoteAudioGainRef = reactExports.useRef(null);
  const remoteStreamRef = reactExports.useRef(null);
  const rawAudioTracksRef = reactExports.useRef([]);
  const pendingIceRef = reactExports.useRef([]);
  const reconnectTimerRef = reactExports.useRef(null);
  const reconnectStartedAtRef = reactExports.useRef(null);
  const reconnectAttemptRef = reactExports.useRef(0);
  const signalFailureCountRef = reactExports.useRef(0);
  const lastSignalSeqRef = reactExports.useRef(0);
  const processedSignalsRef = reactExports.useRef(/* @__PURE__ */ new Set());
  const iceServersRef = reactExports.useRef(DEFAULT_ICE_SERVERS);
  const makingOfferRef = reactExports.useRef(false);
  const ignoreOfferRef = reactExports.useRef(false);
  const callStartedRef = reactExports.useRef(false);
  const remoteAudioMutedRef = reactExports.useRef(true);
  const [callStarted, setCallStarted] = reactExports.useState(false);
  const [connecting, setConnecting] = reactExports.useState(false);
  const [audioMuted, setAudioMuted] = reactExports.useState(false);
  const [remoteAudioMuted, setRemoteAudioMuted] = reactExports.useState(true);
  const [videoMuted, setVideoMuted] = reactExports.useState(false);
  const [status, setStatus] = reactExports.useState("Ready");
  const [connectionState, setConnectionState] = reactExports.useState("new");
  const [iceState, setIceState] = reactExports.useState("new");
  const [remoteSeen, setRemoteSeen] = reactExports.useState(false);
  const [remoteAudioEnhanced, setRemoteAudioEnhanced] = reactExports.useState(false);
  const [recoverySeconds, setRecoverySeconds] = reactExports.useState(0);
  const [joinRequests, setJoinRequests] = reactExports.useState([]);
  const [networkMode, setNetworkMode] = reactExports.useState("standard");
  const [turnConfigured, setTurnConfigured] = reactExports.useState(false);
  const roomId = String(consultationId || "").trim();
  const participantId = String(userId || doctorId || patientId || userType || "").trim();
  const shouldCreateOffer = CALLER_TYPES.has(String(userType || "").toLowerCase());
  const politePeer = !shouldCreateOffer;
  const mediaProfile = reactExports.useMemo(() => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const type = String((conn == null ? void 0 : conn.effectiveType) || "").toLowerCase();
    if ((conn == null ? void 0 : conn.saveData) || type.includes("2g")) {
      return { mode: "data saver", width: 640, height: 360, frameRate: 18, bitrate: VIDEO_LOW_BITRATE };
    }
    if (type.includes("3g")) {
      return { mode: "balanced", width: 960, height: 540, frameRate: 24, bitrate: VIDEO_MEDIUM_BITRATE };
    }
    return { mode: "HD", width: 1280, height: 720, frameRate: 30, bitrate: VIDEO_MAX_BITRATE };
  }, []);
  const isClosedPeer = (peer) => {
    return !peer || peer.signalingState === "closed" || peer.connectionState === "closed";
  };
  const resetPeerOnly = () => {
    var _a;
    (_a = peerRef.current) == null ? void 0 : _a.close();
    peerRef.current = null;
    videoSenderRef.current = null;
    pendingIceRef.current = [];
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    closeRemoteAudio();
    remoteStreamRef.current = null;
    setConnectionState("new");
    setIceState("new");
    setRemoteSeen(false);
  };
  const closeRemoteAudio = () => {
    var _a, _b;
    remoteAudioGainRef.current = null;
    remoteAudioSourceRef.current = null;
    (_b = (_a = remoteAudioContextRef.current) == null ? void 0 : _a.close) == null ? void 0 : _b.call(_a).catch(() => null);
    remoteAudioContextRef.current = null;
    setRemoteAudioEnhanced(false);
  };
  const clearReconnectTimer = () => {
    window.clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = null;
    reconnectStartedAtRef.current = null;
    reconnectAttemptRef.current = 0;
    setRecoverySeconds(0);
  };
  const normalizeSignalPayload = (payload) => {
    if (!payload) return {};
    if (typeof payload.toJSON === "function") return payload.toJSON();
    if (typeof RTCSessionDescription !== "undefined" && payload instanceof RTCSessionDescription) {
      return { type: payload.type, sdp: payload.sdp };
    }
    if (typeof RTCIceCandidate !== "undefined" && payload instanceof RTCIceCandidate) {
      return payload.toJSON();
    }
    return typeof payload === "object" ? { ...payload } : { value: payload };
  };
  const cleanSessionDescription = (payload) => ({
    type: payload == null ? void 0 : payload.type,
    sdp: payload == null ? void 0 : payload.sdp
  });
  const cleanIceCandidate = (payload) => ({
    candidate: payload == null ? void 0 : payload.candidate,
    sdpMid: (payload == null ? void 0 : payload.sdpMid) ?? null,
    sdpMLineIndex: (payload == null ? void 0 : payload.sdpMLineIndex) ?? null,
    usernameFragment: payload == null ? void 0 : payload.usernameFragment
  });
  const loadIceServers = async () => {
    try {
      const response = await apiFetch("/api/video/ice-servers");
      const data = await response.json().catch(() => ({}));
      if (response.ok && Array.isArray(data.iceServers) && data.iceServers.length > 0) {
        iceServersRef.current = data.iceServers;
        setTurnConfigured(Boolean(data.turnConfigured));
      }
    } catch {
      iceServersRef.current = DEFAULT_ICE_SERVERS;
      setTurnConfigured(false);
    }
  };
  const flushPendingIce = async (peer) => {
    if (!(peer == null ? void 0 : peer.remoteDescription)) return;
    const candidates = pendingIceRef.current.splice(0);
    for (const candidate of candidates) {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
      }
    }
  };
  const sendSignal = async (type, payload) => {
    if (!roomId || !participantId) return;
    const signalPayload = normalizeSignalPayload(payload);
    await apiFetch("/api/video-signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId,
        senderId: participantId,
        senderType: userType,
        type,
        payload: {
          ...signalPayload,
          roomId,
          senderId: participantId,
          sentAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      })
    });
  };
  const tuneSenderQuality = async (sender, track) => {
    if (!sender || !track) return;
    try {
      const parameters = sender.getParameters();
      parameters.encodings = parameters.encodings || [{}];
      const [encoding] = parameters.encodings;
      if (track.kind === "video") {
        encoding.maxBitrate = mediaProfile.bitrate;
        encoding.maxFramerate = mediaProfile.frameRate;
        encoding.scaleResolutionDownBy = 1;
        parameters.degradationPreference = "maintain-framerate";
      }
      if (track.kind === "audio") {
        encoding.maxBitrate = AUDIO_MAX_BITRATE;
        parameters.degradationPreference = "maintain-framerate";
      }
      await sender.setParameters(parameters);
    } catch {
    }
  };
  const announceJoin = async () => {
    await sendSignal("join_request", {
      requestedAt: (/* @__PURE__ */ new Date()).toISOString(),
      userType,
      patientId,
      doctorId
    });
  };
  const acceptJoin = async () => {
    await sendSignal("join_accept", {
      acceptedAt: (/* @__PURE__ */ new Date()).toISOString(),
      doctorId,
      patientId
    });
    await startCall();
  };
  const createManagedAudioTrack = (stream) => {
    const [rawAudioTrack] = stream.getAudioTracks();
    if (!rawAudioTrack) return null;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return rawAudioTrack;
    try {
      const audioContext = new AudioContextCtor();
      const source = audioContext.createMediaStreamSource(new MediaStream([rawAudioTrack]));
      const highPass = audioContext.createBiquadFilter();
      highPass.type = "highpass";
      highPass.frequency.value = 90;
      const presence = audioContext.createBiquadFilter();
      presence.type = "peaking";
      presence.frequency.value = 2800;
      presence.Q.value = 0.8;
      presence.gain.value = 2.2;
      const lowPass = audioContext.createBiquadFilter();
      lowPass.type = "lowpass";
      lowPass.frequency.value = 7600;
      const compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.value = -30;
      compressor.knee.value = 20;
      compressor.ratio.value = 4;
      compressor.attack.value = 8e-3;
      compressor.release.value = 0.18;
      const gain = audioContext.createGain();
      gain.gain.value = 0.9;
      const destination = audioContext.createMediaStreamDestination();
      source.connect(highPass);
      highPass.connect(presence);
      presence.connect(lowPass);
      lowPass.connect(compressor);
      compressor.connect(gain);
      gain.connect(destination);
      audioContextRef.current = audioContext;
      rawAudioTracksRef.current = [rawAudioTrack];
      return destination.stream.getAudioTracks()[0] || rawAudioTrack;
    } catch {
      return rawAudioTrack;
    }
  };
  const attachLocalStream = async () => {
    if (streamRef.current) return streamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "user" },
        width: { ideal: mediaProfile.width },
        height: { ideal: mediaProfile.height },
        frameRate: { ideal: Math.min(24, mediaProfile.frameRate), max: mediaProfile.frameRate }
      },
      audio: CLEAN_AUDIO_CONSTRAINTS
    });
    setNetworkMode(mediaProfile.mode);
    stream.getAudioTracks().forEach((track) => {
      var _a;
      (_a = track.applyConstraints) == null ? void 0 : _a.call(track, CLEAN_AUDIO_CONSTRAINTS).catch(() => null);
    });
    const managedAudioTrack = createManagedAudioTrack(stream);
    const managedStream = new MediaStream([
      ...stream.getVideoTracks(),
      ...managedAudioTrack ? [managedAudioTrack] : stream.getAudioTracks()
    ]);
    streamRef.current = managedStream;
    if (localVideoRef.current) localVideoRef.current.srcObject = managedStream;
    return managedStream;
  };
  const pauseLocalVideoForVitalCamera = async () => {
    var _a, _b, _c, _d, _e, _f;
    const peer = peerRef.current;
    const sender = videoSenderRef.current || ((_a = peer == null ? void 0 : peer.getSenders) == null ? void 0 : _a.call(peer).find((item) => {
      var _a2;
      return ((_a2 = item.track) == null ? void 0 : _a2.kind) === "video";
    }));
    try {
      await ((_b = sender == null ? void 0 : sender.replaceTrack) == null ? void 0 : _b.call(sender, null));
    } catch {
    }
    const oldVideoTracks = ((_d = (_c = streamRef.current) == null ? void 0 : _c.getVideoTracks) == null ? void 0 : _d.call(_c)) || [];
    oldVideoTracks.forEach((track) => track.stop());
    const audioTracks = ((_f = (_e = streamRef.current) == null ? void 0 : _e.getAudioTracks) == null ? void 0 : _f.call(_e)) || [];
    streamRef.current = audioTracks.length ? new MediaStream(audioTracks) : null;
    if (localVideoRef.current) localVideoRef.current.srcObject = streamRef.current;
    setVideoMuted(true);
    setStatus("Video paused for vital capture");
  };
  const prepareRemoteAudio = (remoteStream) => {
    var _a;
    if (!remoteStream || remoteStreamRef.current === remoteStream) return;
    closeRemoteAudio();
    remoteStreamRef.current = remoteStream;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
      setRemoteAudioEnhanced(false);
      return;
    }
    try {
      const audioContext = new AudioContextCtor();
      const source = audioContext.createMediaStreamSource(remoteStream);
      const highPass = audioContext.createBiquadFilter();
      highPass.type = "highpass";
      highPass.frequency.value = 85;
      const voicePresence = audioContext.createBiquadFilter();
      voicePresence.type = "peaking";
      voicePresence.frequency.value = 2600;
      voicePresence.Q.value = 0.9;
      voicePresence.gain.value = 2.6;
      const lowPass = audioContext.createBiquadFilter();
      lowPass.type = "lowpass";
      lowPass.frequency.value = 7200;
      const compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.value = -28;
      compressor.knee.value = 18;
      compressor.ratio.value = 3.4;
      compressor.attack.value = 0.01;
      compressor.release.value = 0.18;
      const gain = audioContext.createGain();
      gain.gain.value = remoteAudioMutedRef.current ? 0 : REMOTE_SPEAKER_VOLUME;
      source.connect(highPass);
      highPass.connect(voicePresence);
      voicePresence.connect(lowPass);
      lowPass.connect(compressor);
      compressor.connect(gain);
      gain.connect(audioContext.destination);
      remoteAudioContextRef.current = audioContext;
      remoteAudioSourceRef.current = source;
      remoteAudioGainRef.current = gain;
      setRemoteAudioEnhanced(true);
      if (remoteAudioMutedRef.current) (_a = audioContext.suspend) == null ? void 0 : _a.call(audioContext).catch(() => null);
    } catch {
      remoteAudioContextRef.current = null;
      remoteAudioSourceRef.current = null;
      remoteAudioGainRef.current = null;
      setRemoteAudioEnhanced(false);
    }
  };
  const refreshFrontCamera = async () => {
    var _a, _b, _c, _d, _e;
    if (!callStarted) return;
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: mediaProfile.width },
          height: { ideal: mediaProfile.height },
          frameRate: { ideal: Math.min(24, mediaProfile.frameRate), max: mediaProfile.frameRate }
        },
        audio: false
      });
      const [nextVideoTrack] = nextStream.getVideoTracks();
      if (!nextVideoTrack) return;
      const oldVideoTracks = ((_b = (_a = streamRef.current) == null ? void 0 : _a.getVideoTracks) == null ? void 0 : _b.call(_a)) || [];
      const peer = peerRef.current;
      const sender = videoSenderRef.current || ((_c = peer == null ? void 0 : peer.getSenders) == null ? void 0 : _c.call(peer).find((item) => {
        var _a2;
        return ((_a2 = item.track) == null ? void 0 : _a2.kind) === "video";
      }));
      if (sender) {
        await sender.replaceTrack(nextVideoTrack);
        videoSenderRef.current = sender;
        await tuneSenderQuality(sender, nextVideoTrack);
      }
      const audioTracks = ((_e = (_d = streamRef.current) == null ? void 0 : _d.getAudioTracks) == null ? void 0 : _e.call(_d)) || [];
      const combinedStream = new MediaStream([...audioTracks, nextVideoTrack]);
      oldVideoTracks.forEach((track) => track.stop());
      streamRef.current = combinedStream;
      if (localVideoRef.current) localVideoRef.current.srcObject = combinedStream;
      setVideoMuted(false);
      setStatus((current) => current === "Closed" ? "Ready" : current);
    } catch (error) {
      addError(error.message || "Could not switch back to the front camera.", "warning");
    }
  };
  const createPeer = async () => {
    if (peerRef.current && !isClosedPeer(peerRef.current)) return peerRef.current;
    resetPeerOnly();
    const peer = new RTCPeerConnection({
      iceServers: iceServersRef.current,
      bundlePolicy: "max-bundle",
      iceCandidatePoolSize: 4
    });
    peerRef.current = peer;
    peer.onicecandidate = (event) => {
      var _a, _b;
      if (event.candidate) void sendSignal("ice", ((_b = (_a = event.candidate).toJSON) == null ? void 0 : _b.call(_a)) || event.candidate);
    };
    peer.onicecandidateerror = () => {
      if (!turnConfigured) setStatus("Connection is trying STUN. Add TURN for stricter mobile networks.");
    };
    peer.onnegotiationneeded = async () => {
      if (!callStartedRef.current || !shouldCreateOffer) return;
      await createOffer();
    };
    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.muted = true;
        remoteVideoRef.current.volume = 0;
        prepareRemoteAudio(remoteStream);
        setRemoteSeen(true);
        setStatus("Connected");
      }
    };
    peer.onconnectionstatechange = () => {
      const state = peer.connectionState;
      setConnectionState(state || "unknown");
      if (state === "connected") {
        clearReconnectTimer();
        signalFailureCountRef.current = 0;
        setStatus("Connected");
      }
      if (state === "failed" || state === "disconnected") {
        scheduleReconnect();
      }
      if (state === "closed") setStatus("Closed");
    };
    peer.oniceconnectionstatechange = () => {
      setIceState(peer.iceConnectionState || "unknown");
      if (peer.iceConnectionState === "connected" || peer.iceConnectionState === "completed") {
        clearReconnectTimer();
      }
      if (peer.iceConnectionState === "failed" || peer.iceConnectionState === "disconnected") {
        scheduleReconnect();
      }
    };
    const stream = await attachLocalStream();
    stream.getTracks().forEach((track) => {
      if (!isClosedPeer(peer)) {
        const sender = peer.addTrack(track, stream);
        if (track.kind === "video") videoSenderRef.current = sender;
        void tuneSenderQuality(sender, track);
      }
    });
    return peer;
  };
  const sendReconnectSignals = async () => {
    await sendSignal("ready", {
      readyAt: (/* @__PURE__ */ new Date()).toISOString(),
      doctorId,
      patientId,
      reconnect: true
    });
    if (shouldCreateOffer) {
      await announceJoin();
      await createOffer();
    }
  };
  const reconnectNow = async () => {
    var _a;
    if (!callStartedRef.current) return;
    reconnectStartedAtRef.current = reconnectStartedAtRef.current || Date.now();
    setStatus("Reconnecting now");
    try {
      const peer = peerRef.current;
      (_a = peer == null ? void 0 : peer.restartIce) == null ? void 0 : _a.call(peer);
      if (!peer || peer.connectionState === "failed" || peer.connectionState === "closed") {
        resetPeerOnly();
        await createPeer();
      }
      await sendReconnectSignals();
      scheduleReconnect();
    } catch (error) {
      addError(error.message || "Reconnect failed. Trying again automatically.", "warning");
      scheduleReconnect();
    }
  };
  const scheduleReconnect = () => {
    if (!callStartedRef.current) return;
    if (!reconnectStartedAtRef.current) reconnectStartedAtRef.current = Date.now();
    const elapsedMs = Date.now() - reconnectStartedAtRef.current;
    const secondsLeft = Math.max(0, Math.ceil((RECONNECT_WINDOW_MS - elapsedMs) / 1e3));
    setRecoverySeconds(secondsLeft);
    setStatus(`Reconnecting (${secondsLeft}s left)`);
    if (elapsedMs > RECONNECT_WINDOW_MS) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
      setStatus("Reconnect window expired. Reopen room if network is back.");
      return;
    }
    if (reconnectTimerRef.current) return;
    reconnectTimerRef.current = window.setTimeout(async () => {
      var _a;
      reconnectTimerRef.current = null;
      if (!callStartedRef.current) return;
      if (Date.now() - reconnectStartedAtRef.current > RECONNECT_WINDOW_MS) {
        setStatus("Reconnect window expired. Reopen room if network is back.");
        return;
      }
      reconnectAttemptRef.current += 1;
      setRecoverySeconds(Math.max(0, Math.ceil((RECONNECT_WINDOW_MS - (Date.now() - reconnectStartedAtRef.current)) / 1e3)));
      try {
        const peer = peerRef.current;
        (_a = peer == null ? void 0 : peer.restartIce) == null ? void 0 : _a.call(peer);
        if ((peer == null ? void 0 : peer.connectionState) === "failed") {
          resetPeerOnly();
          await createPeer();
        }
        await sendReconnectSignals();
        scheduleReconnect();
      } catch {
        scheduleReconnect();
      }
    }, RECONNECT_INTERVAL_MS);
  };
  const createOffer = async () => {
    const peer = await createPeer();
    if (isClosedPeer(peer)) return;
    if (makingOfferRef.current) return;
    try {
      makingOfferRef.current = true;
      if (peer.signalingState !== "stable") {
        await peer.setLocalDescription({ type: "rollback" }).catch(() => null);
      }
      const offer = await peer.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await peer.setLocalDescription(offer);
      await sendSignal("offer", peer.localDescription || offer);
      setStatus("Waiting for other participant");
    } finally {
      makingOfferRef.current = false;
    }
  };
  const handleSignal = async (signal) => {
    var _a;
    if (!(signal == null ? void 0 : signal.id) || processedSignalsRef.current.has(signal.id)) return;
    processedSignalsRef.current.add(signal.id);
    if ((signal.type === "join_accept" || signal.type === "ready") && shouldCreateOffer && callStarted) {
      resetPeerOnly();
      await createOffer();
      setStatus("Doctor joined. Reconnecting remote video");
      return;
    }
    if (signal.type === "join_request" || signal.type === "join_accept" || signal.type === "ready") return;
    const peer = await createPeer();
    if (isClosedPeer(peer)) return;
    if (signal.type === "offer") {
      const offerCollision = makingOfferRef.current || peer.signalingState !== "stable";
      ignoreOfferRef.current = !politePeer && offerCollision;
      if (ignoreOfferRef.current) return;
      if (offerCollision) {
        await peer.setLocalDescription({ type: "rollback" }).catch(() => null);
      }
      await peer.setRemoteDescription(new RTCSessionDescription(cleanSessionDescription(signal.payload)));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      await sendSignal("answer", peer.localDescription || answer);
      await flushPendingIce(peer);
      setStatus("Answer sent");
      return;
    }
    if (signal.type === "answer" && peer.signalingState === "have-local-offer") {
      await peer.setRemoteDescription(new RTCSessionDescription(cleanSessionDescription(signal.payload)));
      await flushPendingIce(peer);
      setStatus("Connected");
      return;
    }
    if (signal.type === "ice") {
      if (!((_a = signal.payload) == null ? void 0 : _a.candidate)) return;
      if (!peer.remoteDescription) {
        pendingIceRef.current.push(cleanIceCandidate(signal.payload));
        return;
      }
      try {
        await peer.addIceCandidate(new RTCIceCandidate(cleanIceCandidate(signal.payload)));
      } catch {
        if (!ignoreOfferRef.current) ;
      }
    }
  };
  const pollJoinRequests = async () => {
    if (!roomId || !participantId || callStarted || shouldCreateOffer) return;
    const response = await apiFetch(`/api/video-signal?roomId=${encodeURIComponent(roomId)}&senderId=${encodeURIComponent(participantId)}&since=0&type=join_request`);
    const data = await response.json().catch(() => ({}));
    const signals = Array.isArray(data.signals) ? data.signals : [];
    const latestBySender = /* @__PURE__ */ new Map();
    signals.forEach((signal) => latestBySender.set(signal.sender_id, signal));
    setJoinRequests([...latestBySender.values()].sort((a, b) => Number(b.seq || 0) - Number(a.seq || 0)));
  };
  const pollSignals = async () => {
    if (!roomId || !participantId || !callStarted) return;
    try {
      const response = await apiFetch(`/api/video-signal?roomId=${encodeURIComponent(roomId)}&senderId=${encodeURIComponent(participantId)}&since=${lastSignalSeqRef.current}`);
      if (!response.ok) throw new Error("Video signaling is temporarily unavailable");
      const data = await response.json().catch(() => ({}));
      signalFailureCountRef.current = 0;
      const signals = Array.isArray(data.signals) ? data.signals : [];
      for (const signal of signals) {
        lastSignalSeqRef.current = Math.max(lastSignalSeqRef.current, Number(signal.seq || 0));
        await handleSignal(signal);
      }
    } catch (error) {
      signalFailureCountRef.current += 1;
      if (signalFailureCountRef.current >= 2) scheduleReconnect();
      throw error;
    }
  };
  const startCall = async () => {
    if (!roomId) {
      addError("Select or start a consultation before opening video.", "warning");
      return;
    }
    if (!participantId) {
      addError("Missing participant identity for video call.", "warning");
      return;
    }
    setConnecting(true);
    try {
      clearReconnectTimer();
      await loadIceServers();
      await createPeer();
      callStartedRef.current = true;
      setCallStarted(true);
      await sendSignal("ready", {
        readyAt: (/* @__PURE__ */ new Date()).toISOString(),
        doctorId,
        patientId
      });
      setStatus(shouldCreateOffer ? "Creating room" : "Waiting for patient or facility");
      if (shouldCreateOffer) {
        await announceJoin();
        await createOffer();
      }
      addError("Secure video room opened. Allow camera and microphone access when prompted.", "success");
    } catch (error) {
      callStartedRef.current = false;
      setCallStarted(false);
      addError(error.message || "Unable to start the video call.", "error");
      setStatus("Could not start");
    } finally {
      setConnecting(false);
    }
  };
  const endCall = () => {
    var _a, _b, _c, _d;
    clearReconnectTimer();
    (_a = peerRef.current) == null ? void 0 : _a.close();
    peerRef.current = null;
    videoSenderRef.current = null;
    (_b = streamRef.current) == null ? void 0 : _b.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    rawAudioTracksRef.current.forEach((track) => track.stop());
    rawAudioTracksRef.current = [];
    (_d = (_c = audioContextRef.current) == null ? void 0 : _c.close) == null ? void 0 : _d.call(_c).catch(() => null);
    audioContextRef.current = null;
    closeRemoteAudio();
    remoteStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setCallStarted(false);
    callStartedRef.current = false;
    setAudioMuted(false);
    setRemoteAudioMuted(true);
    remoteAudioMutedRef.current = true;
    setVideoMuted(false);
    setStatus("Closed");
  };
  reactExports.useEffect(() => {
    lastSignalSeqRef.current = 0;
    processedSignalsRef.current = /* @__PURE__ */ new Set();
    if (peerRef.current) {
      resetPeerOnly();
      callStartedRef.current = false;
      setCallStarted(false);
      setStatus("Ready");
    }
  }, [roomId, participantId]);
  const toggleAudio = () => {
    var _a;
    const next = !audioMuted;
    (_a = streamRef.current) == null ? void 0 : _a.getAudioTracks().forEach((track) => {
      track.enabled = !next;
    });
    setAudioMuted(next);
  };
  const toggleVideo = () => {
    var _a;
    const next = !videoMuted;
    (_a = streamRef.current) == null ? void 0 : _a.getVideoTracks().forEach((track) => {
      track.enabled = !next;
    });
    setVideoMuted(next);
  };
  const toggleRemoteAudio = () => {
    var _a, _b, _c, _d;
    const next = !remoteAudioMuted;
    remoteAudioMutedRef.current = next;
    if (remoteAudioGainRef.current) remoteAudioGainRef.current.gain.value = next ? 0 : REMOTE_SPEAKER_VOLUME;
    if (remoteAudioContextRef.current) {
      if (next) (_b = (_a = remoteAudioContextRef.current).suspend) == null ? void 0 : _b.call(_a).catch(() => null);
      else (_d = (_c = remoteAudioContextRef.current).resume) == null ? void 0 : _d.call(_c).catch(() => null);
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = remoteAudioEnhanced || next;
      remoteVideoRef.current.volume = remoteAudioEnhanced || next ? 0 : REMOTE_SPEAKER_VOLUME;
    }
    setRemoteAudioMuted(next);
  };
  reactExports.useEffect(() => {
    var _a;
    void loadIceServers();
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const handleNetworkChange = () => {
      const type = String((conn == null ? void 0 : conn.effectiveType) || "").toLowerCase();
      if ((conn == null ? void 0 : conn.saveData) || type.includes("2g")) setNetworkMode("data saver");
      else if (type.includes("3g")) setNetworkMode("balanced");
      else setNetworkMode(mediaProfile.mode);
    };
    (_a = conn == null ? void 0 : conn.addEventListener) == null ? void 0 : _a.call(conn, "change", handleNetworkChange);
    return () => {
      var _a2;
      return (_a2 = conn == null ? void 0 : conn.removeEventListener) == null ? void 0 : _a2.call(conn, "change", handleNetworkChange);
    };
  }, []);
  reactExports.useEffect(() => {
    if (autoStart && !callStarted && !connecting && roomId && participantId) {
      void startCall();
    }
  }, [autoStart, roomId, participantId]);
  reactExports.useEffect(() => {
    if (!callStarted) return void 0;
    const interval = window.setInterval(() => {
      void pollSignals().catch(() => scheduleReconnect());
    }, document.hidden ? 1800 : 900);
    void pollSignals().catch(() => scheduleReconnect());
    return () => window.clearInterval(interval);
  }, [callStarted, roomId, participantId]);
  reactExports.useEffect(() => {
    if (callStarted || shouldCreateOffer || !roomId || !participantId) return void 0;
    const interval = window.setInterval(() => {
      void pollJoinRequests().catch(() => null);
    }, 3e3);
    void pollJoinRequests().catch(() => null);
    return () => window.clearInterval(interval);
  }, [callStarted, shouldCreateOffer, roomId, participantId]);
  reactExports.useEffect(() => () => endCall(), []);
  reactExports.useEffect(() => {
    const handleVitalCameraStarted = () => {
      void pauseLocalVideoForVitalCamera();
    };
    const handleVitalCameraFinished = () => {
      void refreshFrontCamera();
    };
    window.addEventListener("globaldoc:vital-camera-started", handleVitalCameraStarted);
    window.addEventListener("globaldoc:vital-camera-finished", handleVitalCameraFinished);
    return () => {
      window.removeEventListener("globaldoc:vital-camera-started", handleVitalCameraStarted);
      window.removeEventListener("globaldoc:vital-camera-finished", handleVitalCameraFinished);
    };
  }, [callStarted]);
  reactExports.useEffect(() => {
    const handleOnline = () => {
      if (callStartedRef.current) {
        reconnectStartedAtRef.current = reconnectStartedAtRef.current || Date.now();
        void sendReconnectSignals().catch(() => scheduleReconnect());
      }
    };
    const handleOffline = () => {
      if (callStartedRef.current) scheduleReconnect();
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.18em] text-brand-700", children: "Secure browser video room" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-2xl font-bold text-slate-900", children: "Video and audio consultation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-500", children: "Remote sound starts muted. Enable clear speaker when you are ready; voice is filtered for lower feedback and cleaner speech." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-2 text-xs font-semibold text-slate-600 sm:grid-cols-2 lg:grid-cols-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100", children: [
              "Room: ",
              roomId || "None"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100", children: [
              "Status: ",
              status
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100", children: [
              "Peer: ",
              connectionState
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100", children: [
              "ICE: ",
              iceState
            ] }),
            recoverySeconds > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-2xl bg-amber-50 px-3 py-2 text-amber-800 ring-1 ring-amber-100", children: [
              "Auto reconnect: ",
              recoverySeconds,
              "s"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
          !shouldCreateOffer && !callStarted && joinRequests.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => acceptJoin().catch((error) => addError(error.message, "error")),
              disabled: connecting,
              className: "rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50",
              children: "Accept patient in room"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: startCall,
              disabled: connecting || callStarted,
              className: "rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50",
              children: callStarted ? "Room open" : connecting ? "Opening..." : "Open Video Room"
            }
          ),
          callStarted && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: toggleAudio, className: "rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800", children: audioMuted ? "Unmute" : "Mute" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: toggleVideo, className: "rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800", children: videoMuted ? "Camera on" : "Camera off" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: toggleRemoteAudio, className: "rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-200", children: remoteAudioMuted ? "Enable clear speaker" : "Mute speaker" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: reconnectNow, className: "rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700", children: "Reconnect" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: refreshFrontCamera, className: "rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-200", children: "Refresh camera" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: endCall, className: "rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700", children: "End Call" })
          ] })
        ] })
      ] }),
      !shouldCreateOffer && !callStarted && joinRequests.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900", children: [
        "A patient or facility is waiting in this room. Press ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: "Accept patient in room" }),
        " to join."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-3 text-xs font-semibold text-slate-600 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100", children: [
          "Camera quality: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-900", children: networkMode })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100", children: [
          "Relay support: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: turnConfigured ? "text-emerald-700" : "text-amber-700", children: turnConfigured ? "TURN enabled" : "STUN only" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100", children: [
          "Speaker: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-900", children: remoteAudioMuted ? "muted" : remoteAudioEnhanced ? "enhanced" : "browser audio" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-[1.35fr_0.65fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-3xl bg-slate-950 shadow-xl shadow-slate-200/50 ring-1 ring-slate-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm font-semibold text-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Remote participant" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-xs ${remoteSeen ? "bg-emerald-500/20 text-emerald-200" : "bg-amber-500/20 text-amber-100"}`, children: remoteSeen ? "Remote connected" : "Waiting for remote" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("video", { ref: remoteVideoRef, autoPlay: true, playsInline: true, muted: remoteAudioEnhanced || remoteAudioMuted, className: "aspect-video w-full bg-slate-950 object-cover" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-3xl bg-slate-950 shadow-xl shadow-slate-200/50 ring-1 ring-slate-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-white/10 px-4 py-3 text-sm font-semibold text-white", children: "You" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("video", { ref: localVideoRef, autoPlay: true, playsInline: true, muted: true, className: "aspect-video w-full bg-slate-950 object-cover" })
      ] })
    ] })
  ] });
}
const COMPANY_NAME$1 = "GlobalDoc";
function escapeHtml$1(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function buildPrescriptionHtml(prescription) {
  const issued = prescription.issued_at || prescription.created_at || (/* @__PURE__ */ new Date()).toISOString();
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Prescription - ${escapeHtml$1(prescription.patient_name)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f8fafc; color: #0f172a; }
    .page { max-width: 840px; margin: 28px auto; background: #fff; border: 1px solid #e2e8f0; padding: 36px; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #0f766e; padding-bottom: 20px; }
    .brand { display: flex; gap: 14px; align-items: center; }
    .logo { width: 62px; height: 62px; border-radius: 18px; background: #0f766e; color: #fff; display: grid; place-items: center; font-size: 26px; font-weight: 800; }
    h1, h2, p { margin: 0; }
    h1 { font-size: 28px; }
    h2 { margin-top: 28px; font-size: 16px; color: #0f766e; text-transform: uppercase; letter-spacing: 0.08em; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 22px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; }
    .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; }
    .value { margin-top: 6px; font-size: 15px; font-weight: 700; }
    pre { white-space: pre-wrap; font: 15px/1.6 Arial, sans-serif; background: #f8fafc; padding: 18px; border-radius: 14px; border: 1px solid #e2e8f0; }
    .footer { margin-top: 36px; display: flex; justify-content: space-between; gap: 24px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
    .signature { min-width: 260px; text-align: center; }
    .signature img { max-width: 220px; max-height: 80px; object-fit: contain; display: block; margin: 0 auto 8px; }
    .signature-line { border-top: 1px solid #0f172a; padding-top: 8px; font-weight: 700; }
    @media print { body { background: #fff; } .page { margin: 0; border: 0; } }
  </style>
</head>
<body>
  <main class="page">
    <section class="header">
      <div class="brand">
        <div class="logo">GD</div>
        <div>
          <h1>${COMPANY_NAME$1}</h1>
          <p>Digital Healthcare Prescription</p>
        </div>
      </div>
      <div>
        <p class="label">Date</p>
        <p class="value">${new Date(issued).toLocaleString()}</p>
      </div>
    </section>
    <section class="grid">
      <div class="box"><p class="label">Patient Name</p><p class="value">${escapeHtml$1(prescription.patient_name)}</p></div>
      <div class="box"><p class="label">Patient ID</p><p class="value">${escapeHtml$1(prescription.patient_id)}</p></div>
      <div class="box"><p class="label">Doctor Name</p><p class="value">Dr. ${escapeHtml$1(prescription.doctor_name)}</p></div>
      <div class="box"><p class="label">Doctor R/N Number</p><p class="value">${escapeHtml$1(prescription.doctor_license_number || prescription.rn_number || "Not provided")}</p></div>
    </section>
    <h2>Prescription</h2>
    <pre>${escapeHtml$1(prescription.medications || prescription.prescription_text)}</pre>
    <h2>Clinical Notes</h2>
    <pre>${escapeHtml$1(prescription.notes || "No additional notes.")}</pre>
    <section class="footer">
      <div>
        <p class="label">Company</p>
        <p class="value">${COMPANY_NAME$1}</p>
      </div>
      <div class="signature">
        ${prescription.doctor_signature_data_url ? `<img src="${escapeHtml$1(prescription.doctor_signature_data_url)}" alt="Doctor signature" />` : ""}
        <div class="signature-line">Dr. ${escapeHtml$1(prescription.doctor_name)}</div>
      </div>
    </section>
  </main>
</body>
</html>`;
}
function downloadPrescription(prescription) {
  const html = buildPrescriptionHtml(prescription);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `prescription-${prescription.patient_name || prescription.patient_id || prescription.id}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
function PrescriptionManager({ mode = "list", patientId, patientName, doctor, consultationId, facilityId }) {
  const { addError } = useError();
  const [prescriptions, setPrescriptions] = reactExports.useState([]);
  const [medications, setMedications] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const loadPrescriptions = async () => {
    const params = new URLSearchParams();
    if (patientId) params.set("patientId", patientId);
    if (doctor == null ? void 0 : doctor.id) params.set("doctorId", doctor.id);
    if (facilityId) params.set("facilityId", facilityId);
    if (consultationId) params.set("consultationId", consultationId);
    const response = await apiFetch(`/api/prescriptions?${params.toString()}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Failed to load prescriptions");
    setPrescriptions(Array.isArray(data.prescriptions) ? data.prescriptions : []);
  };
  reactExports.useEffect(() => {
    if (patientId || (doctor == null ? void 0 : doctor.id) || facilityId || consultationId) {
      void loadPrescriptions().catch((error) => addError(error.message, "error"));
    }
  }, [patientId, doctor == null ? void 0 : doctor.id, facilityId, consultationId]);
  const submitPrescription = async (event) => {
    event.preventDefault();
    if (!patientId || !(doctor == null ? void 0 : doctor.id) || !consultationId || !medications.trim()) {
      addError("Patient, consultation, doctor, and prescription text are required.", "warning");
      return;
    }
    setLoading(true);
    try {
      const response = await apiFetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId,
          patientId,
          patientName,
          doctorId: doctor.id,
          doctorName: doctor.name,
          doctorLicenseNumber: doctor.licenseNumber || doctor.license_number || doctor.rnNumber || "",
          doctorSignatureDataUrl: doctor.signatureDataUrl || doctor.signature_data_url || "",
          facilityId,
          medications,
          notes
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to send prescription");
      setMedications("");
      setNotes("");
      addError("Prescription sent to patient and facility records.", "success");
      await loadPrescriptions();
    } catch (error) {
      addError(error.message, "error");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Prescriptions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "Create, share, and download official GlobalDoc prescriptions." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => loadPrescriptions().catch((error) => addError(error.message, "error")), className: "rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200", children: "Refresh" })
    ] }),
    mode === "doctor" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submitPrescription, className: "mt-5 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: medications,
          onChange: (event) => setMedications(event.target.value),
          rows: 5,
          className: "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500",
          placeholder: "Medication, dosage, frequency, duration..."
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: notes,
          onChange: (event) => setNotes(event.target.value),
          rows: 3,
          className: "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500",
          placeholder: "Diagnosis, instructions, follow-up notes..."
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: loading, className: "rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50", children: loading ? "Sending..." : "Send prescription" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 space-y-3", children: prescriptions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-2xl bg-slate-50 p-4 text-sm text-slate-600", children: "No prescriptions yet." }) : prescriptions.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-slate-900", children: item.patient_name || item.patient_id }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-500", children: [
          "Dr. ",
          item.doctor_name,
          " | ",
          new Date(item.issued_at || item.created_at).toLocaleString()
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => downloadPrescription(item), className: "rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800", children: "Download" })
    ] }) }, item.id)) })
  ] });
}
const COMPANY_NAME = "GlobalDoc";
function escapeHtml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function buildLabRequestHtml(order, fallback = {}) {
  const tests = Array.isArray(order.tests) ? order.tests : [];
  return `<!doctype html>
<html><head><meta charset="utf-8" /><title>Lab Request - ${escapeHtml(order.patient_name || fallback.patientName)}</title>
<style>
body{font-family:Arial,sans-serif;background:#f8fafc;color:#0f172a;margin:0}.page{max-width:840px;margin:28px auto;background:#fff;border:1px solid #e2e8f0;padding:36px}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #0f766e;padding-bottom:20px}.brand{display:flex;gap:14px;align-items:center}.logo{width:62px;height:62px;border-radius:18px;background:#0f766e;color:white;display:grid;place-items:center;font-weight:900;font-size:26px}h1,p{margin:0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:22px}.box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px}.label{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.08em}.value{margin-top:6px;font-weight:700}.tests{margin-top:28px}.tests li{margin:8px 0;font-weight:700}.signature{margin-top:42px;text-align:right}.signature img{max-width:220px;max-height:80px;object-fit:contain;display:block;margin-left:auto}.line{margin-left:auto;width:260px;border-top:1px solid #0f172a;padding-top:8px;font-weight:700;text-align:center}@media print{body{background:#fff}.page{margin:0;border:0}}
</style></head>
<body><main class="page">
<section class="header"><div class="brand"><div class="logo">GD</div><div><h1>${COMPANY_NAME}</h1><p>Laboratory / USS Request Form</p></div></div><div><p class="label">Date</p><p class="value">${new Date(order.created_at || Date.now()).toLocaleString()}</p></div></section>
<section class="grid">
<div class="box"><p class="label">Patient Name</p><p class="value">${escapeHtml(order.patient_name || fallback.patientName || order.patient_id)}</p></div>
<div class="box"><p class="label">Patient ID</p><p class="value">${escapeHtml(order.patient_id)}</p></div>
<div class="box"><p class="label">Doctor Name</p><p class="value">Dr. ${escapeHtml(order.doctor_name || fallback.doctorName || order.doctor_id)}</p></div>
<div class="box"><p class="label">Doctor R/N Number</p><p class="value">${escapeHtml(order.doctor_license_number || fallback.doctorLicenseNumber || "Not provided")}</p></div>
<div class="box"><p class="label">Request ID</p><p class="value">${escapeHtml(order.id)}</p></div>
<div class="box"><p class="label">Company</p><p class="value">${escapeHtml(order.company_name || COMPANY_NAME)}</p></div>
</section>
<section class="tests"><p class="label">Requested Tests / Imaging</p><ul>${tests.map((test) => `<li>${escapeHtml(typeof test === "string" ? test : test.name || JSON.stringify(test))}</li>`).join("")}</ul></section>
<section class="signature">${order.doctor_signature_data_url || fallback.doctorSignatureDataUrl ? `<img src="${escapeHtml(order.doctor_signature_data_url || fallback.doctorSignatureDataUrl)}" alt="Doctor signature" />` : ""}<div class="line">Dr. ${escapeHtml(order.doctor_name || fallback.doctorName || order.doctor_id)}</div></section>
</main></body></html>`;
}
function downloadLabRequest(order, fallback) {
  const blob = new Blob([buildLabRequestHtml(order, fallback)], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `lab-request-${order.patient_name || order.patient_id || order.id}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
function LabRequestManager({ mode = "list", consultationId, patientId, patientName, doctor, facilityId }) {
  const { addError } = useError();
  const [orders, setOrders] = reactExports.useState([]);
  const [testsText, setTestsText] = reactExports.useState("");
  const [total, setTotal] = reactExports.useState("1000");
  const [loading, setLoading] = reactExports.useState(false);
  const loadOrders = async () => {
    const params = new URLSearchParams();
    if (patientId) params.set("patientId", patientId);
    if (doctor == null ? void 0 : doctor.id) params.set("doctorId", doctor.id);
    if (facilityId) params.set("facilityId", facilityId);
    if (consultationId) params.set("consultationId", consultationId);
    const response = await apiFetch(`/api/labs/orders?${params.toString()}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Failed to load lab requests");
    setOrders(Array.isArray(data.orders) ? data.orders : []);
  };
  reactExports.useEffect(() => {
    if (patientId || (doctor == null ? void 0 : doctor.id) || facilityId || consultationId) void loadOrders().catch((error) => addError(error.message, "error"));
  }, [patientId, doctor == null ? void 0 : doctor.id, facilityId, consultationId]);
  const createOrder = async (event) => {
    event.preventDefault();
    const tests = testsText.split("\n").map((item) => item.trim()).filter(Boolean);
    if (!patientId || !(doctor == null ? void 0 : doctor.id) || tests.length === 0) {
      addError("Patient, doctor, and tests are required.", "warning");
      return;
    }
    setLoading(true);
    try {
      const response = await apiFetch("/api/labs/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId,
          patientId,
          patientName,
          doctorId: doctor.id,
          doctorName: doctor.name,
          doctorLicenseNumber: doctor.licenseNumber || doctor.license_number || doctor.rnNumber || "",
          doctorSignatureDataUrl: doctor.signatureDataUrl || doctor.signature_data_url || "",
          facilityId: facilityId || null,
          tests,
          total_price_ngn: Number(total) || 1e3
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to create lab request");
      setTestsText("");
      addError("Lab request created. Patient can download it.", "success");
      await loadOrders();
    } catch (error) {
      addError(error.message, "error");
    } finally {
      setLoading(false);
    }
  };
  const fallback = {
    patientName,
    doctorName: doctor == null ? void 0 : doctor.name,
    doctorLicenseNumber: (doctor == null ? void 0 : doctor.licenseNumber) || (doctor == null ? void 0 : doctor.license_number) || (doctor == null ? void 0 : doctor.rnNumber),
    doctorSignatureDataUrl: (doctor == null ? void 0 : doctor.signatureDataUrl) || (doctor == null ? void 0 : doctor.signature_data_url)
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Lab / USS Requests" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "Create and download official request forms." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => loadOrders().catch((error) => addError(error.message, "error")), className: "rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200", children: "Refresh" })
    ] }),
    mode === "doctor" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: createOrder, className: "mt-5 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: testsText, onChange: (event) => setTestsText(event.target.value), rows: 4, className: "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500", placeholder: "One test per line e.g. FBC, Malaria test, USS abdomen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: total, onChange: (event) => setTotal(event.target.value), className: "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500", placeholder: "Estimated price NGN" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: loading, className: "rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50", children: loading ? "Creating..." : "Create request form" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 space-y-3", children: orders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-2xl bg-slate-50 p-4 text-sm text-slate-600", children: "No lab requests yet." }) : orders.map((order) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-slate-900", children: (order.tests || []).join(", ") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-500", children: [
          new Date(order.created_at).toLocaleString(),
          " | ",
          order.status
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => downloadLabRequest(order, fallback), className: "rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800", children: "Download request" })
    ] }) }, order.id)) })
  ] });
}
export {
  LabRequestManager as L,
  PrescriptionManager as P,
  VideoChatPanel as V,
  downloadLabRequest as a,
  downloadPrescription as d
};
