import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import LanguageSelector from '../components/LanguageSelector'
import PrescriptionManager from '../components/PrescriptionManager'
import LabRequestManager from '../components/LabRequestManager'
import PatientClinicalSummaryDownload from '../components/PatientClinicalSummaryDownload'
import VitalParametersMonitor from '../components/VitalParametersMonitor'
import { getSpecialtyInfo } from '../lib/specialtyRegistry'
import { apiFetch } from '../lib/apiFetch'
import { useError } from '../components/ErrorHandler'
import { supabase } from '../lib/supabaseClient'

function PatientDashboard({ logoutSignal = 0, onLoggedOut, onSessionChange }) {
  const { addError } = useError()
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
  const { t } = useTranslation()

  const activeConsultation = useMemo(() => {
    return appointments.find((appointment) => appointment.id === selectedConsultationId) || appointments[0] || null
  }, [appointments, selectedConsultationId])

  const currentSpecialty =
    selectedDoctor?.specialty ||
    activeConsultation?.doctorSpecialty ||
    activeConsultation?.doctor_specialty ||
    activeConsultation?.specialty ||
    'General Practitioner'
  const specialtyInfo = getSpecialtyInfo(currentSpecialty)
  const activeDoctorName =
    selectedDoctor?.name ||
    activeConsultation?.doctorName ||
    activeConsultation?.doctor_name ||
    activeConsultation?.doctorId ||
    activeConsultation?.doctor_id ||
    'Care team'
  const patientDashboardStyle = {
    '--specialty-color': specialtyInfo.color,
    '--specialty-bg': specialtyInfo.bgColor,
    backgroundImage: `linear-gradient(135deg, ${specialtyInfo.bgColor} 0%, #ffffff 42%, ${specialtyInfo.color}18 100%)`,
  }

  const upcomingAppointments = useMemo(
    () => appointments.filter((appointment) => new Date(appointment.scheduledDate || appointment.scheduled_date) > new Date()),
    [appointments]
  )

  const unreadNotifications = notifications.filter((item) => !item.is_read).length

  const cleanLogout = (reason = 'logout') => {
    const patientId = patient?.id
    if (patientId) {
      void apiFetch(`/api/patients/${encodeURIComponent(patientId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: false }),
      }).catch(() => null)
    }
    setPatient(null)
    setSelectedDoctor(null)
    setSubscriptionType('basic')
    setTokens(0)
    setActiveTab('overview')
    setAppointments([])
    setNotifications([])
    setFiles([])
    setSelectedConsultationId('')
    setShowAccessibilityPanel(false)
    setCurrentStep('auth')
    try {
      window.localStorage.removeItem('gd_patient_session')
      window.localStorage.removeItem('gd_pending_patient_profile')
    } catch {
      // ignore
    }
    void supabase.auth.signOut().catch(() => null)
    if (reason === 'idle') addError('You were logged out after 15 minutes of inactivity.', 'info', 9000)
    onSessionChange?.('')
    onLoggedOut?.()
  }

  useEffect(() => {
    if (patient && currentStep === 'dashboard') {
      loadOverview()
    }
  }, [patient, currentStep])

  useEffect(() => {
    if (logoutSignal > 0) cleanLogout('manual')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logoutSignal])

  useEffect(() => {
    if (!patient) return
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll']
    let timer
    const resetTimer = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => cleanLogout('idle'), 15 * 60 * 1000)
    }
    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }))
    resetTimer()
    return () => {
      window.clearTimeout(timer)
      events.forEach((event) => window.removeEventListener(event, resetTimer))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient?.id])

  // ---------- AUTO‑RESTORE SESSION (fixed) ----------
  useEffect(() => {
    if (currentStep !== 'auth') return
    try {
      const stored = window.localStorage.getItem('gd_patient_session')
      if (!stored) return
      const parsed = JSON.parse(stored)
      // Only restore if the patient has an email – otherwise force login
      if (parsed?.id) {
        const returnToDashboard = window.localStorage.getItem('gd_patient_return_dashboard') === '1'
        window.localStorage.removeItem('gd_patient_return_dashboard')
        setPatient(parsed)
        setTokens(parsed.tokens || 0)
        setCurrentStep(returnToDashboard ? 'dashboard' : 'doctor')
        if (returnToDashboard) setActiveTab('tokens')
        onSessionChange?.('patient')
      } else {
        // Clear corrupted / incomplete session
        window.localStorage.removeItem('gd_patient_session')
      }
    } catch {
      // ignore
    }
  }, [currentStep])

  const loadOverview = async () => {
    setLoading(true)
    try {
      const [appointmentsRes, filesRes, notificationsRes] = await Promise.all([
        apiFetch(`/api/appointments?patientId=${encodeURIComponent(patient.id)}`),
        apiFetch(`/api/patients/files?patientId=${encodeURIComponent(patient.id)}`),
        apiFetch(`/api/notifications?userId=${encodeURIComponent(patient.id)}&userType=patient`),
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
    const nextPatient = authResult.type === 'register'
      ? { ...authResult.patient, tokens: 0 }
      : authResult.patient
    if (authResult.type === 'register') {
      setTokens(0)
    } else {
      setTokens(authResult.patient.tokens || 0)
    }
    setPatient(nextPatient)
    try {
      window.localStorage.setItem('gd_patient_session', JSON.stringify(nextPatient))
    } catch {
      // ignore
    }
    onSessionChange?.('patient')
    setCurrentStep('doctor')
  }

  const handleDoctorSelected = (doctor, subType) => {
    setSelectedDoctor(doctor)
    setSubscriptionType(subType)
    setCurrentStep('calendar')
  }

  const handleInstantConsultation = async (doctor, subType) => {
    const price = Number(doctor?.price?.[subType] || (subType === 'premium' ? 100 : 50))
    try {
      const balanceResponse = await apiFetch(`/api/patients/${encodeURIComponent(patient.id)}/tokens`)
      const balanceData = await balanceResponse.json().catch(() => ({}))
      if (!balanceResponse.ok) throw new Error(balanceData.error || 'Unable to confirm token balance')
      if (Number(balanceData.tokens || 0) < price) {
        throw new Error('Insufficient tokens. Buy tokens before starting this consultation.')
      }

      const response = await apiFetch('/api/consultations/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          doctorId: doctor.id,
          channel: 'direct_home',
          track: subType === 'premium' ? 'premium' : 'economy',
          durationMin: subType === 'premium' ? 30 : 15,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to start consultation')

      const debitResponse = await apiFetch('/api/tokens/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patient.id, amount: price }),
      })
      const debitData = await debitResponse.json().catch(() => ({}))
      if (!debitResponse.ok) throw new Error(debitData.error || 'Unable to debit consultation tokens')

      const consultation = data.consultation || {}
      const liveAppointment = {
        id: consultation.id,
        consultationId: consultation.id,
        consultation_id: consultation.id,
        patientId: patient.id,
        patient_id: patient.id,
        doctorId: doctor.id,
        doctor_id: doctor.id,
        doctorName: doctor.name,
        doctor_name: doctor.name,
        doctorSpecialty: doctor.specialty,
        doctor_specialty: doctor.specialty,
        consultationType: 'live_consultation',
        consultation_type: 'live_consultation',
        scheduledDate: new Date().toISOString(),
        scheduled_date: new Date().toISOString(),
        status: 'in_progress',
        tokens_charged: price,
      }
      setSelectedDoctor(doctor)
      setSubscriptionType(subType)
      setTokens(debitData.tokens ?? debitData.balance ?? Math.max(0, tokens - price))
      setAppointments((prev) => [liveAppointment, ...prev])
      setSelectedConsultationId(liveAppointment.id)
      setActiveTab('video')
      setCurrentStep('dashboard')
      addError('Live consultation started. Video room is ready.', 'success')
    } catch (error) {
      addError(error.message, 'error')
    }
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
      const response = await apiFetch(`/api/emergency/call`, {
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
      addError('Emergency request sent to available doctors. Help is on the way.', 'success')
    } catch (error) {
      addError(error.message, 'error')
    }
  }

  // If not authenticated, show auth
  if (currentStep === 'auth') {
    return <PatientAuth onAuth={handleAuth} />
  }

  // Doctor selection step
  if (currentStep === 'doctor') {
    return <DoctorSelection patient={patient} onDoctorSelected={handleDoctorSelected} onInstantConsultation={handleInstantConsultation} />
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

  const handleAppointmentCreated = async () => {
    await loadOverview()
  }

  return (
    <section className="relative mx-auto mt-16 max-w-7xl overflow-hidden rounded-[2rem] px-6 pb-20 pt-1 sm:px-8" style={patientDashboardStyle}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-white/70 blur-xl opacity-70" />
      <AnnouncementBanner audience="patient" />
      <div className="rounded-3xl border border-white/70 bg-white/95 px-8 py-10 shadow-xl shadow-slate-200/40 mb-8 relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-2/5 opacity-15" style={{ background: specialtyInfo.color }} />
        <div className="relative grid gap-6 lg:grid-cols-[1.8fr_1fr] lg:items-center">
          <div>
            <div className="inline-flex flex-wrap items-center gap-3 rounded-full border border-white bg-white px-4 py-2 text-sm font-bold shadow-sm" style={{ color: specialtyInfo.color }}>
              <span className="rounded-full px-2 py-1 text-xs text-white" style={{ backgroundColor: specialtyInfo.color }}>{specialtyInfo.logo}</span>
              <span>{specialtyInfo.name} rhythm</span>
              <span className="text-slate-400">with {activeDoctorName}</span>
            </div>
            <h1 className="mt-5 text-4xl font-bold text-slate-900">Patient Portal</h1>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">Upload medical records, schedule appointments, chat with your doctor, and receive reminders 24 hours and 1 hour before your visit.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] items-center">
              <div className="rounded-3xl border p-4" style={{ borderColor: `${specialtyInfo.color}35`, backgroundColor: `${specialtyInfo.bgColor}90` }}>
                <p className="text-xs uppercase tracking-[0.24em]" style={{ color: specialtyInfo.color }}>Patient guide</p>
                <p className="mt-2 text-sm text-slate-700">Your preferred language: <strong>{patient?.language || 'English'}</strong></p>
                <p className="mt-2 text-sm text-slate-600">{specialtyInfo.description}. Your dashboard adapts to the specialist you selected, the referral path, or the doctor currently consulting.</p>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <LanguageSelector />
                <button
                  onClick={() => setActiveTab('manuals')}
                  className="rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg"
                  style={{ backgroundColor: specialtyInfo.color }}
                >
                  {t('manuals.downloadManual')}
                </button>
              </div>
            </div>
          </div>
          <div className="rounded-3xl p-6 text-white shadow-lg shadow-slate-200/50" style={{ background: `linear-gradient(135deg, ${specialtyInfo.color}, #0f172a)` }}>
            <div className="space-y-4">
              <div className="rounded-3xl bg-white/15 p-4">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">Upcoming appointments</p>
                <p className="mt-2 text-3xl font-semibold">{upcomingAppointments.length}</p>
              </div>
              <div className="rounded-3xl bg-white/15 p-4">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">Unread notifications</p>
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
          { id: 'prescriptions', label: 'Prescriptions' },
          { id: 'labs', label: 'Lab Requests' },
          { id: 'review-pdf', label: 'Review PDF' },
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
            className={`rounded-full border px-6 py-3 text-sm font-semibold transition ${activeTab === tab.id ? 'text-white shadow-lg' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}
            style={activeTab === tab.id ? { backgroundColor: specialtyInfo.color, borderColor: specialtyInfo.color } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <VitalParametersMonitor
            consultationId=""
            patientId={patient.id}
            doctorId={activeConsultation?.doctorId || activeConsultation?.doctor_id || selectedDoctor?.id || ''}
            userType="patient"
          />

          <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <div className="rounded-3xl p-5" style={{ backgroundColor: specialtyInfo.bgColor }}>
                <p className="text-sm font-bold" style={{ color: specialtyInfo.color }}>{specialtyInfo.name} care mode</p>
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
                  <div key={appointment.id} className="rounded-3xl border bg-slate-50 p-5" style={{ borderColor: `${specialtyInfo.color}35` }}>
                    <p className="font-semibold text-slate-900">{String(appointment.consultationType || appointment.consultation_type || 'consultation').replace('_', ' ')} with {appointment.doctorName || appointment.doctor_name || appointment.doctorId || appointment.doctor_id}</p>
                    <p className="text-sm text-slate-600 mt-1">{new Date(appointment.scheduledDate || appointment.scheduled_date).toLocaleString()}</p>
                    <p className="text-sm font-bold mt-2" style={{ color: specialtyInfo.color }}>{appointment.status}</p>
                  </div>
                ))}
                {upcomingAppointments.length === 0 && <p className="text-sm text-slate-500">No upcoming appointments yet.</p>}
              </div>
            )}
          </div>
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
                    <div key={appointment.id} className="rounded-3xl border bg-slate-50 p-5" style={{ borderColor: selectedConsultationId === appointment.id ? specialtyInfo.color : undefined }}>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{appointment.doctorName || appointment.doctor_name || appointment.doctorId || appointment.doctor_id}</p>
                          <p className="text-sm text-slate-600">{String(appointment.consultationType || appointment.consultation_type || 'consultation').replace('_', ' ')}</p>
                        </div>
                        <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase" style={{ backgroundColor: specialtyInfo.bgColor, color: specialtyInfo.color }}>{appointment.status}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{new Date(appointment.scheduledDate || appointment.scheduled_date).toLocaleString()}</p>
                      <button
                        onClick={() => setSelectedConsultationId(appointment.id)}
                        className="mt-4 rounded-full px-4 py-2 text-sm font-semibold text-white"
                        style={{ backgroundColor: specialtyInfo.color }}
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

      {activeTab === 'prescriptions' && (
        <PrescriptionManager
          patientId={patient.id}
          patientName={patient.name}
        />
      )}

      {activeTab === 'labs' && (
        <LabRequestManager
          patientId={patient.id}
          patientName={patient.name}
        />
      )}

      {activeTab === 'review-pdf' && (
        <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
          <h2 className="text-xl font-semibold text-slate-900">Clinical Review Download</h2>
          <p className="mt-2 text-sm text-slate-600">Download your uploaded files summary, reviews, referrals, vitals, and lab requests as a printable PDF.</p>
          <div className="mt-6">
            <PatientClinicalSummaryDownload patient={patient} />
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <ChatPanel
          consultationId={selectedConsultationId}
          userId={patient.id}
          userType="patient"
          recipientId={appointments.find((appt) => appt.id === selectedConsultationId)?.doctorId || appointments.find((appt) => appt.id === selectedConsultationId)?.doctor_id || selectedDoctor?.id || ''}
          recipientType="doctor"
          patientId={patient.id}
          doctorId={appointments.find((appt) => appt.id === selectedConsultationId)?.doctorId || appointments.find((appt) => appt.id === selectedConsultationId)?.doctor_id || selectedDoctor?.id || ''}
        />
      )}

      {activeTab === 'video' && (
        <div className="space-y-6">
          <VideoChatPanel
            consultationId={selectedConsultationId}
            userId={patient.id}
            userType="patient"
            patientId={patient.id}
            doctorId={activeConsultation?.doctorId || activeConsultation?.doctor_id || selectedDoctor?.id || ''}
          />
          <VitalParametersMonitor
            consultationId=""
            patientId={patient.id}
            doctorId={activeConsultation?.doctorId || activeConsultation?.doctor_id || selectedDoctor?.id || ''}
            userType="patient"
          />
        </div>
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
