import { useEffect, useState } from 'react'
import LandingPageEnhanced from './pages/LandingPageEnhanced'
import AdminDashboard from './pages/AdminDashboard'
import PatientDashboard from './pages/PatientDashboard'
import PlatformAdminDashboard from './pages/PlatformAdminDashboard'
import SupportDashboard from './pages/SupportDashboard'
import RequestTracker from './pages/RequestTracker'
import FacilityPortal from './pages/FacilityPortal'
import AuthCallback from './pages/AuthCallback'
import PaymentSuccess from './pages/PaymentSuccess'
import ResetPassword from './pages/ResetPassword'
import DoctorAuth from './components/DoctorAuth'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Contact from './pages/Contact'
import Footer from './components/Footer'
import HumanoidAssistant from './components/ai/HumanoidAssistant'
import { ErrorProvider } from './components/ErrorHandler'
import { apiFetch } from './lib/apiFetch'
import './lib/i18n' // Initialize i18n

function viewFromPath(pathname) {
  const path = String(pathname || '/')
  if (path === '/' || path === '') return 'landing'
  if (path.startsWith('/request-tracker')) return 'request-tracker'
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
  if (view === 'patient' || view === 'payment-success') return 'patient'
  if (view === 'doctor-auth' || view === 'admin') return 'doctor'
  if (view === 'facility') return 'facility'
  if (view === 'platform-admin' || view === 'platform-admin-support') return 'platform-admin'
  return ''
}

function assistantPortalFromView(view) {
  if (view === 'patient') return 'patient'
  if (view === 'admin') return 'doctor'
  if (view === 'facility') return 'facility'
  if (view === 'platform-admin' || view === 'platform-admin-support') return 'platform-admin'
  return ''
}

function App() {
  const [currentView, setCurrentView] = useState(() => viewFromPath(window.location.pathname))
  const [authDoctor, setAuthDoctor] = useState(null)
  const [authAdmin, setAuthAdmin] = useState(null)
  const [activePortal, setActivePortal] = useState(() => {
    try {
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
      if (parsed?.id) {
        setAuthDoctor({ type: 'login', ...parsed })
        setPortalSession('doctor')
      }
    } catch {
      // ignore
    }
  }, [])

  const handleAuth = (authData) => {
    if (authData.type === 'admin-login') {
      setAuthAdmin(authData)
      setAuthDoctor(null)
      setPortalSession('platform-admin')
      setCurrentView('platform-admin')
      try {
        window.history.pushState({ view: 'platform-admin' }, '', '/platform-admin')
      } catch {
        // ignore
      }
      return
    }

    if (authData.type === 'login' || authData.type === 'register') {
      setAuthDoctor(authData)
      setAuthAdmin(null)
      setPortalSession('doctor')
      setCurrentView('admin')
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
        headers: { 'Content-Type': 'application/json' },
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
          {!activePortal && (
            <>
              <button onClick={() => navigate('landing')} className={`hover:text-brand-700 ${currentView === 'landing' ? 'text-brand-700' : ''}`}>Home</button>
              <button onClick={() => navigate('patient')} className={`hover:text-brand-700 ${currentView === 'patient' ? 'text-brand-700' : ''}`}>Patient Portal</button>
              <button onClick={() => navigate('doctor-auth')} className={`hover:text-brand-700 ${currentView === 'doctor-auth' ? 'text-brand-700' : ''}`}>Doctor Portal</button>
              <button onClick={() => navigate('facility')} className={`hover:text-brand-700 ${currentView === 'facility' ? 'text-brand-700' : ''}`}>Facility Portal</button>
            </>
          )}
          {activePortal === 'patient' && (
            <button onClick={() => navigate('patient')} className="font-semibold text-brand-700">Patient Portal</button>
          )}
          {activePortal === 'doctor' && (
            <button onClick={() => navigate(authDoctor ? 'admin' : 'doctor-auth')} className="font-semibold text-brand-700">Doctor Portal</button>
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

      {currentView === 'landing' && <LandingPageEnhanced />}
      {currentView === 'request-tracker' && <RequestTracker />}
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

      {assistantPortal && <HumanoidAssistant portal={assistantPortal} />}

      {currentView === 'landing' && <Footer onNavigate={setCurrentView} />}
    </div>
    </ErrorProvider>
  )
}

export default App
