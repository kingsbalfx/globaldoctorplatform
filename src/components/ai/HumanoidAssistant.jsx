import { useMemo, useRef, useState } from 'react'
import { Bot, CalendarDays, FileText, Languages, MessageCircle, Mic, MicOff, Send, ShieldCheck, Sparkles, Stethoscope, Video, X, Minus } from 'lucide-react'

const portalProfiles = {
  landing: {
    title: 'GlobalDoc AI Guide',
    badge: 'Platform guide',
    greeting: 'Hi, I am your GlobalDoc AI guide. I can explain how patients, doctors, facilities, and admins use this platform.',
    quickActions: ['How does the platform work?', 'Find a doctor', 'Need urgent help', 'Explain video consultation'],
  },
  patient: {
    title: 'Patient AI Guide',
    badge: 'Patient support',
    greeting: 'Tell me what you need: booking help, records, prescriptions, lab requests, or video consultation guidance.',
    quickActions: ['Prepare health summary', 'Book a doctor', 'Upload records', 'Start video call'],
  },
  doctor: {
    title: 'Doctor AI Copilot',
    badge: 'Clinical workflow',
    greeting: 'I can help structure visit notes, summarize patient context, prepare follow-up steps, and keep consultations organized.',
    quickActions: ['Summarize visit', 'Prepare follow-up', 'Write patient instructions', 'Check priority signs'],
  },
  facility: {
    title: 'Facility AI Coordinator',
    badge: 'Facility support',
    greeting: 'I can help route patients, explain lab/referral workflows, and guide facility staff through telehealth operations.',
    quickActions: ['Route a patient', 'Explain lab request', 'Referral workflow', 'Doctor matching'],
  },
  'platform-admin': {
    title: 'Admin AI Monitor',
    badge: 'Operations',
    greeting: 'I can help monitor platform operations, spot support issues, explain user flows, and guide admin decisions.',
    quickActions: ['Platform summary', 'Support issue', 'Doctor verification', 'Booking problem'],
  },
}

function getPortalProfile(portal) {
  return portalProfiles[portal] || portalProfiles.landing
}

function buildResponse(input, portal) {
  const text = String(input || '').trim().toLowerCase()
  const profile = getPortalProfile(portal)

  if (!text) return 'Please type what you need help with. I guide workflow steps; qualified professionals make care decisions.'

  if (text.includes('urgent') || text.includes('emergency')) {
    return 'For immediate danger or rapidly worsening health problems, contact local emergency services now. Use GlobalDoc support only when it is safe to wait for platform assistance.'
  }

  if (text.includes('how') && (text.includes('work') || text.includes('platform'))) {
    return 'GlobalDoc Connect works in four layers: patients search and book care, doctors manage consultations, facilities coordinate referrals and lab support, and admins monitor trust, support, and verification.'
  }

  if (text.includes('book') || text.includes('appointment') || text.includes('doctor')) {
    return portal === 'doctor'
      ? 'For doctors: keep availability updated, complete verification, and use consultation tools for chat, video, notes, prescriptions, and follow-up.'
      : 'To book care: search by specialty, language, location, rating, and availability. Choose a doctor, confirm the consultation type, complete payment or token use, then join chat or video when ready.'
  }

  if (text.includes('video') || text.includes('call') || text.includes('consult')) {
    return 'For video consultation: confirm the appointment, allow microphone/camera permission, join from a stable connection, keep your records nearby, and use chat if the network becomes weak.'
  }

  if (text.includes('upload') || text.includes('file') || text.includes('record') || text.includes('pdf')) {
    return 'Use the patient files area to upload lab results, scans, prescriptions, or summaries. Only upload documents relevant to the current consultation.'
  }

  if (text.includes('prescription') || text.includes('medicine') || text.includes('medication')) {
    return 'I can help organize medication questions. A qualified professional should prescribe or change treatment. Ask about dosage, timing, side effects, allergies, and follow-up instructions.'
  }

  if (text.includes('language') || text.includes('translate') || text.includes('hausa') || text.includes('french') || text.includes('arabic')) {
    return 'Use the language selector or page translation tools to make the care flow easier. Confirm important details directly with the professional to avoid translation mistakes.'
  }

  if (text.includes('health') || text.includes('summary') || text.includes('feel') || text.includes('pain')) {
    return 'Prepare a clean health summary: when it started, severity from 1 to 10, readings if available, medicines already taken, allergies, age, and serious warning signs. Then book the right professional.'
  }

  if (portal === 'doctor') return 'Doctor workflow: capture complaint, relevant history, priority signs, assessment, plan, prescription if appropriate, patient education, and follow-up date.'
  if (portal === 'facility') return 'Facility workflow: identify need, check priority, match specialty, attach lab/referral documents, assign available clinician, and keep the patient updated.'
  if (portal === 'platform-admin') return 'Admin workflow: check verification status, failed bookings, payment/token issues, unanswered consultations, doctor availability, and support messages.'

  return `${profile.title} can guide booking, records, chat, video consultation, prescriptions, lab requests, translation, and safe handoff.`
}

function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.95
  utterance.pitch = 1
  window.speechSynthesis.speak(utterance)
}

function getDismissedKey(portal) {
  return `gd_ai_assistant_dismissed_${portal || 'landing'}`
}

function HumanoidAssistant({ portal = 'landing', docked = true }) {
  const profile = getPortalProfile(portal)
  const dismissedKey = getDismissedKey(portal)
  const [panelState, setPanelState] = useState(() => {
    if (!docked) return 'expanded'
    try {
      return window.sessionStorage.getItem(dismissedKey) === '1' ? 'closed' : 'minimized'
    } catch {
      return 'minimized'
    }
  })
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('idle')
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', text: profile.greeting }])
  const recognitionRef = useRef(null)
  const visibleMessages = useMemo(() => messages.slice(-6), [messages])

  const sendMessage = (value = input) => {
    const cleanValue = String(value || '').trim()
    if (!cleanValue) return
    setMode('thinking')
    const answer = buildResponse(cleanValue, portal)
    setMessages((prev) => [...prev, { role: 'user', text: cleanValue }, { role: 'assistant', text: answer }])
    setInput('')
    window.setTimeout(() => setMode('idle'), 450)
    if (voiceEnabled) speak(answer)
  }

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Voice input is not supported in this browser. You can still type your request here.' }])
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => setMode('listening')
    recognition.onerror = () => setMode('idle')
    recognition.onend = () => setMode('idle')
    recognition.onresult = (event) => sendMessage(event.results?.[0]?.[0]?.transcript || '')
    recognitionRef.current = recognition
    recognition.start()
  }

  const minimizeAssistant = () => {
    recognitionRef.current?.stop?.()
    setMode('idle')
    setPanelState('minimized')
  }

  const cancelAssistant = () => {
    recognitionRef.current?.stop?.()
    setMode('idle')
    try {
      window.sessionStorage.setItem(dismissedKey, '1')
    } catch {
      // ignore
    }
    setPanelState('closed')
  }

  const cards = [
    { icon: Stethoscope, label: 'Health intake', body: 'Prepare the right details before handoff.' },
    { icon: CalendarDays, label: 'Booking guide', body: 'Guide search, payment, tokens, and scheduling.' },
    { icon: Video, label: 'Video ready', body: 'Explain camera, mic, and consultation flow.' },
    { icon: ShieldCheck, label: 'Guardrails', body: 'Guide users without replacing professionals.' },
  ]

  if (panelState === 'closed') return null

  return (
    <div className={docked ? 'fixed bottom-5 right-5 z-40 w-[calc(100vw-2.5rem)] max-w-md' : 'w-full'}>
      {panelState === 'minimized' && docked && (
        <div className="ml-auto flex w-fit items-center gap-2 rounded-full bg-white p-1 shadow-2xl shadow-slate-900/25 ring-1 ring-slate-200">
          <button
            type="button"
            onClick={() => setPanelState('expanded')}
            className="flex items-center gap-3 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-700"
            aria-label="Open GlobalDoc AI guide"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15"><Bot className="h-4 w-4" /></span>
            Need help?
            <Sparkles className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={cancelAssistant}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600"
            aria-label="Cancel AI assistant"
            title="Cancel assistant"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {panelState === 'expanded' && (
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-slate-900/20 transition-all duration-200 ease-out">
          <div className="bg-gradient-to-br from-slate-950 via-brand-800 to-brand-600 p-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-brand-50"><Sparkles className="h-3.5 w-3.5" /> {profile.badge}</p>
                <h2 className="mt-3 text-xl font-bold">{profile.title}</h2>
                <p className="mt-2 text-sm leading-6 text-brand-50/90">Safe guidance for telehealth workflows. Professionals make care decisions.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={minimizeAssistant}
                  className="flex h-9 items-center gap-1 rounded-full bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/20"
                  aria-label="Minimize AI assistant"
                  title="Minimize"
                >
                  <Minus className="h-4 w-4" />
                  Minimize
                </button>
                <button
                  type="button"
                  onClick={cancelAssistant}
                  className="flex h-9 items-center gap-1 rounded-full bg-white px-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                  aria-label="Cancel AI assistant"
                  title="Cancel assistant"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
            <div className="relative mx-auto mt-3 flex h-28 w-28 items-center justify-center">
              <div className={`absolute inset-0 rounded-full bg-brand-300/30 ${mode !== 'idle' ? 'animate-ping' : ''}`} />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-brand-100 via-white to-slate-100 shadow-inner" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-[2rem] border border-white bg-gradient-to-br from-brand-700 to-slate-900 text-white shadow-xl shadow-brand-700/30"><Bot className="h-10 w-10" /></div>
              <div className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-white ${mode === 'listening' ? 'bg-emerald-500' : mode === 'thinking' ? 'bg-amber-400' : 'bg-brand-500'}`} />
            </div>
          </div>

          <div className="max-h-[64vh] overflow-y-auto p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {cards.map((card) => {
                const Icon = card.icon
                return <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><Icon className="h-4 w-4 text-brand-700" /><p className="mt-2 text-xs font-bold text-slate-900">{card.label}</p><p className="mt-1 text-xs text-slate-600">{card.body}</p></div>
              })}
            </div>

            <div className="mt-4 space-y-3">
              {visibleMessages.map((message, index) => <div key={`${message.role}-${index}`} className={`rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'assistant' ? 'bg-slate-100 text-slate-700' : 'ml-8 bg-brand-700 text-white'}`}>{message.text}</div>)}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {profile.quickActions.map((action) => <button key={action} type="button" onClick={() => sendMessage(action)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-brand-300 hover:text-brand-700">{action}</button>)}
            </div>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); sendMessage() }} className="border-t border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setVoiceEnabled((value) => !value)} className={`rounded-full p-3 ${voiceEnabled ? 'bg-brand-700 text-white' : 'bg-white text-slate-600'} shadow-sm`} title="Toggle spoken replies"><Languages className="h-4 w-4" /></button>
              <button type="button" onClick={mode === 'listening' ? () => recognitionRef.current?.stop?.() : startVoiceInput} className={`rounded-full p-3 ${mode === 'listening' ? 'bg-red-600 text-white' : 'bg-white text-slate-600'} shadow-sm`} title="Voice input">{mode === 'listening' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}</button>
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm"><MessageCircle className="h-4 w-4 shrink-0 text-slate-400" /><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about booking, video, records..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></div>
              <button type="submit" className="rounded-full bg-brand-700 p-3 text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600"><Send className="h-4 w-4" /></button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-start gap-2 text-xs leading-5 text-slate-500"><FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" /> AI guidance is for navigation and preparation only.</p>
              <button type="button" onClick={cancelAssistant} className="text-xs font-bold text-red-600 hover:text-red-700">Cancel assistant</button>
            </div>
          </form>
        </section>
      )}
    </div>
  )
}

export default HumanoidAssistant
