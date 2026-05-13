import { useEffect, useMemo, useState } from 'react'
import AppointmentScheduler from '../components/AppointmentScheduler'
import PatientFileManager from '../components/PatientFileManager'
import NotificationCenter from '../components/NotificationCenter'
import ChatPanel from '../components/ChatPanel'
import VideoChatPanel from '../components/VideoChatPanel'
import PatientAuth from '../components/PatientAuth'
import DoctorSelection from '../components/DoctorSelection'
import CalendarScheduler from '../components/CalendarScheduler'
import TokenManager from '../components/TokenManager'
import PatientReferralPanel from '../components/PatientReferralPanel'
import AnnouncementBanner from '../components/AnnouncementBanner'
import ManualDownload from '../components/ManualDownload'
import AccessibilityPanel from '../components/AccessibilityPanel'
import { getSpecialtyInfo } from '../lib/specialtyRegistry'
import { API_BASE } from '../lib/apiBase'

function PatientDashboard() {
  const [currentStep, setCurrentStep] = useState('auth') // auth -> doctor -> calendar -> dashboard
  const [patient, setPatient] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [subscriptionType, setSubscriptionType] = useState('basic')
  const [tokens, setTokens] = useState(0)

  const [activeTab, setActiveTab] = useState('overview')
  const [appointments, setAppointments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedConsultationId, setSelectedConsultationId] = useState('')
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false)

  const currentSpecialty = selectedDoctor?.specialty || 'General Practitioner'
  const specialtyInfo = getSpecialtyInfo(currentSpecialty)
  const patientDashboardStyle = {
    backgroundImage: `radial-gradient(circle at top left, ${specialtyInfo.color}20, transparent 35%), radial-gradient(circle at bottom right, ${specialtyInfo.color}10, transparent 25%)`,
    backgroundColor: specialtyInfo.bgColor,
  }

  useEffect(() => {
    if (patient && currentStep === 'dashboard') {
      loadOverview()
    }
  }, [patient, currentStep])

  // Auto-restore patient session from OAuth callback (or previous session).
  useEffect(() => {
    if (currentStep !== 'auth') return
    try {
      const stored = window.localStorage.getItem('gd_patient_session')
      if (!stored) return
      const parsed = JSON.parse(stored)
      if (parsed?.id) {
        setPatient(parsed)
        setTokens(parsed.tokens || 0)
        setCurrentStep('doctor')
      }
    } catch {
      // ignore
    }
  }, [currentStep])

  const loadOverview = async () => {
    setLoading(true)
    try {
      const [appointmentsRes, filesRes, notificationsRes] = await Promise.all([
        fetch(`${API_BASE}/api/appointments?patientId=${encodeURIComponent(patient.id)}`),
        fetch(`${API_BASE}/api/patients/files?patientId=${encodeURIComponent(patient.id)}`),
        fetch(`${API_BASE}/api/notifications?userId=${encodeURIComponent(patient.id)}&userType=patient`),
      ])

      const [appointmentsData, filesData, notificationsData] = await Promise.all([
        appointmentsRes.json(),
        filesRes.json(),
        notificationsRes.json(),
      ])

      setAppointments(appointmentsData.appointments || [])
      setFiles(filesData.files || [])
      setNotifications(notificationsData.notifications || [])
      if (!selectedConsultationId && appointmentsData.appointments?.length > 0) {
        setSelectedConsultationId(appointmentsData.appointments[0].id)
      }
    } catch (error) {
      console.error('Failed to load patient dashboard', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = (authResult) => {
    if (authResult.type === 'register') {
      setPatient({ ...authResult.patient, tokens: 0 })
      setTokens(0)
    } else {
      setPatient(authResult.patient)
      setTokens(authResult.patient.tokens || 0)
    }
    setCurrentStep('doctor')
  }

  const handleDoctorSelected = (doctor, subType) => {
    setSelectedDoctor(doctor)
    setSubscriptionType(subType)
    setCurrentStep('calendar')
  }

  const handleAppointmentScheduled = (appointment) => {
    setCurrentStep('dashboard')
    loadOverview()
  }

  const handleTokensUpdated = (newTokenBalance) => {
    setTokens(newTokenBalance)
  }

  const handleEmergencyCall = async () => {
    if (!patient) return

    try {
      const response = await fetch(`${API_BASE}/api/emergency/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          patientName: patient.name,
          reason: 'Emergency request',
        }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Emergency call failed')
      }
      alert('Emergency request sent to available doctors. Help is on the way.')
    } catch (error) {
      alert(error.message)
    }
  }

  // If not authenticated, show auth
  if (currentStep === 'auth') {
    return <PatientAuth onAuth={handleAuth} />
  }

  // Doctor selection step
  if (currentStep === 'doctor') {
    return <DoctorSelection patient={patient} onDoctorSelected={handleDoctorSelected} />
  }

  // Calendar scheduling step
  if (currentStep === 'calendar') {
    return (
      <CalendarScheduler
        patient={patient}
        doctor={selectedDoctor}
        subscriptionType={subscriptionType}
        onAppointmentScheduled={handleAppointmentScheduled}
      />
    )
  }

  // Main dashboard
  const upcomingAppointments = useMemo(
    () => appointments.filter((appointment) => new Date(appointment.scheduledDate) > new Date()),
    [appointments]
  )

  const unreadNotifications = notifications.filter((item) => !item.is_read).length

  const handleAppointmentCreated = async () => {
    await loadOverview()
  }

  return (
    <section className="relative mx-auto mt-16 max-w-7xl px-6 pb-20 sm:px-8" style={patientDashboardStyle}>
      <div className="absolute inset-x-0 top-0 h-72 bg-white/80 blur-xl opacity-40" />
      <AnnouncementBanner audience="patient" />
      <div className="rounded-3xl border border-white/60 bg-white/95 px-8 py-10 shadow-xl shadow-slate-200/40 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/80 opacity-80" />
        <div className="relative grid gap-6 lg:grid-cols-[1.8fr_1fr] lg:items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Patient Portal</h1>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">Upload medical records, schedule appointments, chat with your doctor, and receive reminders 24 hours and 1 hour before your visit.</p>
            <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 shadow-sm">
              <span className="text-lg">{specialtyInfo.logo}</span>
              <span>{currentSpecialty} care experience</span>
            </div>
          </div>
          <div className="rounded-3xl bg-gradient-to-r from-white to-slate-100 p-6 shadow-lg shadow-slate-200/50">
            <div className="space-y-4">
              <div className="rounded-3xl bg-white/15 p-4">
                <p className="text-sm uppercase tracking-[0.2em] text-brand-100">Upcoming appointments</p>
                <p className="mt-2 text-3xl font-semibold">{upcomingAppointments.length}</p>
              </div>
              <div className="rounded-3xl bg-white/15 p-4">
                <p className="text-sm uppercase tracking-[0.2em] text-brand-100">Unread notifications</p>
                <p className="mt-2 text-3xl font-semibold">{unreadNotifications}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'appointments', label: 'Appointments' },
          { id: 'files', label: 'Files' },
          { id: 'chat', label: 'Chat' },
          { id: 'video', label: 'Video Call' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'tokens', label: 'Tokens & Subscription' },
          { id: 'manuals', label: 'Help & Manuals' },
          { id: 'accessibility', label: 'Accessibility' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-6 py-3 text-sm font-semibold transition ${activeTab === tab.id ? 'bg-brand-700 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-600">Schedule a new appointment and receive email and in-app reminders before the consultation.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-600">Upload test results, prescriptions, or scans and share them securely with your doctor.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-600">Send quick messages to your doctor and get notified when they reply.</p>
              </div>
              <div className="rounded-3xl bg-red-50 border border-red-100 p-5">
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold text-red-700">Emergency assistance</p>
                  <p className="text-sm text-slate-600">If you need urgent help, notify available doctors immediately.</p>
                  <button
                    onClick={handleEmergencyCall}
                    className="w-full rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Call emergency support
                  </button>
                </div>
              </div>
            </div>
          </div>

          <PatientReferralPanel patient={patient} currentDoctor={selectedDoctor} onReferralSubmitted={loadOverview} />

          <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent activity</h2>
            {loading ? (
              <p className="text-sm text-slate-500">Loading activity...</p>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="rounded-3xl bg-slate-50 p-5">
                    <p className="font-semibold text-slate-900">{appointment.consultationType.replace('_', ' ')} with {appointment.doctorName || appointment.doctorId}</p>
                    <p className="text-sm text-slate-600 mt-1">{new Date(appointment.scheduledDate).toLocaleString()}</p>
                    <p className="text-sm text-brand-700 mt-2">{appointment.status}</p>
                  </div>
                ))}
                {upcomingAppointments.length === 0 && <p className="text-sm text-slate-500">No upcoming appointments yet.</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <AppointmentScheduler patientId={patient.id} onScheduled={handleAppointmentCreated} />
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Your Appointments</h2>
              {loading ? (
                <p className="text-sm text-slate-500">Loading appointments...</p>
              ) : appointments.length === 0 ? (
                <p className="text-sm text-slate-500">No appointments scheduled yet.</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{appointment.doctorName || appointment.doctorId}</p>
                          <p className="text-sm text-slate-600">{appointment.consultationType.replace('_', ' ')}</p>
                        </div>
                        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase text-brand-700">{appointment.status}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{new Date(appointment.scheduledDate).toLocaleString()}</p>
                      <button
                        onClick={() => setSelectedConsultationId(appointment.id)}
                        className="mt-4 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
                      >
                        Open chat for this appointment
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'files' && <PatientFileManager patientId={patient.id} />}

      {activeTab === 'chat' && (
        <ChatPanel
          consultationId={selectedConsultationId}
          userId={patient.id}
          userType="patient"
          recipientId={appointments.find((appt) => appt.id === selectedConsultationId)?.doctorId || ''}
          recipientType="doctor"
        />
      )}

      {activeTab === 'video' && (
        <VideoChatPanel
          consultationId={selectedConsultationId}
          userId={patient.id}
          userType="patient"
        />
      )}

      {activeTab === 'tokens' && <TokenManager patient={patient} onTokensUpdated={handleTokensUpdated} />}

      {activeTab === 'manuals' && <ManualDownload userType="patient" />}

      {activeTab === 'accessibility' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Accessibility Settings</h2>
              <p className="text-sm text-gray-600 mt-1">Customize your experience for better accessibility</p>
            </div>
            <button
              onClick={() => setShowAccessibilityPanel(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open Settings
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Available Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Voice commands for navigation</li>
                <li>• Screen reader support</li>
                <li>• High contrast mode</li>
                <li>• Large text options</li>
                <li>• Audio descriptions</li>
                <li>• Visual guides</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Emergency Access</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 mb-3">
                  Quick access to emergency services and visual communication aids.
                </p>
                <button
                  onClick={handleEmergencyCall}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Emergency Support
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AccessibilityPanel
        isOpen={showAccessibilityPanel}
        onClose={() => setShowAccessibilityPanel(false)}
        userType="patient"
      />
    </section>
  )
}

export default PatientDashboard
