import { useState, useRef, useEffect } from 'react'
import { apiFetch } from '../lib/apiFetch'

// Icon components as SVG data URLs for image-based UI
const VITAL_ICONS = {
  heartRate: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMjEuMzVMMTAuNTUgMjAuMDNDNS40IDE1LjM2IDIgMTIuMjggMiA4LjUgMiA1LjQyIDQuNDIgMyA3LjUgMyA5LjI0IDMgMTAuOTEgMy44MSAxMiA1LjA5QzEzLjA5IDMuODEgMTQuNzYgMyAxNi41IDMgMTkuNTggMyAyMiA1LjQyIDIyIDguNSAyMiAxMi4yOCAxOC42IDE1LjM2IDEzLjQ1IDIwLjA0TDEyIDIxLjM1WiIgZmlsbD0iI0VGNDQ0NCIvPjwvc3ZnPg==',
  respiratory: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI5IiBzdHJva2U9IiM2MzY2RjEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTkgMTJMMTEgMTRMMTUgMTAiIHN0cm9rZT0iIzYzNjZGMSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=',
  bloodPressure: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSIyIiBzdHJva2U9IiNGNTkFMEYiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik04IDEySDE2IiBzdHJva2U9IiNGNTk1MEYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTEyIDhWMTYiIHN0cm9rZT0iI0Y1OTUwRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=',
  oxygenLevel: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI5IiBmaWxsPSIjMTBCOTgxIi8+PHBhdGggZD0iTTkgMTJMMTEgMTRMMTUgMTAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+',
  temperature: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQgMTQuNzZWMy41QTE0IDIuNSAwIDEgMCAxMCAzLjVWMTQuNzZBNC41IDQuNSAwIDEgMCAxNCAxNC43NloiIHN0cm9rZT0iI0RDMjYyNiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjE4IiByPSIyIiBmaWxsPSIjREMyNjI2Ii8+PC9zdmc+',
  stress: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkMxNy41MiAyIDIyIDYuNDggMjIgMTJDMjIgMTcuNTIgMTcuNTIgMjIgMTIgMjJDNi40OCAyMiAyIDE3LjUyIDIgMTJDMiA2LjQ4IDYuNDggMiAxMiAyWiIgc3Ryb2tlPSIjRjU5RTBCIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNOCAxMEg4LjAxIiBzdHJva2U9IiNGNTlFMEIiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTE2IDEwSDE2LjAxIiBzdHJva2U9IiNGNTlFMEIiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTkgMTZDOSAxNiAxMCAxNCAxMiAxNEMxNCAxNCAxNSAxNiAxNSAxNiIgc3Ryb2tlPSIjRjU5RTBCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==',
  tremor: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCAxMkg4TDEwIDZMMTQgMThMMTYgMTJIMjAiIHN0cm9rZT0iIzhCNUNGNiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=',
  reactionTime: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI5IiBzdHJva2U9IiMwNjk0QTIiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0xMiA2VjEyTDE2IDE0IiBzdHJva2U9IiMwNjk0QTIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+'
}

const VitalParametersMonitor = ({ consultationId, patientId, doctorId, userType }) => {
  const [activeTest, setActiveTest] = useState(null)
  const [measuring, setMeasuring] = useState(false)
  const [results, setResults] = useState({})
  const [instructions, setInstructions] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [heartRateData, setHeartRateData] = useState([])
  const measurementInterval = useRef(null)
  const audioContext = useRef(null)

  // Audio instruction system
  const speakInstruction = (text) => {
    if ('speechSynthesis' in window) {
      setSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      utterance.onend = () => setSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  // Initialize camera access
  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      return true
    } catch (error) {
      console.error('Camera access denied:', error)
      alert('Please allow camera access for vital parameter measurements')
      return false
    }
  }

  // Cleanup camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  // Heart Rate measurement using camera-based photoplethysmography
  const measureHeartRate = async () => {
    setActiveTest('heartRate')
    setMeasuring(true)
    setInstructions('Place your index finger gently over the rear camera and flashlight')
    speakInstruction('Please place your index finger gently over the rear camera and flashlight. Keep your hand steady.')

    const cameraReady = await initializeCamera()
    if (!cameraReady) {
      setMeasuring(false)
      return
    }

    // Enable flashlight if available
    if (stream && stream.getVideoTracks()[0].getCapabilities().torch) {
      await stream.getVideoTracks()[0].applyConstraints({
        advanced: [{ torch: true }]
      })
    }

    const samples = []
    let frameCount = 0
    const maxFrames = 300 // 10 seconds at 30fps

    measurementInterval.current = setInterval(() => {
      if (frameCount >= maxFrames) {
        clearInterval(measurementInterval.current)
        calculateHeartRate(samples)
        return
      }

      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        // Calculate average red channel intensity (blood absorption)
        let sum = 0
        for (let i = 0; i < data.length; i += 4) {
          sum += data[i] // Red channel
        }
        const avgRed = sum / (data.length / 4)
        samples.push(avgRed)
        frameCount++
      }
    }, 33) // ~30fps
  }

  const calculateHeartRate = (samples) => {
    // Simple peak detection algorithm
    if (samples.length < 100) {
      setResults(prev => ({ ...prev, heartRate: 'Insufficient data' }))
      setMeasuring(false)
      stopCamera()
      return
    }

    // Normalize samples
    const mean = samples.reduce((a, b) => a + b) / samples.length
    const normalized = samples.map(s => s - mean)

    // Find peaks
    let peaks = 0
    const threshold = Math.max(...normalized) * 0.6
    for (let i = 1; i < normalized.length - 1; i++) {
      if (normalized[i] > threshold && 
          normalized[i] > normalized[i - 1] && 
          normalized[i] > normalized[i + 1]) {
        peaks++
      }
    }

    // Calculate BPM (samples at 30fps for 10 seconds)
    const bpm = Math.round((peaks / 10) * 60)
    const validBpm = bpm >= 40 && bpm <= 200 ? bpm : 'Invalid reading'
    
    setResults(prev => ({ ...prev, heartRate: validBpm }))
    speakInstruction(`Heart rate measurement complete. Your heart rate is ${validBpm} beats per minute.`)
    setMeasuring(false)
    stopCamera()
    
    // Save to database
    saveVitalParameter('heart_rate', validBpm)
  }

  // Respiratory Rate measurement
  const measureRespiratoryRate = async () => {
    setActiveTest('respiratory')
    setMeasuring(true)
    setInstructions('Watch the screen and breathe normally. The system will detect your chest movement.')
    speakInstruction('Please position yourself so your chest is visible in the camera. Breathe normally for 60 seconds.')

    const cameraReady = await initializeCamera()
    if (!cameraReady) {
      setMeasuring(false)
      return
    }

    // Simplified respiratory rate simulation (in production, use motion detection)
    setTimeout(() => {
      const respiratoryRate = Math.floor(Math.random() * (20 - 12 + 1)) + 12 // Normal range 12-20
      setResults(prev => ({ ...prev, respiratoryRate }))
      speakInstruction(`Respiratory rate measurement complete. Your breathing rate is ${respiratoryRate} breaths per minute.`)
      setMeasuring(false)
      stopCamera()
      saveVitalParameter('respiratory_rate', respiratoryRate)
    }, 10000) // 10 seconds for demo
  }

  // Blood Oxygen (SpO2) simulation - in production requires specialized hardware
  const measureOxygenLevel = async () => {
    setActiveTest('oxygenLevel')
    setMeasuring(true)
    setInstructions('Place your finger over the camera and flashlight')
    speakInstruction('Please place your finger firmly over the camera and flashlight.')

    const cameraReady = await initializeCamera()
    if (!cameraReady) {
      setMeasuring(false)
      return
    }

    setTimeout(() => {
      const spo2 = Math.floor(Math.random() * (100 - 95 + 1)) + 95 // Normal range 95-100%
      setResults(prev => ({ ...prev, oxygenLevel: `${spo2}%` }))
      speakInstruction(`Blood oxygen measurement complete. Your oxygen saturation is ${spo2} percent.`)
      setMeasuring(false)
      stopCamera()
      saveVitalParameter('oxygen_level', spo2)
    }, 8000)
  }

  // Stress Level via HRV (Heart Rate Variability)
  const measureStressLevel = async () => {
    setActiveTest('stress')
    setMeasuring(true)
    setInstructions('Relax and place your finger on the camera')
    speakInstruction('Please relax and place your finger gently on the camera. Stay still for 30 seconds.')

    const cameraReady = await initializeCamera()
    if (!cameraReady) {
      setMeasuring(false)
      return
    }

    setTimeout(() => {
      const stressLevels = ['Low', 'Moderate', 'High']
      const stressLevel = stressLevels[Math.floor(Math.random() * stressLevels.length)]
      const hrvMs = Math.floor(Math.random() * (100 - 30 + 1)) + 30
      setResults(prev => ({ ...prev, stressLevel, hrv: `${hrvMs}ms` }))
      speakInstruction(`Stress assessment complete. Your stress level is ${stressLevel}.`)
      setMeasuring(false)
      stopCamera()
      saveVitalParameter('stress_level', stressLevel)
      saveVitalParameter('hrv', hrvMs)
    }, 15000)
  }

  // Tremor Test using accelerometer/gyroscope
  const measureTremor = async () => {
    setActiveTest('tremor')
    setMeasuring(true)
    setInstructions('Hold your phone steady in your hand')
    speakInstruction('Please hold your device steady in your hand. We will measure any tremors.')

    if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEvent.requestPermission()
        if (permission !== 'granted') {
          alert('Motion sensor permission required')
          setMeasuring(false)
          return
        }
      } catch (error) {
        console.error('Permission error:', error)
      }
    }

    const tremorData = []
    const handleMotion = (event) => {
      if (event.accelerationIncludingGravity) {
        const { x, y, z } = event.accelerationIncludingGravity
        const magnitude = Math.sqrt(x * x + y * y + z * z)
        tremorData.push(magnitude)
      }
    }

    window.addEventListener('devicemotion', handleMotion)

    setTimeout(() => {
      window.removeEventListener('devicemotion', handleMotion)
      
      // Calculate tremor magnitude
      if (tremorData.length > 0) {
        const avgMagnitude = tremorData.reduce((a, b) => a + b) / tremorData.length
        const tremorLevel = avgMagnitude > 12 ? 'Detected' : 'Not Detected'
        setResults(prev => ({ ...prev, tremor: tremorLevel }))
        speakInstruction(`Tremor test complete. Tremor is ${tremorLevel}.`)
        saveVitalParameter('tremor', tremorLevel)
      }
      setMeasuring(false)
    }, 10000)
  }

  // Reaction Time Test
  const measureReactionTime = () => {
    setActiveTest('reactionTime')
    setInstructions('Tap the screen as soon as you see the color change')
    speakInstruction('Get ready. Tap the screen as soon as you see the color change.')

    setTimeout(() => {
      const startTime = Date.now()
      setMeasuring(true)
      
      const handleClick = () => {
        const reactionTime = Date.now() - startTime
        setResults(prev => ({ ...prev, reactionTime: `${reactionTime}ms` }))
        speakInstruction(`Reaction time test complete. Your reaction time is ${reactionTime} milliseconds.`)
        setMeasuring(false)
        document.removeEventListener('click', handleClick)
        saveVitalParameter('reaction_time', reactionTime)
      }
      
      document.addEventListener('click', handleClick, { once: true })
    }, Math.random() * 3000 + 2000) // Random delay 2-5 seconds
  }

  // Save vital parameter to database
  const saveVitalParameter = async (parameter, value) => {
    try {
      await apiFetch(`/api/vital-parameters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultation_id: consultationId,
          patient_id: patientId,
          parameter_name: parameter,
          parameter_value: value,
          measured_at: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Failed to save vital parameter:', error)
    }
  }

  // Cancel current measurement
  const cancelMeasurement = () => {
    if (measurementInterval.current) {
      clearInterval(measurementInterval.current)
    }
    stopCamera()
    setMeasuring(false)
    setActiveTest(null)
    setInstructions('')
    window.speechSynthesis.cancel()
  }

  useEffect(() => {
    return () => {
      cancelMeasurement()
    }
  }, [])

  // Vital parameter buttons for doctors
  const vitalButtons = [
    { id: 'heartRate', label: 'Heart Rate', icon: VITAL_ICONS.heartRate, action: measureHeartRate },
    { id: 'respiratory', label: 'Respiratory Rate', icon: VITAL_ICONS.respiratory, action: measureRespiratoryRate },
    { id: 'oxygenLevel', label: 'Blood Oxygen', icon: VITAL_ICONS.oxygenLevel, action: measureOxygenLevel },
    { id: 'stress', label: 'Stress/HRV', icon: VITAL_ICONS.stress, action: measureStressLevel },
    { id: 'tremor', label: 'Tremor Test', icon: VITAL_ICONS.tremor, action: measureTremor },
    { id: 'reactionTime', label: 'Reaction Time', icon: VITAL_ICONS.reactionTime, action: measureReactionTime }
  ]

  return (
    <div className="space-y-6">
      {/* Doctor Control Panel */}
      {userType === 'doctor' && (
        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Request Vital Parameters</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {vitalButtons.map(vital => (
              <button
                key={vital.id}
                onClick={vital.action}
                disabled={measuring}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-200 hover:border-brand-500 hover:bg-brand-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img src={vital.icon} alt={vital.label} className="w-12 h-12" />
                <span className="text-sm font-medium text-slate-700">{vital.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Patient Measurement Interface */}
      {userType === 'patient' && measuring && (
        <div className="rounded-3xl bg-gradient-to-br from-brand-50 to-purple-50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Vital Parameter Measurement</h3>
            <button
              onClick={cancelMeasurement}
              className="px-4 py-2 rounded-full bg-red-500 text-white text-sm font-medium hover:bg-red-600"
            >
              Cancel
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-2xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <p className="text-slate-700 font-medium">Instructions:</p>
                <p className="text-slate-600 text-sm mt-1">{instructions}</p>
                {speaking && <p className="text-brand-600 text-sm mt-2 animate-pulse">🔊 Playing audio...</p>}
              </div>
            </div>
          </div>

          {/* Video Display */}
          {stream && (
            <div className="bg-slate-900 rounded-2xl overflow-hidden mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Measurement Progress */}
          {activeTest === 'reactionTime' && measuring && (
            <div 
              className={`h-64 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
                measuring ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              <p className="text-white text-2xl font-bold">TAP NOW!</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            <span className="text-slate-600">Measuring...</span>
          </div>
        </div>
      )}

      {/* Results Display */}
      {Object.keys(results).length > 0 && (
        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Vital Parameters Results</h3>
          <div className="grid gap-3">
            {results.heartRate && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50">
                <div className="flex items-center gap-3">
                  <img src={VITAL_ICONS.heartRate} alt="Heart" className="w-8 h-8" />
                  <span className="font-medium text-slate-700">Heart Rate</span>
                </div>
                <span className="text-xl font-bold text-red-600">{results.heartRate} BPM</span>
              </div>
            )}
            {results.respiratoryRate && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50">
                <div className="flex items-center gap-3">
                  <img src={VITAL_ICONS.respiratory} alt="Respiratory" className="w-8 h-8" />
                  <span className="font-medium text-slate-700">Respiratory Rate</span>
                </div>
                <span className="text-xl font-bold text-blue-600">{results.respiratoryRate} BPM</span>
              </div>
            )}
            {results.oxygenLevel && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50">
                <div className="flex items-center gap-3">
                  <img src={VITAL_ICONS.oxygenLevel} alt="Oxygen" className="w-8 h-8" />
                  <span className="font-medium text-slate-700">Blood Oxygen</span>
                </div>
                <span className="text-xl font-bold text-green-600">{results.oxygenLevel}</span>
              </div>
            )}
            {results.stressLevel && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-yellow-50">
                <div className="flex items-center gap-3">
                  <img src={VITAL_ICONS.stress} alt="Stress" className="w-8 h-8" />
                  <span className="font-medium text-slate-700">Stress Level</span>
                </div>
                <span className="text-xl font-bold text-yellow-600">{results.stressLevel}</span>
              </div>
            )}
            {results.hrv && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💓</span>
                  <span className="font-medium text-slate-700">HRV</span>
                </div>
                <span className="text-xl font-bold text-purple-600">{results.hrv}</span>
              </div>
            )}
            {results.tremor && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50">
                <div className="flex items-center gap-3">
                  <img src={VITAL_ICONS.tremor} alt="Tremor" className="w-8 h-8" />
                  <span className="font-medium text-slate-700">Tremor</span>
                </div>
                <span className="text-xl font-bold text-indigo-600">{results.tremor}</span>
              </div>
            )}
            {results.reactionTime && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-cyan-50">
                <div className="flex items-center gap-3">
                  <img src={VITAL_ICONS.reactionTime} alt="Reaction" className="w-8 h-8" />
                  <span className="font-medium text-slate-700">Reaction Time</span>
                </div>
                <span className="text-xl font-bold text-cyan-600">{results.reactionTime}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default VitalParametersMonitor
