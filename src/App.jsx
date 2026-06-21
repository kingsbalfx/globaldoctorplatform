import { Suspense, lazy, useEffect, useState } from 'react'
import Footer from './components/Footer'
import HumanoidAssistant from './components/ai/HumanoidAssistant'
import { ErrorProvider } from './components/ErrorHandler'
import { apiFetch, getApiBaseCandidates } from './lib/apiFetch'
import './lib/i18n' // Initialize i18n

const LandingPageEnhanced = lazy(() => import('./pages/LandingPageEnhanced'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'))
const PlatformAdminDashboard = lazy(() => import('./pages/PlatformAdminDashboard'))
const SupportDashboard = lazy(() => import('./pages/SupportDashboard'))
const RequestTracker = lazy(() => import('./pages/RequestTracker'))
const AdvancedHealthOS = lazy(() => import('./pages/AdvancedHealthOS'))
const ClinicalSafetyOS = lazy(() => import('./pages/ClinicalSafetyOS'))
const FacilityPortal = lazy(() => import('./pages/FacilityPortal'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const DoctorAuth = lazy(() => import('./components/DoctorAuth'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const Contact = lazy(() => import('./pages/Contact'))

function viewFromPath(pathname) {
  const path = String(pathname || '/')
  if (path === '/' || path === '') return 'landing'
  if (path.startsWith('/request-tracker')) return 'request-tracker'
  if (path.startsWith('/clinical-safety')) return 'clinical-safety'
  if (path.startsWith('/health-os')) return 'health-os'
  if (path.startsWith('/patient')) return 'patient'
  if (path.startsWith('/doctor/dashboard')) return 'admin'
  if (path.startsWith('/doctor')) return 'doctor-auth'
  if (path.startsWith('/facility')) return 'facility'
  if (path.startsWith('/platform-admin/support')) return 'platform-admin-support'
  if (path.startsWith('/platform-admin')) return 'platform-admin'
  if (path.startsWith('/auth/callback')) return 'auth-callback'
  if (path.startsWith('/payment-success')) return 'payment-success'
  if (path.startsWith('/reset-password')) return 'reset-password'
  if (path.startsWith('/terms')) return 'terms'
  if (path.startsWith('/privacy')) return 'privacy'
  if (path.startsWith('/contact')) return 'contact'
  return 'landing'
}

function pathFromView(view) {
  switch (view) {
    case 'patient':
      return '/patient'
    case 'doctor-auth':
      return '/doctor'
    case 'facility':
      return '/facility'
    case 'platform-admin-support':
      return '/platform-admin/support'
    case 'platform-admin':
      return '/platform-admin'
    case 'admin':
      return '/doctor/dashboard'
    case 'request-tracker':
      return '/request-tracker'
    case 'health-os':
      return '/health-os'
    case 'clinical-safety':
      return '/clinical-safety'
    case 'auth-callback':
      return '/auth/callback'
    case 'payment-success':
      return '/payment-success'
    case 'reset-password':
      return '/reset-password'
    case 'terms':
      return '/terms'
    case 'privacy':
      return '/privacy'
    case 'contact':
      return '/contact'
    case 'landing':
    default:
      return '/'
  }
}

function portalFromView(view) {
  if (view === 'platform-admin' || view === 'platform-admin-support' || view === 'health-os' || view === 'clinical-safety') return ''
  if (view === 'patient' || view === 'payment-success') return 'patient'
  if (view === 'doctor-auth' || view === 'admin') return 'doctor'
  if (view === 'facility') return 'facility'
  return ''
}

function assistantPortalFromView(view) {
  if (view === 'patient') return 'patient'
  if (view === 'admin') return 'doctor'
  if (view === 'facility') return 'facility'
  if (view === 'platform-admin' || view === 'platform-admin-support') return 'platform-admin'
  return ''
}

function normalizeDoctorSession(authData) {
  const doctor = authData?.doctor && typeof authData.doctor === 'object' ? authData.doctor : authData
  if (!doctor?.id) return null
  return { type: authData?.type || 'login', ...doctor }
}

function App() {
  const [currentView, setCurrentView] = useState(() => viewFromPath(window.location.pathname))
  const [authDoctor, setAuthDoctor] = useState(null)
  const [authAdmin, setAuthAdmin] = useState(null)
  const [activePortal, setActivePortal] = useState(() => {
    try {
      const pathPortal = portalFromView(viewFromPath(window.location.pathname))
      if (pathPortal) return pathPortal
      return window.localStorage.getItem('gd_active_portal') || ''
    } catch {
      return ''
    }
  })
  const [patientLogoutSignal, setPatientLogoutSignal] = useState(0)
  const [facilityLogoutSignal, setFacilityLogoutSignal] = useState(0)

  const setPortalSession = (portal) => {
    const nextPortal = portal || ''
    setActivePortal(nextPortal)
    try {
      if (nextPortal) window.localStorage.setItem('gd_active_portal', nextPortal)
      else window.localStorage.removeItem('gd_active_portal')
    } catch {
      // ignore
    }
  }

  const navigate = (view) => {
    const nextView = viewFromPath(pathFromView(view))
    const nextPortal = portalFromView(nextView)
    if (nextView === 'platform-admin' || nextView === 'platform-admin-support' || nextView === 'health-os' || nextView === 'clinical-safety') {
      setCurrentView(nextView)
      try {
        const nextPath = pathFromView(nextView)
        if (window.location.pathname !== nextPath) {
          window.history.pushState({ view: nextView }, '', nextPath)
        }
      } catch {
        // ignore
      }
      return
    }
    if (activePortal && nextPortal !== activePortal) return
    setCurrentView(nextView)
    try {
      const nextPath = pathFromView(nextView)
      if (window.location.pathname !== nextPath) {
        window.history.pushState({ view: nextView }, '', nextPath)
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    const handler = () => {
      const nextView = viewFromPath(window.location.pathname)
      const nextPortal = portalFromView(nextView)
      if (nextView === 'platform-admin' || nextView === 'platform-admin-support' || nextView === 'health-os' || nextView === 'clinical-safety') {
        setCurrentView(nextView)
        return
      }
      if (activePortal && nextPortal !== activePortal) {
        const fallbackView = activePortal === 'doctor' ? (authDoctor ? 'admin' : 'doctor-auth') : activePortal
        const fallbackPath = pathFromView(fallbackView)
        window.history.replaceState({ view: fallbackView }, '', fallbackPath)
        setCurrentView(fallbackView)
        return
      }
      setCurrentView(nextView)
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [activePortal, authDoctor])

  useEffect(() => {
    if (!activePortal) return
    if (currentView === 'platform-admin' || currentView === 'platform-admin-support' || currentView === 'health-os' || currentView === 'clinical-safety') return
    if (portalFromView(currentView) === activePortal) return
    const fallbackView = activePortal === 'doctor' ? (authDoctor ? 'admin' : 'doctor-auth') : activePortal
    setCurrentView(fallbackView)
    try {
      window.history.replaceState({ view: fallbackView }, '', pathFromView(fallbackView))
    } catch {
      // ignore
    }
  }, [activePortal, authDoctor, currentView])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('gd_doctor_session')
      if (!stored) return
      const parsed = JSON.parse(stored)
      if (parsed?.id && parsed?.session_proof) {
        setAuthDoctor({ type: 'login', ...parsed })
        setPortalSession('doctor')
        window.localStorage.removeItem('gd_patient_session')
        window.localStorage.removeItem('gd_facility_session_active')
        window.localStorage.removeItem('gd_pending_patient_profile')
      } else {
        window.localStorage.removeItem('gd_doctor_session')
      }
    } catch {
      window.localStorage.removeItem('gd_doctor_session')
    }
  }, [])

  useEffect(() => {
    if (!authDoctor?.id) return
    if (activePortal !== 'doctor') setPortalSession('doctor')
    if (currentView !== 'admin' && currentView !== 'doctor-auth' && currentView !== 'health-os' && currentView !== 'clinical-safety') {
      setCurrentView('admin')
      try {
        window.history.replaceState({ view: 'admin' }, '', '/doctor/dashboard')
      } catch {
        // ignore
      }
    }
    try {
      window.localStorage.removeItem('gd_patient_session')
      window.localStorage.removeItem('gd_facility_session_active')
      window.localStorage.removeItem('gd_pending_patient_profile')
    } catch {
      // ignore
    }
  }, [authDoctor?.id, activePortal, currentView])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('gd_platform_admin_session')
      if (!stored) return
      const parsed = JSON.parse(stored)
      if (parsed?.type === 'admin-login' && (parsed?.admin?.email || parsed?.email)) {
        setAuthAdmin(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (!authDoctor?.id || currentView !== 'admin') return undefined
    const statusPath = `/api/doctors/${encodeURIComponent(authDoctor.id)}/status`
    const markOnline = () => {
      void apiFetch(statusPath, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-session-proof': authDoctor.session_proof || '' },
        body: JSON.stringify({ isOnline: true }),
      })
        .then((response) => response.json().catch(() => ({})))
        .then((data) => {
          if (data?.doctor?.id) {
            setAuthDoctor((current) => {
              if (!current?.id) return current
              const nextDoctor = { ...current, ...data.doctor }
              try {
                window.localStorage.setItem('gd_doctor_session', JSON.stringify({ type: 'login', ...nextDoctor }))
              } catch {
                // ignore
              }
              return nextDoctor
            })
          }
        })
        .catch(() => null)
    }
    const markOfflineOnExit = () => {
      const body = JSON.stringify({ isOnline: false })
      const [base = ''] = getApiBaseCandidates()
      void fetch(`${base}${statusPath}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-session-proof': authDoctor.session_proof || '' },
        body,
        keepalive: true,
      }).catch(() => null)
    }
    markOnline()
    const timer = window.setInterval(markOnline, 60 * 1000)
    window.addEventListener('pagehide', markOfflineOnExit)
    window.addEventListener('beforeunload', markOfflineOnExit)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('pagehide', markOfflineOnExit)
      window.removeEventListener('beforeunload', markOfflineOnExit)
    }
  }, [authDoctor?.id, authDoctor?.session_proof, currentView])

  const handleAuth = (authData) => {
    if (authData.type === 'admin-login') {
      setAuthAdmin(authData)
      setAuthDoctor(null)
      setPortalSession('')
      setCurrentView('platform-admin')
      try {
        window.localStorage.setItem('gd_platform_admin_session', JSON.stringify(authData))
      } catch {
        // ignore
      }
      try {
        window.history.pushState({ view: 'platform-admin' }, '', '/platform-admin')
      } catch {
        // ignore
      }
      return
    }

    if (authData.type === 'login' || authData.type === 'register') {
      const doctorSession = normalizeDoctorSession(authData)
      if (!doctorSession) return
      setAuthDoctor(doctorSession)
      setAuthAdmin(null)
      setPortalSession('doctor')
      setCurrentView('admin')
      try {
        window.localStorage.setItem('gd_doctor_session', JSON.stringify(doctorSession))
        window.localStorage.removeItem('gd_patient_session')
        window.localStorage.removeItem('gd_facility_session_active')
        window.localStorage.removeItem('gd_pending_patient_profile')
      } catch {
        // ignore
      }
      try {
        window.history.pushState({ view: 'admin' }, '', '/doctor/dashboard')
      } catch {
        // ignore
      }
    }
  }

  const handleLogout = () => {
    if (authDoctor?.id) {
      void apiFetch(`/api/doctors/${encodeURIComponent(authDoctor.id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-session-proof': authDoctor.session_proof || '' },
        body: JSON.stringify({ isOnline: false }),
      }).catch(() => null)
    }
    setAuthDoctor(null)
    setAuthAdmin(null)
    setPatientLogoutSignal((value) => value + 1)
    setFacilityLogoutSignal((value) => value + 1)
    setPortalSession('')
    setCurrentView('landing')
    try {
      window.localStorage.removeItem('gd_doctor_session')
      window.localStorage.removeItem('gd_platform_admin_session')
      window.localStorage.removeItem('gd_patient_session')
      window.localStorage.removeItem('gd_facility_session_active')
      window.localStorage.removeItem('gd_pending_patient_profile')
      window.localStorage.removeItem('gd_pending_doctor_profile')
    } catch {
      // ignore
    }
    try {
      window.history.pushState({ view: 'landing' }, '', '/')
    } catch {
      // ignore
    }
  }

  const assistantPortal = assistantPortalFromView(currentView)

  return (
    <ErrorProvider>
      <div className="min-h-screen text-slate-900">
      <nav className="mx-auto mt-4 flex max-w-7xl flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/80 bg-white/90 px-6 py-4 shadow-sm backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="GlobalDoc Connect logo" className="h-10 w-10 rounded-full shadow-sm object-cover" />
          <span className="text-lg font-bold text-brand-700">GlobalDoc Connect</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          {authAdmin && (
            <>
              <button onClick={() => navigate('platform-admin')} className={`font-semibold ${currentView === 'platform-admin' ? 'text-brand-700' : 'text-slate-600 hover:text-brand-700'}`}>Platform Admin</button>
              <button onClick={() => navigate('platform-admin-support')} className={`font-semibold ${currentView === 'platform-admin-support' ? 'text-brand-700' : 'text-slate-600 hover:text-brand-700'}`}>Patient Support</button>
            </>
          )}
          {!activePortal && !authAdmin && (
            <>
              <button onClick={() => navigate('landing')} className={`hover:text-brand-700 ${currentView === 'landing' ? 'text-brand-700' : ''}`}>Home</button>
              <button onClick={() => navigate('patient')} className={`hover:text-brand-700 ${currentView === 'patient' ? 'text-brand-700' : ''}`}>Patient Portal</button>
              <button onClick={() => navigate('doctor-auth')} className={`hover:text-brand-700 ${currentView === 'doctor-auth' ? 'text-brand-700' : ''}`}>Doctor Portal</button>
              <button onClick={() => navigate('facility')} className={`hover:text-brand-700 ${currentView === 'facility' ? 'text-brand-700' : ''}`}>Facility Portal</button>
              <button onClick={() => navigate('health-os')} className={`hover:text-brand-700 ${currentView === 'health-os' ? 'text-brand-700' : ''}`}>Health OS</button>
              <button onClick={() => navigate('clinical-safety')} className={`hover:text-brand-700 ${currentView === 'clinical-safety' ? 'text-brand-700' : ''}`}>Clinical Safety</button>
            </>
          )}
          {activePortal === 'patient' && (
            <>
              <button onClick={() => navigate('patient')} className={`font-semibold ${currentView === 'patient' ? 'text-brand-700' : 'text-slate-600 hover:text-brand-700'}`}>Patient Portal</button>
              <button onClick={() => navigate('health-os')} className={`font-semibold ${currentView === 'health-os' ? 'text-brand-700' : 'text-slate-600 hover:text-brand-700'}`}>Health OS</button>
              <button onClick={() => navigate('clinical-safety')} className={`font-semibold ${currentView === 'clinical-safety' ? 'text-brand-700' : 'text-slate-600 hover:text-brand-700'}`}>Clinical Safety</button>
            </>
          )}
          {activePortal === 'doctor' && (
            <>
              <button onClick={() => navigate(authDoctor ? 'admin' : 'doctor-auth')} className={`font-semibold ${currentView === 'admin' || currentView === 'doctor-auth' ? 'text-brand-700' : 'text-slate-600 hover:text-brand-700'}`}>Doctor Portal</button>
              <button onClick={() => navigate('health-os')} className={`font-semibold ${currentView === 'health-os' ? 'text-brand-700' : 'text-slate-600 hover:text-brand-700'}`}>Health OS</button>
              <button onClick={() => navigate('clinical-safety')} className={`font-semibold ${currentView === 'clinical-safety' ? 'text-brand-700' : 'text-slate-600 hover:text-brand-700'}`}>Clinical Safety</button>
            </>
          )}
          {activePortal === 'facility' && (
            <button onClick={() => navigate('facility')} className="font-semibold text-brand-700">Facility Portal</button>
          )}
          {activePortal === 'platform-admin' && (
            <>
              <button onClick={() => navigate('platform-admin')} className={`font-semibold ${currentView === 'platform-admin' ? 'text-brand-700' : 'text-slate-600 hover:text-brand-700'}`}>Platform Admin</button>
              <button onClick={() => navigate('platform-admin-support')} className={`font-semibold ${currentView === 'platform-admin-support' ? 'text-brand-700' : 'text-slate-600 hover:text-brand-700'}`}>Patient Support</button>
            </>
          )}
          {(authDoctor || authAdmin || activePortal) && (
            <button onClick={handleLogout} className="text-red-600 hover:text-red-700">Logout</button>
          )}
        </div>
      </nav>

      <Suspense fallback={<div className="mx-auto mt-16 max-w-3xl rounded-3xl bg-white p-8 text-center text-sm font-semibold text-slate-600 shadow-lg">Loading workspace...</div>}>
        {currentView === 'landing' && <LandingPageEnhanced />}
        {currentView === 'request-tracker' && <RequestTracker />}
        {currentView === 'health-os' && <AdvancedHealthOS />}
        {currentView === 'clinical-safety' && <ClinicalSafetyOS />}
        {currentView === 'patient' && <PatientDashboard logoutSignal={patientLogoutSignal} onSessionChange={setPortalSession} />}
        {currentView === 'doctor-auth' && <DoctorAuth onAuth={handleAuth} />}
        {currentView === 'admin' && <AdminDashboard doctor={authDoctor} onLogout={handleLogout} />}
        {currentView === 'platform-admin' && <PlatformAdminDashboard adminSession={authAdmin} onLogout={handleLogout} />}
        {currentView === 'platform-admin-support' && <SupportDashboard adminSession={authAdmin} />}
        {currentView === 'facility' && <FacilityPortal logoutSignal={facilityLogoutSignal} onSessionChange={setPortalSession} />}
        {currentView === 'auth-callback' && <AuthCallback onNavigate={navigate} onDoctorAuth={handleAuth} onPatientNavigate={() => navigate('patient')} />}
        {currentView === 'payment-success' && <PaymentSuccess onNavigate={navigate} />}
        {currentView === 'reset-password' && <ResetPassword />}
        {currentView === 'terms' && <TermsOfService onNavigate={navigate} />}
        {currentView === 'privacy' && <PrivacyPolicy onNavigate={navigate} />}
        {currentView === 'contact' && <Contact onNavigate={navigate} />}
      </Suspense>

      {assistantPortal && <HumanoidAssistant portal={assistantPortal} />}

      {currentView === 'landing' && <Footer onNavigate={setCurrentView} />}
    </div>
    </ErrorProvider>
  )
}

export default App
