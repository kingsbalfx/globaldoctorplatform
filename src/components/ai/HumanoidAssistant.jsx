import { useMemo, useRef, useState } from 'react'
import { ArrowRight, Bot, CalendarDays, FileText, Languages, MessageCircle, Mic, MicOff, Minus, Send, ShieldCheck, Sparkles, Video, X } from 'lucide-react'
import SupportIntakeForm from '../support/SupportIntakeForm'

const portalProfiles = {
  landing: {
    title: 'GlobalDoc AI Guide',
    badge: 'Platform guide',
    greeting: 'Hello 👋 I am your GlobalDoc AI guide. Submit a quick request first, then I can help with directions, booking flow, uploads, video, and support.',
    quickActions: ['How does it work?', 'Find a provider', 'Patient portal', 'Provider portal'],
  },
  patient: {
    title: 'Patient AI Guide',
    badge: 'Patient support',
    greeting: 'Hi 👋 Submit your contact details and request first. After that, I can guide you around booking, files, chat, video, notifications, and support.',
    quickActions: ['Book a visit', 'Upload files', 'Start video', 'Contact support'],
  },
  doctor: {
    title: 'Provider AI Guide',
    badge: 'Workspace guide',
    greeting: 'Hello 👋 Submit a support request first, then I can help you move around the provider workspace and organize your daily flow.',
    quickActions: ['Provider dashboard', 'Follow-up flow', 'Messages', 'Support issue'],
  },
  facility: {
    title: 'Facility AI Guide',
    badge: 'Facility support',
    greeting: 'Hello 👋 Submit a support request first, then I can help with facility navigation, team coordination, and support links.',
    quickActions: ['Facility portal', 'Team flow', 'Provider matching', 'Contact support'],
  },
  'platform-admin': {
    title: 'Admin AI Guide',
    badge: 'Operations',
    greeting: 'Hello admin 👋 I can help explain operations, user flows, checks, and support workflows.',
    quickActions: ['Admin portal', 'Support issue', 'User checks', 'Booking problem'],
  },
}

const routeActions = [
  { label: 'Patient Portal', href: '/patient', keywords: ['patient', 'patient portal', 'book', 'appointment', 'visit', 'files', 'video'] },
  { label: 'Provider Portal', href: '/doctor', keywords: ['doctor', 'provider', 'provider portal', 'doctor portal'] },
  { label: 'Facility Portal', href: '/facility', keywords: ['facility', 'hospital', 'clinic'] },
  { label: 'Platform Admin', href: '/platform-admin', keywords: ['admin', 'platform admin'] },
  { label: 'Support Dashboard', href: '/platform-admin/support', keywords: ['support dashboard', 'tickets', 'cases'] },
  { label: 'Track Request', href: '/request-tracker', keywords: ['track', 'tracking', 'request id', 'case id', 'status'] },
  { label: 'Search Providers', href: '/#search', keywords: ['find', 'search', 'provider', 'specialist'] },
  { label: 'Directory', href: '/#directory', keywords: ['directory', 'available', 'list', 'browse'] },
  { label: 'How It Works', href: '/#how-it-works', keywords: ['how', 'work', 'explain', 'walkthrough', 'guide'] },
  { label: 'Contact Support', href: '/contact', keywords: ['contact', 'support', 'help', 'email', 'complaint'] },
]

const languageLabels = {
  en: 'English',
  ha: 'Hausa',
  yo: 'Yoruba',
  ig: 'Igbo',
  ar: 'Arabic',
  fr: 'French',
}

function getPortalProfile(portal) {
  return portalProfiles[portal] || portalProfiles.landing
}

function findRoutes(text) {
  const lower = String(text || '').toLowerCase()
  return routeActions.filter((route) => route.keywords.some((keyword) => lower.includes(keyword))).slice(0, 3)
}

function humanReply(text) {
  const lower = String(text || '').trim().toLowerCase()
  if (!lower) return null
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|salam|assalamu alaikum)\b/.test(lower)) return 'Hello 👋 I am doing great and ready to help. Tell me what you want to do, and I will guide you there.'
  if (lower.includes('how are you') || lower.includes('how far') || lower.includes('are you okay')) return 'I am doing well, thank you 😊 What would you like to do today?'
  if (lower.includes('thank')) return 'You are welcome. I am here whenever you need help.'
  if (lower.includes('who are you') || lower.includes('your name')) return 'I am the GlobalDoc AI Guide — your assistant for navigation, communication, and platform direction.'
  if (lower.includes('what can you do') || lower.includes('help me')) return 'I can answer simple questions, show useful links, and direct users to patient, provider, facility, admin, directory, walkthrough, tracker, or support pages.'
  return null
}

function buildResponse(input, portal, supportCase) {
  const text = String(input || '').trim().toLowerCase()
  const routes = findRoutes(text)
  const caseNote = supportCase?.caseId ? ` Your Request ID is ${supportCase.caseId}. Keep it safe and use it whenever you contact support.` : ''
  const friendly = humanReply(text)
  if (friendly) return { text: `${friendly}${caseNote}`, routes: routes.length ? routes : [{ label: 'Patient Portal', href: '/patient' }, { label: 'Track Request', href: '/request-tracker' }] }
  if (!text) return { text: 'Please type what you need help with.', routes: [] }
  if (text.includes('track') || text.includes('status') || text.includes('request id') || text.includes('case id')) return { text: `Use the tracker page and enter your Request ID.${caseNote}`, routes: [{ label: 'Track Request', href: '/request-tracker' }] }
  if (text.includes('how') && (text.includes('work') || text.includes('platform'))) return { text: `GlobalDoc Connect brings patients, providers, facilities, and admins into one connected platform. Open the walkthrough for the full summary.${caseNote}`, routes: [{ label: 'How It Works', href: '/#how-it-works' }] }
  if (text.includes('book') || text.includes('appointment') || text.includes('visit')) return { text: `To book, go to the patient portal or use the search area to choose a provider.${caseNote}`, routes: [{ label: 'Search Providers', href: '/#search' }, { label: 'Patient Portal', href: '/patient' }] }
  if (text.includes('video') || text.includes('call')) return { text: `For video, open the patient portal and go to the video area after your booking is ready.${caseNote}`, routes: [{ label: 'Patient Portal', href: '/patient' }] }
  if (text.includes('upload') || text.includes('file') || text.includes('record') || text.includes('document')) return { text: `Your uploaded files are attached to your support request. To upload more platform files, open the patient portal and use the files section.${caseNote}`, routes: [{ label: 'Patient Portal', href: '/patient' }] }
  if (text.includes('language') || text.includes('translate')) return { text: 'Use the language selector inside this assistant to choose your preferred language. Full automatic translation depends on the app translation setup.', routes: [] }
  if (text.includes('agent') || text.includes('human')) return { text: `Your request is available to the support team inside the Patient Support dashboard.${caseNote}`, routes: [{ label: 'Track Request', href: '/request-tracker' }, { label: 'Contact Support', href: '/contact' }] }
  if (routes.length > 0) return { text: 'I found the direction you may need. Use one of these buttons.', routes }
  if (portal === 'doctor') return { text: `I can guide you around the provider workspace.${caseNote}`, routes: [{ label: 'Provider Dashboard', href: '/doctor/dashboard' }] }
  if (portal === 'facility') return { text: `I can guide you around the facility portal.${caseNote}`, routes: [{ label: 'Facility Portal', href: '/facility' }] }
  if (portal === 'platform-admin') return { text: 'I can guide you around admin operations.', routes: [{ label: 'Platform Admin', href: '/platform-admin' }, { label: 'Support Dashboard', href: '/platform-admin/support' }] }
  return { text: `Tell me where you want to go, or choose a direction below.${caseNote}`, routes: [{ label: 'Patient Portal', href: '/patient' }, { label: 'Track Request', href: '/request-tracker' }, { label: 'Contact Support', href: '/contact' }] }
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

function navigateTo(href) {
  if (typeof window === 'undefined' || !href) return
  window.location.href = href
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
  const [supportCase, setSupportCase] = useState(null)
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('idle')
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [assistantLanguage, setAssistantLanguage] = useState('en')
  const [caseCopied, setCaseCopied] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', text: profile.greeting, routes: [] }])
  const recognitionRef = useRef(null)
  const visibleMessages = useMemo(() => messages.slice(-6), [messages])
  const chatUnlocked = Boolean(supportCase?.caseId) || portal === 'platform-admin'

  const copyRequestId = async () => {
    if (!supportCase?.caseId) return
    try {
      await navigator.clipboard.writeText(supportCase.caseId)
      setCaseCopied(true)
      window.setTimeout(() => setCaseCopied(false), 1800)
    } catch {
      setCaseCopied(false)
    }
  }

  const handleCaseSubmitted = (submittedCase) => {
    setSupportCase(submittedCase)
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: `Thank you ${submittedCase.fullName || ''}. Your request has been submitted. IMPORTANT: copy and keep your Request ID: ${submittedCase.caseId}. Use it to track your request or when talking with support.`,
        routes: [{ label: 'Track Request', href: '/request-tracker' }, { label: 'Patient Portal', href: '/patient' }, { label: 'Contact Support', href: '/contact' }],
      },
    ])
  }

  const sendMessage = (value = input) => {
    const cleanValue = String(value || '').trim()
    if (!cleanValue) return
    if (!chatUnlocked) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Please submit the support request form first. You only need a valid email, your name, request details, and optional documents.', routes: [{ label: 'Track Request', href: '/request-tracker' }] }])
      return
    }
    setMode('thinking')
    const answer = buildResponse(cleanValue, portal, supportCase)
    setMessages((prev) => [...prev, { role: 'user', text: cleanValue }, { role: 'assistant', text: answer.text, routes: answer.routes || [] }])
    setInput('')
    window.setTimeout(() => setMode('idle'), 450)
    if (voiceEnabled) speak(answer.text)
  }

  const startVoiceInput = () => {
    if (!chatUnlocked) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Submit the request form first, then voice chat will be available.', routes: [] }])
      return
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Voice input is not supported in this browser. You can still type your request here.', routes: [] }])
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = assistantLanguage === 'en' ? 'en-US' : assistantLanguage
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
    { icon: MessageCircle, label: 'Request first', body: 'Collects email, request details, and documents before chat.' },
    { icon: CalendarDays, label: 'Route guide', body: 'Takes users to the right page.' },
    { icon: Video, label: 'Video help', body: 'Guides users to video areas.' },
    { icon: ShieldCheck, label: 'Track request', body: 'Shows a Request ID and tracking button after submission.' },
  ]

  if (panelState === 'closed') return null

  return (
    <div className={docked ? 'fixed bottom-5 right-5 z-40 w-[calc(100vw-2.5rem)] max-w-lg' : 'w-full'}>
      {panelState === 'minimized' && docked && (
        <div className="ml-auto flex w-fit items-center gap-2 rounded-full bg-white p-1 shadow-2xl shadow-slate-900/25 ring-1 ring-slate-200">
          <button type="button" onClick={() => setPanelState('expanded')} className="flex items-center gap-3 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-700" aria-label="Open GlobalDoc AI guide">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15"><Bot className="h-4 w-4" /></span>
            Need help?
            <Sparkles className="h-4 w-4" />
          </button>
          <button type="button" onClick={cancelAssistant} className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label="Cancel AI assistant" title="Cancel assistant"><X className="h-5 w-5" /></button>
        </div>
      )}

      {panelState === 'expanded' && (
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-slate-900/20 transition-all duration-200 ease-out">
          <div className="bg-gradient-to-br from-slate-950 via-brand-800 to-brand-600 p-5 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-brand-50"><Sparkles className="h-3.5 w-3.5" /> {profile.badge}</p>
                <h2 className="mt-3 text-xl font-bold">{profile.title}</h2>
                <p className="mt-2 text-sm leading-6 text-brand-50/90">{chatUnlocked ? 'Chat is active. Your Request ID stays visible below.' : 'Submit your request first. No patient account is required.'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={minimizeAssistant} className="flex h-9 items-center gap-1 rounded-full bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/20" aria-label="Minimize AI assistant" title="Minimize"><Minus className="h-4 w-4" /> Minimize</button>
                <button type="button" onClick={cancelAssistant} className="flex h-9 items-center gap-1 rounded-full bg-white px-3 text-sm font-semibold text-red-600 hover:bg-red-50" aria-label="Cancel AI assistant" title="Cancel assistant"><X className="h-4 w-4" /> Cancel</button>
              </div>
            </div>
            <div className="relative mx-auto mt-3 flex h-24 w-24 items-center justify-center">
              <div className={`absolute inset-0 rounded-full bg-brand-300/30 ${mode !== 'idle' ? 'animate-ping' : ''}`} />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-brand-100 via-white to-slate-100 shadow-inner" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-white bg-gradient-to-br from-brand-700 to-slate-900 text-white shadow-xl shadow-brand-700/30"><Bot className="h-8 w-8" /></div>
              <div className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-white ${mode === 'listening' ? 'bg-emerald-500' : mode === 'thinking' ? 'bg-amber-400' : chatUnlocked ? 'bg-emerald-500' : 'bg-brand-500'}`} />
            </div>
          </div>

          <div className="max-h-[68vh] overflow-y-auto p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {cards.map((card) => {
                const Icon = card.icon
                return <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><Icon className="h-4 w-4 text-brand-700" /><p className="mt-2 text-xs font-bold text-slate-900">{card.label}</p><p className="mt-1 text-xs text-slate-600">{card.body}</p></div>
              })}
            </div>

            {!chatUnlocked && <div className="mt-4"><SupportIntakeForm onSubmitted={handleCaseSubmitted} /></div>}

            {chatUnlocked && supportCase?.caseId && (
              <div className="mt-4 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Important: copy and keep safe</p>
                <p className="mt-2 text-sm font-semibold">Your Request ID is:</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <code className="rounded-xl bg-emerald-900 px-4 py-2 text-lg font-black tracking-wide text-white">{supportCase.caseId}</code>
                  <button type="button" onClick={copyRequestId} className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600">{caseCopied ? 'Copied' : 'Copy ID'}</button>
                </div>
                <p className="mt-3 text-xs leading-5 text-emerald-800">You need this ID to track the request or when speaking with support.</p>
                <button type="button" onClick={() => navigateTo('/request-tracker')} className="mt-3 w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600">Track request</button>
              </div>
            )}

            {chatUnlocked && (
              <>
                <div className="mt-4 space-y-3">
                  {visibleMessages.map((message, index) => (
                    <div key={`${message.role}-${index}`} className={`rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'assistant' ? 'bg-slate-100 text-slate-700' : 'ml-8 bg-brand-700 text-white'}`}>
                      <p>{message.text}</p>
                      {message.role === 'assistant' && Array.isArray(message.routes) && message.routes.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.routes.map((route) => <button key={`${route.href}-${route.label}`} type="button" onClick={() => navigateTo(route.href)} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-bold text-brand-700 shadow-sm ring-1 ring-brand-100 hover:bg-brand-50">{route.label}<ArrowRight className="h-3.5 w-3.5" /></button>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.quickActions.map((action) => <button key={action} type="button" onClick={() => sendMessage(action)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-brand-300 hover:text-brand-700">{action}</button>)}
                </div>
              </>
            )}
          </div>

          <form onSubmit={(event) => { event.preventDefault(); sendMessage() }} className="border-t border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <Languages className="h-4 w-4 text-slate-500" />
                <select value={assistantLanguage} onChange={(event) => setAssistantLanguage(event.target.value)} className="bg-transparent text-xs font-semibold text-slate-700 outline-none" title="Assistant language">
                  {Object.entries(languageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <button type="button" onClick={() => setVoiceEnabled((value) => !value)} disabled={!chatUnlocked} className={`rounded-full px-3 py-2 text-xs font-bold ${voiceEnabled ? 'bg-brand-700 text-white' : 'bg-white text-slate-600'} shadow-sm disabled:opacity-40`} title="Toggle spoken replies">{voiceEnabled ? 'Voice on' : 'Voice off'}</button>
              <button type="button" onClick={mode === 'listening' ? () => recognitionRef.current?.stop?.() : startVoiceInput} disabled={!chatUnlocked} className={`rounded-full p-3 ${mode === 'listening' ? 'bg-red-600 text-white' : 'bg-white text-slate-600'} shadow-sm disabled:opacity-40`} title="Voice input">{mode === 'listening' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}</button>
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm"><MessageCircle className="h-4 w-4 shrink-0 text-slate-400" /><input disabled={!chatUnlocked} value={input} onChange={(event) => setInput(event.target.value)} placeholder={chatUnlocked ? 'Say hi, ask where to go, or request help...' : 'Submit request first to unlock chat'} className="min-w-0 flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed" /></div>
              <button type="submit" disabled={!chatUnlocked} className="rounded-full bg-brand-700 p-3 text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:bg-slate-300"><Send className="h-4 w-4" /></button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-start gap-2 text-xs leading-5 text-slate-500"><FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {supportCase?.caseId ? `Active Request ID: ${supportCase.caseId}` : 'Support request is required before chat.'}</p>
              <button type="button" onClick={cancelAssistant} className="text-xs font-bold text-red-600 hover:text-red-700">Cancel assistant</button>
            </div>
          </form>
        </section>
      )}
    </div>
  )
}

export default HumanoidAssistant
