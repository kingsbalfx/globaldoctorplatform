import { useEffect, useState } from 'react'
import LandingPage from './pages/LandingPage'
import AdminDashboard from './pages/AdminDashboard'
import PatientDashboard from './pages/PatientDashboard'
import PlatformAdminDashboard from './pages/PlatformAdminDashboard'
import FacilityPortal from './pages/FacilityPortal'
import AuthCallback from './pages/AuthCallback'
import DoctorAuth from './components/DoctorAuth'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Contact from './pages/Contact'
import Footer from './components/Footer'
import { ErrorProvider } from './components/ErrorHandler'
import './lib/i18n' // Initialize i18n

function viewFromPath(pathname) {
  const path = String(pathname || '/')
  if (path === '/' || path === '') return 'landing'
  if (path.startsWith('/patient')) return 'patient'
  if (path.startsWith('/doctor/dashboard')) return 'admin'
  if (path.startsWith('/doctor')) return 'doctor-auth'
  if (path.startsWith('/facility')) return 'facility'
  if (path.startsWith('/platform-admin')) return 'platform-admin'
  if (path.startsWith('/auth/callback')) return 'auth-callback'
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
    case 'platform-admin':
      return '/platform-admin'
    case 'admin':
      return '/doctor/dashboard'
    case 'auth-callback':
      return '/auth/callback'
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

function App() {
  const [currentView, setCurrentView] = useState(() => viewFromPath(window.location.pathname)) // 'landing', 'patient', 'doctor-auth', 'admin', 'platform-admin', 'facility', 'auth-callback', 'terms', 'privacy', 'contact'
  const [authDoctor, setAuthDoctor] = useState(null)
  const [authAdmin, setAuthAdmin] = useState(null)

  const navigate = (view) => {
    const nextView = viewFromPath(pathFromView(view))
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

  // Handle back/forward navigation.
  useEffect(() => {
    const handler = () => setCurrentView(viewFromPath(window.location.pathname))
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  // Restore doctor session (OAuth bridge or prior login).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('gd_doctor_session')
      if (!stored) return
      const parsed = JSON.parse(stored)
      if (parsed?.id) setAuthDoctor({ type: 'login', ...parsed })
    } catch {
      // ignore
    }
  }, [])

  const handleAuth = (authData) => {
    if (authData.type === 'admin-login') {
      setAuthAdmin(authData)
      setAuthDoctor(null)
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
      setCurrentView('admin')
      try {
        window.history.pushState({ view: 'admin' }, '', '/doctor/dashboard')
      } catch {
        // ignore
      }
    }
  }

  const handleLogout = () => {
    setAuthDoctor(null)
    setAuthAdmin(null)
    setCurrentView('landing')
    try {
      window.history.pushState({ view: 'landing' }, '', '/')
    } catch {
      // ignore
    }
  }

  return (
    <ErrorProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="GlobalDoc Connect logo" className="h-10 w-10 rounded-full shadow-sm object-cover" />
          <span className="text-lg font-semibold text-brand-700">GlobalDoc Connect</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <button
            onClick={() => navigate('landing')}
            className={`hover:text-brand-700 ${currentView === 'landing' ? 'text-brand-700' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => navigate('patient')}
            className={`hover:text-brand-700 ${currentView === 'patient' ? 'text-brand-700' : ''}`}
          >
            Patient Portal
          </button>
          <button
            onClick={() => navigate('doctor-auth')}
            className={`hover:text-brand-700 ${currentView === 'doctor-auth' ? 'text-brand-700' : ''}`}
          >
            Doctor Portal
          </button>
          <button
            onClick={() => navigate('facility')}
            className={`hover:text-brand-700 ${currentView === 'facility' ? 'text-brand-700' : ''}`}
          >
            Facility Portal
          </button>
          {authAdmin && (
            <button
              onClick={() => setCurrentView('platform-admin')}
              className={`hover:text-brand-700 ${currentView === 'platform-admin' ? 'text-brand-700' : ''}`}
            >
              Platform Admin
            </button>
          )}
          {(authDoctor || authAdmin) && (
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {currentView === 'landing' && <LandingPage />}
      {currentView === 'patient' && <PatientDashboard />}
      {currentView === 'doctor-auth' && <DoctorAuth onAuth={handleAuth} />}
      {currentView === 'admin' && <AdminDashboard doctor={authDoctor} onLogout={handleLogout} />}
      {currentView === 'platform-admin' && <PlatformAdminDashboard adminSession={authAdmin} onLogout={handleLogout} />}
      {currentView === 'facility' && <FacilityPortal />}
      {currentView === 'auth-callback' && <AuthCallback onNavigate={navigate} onDoctorAuth={setAuthDoctor} onPatientNavigate={() => navigate('patient')} />}
      {currentView === 'terms' && <TermsOfService onNavigate={navigate} />}
      {currentView === 'privacy' && <PrivacyPolicy onNavigate={navigate} />}
      {currentView === 'contact' && <Contact onNavigate={navigate} />}

      {/* Footer - only show on landing page */}
      {currentView === 'landing' && <Footer onNavigate={setCurrentView} />}
    </div>
    </ErrorProvider>
  )
}

export default App
