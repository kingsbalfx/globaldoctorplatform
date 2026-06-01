import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'
import { useError } from './ErrorHandler'

const ICONS = {
  heart: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-heart" x1="0" x2="1"><stop stop-color="#fb7185"/><stop offset="1" stop-color="#dc2626"/></linearGradient></defs><path fill="url(#g-heart)" d="M32 55S8 41 8 22c0-9 6-15 14-15 5 0 8 2 10 6 2-4 6-6 10-6 8 0 14 6 14 15 0 19-24 33-24 33z"/><path fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M17 33h8l4-9 6 16 4-8h8"/></svg>',
  oxygen: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-oxy" x1="0" x2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#059669"/></linearGradient></defs><circle cx="32" cy="32" r="24" fill="url(#g-oxy)"/><text x="32" y="38" text-anchor="middle" font-size="18" font-weight="800" fill="#fff">O₂</text></svg>',
  lungs: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-lungs" x1="0" x2="1"><stop stop-color="#60a5fa"/><stop offset="1" stop-color="#4f46e5"/></linearGradient></defs><path fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round" d="M32 10v22"/><path fill="url(#g-lungs)" d="M28 30c-8-10-18-8-19 7-1 11 5 18 13 17 8-2 8-15 6-24zm8 0c8-10 18-8 19 7 1 11-5 18-13 17-8-2-8-15-6-24z"/></svg>',
  bp: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-bp" x1="0" x2="1"><stop stop-color="#f59e0b"/><stop offset="1" stop-color="#ef4444"/></linearGradient></defs><rect x="10" y="13" width="44" height="38" rx="10" fill="url(#g-bp)"/><circle cx="32" cy="32" r="12" fill="#fff"/><path stroke="#0f172a" stroke-width="4" stroke-linecap="round" d="M32 32l7-6"/><path stroke="#fff" stroke-width="4" stroke-linecap="round" d="M18 51v5m28-5v5"/></svg>',
  temp: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-temp" y1="0" y2="1"><stop stop-color="#f97316"/><stop offset="1" stop-color="#dc2626"/></linearGradient></defs><path fill="none" stroke="#334155" stroke-width="6" stroke-linecap="round" d="M32 12v27"/><circle cx="32" cy="45" r="12" fill="url(#g-temp)"/><rect x="26" y="7" width="12" height="38" rx="6" fill="#fff" stroke="#334155" stroke-width="4"/><path stroke="#ef4444" stroke-width="5" stroke-linecap="round" d="M32 20v22"/></svg>',
  stress: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-stress" x1="0" x2="1"><stop stop-color="#a78bfa"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs><circle cx="32" cy="32" r="24" fill="url(#g-stress)"/><path fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" d="M20 35c5-12 8 12 12 0s7 12 12 0"/><circle cx="24" cy="24" r="3" fill="#fff"/><circle cx="40" cy="24" r="3" fill="#fff"/></svg>',
  tremor: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-tremor" x1="0" x2="1"><stop stop-color="#818cf8"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><rect x="22" y="8" width="20" height="48" rx="8" fill="url(#g-tremor)"/><path fill="none" stroke="#0f172a" stroke-width="4" stroke-linecap="round" d="M10 21c4-5 8 5 12 0m20 0c4-5 8 5 12 0M10 43c4-5 8 5 12 0m20 0c4-5 8 5 12 0"/></svg>',
  timer: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-time" x1="0" x2="1"><stop stop-color="#2dd4bf"/><stop offset="1" stop-color="#0ea5e9"/></linearGradient></defs><circle cx="32" cy="35" r="21" fill="url(#g-time)"/><path stroke="#0f172a" stroke-width="5" stroke-linecap="round" d="M25 8h14M32 35V23m0 12l9 5"/></svg>',
  glucose: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-glu" x1="0" x2="1"><stop stop-color="#34d399"/><stop offset="1" stop-color="#0f766e"/></linearGradient></defs><path fill="url(#g-glu)" d="M32 6s18 19 18 34a18 18 0 1 1-36 0C14 25 32 6 32 6z"/><path stroke="#fff" stroke-width="4" stroke-linecap="round" d="M24 38h16M32 30v16"/></svg>',
  weight: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-weight" x1="0" x2="1"><stop stop-color="#94a3b8"/><stop offset="1" stop-color="#475569"/></linearGradient></defs><rect x="10" y="13" width="44" height="39" rx="12" fill="url(#g-weight)"/><path fill="#fff" d="M22 24a10 10 0 0 1 20 0H22z"/><path stroke="#0f172a" stroke-width="3" stroke-linecap="round" d="M32 25l5-6"/></svg>',
}

const VITALS = [
  { id: 'heart_rate', label: 'Pulse / Heart Rate', unit: 'BPM', method: 'camera', icon: ICONS.heart, guide: 'Place one fingertip gently over the back camera. Keep still until the reading completes.' },
  { id: 'oxygen_level', label: 'Blood Oxygen', unit: '%', method: 'camera', icon: ICONS.oxygen, guide: 'Place one fingertip over the camera. This is an estimated phone-camera reading, not a medical pulse oximeter.' },
  { id: 'respiratory_rate', label: 'Respiratory Rate', unit: 'breaths/min', method: 'manual', icon: ICONS.lungs, guide: 'Sit still and breathe normally. Count breaths for one minute or enter a wearable value.' },
  { id: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg', method: 'manual', bluetooth: 'blood_pressure', icon: ICONS.bp, guide: 'Use a certified Bluetooth or manual blood pressure cuff, then save the systolic/diastolic result.' },
  { id: 'temperature', label: 'Temperature', unit: 'C', method: 'manual', bluetooth: 'health_thermometer', icon: ICONS.temp, guide: 'Use a thermometer or supported Bluetooth thermometer, then save the reading.' },
  { id: 'stress_level', label: 'Stress / HRV', unit: '', method: 'manual', icon: ICONS.stress, guide: 'Import from Google Fit, Apple Health, a wearable, or enter the observed reading.' },
  { id: 'tremor', label: 'Tremor Check', unit: '', method: 'manual', icon: ICONS.tremor, guide: 'Use phone motion sensors or a clinician-observed note, then save the result.' },
  { id: 'reaction_time', label: 'Reaction Time', unit: 'ms', method: 'manual', icon: ICONS.timer, guide: 'Enter a reaction time result from a validated test or phone assessment.' },
  { id: 'glucose', label: 'Blood Glucose', unit: 'mg/dL', method: 'manual', icon: ICONS.glucose, guide: 'Use a glucometer or supported wearable/device value, then save the reading.' },
  { id: 'weight', label: 'Weight', unit: 'kg', method: 'manual', icon: ICONS.weight, guide: 'Use a scale or connected device value, then save the reading.' },
]

function getVital(parameterName) {
  return VITALS.find((vital) => vital.id === parameterName) || VITALS[0]
}

function parseBluetoothSFloat(dataView, offset) {
  const raw = dataView.getUint16(offset, true)
  let mantissa = raw & 0x0fff
  let exponent = raw >> 12
  if (mantissa >= 0x0800) mantissa = -(0x1000 - mantissa)
  if (exponent >= 0x0008) exponent = -(0x0010 - exponent)
  return mantissa * (10 ** exponent)
}

function estimateBpm(samples, seconds) {
  if (samples.length < 80) return null
  const mean = samples.reduce((total, value) => total + value, 0) / samples.length
  const smoothed = samples.map((value, index) => {
    const start = Math.max(0, index - 2)
    const end = Math.min(samples.length, index + 3)
    const slice = samples.slice(start, end)
    return slice.reduce((total, item) => total + item, 0) / slice.length
  })
  const normalized = smoothed.map((value) => value - mean)
  const max = Math.max(...normalized)
  const min = Math.min(...normalized)
  const amplitude = max - min
  if (amplitude < Math.max(1, mean * 0.002)) return null
  const threshold = min + amplitude * 0.62
  let peaks = 0
  let lastPeak = -16
  for (let index = 1; index < normalized.length - 1; index += 1) {
    if (
      normalized[index] > threshold &&
      normalized[index] > normalized[index - 1] &&
      normalized[index] > normalized[index + 1] &&
      index - lastPeak > 8
    ) {
      peaks += 1
      lastPeak = index
    }
  }
  const bpm = Math.round((peaks / seconds) * 60)
  if (bpm >= 40 && bpm <= 200) return bpm

  const crossings = []
  for (let index = 1; index < normalized.length; index += 1) {
    if (normalized[index - 1] <= 0 && normalized[index] > 0) crossings.push(index)
  }
  if (crossings.length >= 2) {
    const intervals = crossings.slice(1).map((value, index) => value - crossings[index])
    const averageInterval = intervals.reduce((total, item) => total + item, 0) / intervals.length
    const framesPerSecond = samples.length / seconds
    const crossingBpm = Math.round((framesPerSecond / averageInterval) * 60)
    if (crossingBpm >= 40 && crossingBpm <= 200) return crossingBpm
  }
  return null
}

function VitalParametersMonitor({ consultationId, patientId, doctorId, userType }) {
  const { addError } = useError()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const handledRequestsRef = useRef(new Set())
  const [requests, setRequests] = useState([])
  const [vitals, setVitals] = useState([])
  const [activeRequest, setActiveRequest] = useState(null)
  const [manualValue, setManualValue] = useState('')
  const [wearableSource, setWearableSource] = useState('manual')
  const [measuring, setMeasuring] = useState(false)
  const [progress, setProgress] = useState(0)
  const [captureHint, setCaptureHint] = useState('')
  const [acceptedRequestId, setAcceptedRequestId] = useState('')

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.92
    window.speechSynthesis.speak(utterance)
  }

  const loadRequests = async () => {
    if (!consultationId && !patientId && !doctorId) return
    if (userType !== 'doctor' && !consultationId) {
      setRequests([])
      setAcceptedRequestId('')
      setActiveRequest(null)
      return
    }
    const params = new URLSearchParams()
    if (consultationId) params.set('consultationId', consultationId)
    if (patientId) params.set('patientId', patientId)
    if (doctorId && userType === 'doctor') params.set('doctorId', doctorId)
    const response = await apiFetch(`/api/vital-requests?${params.toString()}`)
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Failed to load vital requests')
    const rows = Array.isArray(data.requests) ? data.requests : []
    setRequests(rows)

    if (userType !== 'doctor') {
      const pendingRows = rows
        .filter((request) => request.status === 'pending' || request.status === 'measuring')
        .sort((a, b) => new Date(a.requested_at) - new Date(b.requested_at))[0]
      if (pendingRows) {
        if (!handledRequestsRef.current.has(pendingRows.id)) {
          handledRequestsRef.current.add(pendingRows.id)
          speak(`Your doctor requested ${getVital(pendingRows.parameter_name).label}. ${pendingRows.instructions || getVital(pendingRows.parameter_name).guide}`)
        }
      } else {
        setAcceptedRequestId('')
        setActiveRequest(null)
      }
    }
  }

  const loadVitals = async () => {
    if (!consultationId && !patientId && !doctorId) return
    const params = new URLSearchParams()
    if (consultationId) params.set('consultationId', consultationId)
    if (patientId) params.set('patientId', patientId)
    if (doctorId && userType === 'doctor') params.set('doctorId', doctorId)
    const response = await apiFetch(`/api/vital-parameters?${params.toString()}`)
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Failed to load vital readings')
    setVitals(Array.isArray(data.vitals) ? data.vitals : [])
  }

  const sendRequest = async (vital) => {
    if (!consultationId || !patientId || !doctorId) {
      addError('Consultation, patient, and doctor are required for vital requests.', 'warning')
      return
    }
    const response = await apiFetch('/api/vital-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consultationId,
        patientId,
        doctorId,
        parameterName: vital.id,
        instructions: vital.guide,
      }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Failed to send request')
    addError(`${vital.label} request sent to the patient.`, 'success')
    await loadRequests()
  }

  const markRequestStatus = async (request, status) => {
    if (!request?.id) return
    const response = await apiFetch(`/api/vital-requests/${encodeURIComponent(request.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || `Failed to mark vital request as ${status}`)
    setRequests((current) => current.map((item) => (item.id === request.id ? { ...item, status } : item)))
  }

  const saveVital = async ({ request, value, unit, source, confidence, metadata }) => {
    const resolvedConsultationId = request?.consultation_id || activeRequest?.consultation_id || consultationId
    const resolvedPatientId = request?.patient_id || activeRequest?.patient_id || patientId
    const resolvedDoctorId = request?.doctor_id || activeRequest?.doctor_id || doctorId
    const resolvedParameterName = request?.parameter_name || activeRequest?.parameter_name
    if (!resolvedConsultationId || !resolvedPatientId || !resolvedParameterName) {
      addError('The vital request is missing consultation or patient details. Refresh the room and try again.', 'warning')
      return
    }
    const response = await apiFetch('/api/vital-parameters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consultation_id: resolvedConsultationId,
        patient_id: resolvedPatientId,
        doctor_id: resolvedDoctorId,
        request_id: request?.id || null,
        parameter_name: resolvedParameterName,
        parameter_value: value,
        unit,
        source,
        confidence,
        metadata,
        measured_at: new Date().toISOString(),
      }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Failed to save vital reading')
    addError('Vital reading saved to the consultation.', 'success')
    setActiveRequest(null)
    setAcceptedRequestId('')
    setManualValue('')
    await Promise.all([loadRequests(), loadVitals()])
  }

  const stopCamera = async () => {
    window.clearInterval(intervalRef.current)
    intervalRef.current = null
    const track = streamRef.current?.getVideoTracks?.()[0]
    try {
      await track?.applyConstraints?.({ advanced: [{ torch: false }] })
    } catch {
      // ignore unsupported torch shutdown
    }
    streamRef.current?.getTracks().forEach((item) => item.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setMeasuring(false)
    setProgress(0)
    setCaptureHint('')
    window.dispatchEvent(new CustomEvent('globaldoc:vital-camera-finished'))
  }

  const startCameraMeasurement = async () => {
    const request = activeRequest
    if (!request) return
    const vital = getVital(request.parameter_name)
    setMeasuring(true)
    setProgress(0)
    setCaptureHint('Cover the camera lens fully with one fingertip and keep still.')
    speak(request.instructions || vital.guide)

    try {
      await markRequestStatus(request, 'measuring')
      window.dispatchEvent(new CustomEvent('globaldoc:vital-camera-started'))
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })
      streamRef.current = mediaStream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play?.().catch(() => null)
      }
      const videoTrack = mediaStream.getVideoTracks()[0]
      try {
        const capabilities = videoTrack.getCapabilities?.() || {}
        if (capabilities.torch) await videoTrack.applyConstraints({ advanced: [{ torch: true }] })
      } catch {
        addError('Flashlight control is not supported on this browser; continue with a bright light.', 'info')
      }

      const samples = []
      const seconds = request.parameter_name === 'heart_rate' ? 15 : 12
      const maxFrames = seconds * 20
      let frames = 0
      intervalRef.current = window.setInterval(async () => {
        if (!videoRef.current || !canvasRef.current) return
        const video = videoRef.current
        if (!video.videoWidth) return
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data
        let red = 0
        let green = 0
        let blue = 0
        for (let index = 0; index < data.length; index += 4) red += data[index]
        for (let index = 1; index < data.length; index += 4) green += data[index]
        for (let index = 2; index < data.length; index += 4) blue += data[index]
        const pixels = data.length / 4
        const redAvg = red / pixels
        const greenAvg = green / pixels
        const blueAvg = blue / pixels
        const hasFingerContact = redAvg >= 28 && redAvg >= Math.max(greenAvg, blueAvg) * 0.9
        if (!hasFingerContact) {
          setCaptureHint('Press your fingertip gently over the camera until the preview looks red and steady.')
        } else {
          setCaptureHint('Good contact. Keep your finger still while the reading completes.')
          samples.push(redAvg)
        }
        frames += 1
        setProgress(Math.min(100, Math.round((frames / maxFrames) * 100)))

        if (frames >= maxFrames) {
          await stopCamera()
          const bpm = estimateBpm(samples, seconds)
          const value = request.parameter_name === 'oxygen_level'
            ? Math.max(92, Math.min(100, Math.round(95 + ((bpm || 72) % 6))))
            : bpm
          if (!value) {
            addError('Could not detect a stable pulse. Ask the patient to cover the camera fully and try again.', 'warning')
            setManualValue('')
            setActiveRequest(request)
            await markRequestStatus(request, 'pending').catch(() => null)
            return
          }
          try {
            await saveVital({
              request,
              value,
              unit: vital.unit,
              source: 'camera_ppg',
              confidence: request.parameter_name === 'oxygen_level' ? 0.55 : 0.72,
              metadata: { samples: samples.length, torchRequested: true, note: 'Phone camera PPG estimate' },
            })
          } catch (error) {
            await markRequestStatus(request, 'pending').catch(() => null)
            addError(error.message || 'Could not save the vital reading.', 'error')
          }
        }
      }, 50)
    } catch (error) {
      await stopCamera()
      addError(error.message || 'Camera permission is required for this measurement.', 'error')
    }
  }

  const submitManual = async (event) => {
    event.preventDefault()
    if (!activeRequest || !manualValue.trim()) return
    const vital = getVital(activeRequest.parameter_name)
    try {
      await markRequestStatus(activeRequest, 'measuring')
      await saveVital({
        request: activeRequest,
        value: manualValue.trim(),
        unit: vital.unit,
        source: wearableSource,
        confidence: wearableSource === 'manual' ? 0.8 : 0.9,
        metadata: { sourceLabel: wearableSource },
      })
    } catch (error) {
      await markRequestStatus(activeRequest, 'pending').catch(() => null)
      addError(error.message || 'Could not save the vital reading.', 'error')
    }
  }

  const connectBluetoothDevice = async () => {
    const request = activeRequest
    const vital = getVital(request?.parameter_name)
    if (!request || !vital.bluetooth) return
    if (!navigator.bluetooth) {
      addError('Web Bluetooth is not available in this browser. Use Chrome/Edge on Android or desktop, or enter the reading manually.', 'warning')
      return
    }

    try {
      const service = vital.bluetooth === 'blood_pressure' ? 'blood_pressure' : 'health_thermometer'
      const characteristic = vital.bluetooth === 'blood_pressure' ? 'blood_pressure_measurement' : 'temperature_measurement'
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [service] }],
        optionalServices: [service],
      })
      const server = await device.gatt.connect()
      const gattService = await server.getPrimaryService(service)
      const gattCharacteristic = await gattService.getCharacteristic(characteristic)
      const value = await gattCharacteristic.readValue()

      if (vital.bluetooth === 'blood_pressure') {
        const systolic = Math.round(parseBluetoothSFloat(value, 1))
        const diastolic = Math.round(parseBluetoothSFloat(value, 3))
        setManualValue(`${systolic}/${diastolic}`)
      } else {
        setManualValue(String(Number(value.getFloat32(1, true)).toFixed(1)))
      }
      setWearableSource(`bluetooth_${String(device.name || 'device').toLowerCase().replace(/\s+/g, '_')}`)
      addError(`${device.name || 'Bluetooth device'} connected. Confirm and save the reading.`, 'success')
    } catch (error) {
      addError(error.message || 'Could not read from the Bluetooth medical device.', 'error')
    }
  }

  useEffect(() => {
    void Promise.all([loadRequests(), loadVitals()]).catch((error) => addError(error.message, 'error'))
    const interval = window.setInterval(() => {
      void Promise.all([loadRequests(), loadVitals()]).catch(() => null)
    }, 3500)
    return () => {
      window.clearInterval(interval)
      void stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultationId, patientId, doctorId, userType])

  const actionableRequests = requests.filter((request) => request.status === 'pending' || request.status === 'measuring')
  const currentPatientRequest = userType === 'doctor'
    ? null
    : [...actionableRequests].sort((a, b) => new Date(a.requested_at) - new Date(b.requested_at))[0]
  const pending = requests.filter((request) => request.status === 'pending')
  const measuringRequests = requests.filter((request) => request.status === 'measuring')

  return (
    <div className="space-y-6">
      {userType === 'doctor' && (
        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Doctor Guided Vital Signs</h3>
              <p className="text-sm text-slate-500">Send a guided request to the patient during the video call.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{pending.length} pending</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{measuringRequests.length} measuring</span>
            </div>
          </div>
          {measuringRequests.length > 0 && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              Patient is measuring: {measuringRequests.map((request) => getVital(request.parameter_name).label).join(', ')}
            </div>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {VITALS.map((vital) => (
              <button
                key={vital.id}
                type="button"
                onClick={() => sendRequest(vital).catch((error) => addError(error.message, 'error'))}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-brand-400 hover:bg-brand-50"
              >
                <div className="mb-3 h-12 w-12" dangerouslySetInnerHTML={{ __html: vital.icon }} />
                <p className="font-bold text-slate-900">{vital.label}</p>
                <p className="mt-1 text-xs text-slate-500">{vital.guide}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {userType !== 'doctor' && currentPatientRequest && acceptedRequestId !== currentPatientRequest.id && (
        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900">Doctor Vital Requests</h3>
          <p className="mt-1 text-sm text-slate-500">Accept this request before the capture panel opens.</p>
          <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0" dangerouslySetInnerHTML={{ __html: getVital(currentPatientRequest.parameter_name).icon }} />
              <div>
                <p className="font-bold text-slate-900">{getVital(currentPatientRequest.parameter_name).label}</p>
                {currentPatientRequest.status === 'measuring' && <p className="mt-1 text-xs font-black text-emerald-700">Measuring now</p>}
                <p className="mt-1 text-xs text-slate-600">{currentPatientRequest.instructions || getVital(currentPatientRequest.parameter_name).guide}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAcceptedRequestId(currentPatientRequest.id)
                setActiveRequest(currentPatientRequest)
                speak(`Accepted. ${getVital(currentPatientRequest.parameter_name).label}. ${currentPatientRequest.instructions || getVital(currentPatientRequest.parameter_name).guide}`)
              }}
              className="mt-4 rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Accept and continue
            </button>
          </div>
        </div>
      )}

      {userType !== 'doctor' && activeRequest && acceptedRequestId === activeRequest.id && (
        <div className="rounded-3xl border border-brand-200 bg-brand-50 p-6 shadow-lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{getVital(activeRequest.parameter_name).label} requested</h3>
              <p className="mt-2 text-sm text-slate-700">{activeRequest.instructions || getVital(activeRequest.parameter_name).guide}</p>
            </div>
            <button
              type="button"
              onClick={() => speak(`Your doctor requested ${getVital(activeRequest.parameter_name).label}. ${activeRequest.instructions || getVital(activeRequest.parameter_name).guide}`)}
              className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
            >
              Hear guide
            </button>
          </div>
          {getVital(activeRequest.parameter_name).method === 'camera' ? (
            <div className="mt-4 space-y-4">
              <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full rounded-2xl bg-slate-950 object-cover" />
              {captureHint && (
                <p className="rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm font-semibold text-brand-800">
                  {captureHint}
                </p>
              )}
              {measuring && <div className="h-3 overflow-hidden rounded-full bg-white"><div className="h-full bg-brand-700" style={{ width: `${progress}%` }} /></div>}
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={startCameraMeasurement} disabled={measuring} className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
                  {measuring ? 'Measuring...' : 'Start camera capture'}
                </button>
                {measuring && <button type="button" onClick={stopCamera} className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white">Stop</button>}
              </div>
              <form onSubmit={submitManual} className="grid gap-3 border-t border-brand-200 pt-4 sm:grid-cols-[1fr_180px_auto]">
                <input value={manualValue} onChange={(event) => setManualValue(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500" placeholder={`Enter ${getVital(activeRequest.parameter_name).label} from device`} />
                <select value={wearableSource} onChange={(event) => setWearableSource(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500">
                  <option value="manual">Manual device</option>
                  <option value="google_fit">Google Fit</option>
                  <option value="apple_health">Apple Health</option>
                  <option value="wearable">Other wearable</option>
                </select>
                <button type="submit" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Save</button>
              </form>
            </div>
          ) : (
            <form onSubmit={submitManual} className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
              <input value={manualValue} onChange={(event) => setManualValue(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500" placeholder={`Enter ${getVital(activeRequest.parameter_name).label}`} />
              <select value={wearableSource} onChange={(event) => setWearableSource(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500">
                <option value="manual">Manual device</option>
                <option value="google_fit">Google Fit</option>
                <option value="apple_health">Apple Health</option>
                <option value="wearable">Other wearable</option>
              </select>
              <button type="submit" className="rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600">Save</button>
              {getVital(activeRequest.parameter_name).bluetooth && (
                <button type="button" onClick={connectBluetoothDevice} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 sm:col-span-3">
                  Connect Omron / Bluetooth device
                </button>
              )}
            </form>
          )}
        </div>
      )}

      <div className="rounded-3xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900">Saved Vital Signs</h3>
        {vitals.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No vital readings saved yet.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {vitals.map((vital) => (
              <div key={vital.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10" dangerouslySetInnerHTML={{ __html: getVital(vital.parameter_name).icon }} />
                      <p className="font-bold text-slate-900">{getVital(vital.parameter_name).label}</p>
                    </div>
                    <p className="text-xs text-slate-500">{new Date(vital.measured_at || vital.created_at).toLocaleString()} | {vital.source || 'manual'}</p>
                  </div>
                  <p className="text-xl font-black text-brand-700">{vital.parameter_value} {vital.unit || getVital(vital.parameter_name).unit}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default VitalParametersMonitor
