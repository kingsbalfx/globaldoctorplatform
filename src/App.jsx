import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import AdminDashboard from './pages/AdminDashboard'
import PatientDashboard from './pages/PatientDashboard'
import PlatformAdminDashboard from './pages/PlatformAdminDashboard'
import FacilityPortal from './pages/FacilityPortal'
import DoctorAuth from './components/DoctorAuth'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Contact from './pages/Contact'
import Footer from './components/Footer'

function App() {
  const [currentView, setCurrentView] = useState('landing') // 'landing', 'patient', 'doctor-auth', 'admin', 'platform-admin', 'facility', 'terms', 'privacy', 'contact'
  const [authDoctor, setAuthDoctor] = useState(null)
  const [authAdmin, setAuthAdmin] = useState(null)

  const handleAuth = (authData) => {
    if (authData.type === 'admin-login') {
      setAuthAdmin(authData)
      setAuthDoctor(null)
      setCurrentView('platform-admin')
      return
    }

    if (authData.type === 'login' || authData.type === 'register') {
      setAuthDoctor(authData)
      setAuthAdmin(null)
      setCurrentView('admin')
    }
  }

  const handleLogout = () => {
    setAuthDoctor(null)
    setAuthAdmin(null)
    setCurrentView('landing')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="GlobalDoc Connect logo" className="h-10 w-10 rounded-full shadow-sm object-cover" />
          <span className="text-lg font-semibold text-brand-700">GlobalDoc Connect</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <button
            onClick={() => setCurrentView('landing')}
            className={`hover:text-brand-700 ${currentView === 'landing' ? 'text-brand-700' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentView('patient')}
            className={`hover:text-brand-700 ${currentView === 'patient' ? 'text-brand-700' : ''}`}
          >
            Patient Portal
          </button>
          <button
            onClick={() => setCurrentView('doctor-auth')}
            className={`hover:text-brand-700 ${currentView === 'doctor-auth' ? 'text-brand-700' : ''}`}
          >
            Doctor Portal
          </button>
          <button
            onClick={() => setCurrentView('facility')}
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
      {currentView === 'terms' && <TermsOfService onNavigate={setCurrentView} />}
      {currentView === 'privacy' && <PrivacyPolicy onNavigate={setCurrentView} />}
      {currentView === 'contact' && <Contact onNavigate={setCurrentView} />}

      {/* Footer - only show on landing page */}
      {currentView === 'landing' && <Footer onNavigate={setCurrentView} />}
    </div>
  )
}

export default App
