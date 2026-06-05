import { useEffect, useRef, useState } from 'react'
import FacilityReferralManager from '../components/FacilityReferralManager'
import NotificationCenter from '../components/NotificationCenter'
import PatientRecordReview from '../components/PatientRecordReview'
import AnnouncementBanner from '../components/AnnouncementBanner'
import ManualDownload from '../components/ManualDownload'
import DoctorCommunityChat from '../components/DoctorCommunityChat'
import VideoChatPanel from '../components/VideoChatPanel'
import ChatPanel from '../components/ChatPanel'
import PrescriptionManager from '../components/PrescriptionManager'
import LabRequestManager from '../components/LabRequestManager'
import VitalParametersMonitor from '../components/VitalParametersMonitor'
import DoctorSpecialtyReferralPanel from '../components/DoctorSpecialtyReferralPanel'
import SpecialtyReferralInbox from '../components/SpecialtyReferralInbox'
import DoctorPatientNotes from '../components/DoctorPatientNotes'
import DoctorAvailabilityManager from '../components/DoctorAvailabilityManager'
import { PortalArtBanner } from '../components/TelehealthArt'
import { getSpecialtyInfo } from '../lib/specialtyRegistry'
import { apiFetch } from '../lib/apiFetch'
import { useError } from '../components/ErrorHandler'

function WorkspaceModal({ title, subtitle, onClose, children, size = 'max-w-4xl' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className={`max-h-[90vh] w-full ${size} overflow-hidden rounded-3xl bg-white shadow-2xl`}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Close
          </button>
        </div>
        <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

function AdminDashboard({ doctor, onLogout }) {
  const { addError } = useError()
  const [activeTab, setActiveTab] = useState('overview')
  const [doctorOnline, setDoctorOnline] = useState(Boolean(doctor?.isOnline || doctor?.is_online))
  const [updatingDoctorStatus, setUpdatingDoctorStatus] = useState(false)
  const adminSpecialty = doctor?.specialty || 'General Practitioner'
  const adminSpecialtyInfo = getSpecialtyInfo(adminSpecialty)
  const adminHeaderStyle = {
    backgroundImage: `linear-gradient(135deg, ${adminSpecialtyInfo.color}, ${adminSpecialtyInfo.bgColor})`,
  }
  const [withdrawing, setWithdrawing] = useState(false)
  const [savingPayoutDetails, setSavingPayoutDetails] = useState(false)
  const [withdrawalResult, setWithdrawalResult] = useState(null)
  const [withdrawTokenAmount, setWithdrawTokenAmount] = useState(() => {
    const value = Number(doctor?.earningsTokens ?? doctor?.earnings_tokens ?? 0)
    return value > 0 ? String(Math.floor(value)) : ''
  })
  const [payoutDetails, setPayoutDetails] = useState(() => ({
    payoutMethod: doctor?.payoutMethod || 'bank_account',
    bankCode: doctor?.bankCode || '',
    bankAccount: doctor?.bankAccount || '',
    currency: doctor?.currency || '',
    mobileMoneyOperator: doctor?.mobileMoneyOperator || '',
    mobileMoneyNumber: doctor?.mobileMoneyNumber || '',
  }))
  const [consultationPatients, setConsultationPatients] = useState([])
  const [consultationPatientTotal, setConsultationPatientTotal] = useState(0)
  const [consultationPatientSearch, setConsultationPatientSearch] = useState('')
  const [consultationPatientLimit, setConsultationPatientLimit] = useState(10)
  const [loadingConsultationPatients, setLoadingConsultationPatients] = useState(false)
  const [selectedConsultationPatient, setSelectedConsultationPatient] = useState(null)
  const [workspacePanel, setWorkspacePanel] = useState('')
  const [activeConsultTool, setActiveConsultTool] = useState('chat')
  const [financials, setFinancials] = useState(null)
  const hasAutoOpenedPatients = useRef(false)
  const earningsTokens = Number(financials?.earningsTokens ?? doctor?.earningsTokens ?? doctor?.earnings_tokens ?? 0) || 0
  const estimatedUsd = financials?.estimatedUsd ?? (earningsTokens / 10)
  const tokenToUsd = Number(financials?.settings?.tokenToUSD || 10)
  const minimumWithdrawalUsd = Number(financials?.settings?.doctorMinimumWithdrawalUSD || 5)
  const minimumWithdrawTokens = Math.max(1, Math.round(minimumWithdrawalUsd * tokenToUsd))

  const loadConsultationPatients = async (limit = consultationPatientLimit, search = consultationPatientSearch) => {
    if (!doctor?.id) return
    setLoadingConsultationPatients(true)
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: '0' })
      params.set('onlineOnly', 'true')
      if (search.trim()) params.set('search', search.trim())
      const response = await apiFetch(`/api/doctors/${encodeURIComponent(doctor.id)}/consultation-patients?${params.toString()}`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to load consultation patients')
      const patients = Array.isArray(data.patients) ? data.patients : []
      setConsultationPatients(patients)
      setConsultationPatientTotal(Number(data.total || 0))
      setSelectedConsultationPatient((current) => {
        if (!patients.length) return null
        const currentConsultationId = current?.latest_consultation?.id
        const stillVisible = patients.find((patient) => patient.latest_consultation?.id === currentConsultationId)
        if (stillVisible) return stillVisible
        return patients.find((patient) => patient.latest_consultation?.status === 'in_progress') || patients[0]
      })
    } catch (err) {
      setConsultationPatients([])
      setConsultationPatientTotal(0)
      setSelectedConsultationPatient(null)
      addError(err.message, 'error')
    } finally {
      setLoadingConsultationPatients(false)
    }
  }

  const loadFinancials = async () => {
    if (!doctor?.id) return
    try {
      const response = await apiFetch(`/api/doctors/${encodeURIComponent(doctor.id)}/financials`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to load financials')
      setFinancials(data)
      if (data.doctor && activeTab !== 'wallet') {
        setPayoutDetails((prev) => ({
          payoutMethod: data.doctor.payoutMethod || data.doctor.payout_method || prev.payoutMethod || 'bank_account',
          bankCode: data.doctor.bankCode || data.doctor.bank_code || prev.bankCode || '',
          bankAccount: data.doctor.bankAccount || data.doctor.bank_account || prev.bankAccount || '',
          currency: data.doctor.currency || prev.currency || '',
          mobileMoneyOperator: data.doctor.mobileMoneyOperator || data.doctor.mobile_money_operator || prev.mobileMoneyOperator || '',
          mobileMoneyNumber: data.doctor.mobileMoneyNumber || data.doctor.mobile_money_number || prev.mobileMoneyNumber || '',
        }))
      }
    } catch (err) {
      addError(err.message, 'error')
    }
  }

  useEffect(() => {
    if (!doctor?.id) return
    const timer = window.setTimeout(() => {
      void loadConsultationPatients(consultationPatientLimit, consultationPatientSearch)
    }, 250)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor?.id, consultationPatientSearch, consultationPatientLimit])

  useEffect(() => {
    if (!doctor?.id) return undefined
    const interval = window.setInterval(() => {
      void loadConsultationPatients(consultationPatientLimit, consultationPatientSearch)
    }, 10000)
    return () => window.clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor?.id, consultationPatientLimit, consultationPatientSearch])

  useEffect(() => {
    if (!doctor?.id) return
    void loadFinancials()
    const interval = window.setInterval(() => {
      void loadFinancials()
    }, 15000)
    return () => window.clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor?.id, activeTab])

  useEffect(() => {
    if (hasAutoOpenedPatients.current || activeTab !== 'overview') return
    if (consultationPatients.some((patient) => patient.latest_consultation?.status === 'in_progress')) {
      hasAutoOpenedPatients.current = true
      setActiveTab('patients')
    }
  }, [activeTab, consultationPatients])

  const selectedConsultation = selectedConsultationPatient?.latest_consultation || null

  const openPatientWorkspace = (patient, panel = 'video') => {
    setSelectedConsultationPatient(patient)
    setWorkspacePanel('')
    setActiveConsultTool(panel === 'video' || panel === 'patients' ? 'chat' : panel)
  }

  const openAcceptedReferralWorkspace = ({ patient, consultation }) => {
    if (!patient?.id || !consultation?.id) return
    setSelectedConsultationPatient({
      ...patient,
      latest_consultation: consultation,
      source: 'specialty_referral',
      video_waiting: true,
    })
    setWorkspacePanel('')
    setActiveConsultTool('chat')
    setActiveTab('patients')
  }

  const handleSavePayoutDetails = async () => {
    setSavingPayoutDetails(true)
    try {
      const response = await apiFetch(`/api/doctors/${doctor.id}/payout-details`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payoutDetails),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to save payout details')
      if (data.doctor) {
        setPayoutDetails((prev) => ({
          payoutMethod: data.doctor.payoutMethod || data.doctor.payout_method || prev.payoutMethod,
          bankCode: data.doctor.bankCode || data.doctor.bank_code || prev.bankCode,
          bankAccount: data.doctor.bankAccount || data.doctor.bank_account || prev.bankAccount,
          currency: data.doctor.currency || prev.currency,
          mobileMoneyOperator: data.doctor.mobileMoneyOperator || data.doctor.mobile_money_operator || prev.mobileMoneyOperator,
          mobileMoneyNumber: data.doctor.mobileMoneyNumber || data.doctor.mobile_money_number || prev.mobileMoneyNumber,
        }))
      }
      addError('Payout details saved.', 'success')
    } catch (err) {
      addError(err.message, 'error')
    } finally {
      setSavingPayoutDetails(false)
    }
  }

  const handleWithdraw = async () => {
    const tokens = Number(withdrawTokenAmount)
    if (!Number.isFinite(tokens) || tokens <= 0) {
      addError('Enter a valid token amount to withdraw.', 'error')
      return
    }
    if (tokens < minimumWithdrawTokens) {
      addError(`Minimum withdrawal is ${minimumWithdrawTokens} tokens ($${minimumWithdrawalUsd}).`, 'error')
      return
    }
    if (tokens > earningsTokens) {
      addError('Requested amount exceeds your available tokens.', 'error')
      return
    }

    setWithdrawing(true)
    setWithdrawalResult(null)
    try {
      const response = await apiFetch(`/api/doctors/${doctor.id}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens, payoutDetails })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Withdrawal request failed')
      setWithdrawalResult({
        message: data.message || 'Withdrawal request queued for payout review.',
        reference: data.reference,
        tokensDebited: data.tokensDebited ?? tokens,
        remainingTokens: data.remainingTokens,
        amountUsd: Number(data.amountUSD ?? ((data.tokensDebited ?? tokens) / 10)),
      })
      setWithdrawTokenAmount('')
      await loadFinancials()
    } catch (err) {
      addError(err.message, 'error')
    } finally {
      setWithdrawing(false)
    }
  }

  const toggleDoctorOnline = async () => {
    if (!doctor?.id) return
    const next = !doctorOnline
    setUpdatingDoctorStatus(true)
    try {
      const response = await apiFetch(`/api/doctors/${encodeURIComponent(doctor.id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: next }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to update doctor status')
      setDoctorOnline(next)
      addError(next ? 'You are now visible as online.' : 'You are now offline.', 'success')
    } catch (err) {
      addError(err.message, 'error')
    } finally {
      setUpdatingDoctorStatus(false)
    }
  }

  const waitingConsultationPatients = consultationPatients.filter((patient) => patient.video_waiting)
  const facilityConsultationPatients = consultationPatients.filter((patient) => patient.source === 'facility' && !patient.video_waiting)
  const referredConsultationPatients = consultationPatients.filter((patient) => patient.source === 'specialty_referral' && !patient.video_waiting)
  const directConsultationPatients = consultationPatients.filter((patient) => patient.source === 'direct_patient' && !patient.video_waiting)
  const consultationPatientSections = [
    { title: 'Waiting now', subtitle: 'Patients already trying to enter the video room.', patients: waitingConsultationPatients },
    { title: 'Facility patients', subtitle: 'Patients sent from PHC or private clinic workflows.', patients: facilityConsultationPatients },
    { title: 'Specialty referrals', subtitle: 'Patients transferred from another doctor.', patients: referredConsultationPatients },
    { title: 'Direct patients', subtitle: 'Patients who started from their own portal.', patients: directConsultationPatients },
  ].filter((section) => section.patients.length > 0)

  const getPatientSourceLabel = (patient, index) => {
    if (patient.video_waiting) return 'Waiting for video'
    if (patient.source === 'facility') return patient.facility_name || patient.facility_type || `Facility queue #${index + 1}`
    if (patient.source === 'specialty_referral') return 'Specialty referral'
    return 'Direct patient'
  }

  const getPatientChannelLabel = (patient) => {
    const channel = patient.latest_consultation?.channel || 'Consultation'
    if (patient.source === 'facility' && patient.facility_name) return `${patient.facility_name} | ${channel.replace(/_/g, ' ')}`
    return channel.replace(/_/g, ' ')
  }

  if (!doctor) {
    return (
      <section className="mx-auto mt-16 max-w-7xl px-6 pb-20 sm:px-8">
        <div className="rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/50 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
          <p className="text-slate-600 mt-2">Please log in as a doctor to access this dashboard.</p>
        </div>
      </section>
    )
  }

  const doctorAccountStatus = doctor.account_status || doctor.accountStatus || 'active'
  const doctorPaused = doctorAccountStatus === 'paused' || doctorAccountStatus === 'stopped'

  if (doctorPaused) {
    return (
      <section className="mx-auto mt-16 max-w-5xl px-6 pb-20 sm:px-8">
        <PortalArtBanner
          theme="doctor"
          title="Doctor account review"
          body="Your dashboard is temporarily paused while the platform admin reviews your account."
          className="mb-8"
        />
        <div className="rounded-3xl border border-amber-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Action required</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Your doctor account is paused</h2>
          <p className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            {doctor.suspension_reason || doctor.suspensionReason || 'Please answer the platform admin query or update your profile before your account is restored.'}
          </p>
          <p className="mt-4 text-sm text-slate-600">
            You can contact platform support or update the requested information. Live consultations, withdrawals, and patient access are unavailable until the admin resumes your account.
          </p>
          <button
            onClick={onLogout}
            className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto mt-16 max-w-7xl px-6 pb-20 sm:px-8">
      <PortalArtBanner
        theme="doctor"
        title="Doctor clinical workspace"
        body="Keep the consultation video alive while you review patient records, request vitals, chat, prescribe, order labs, and refer to another specialty."
        className="mb-8"
      />
      <AnnouncementBanner audience="doctor" />
      {/* Header */}
      <div className="rounded-3xl px-8 py-10 text-white shadow-xl shadow-brand-700/20 mb-8" style={adminHeaderStyle}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-4xl font-bold">Doctor Dashboard</h2>
            <p className="text-brand-100 mt-2">Welcome back, Dr. {doctor.name}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <p className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white">
                {adminSpecialtyInfo.logo} {adminSpecialty}
              </p>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${doctorOnline ? 'bg-emerald-400/25 text-white' : 'bg-slate-900/20 text-white/85'}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${doctorOnline ? 'bg-emerald-200' : 'bg-slate-300'}`} />
                {doctorOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={toggleDoctorOnline}
              disabled={updatingDoctorStatus}
              className={`rounded-full px-6 py-3 text-sm font-semibold text-white transition disabled:opacity-50 ${doctorOnline ? 'bg-amber-500/90 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
            >
              {updatingDoctorStatus ? 'Updating...' : doctorOnline ? 'Go offline' : 'Go online'}
            </button>
            <button
              onClick={onLogout}
              className="rounded-full bg-white/20 hover:bg-white/30 px-6 py-3 text-sm font-semibold text-white transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: 'Stats' },
          { id: 'community', label: 'Community', icon: 'Chat' },
          { id: 'referrals', label: 'Referrals', icon: 'Flow' },
          { id: 'patients', label: 'Patients', icon: 'Records' },
          { id: 'availability', label: 'Availability', icon: 'Calendar' },
          { id: 'wallet', label: 'Financials', icon: 'Wallet' },
          { id: 'manuals', label: 'Manuals & Guides', icon: 'Guides' },
          { id: 'notifications', label: 'Notifications', icon: 'Alerts' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-full px-6 py-3 text-sm font-semibold transition ${
              activeTab === tab.id
                ? 'bg-brand-700 text-white shadow-lg'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/50">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Name</p>
                    <p className="text-lg font-semibold text-slate-900">{doctor.name}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Specialty</p>
                    <p className="text-lg font-semibold text-slate-900">{doctor.specialty}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Location</p>
                    <p className="text-lg font-semibold text-slate-900">{doctor.location}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">License Number</p>
                    <p className="text-lg font-semibold text-slate-900">{doctor.licenseNumber}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Verification Status</p>
                    <p className={`text-lg font-semibold ${doctor.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {doctor.verified ? 'Verified' : 'Pending Verification'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Practice Analytics</h3>
                <div className="space-y-6 rounded-3xl bg-slate-50 p-6">
                  <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm">
                    <span>Total consultations</span>
                    <strong className="text-2xl">47</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm">
                    <span>Average rating</span>
                    <strong className="text-2xl">4.8/5</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm">
                    <span>Monthly revenue</span>
                    <strong className="text-2xl">${estimatedUsd.toFixed(2)}</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm">
                    <span>Profile views</span>
                    <strong className="text-2xl">156</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-blue-50 border border-blue-100 p-8 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">Doctor Support</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-900">Download the Doctor Guide</h3>
                <p className="mt-2 text-sm text-slate-600">Access onboarding manuals, quick-start guides, and best practices for patient support.</p>
              </div>
              <button
                onClick={() => setActiveTab('manuals')}
                className="rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Open manuals
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">New consultation booked</p>
                <p className="text-slate-900">Patient consultation scheduled for tomorrow at 2:00 PM</p>
                <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">New review received</p>
                <p className="text-slate-900">5-star review: "Excellent doctor, very professional"</p>
                <p className="text-xs text-slate-500 mt-1">1 day ago</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Payment received</p>
                <p className="text-slate-900">$50 consultation fee received</p>
                <p className="text-xs text-slate-500 mt-1">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Tab */}
      {activeTab === 'wallet' && (
        <div className="space-y-8">
          <div className="rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/50">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Earnings & Withdrawals</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-brand-50 rounded-3xl p-8 border border-brand-100">
                <p className="text-brand-700 font-medium">Accumulated Tokens</p>
                <p className="text-5xl font-bold text-brand-900 mt-2">{earningsTokens}</p>
                <p className="text-brand-600 mt-4 text-sm">Estimated Payout: <span className="font-bold">${estimatedUsd.toFixed(2)}</span></p>
                <button
                  type="button"
                  onClick={loadFinancials}
                  className="mt-4 rounded-full bg-white px-4 py-2 text-xs font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
                >
                  Refresh earnings
                </button>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-brand-900">Withdraw token amount</label>
                  <input
                    type="number"
                    min={minimumWithdrawTokens}
                    step="1"
                    value={withdrawTokenAmount}
                    onChange={(e) => setWithdrawTokenAmount(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-300"
                    placeholder={`Minimum ${minimumWithdrawTokens}`}
                  />
                  <p className="mt-2 text-xs text-brand-700/90">Minimum withdrawal: {minimumWithdrawTokens} tokens (${minimumWithdrawalUsd}). Conversion: {tokenToUsd} tokens = $1.</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                <p className="text-slate-600 font-medium">Payout Details (Kora)</p>

                <div className="mt-5 grid gap-4">
                  <label className="text-sm font-semibold text-slate-700">
                    Payout method
                    <select
                      value={payoutDetails.payoutMethod}
                      onChange={(e) => setPayoutDetails((prev) => ({ ...prev, payoutMethod: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                    >
                      <option value="bank_account">Bank account</option>
                      <option value="mobile_money">Mobile money</option>
                    </select>
                  </label>

                  <label className="text-sm font-semibold text-slate-700">
                    Payout currency
                    <select
                      value={payoutDetails.currency}
                      onChange={(e) => setPayoutDetails((prev) => ({ ...prev, currency: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                    >
                      <option value="">Auto (by location)</option>
                      <option value="NGN">NGN</option>
                      <option value="KES">KES</option>
                      <option value="ZAR">ZAR</option>
                      <option value="GHS">GHS</option>
                      <option value="XOF">XOF</option>
                      <option value="XAF">XAF</option>
                      <option value="EGP">EGP</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </label>

                  {payoutDetails.payoutMethod === 'bank_account' ? (
                    <>
                      <input
                        type="text"
                        placeholder="Bank code (e.g. 058)"
                        value={payoutDetails.bankCode}
                        onChange={(e) => setPayoutDetails((prev) => ({ ...prev, bankCode: e.target.value }))}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                      />
                      <input
                        type="text"
                        placeholder="Account number"
                        value={payoutDetails.bankAccount}
                        onChange={(e) => setPayoutDetails((prev) => ({ ...prev, bankAccount: e.target.value }))}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                      />
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Mobile money operator (e.g. safaricom-ke)"
                        value={payoutDetails.mobileMoneyOperator}
                        onChange={(e) => setPayoutDetails((prev) => ({ ...prev, mobileMoneyOperator: e.target.value }))}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                      />
                      <input
                        type="text"
                        placeholder="Mobile number (e.g. +2547xxxxxxxx)"
                        value={payoutDetails.mobileMoneyNumber}
                        onChange={(e) => setPayoutDetails((prev) => ({ ...prev, mobileMoneyNumber: e.target.value }))}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                      />
                    </>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleSavePayoutDetails}
                      disabled={savingPayoutDetails}
                      className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      {savingPayoutDetails ? 'Saving...' : 'Save details'}
                    </button>
                    <button
                      disabled={withdrawing || earningsTokens < minimumWithdrawTokens}
                      onClick={handleWithdraw}
                      className="flex-1 rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                      {withdrawing ? 'Processing...' : 'Withdraw'}
                    </button>
                  </div>
                  {withdrawalResult && (
                    <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-xs font-black text-white">
                          OK
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Withdrawal submitted</p>
                          <p className="mt-1 text-sm font-semibold leading-6 text-slate-900">{withdrawalResult.message}</p>
                          <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl bg-white p-3 ring-1 ring-emerald-100">
                              <p className="text-[11px] font-semibold uppercase text-slate-500">Reference</p>
                              <p className="mt-1 break-all text-xs font-bold text-slate-900">{withdrawalResult.reference}</p>
                            </div>
                            <div className="rounded-2xl bg-white p-3 ring-1 ring-emerald-100">
                              <p className="text-[11px] font-semibold uppercase text-slate-500">Tokens debited</p>
                              <p className="mt-1 text-sm font-bold text-slate-900">{withdrawalResult.tokensDebited}</p>
                            </div>
                            <div className="rounded-2xl bg-white p-3 ring-1 ring-emerald-100">
                              <p className="text-[11px] font-semibold uppercase text-slate-500">Estimated USD</p>
                              <p className="mt-1 text-sm font-bold text-slate-900">${withdrawalResult.amountUsd.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <h4 className="text-blue-900 font-semibold mb-2">Withdrawal Policy</h4>
              <ul className="list-disc pl-5 text-blue-800 text-sm space-y-1">
                <li>Conversion rate: {tokenToUsd} Tokens = $1 USD.</li>
                <li>Minimum withdrawal amount is {minimumWithdrawTokens} Tokens (${minimumWithdrawalUsd}).</li>
                <li>Payouts are processed via Kora when configured.</li>
                <li>Ensure payout details match your registered identity.</li>
              </ul>
            </div>
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-lg font-bold text-slate-900">Withdrawal history</h4>
                <button
                  type="button"
                  onClick={loadFinancials}
                  className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Refresh
                </button>
              </div>
              {!Array.isArray(financials?.payouts) || financials.payouts.length === 0 ? (
                <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No withdrawal requests yet.</p>
              ) : (
                <div className="mt-4 grid gap-3">
                  {financials.payouts.slice(0, 8).map((payout) => (
                    <div key={payout.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {Number(payout.amount_tokens || 0).toLocaleString()} tokens
                            <span className="ml-2 text-xs font-semibold text-slate-500">
                              ${Number(payout.amount_usd || 0).toFixed(2)}
                            </span>
                          </p>
                          <p className="mt-1 break-all font-mono text-[11px] text-slate-500">{payout.reference || payout.id}</p>
                          {payout.admin_note && <p className="mt-2 text-xs font-semibold text-slate-600">{payout.admin_note}</p>}
                        </div>
                        <div className="text-left sm:text-right">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            ['paid', 'completed'].includes(String(payout.status || '').toLowerCase())
                              ? 'bg-emerald-100 text-emerald-700'
                              : ['rejected', 'failed'].includes(String(payout.status || '').toLowerCase())
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}>
                            {payout.status || 'pending'}
                          </span>
                          <p className="mt-2 text-xs text-slate-500">{payout.created_at ? new Date(payout.created_at).toLocaleString() : ''}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'manuals' && <ManualDownload userType="doctor" />}

      {activeTab === 'availability' && <DoctorAvailabilityManager doctor={doctor} />}

      {activeTab === 'community' && (
        <DoctorCommunityChat
          sender={{
            id: doctor.id,
            name: doctor.name,
            type: 'doctor',
            phone: doctor.phone,
          }}
        />
      )}

      {/* Referrals Tab */}
      {activeTab === 'referrals' && (
        <div className="space-y-8">
          <SpecialtyReferralInbox doctor={doctor} onAcceptReferral={openAcceptedReferralWorkspace} />
          <FacilityReferralManager doctor={doctor} />
        </div>
      )}

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <div className="space-y-8">
          <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Consultation Control Center</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Patients appear here automatically when they start a live consultation or when a facility selects you.
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Showing {consultationPatients.length} of {consultationPatientTotal}.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={consultationPatientSearch}
                  onChange={(e) => {
                    setConsultationPatientLimit(10)
                    setConsultationPatientSearch(e.target.value)
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 sm:w-80"
                  placeholder="Search patient ID, name, phone"
                />
                <button
                  type="button"
                  onClick={() => loadConsultationPatients(consultationPatientLimit, consultationPatientSearch)}
                  disabled={loadingConsultationPatients}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {loadingConsultationPatients ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-brand-100 bg-brand-50 p-6">
              {selectedConsultationPatient && selectedConsultation ? (
                <>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: adminSpecialtyInfo.color }}>
                        Active patient workspace
                      </p>
                      <h4 className="mt-1 text-2xl font-bold text-slate-900">{selectedConsultationPatient.name || 'Unnamed patient'}</h4>
                      <p className="mt-1 text-sm text-slate-600">
                        Patient ID: {selectedConsultationPatient.id} | Consultation ID: {selectedConsultation.id}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">
                      {selectedConsultation.status || 'in_progress'}
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <span className="rounded-2xl bg-white/70 px-5 py-3 text-sm font-semibold text-slate-600 ring-1 ring-brand-100">
                      Video stays open below. Use the consultation tools under the video.
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">No patient selected</p>
                    <p className="mt-1 text-sm text-slate-600">Press Show patients, select one patient, then open video, chat, vitals, prescription, labs, record review, or specialty referral.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWorkspacePanel('patients')}
                    className="rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600"
                  >
                    Show patients
                  </button>
                </div>
              )}
            </div>
          </div>

          {workspacePanel === 'patients' && (
            <WorkspaceModal
              title="Select Patient"
              subtitle="Choose the patient to open for consultation."
              onClose={() => setWorkspacePanel('')}
              size="max-w-5xl"
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={consultationPatientSearch}
                  onChange={(e) => {
                    setConsultationPatientLimit(10)
                    setConsultationPatientSearch(e.target.value)
                  }}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
                  placeholder="Search patient ID, name, phone"
                />
                <button
                  type="button"
                  onClick={() => loadConsultationPatients(consultationPatientLimit, consultationPatientSearch)}
                  disabled={loadingConsultationPatients}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {loadingConsultationPatients ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              <div className="mt-5 space-y-5">
                {consultationPatients.length === 0 ? (
                  <div className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-600">No active consultation patients yet.</div>
                ) : (
                  consultationPatientSections.map((section) => (
                    <div key={section.title}>
                      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">{section.title}</h4>
                          <p className="text-xs font-semibold text-slate-500">{section.subtitle}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{section.patients.length} patient{section.patients.length === 1 ? '' : 's'}</span>
                      </div>
                      <div className="grid gap-3">
                        {section.patients.map((patient, index) => (
                          <button
                            key={patient.latest_consultation?.id || patient.id}
                            type="button"
                            onClick={() => openPatientWorkspace(patient, 'video')}
                            className={`rounded-3xl border p-5 text-left transition hover:border-brand-200 ${
                              patient.video_waiting
                                ? 'border-emerald-200 bg-emerald-50'
                                : patient.source === 'facility'
                                  ? 'border-sky-200 bg-sky-50'
                                  : 'border-slate-200 bg-slate-50'
                            }`}
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                <p className="text-sm font-black uppercase tracking-[0.18em]" style={{ color: adminSpecialtyInfo.color }}>
                                  {getPatientSourceLabel(patient, index)}
                                </p>
                                <h4 className="mt-1 text-lg font-bold text-slate-900">{patient.name || 'Unnamed patient'}</h4>
                                <p className="mt-1 text-xs font-semibold text-slate-500">ID: {patient.id}</p>
                                {patient.facility_id && (
                                  <p className="mt-1 text-xs font-semibold text-slate-500">
                                    Facility: {patient.facility_name || patient.facility_id}
                                    {patient.facility_type ? ` (${patient.facility_type.replace(/_/g, ' ')})` : ''}
                                  </p>
                                )}
                              </div>
                              <div className="text-sm text-slate-600 lg:text-right">
                                <p className="font-semibold text-slate-900">{getPatientChannelLabel(patient)}</p>
                                <div className="mt-2 flex flex-wrap justify-start gap-2 lg:justify-end">
                                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                                    {patient.latest_consultation?.status || 'in_progress'}
                                  </span>
                                  <span className={`rounded-full px-3 py-1 text-xs font-black ${patient.is_online ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                                    {patient.is_online ? 'Patient online' : 'Patient offline'}
                                  </span>
                                  {patient.video_waiting && (
                                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                                      Waiting in room
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </WorkspaceModal>
          )}

          {selectedConsultationPatient && selectedConsultation && (
            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50">
                <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Live Video Consultation</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedConsultationPatient.name || selectedConsultationPatient.id} | {selectedConsultation.id}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWorkspacePanel('patients')}
                    className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Change patient
                  </button>
                </div>
                <VideoChatPanel
                  key={selectedConsultation.id}
                  consultationId={selectedConsultation.id}
                  userId={doctor.id}
                  userType="doctor"
                  patientId={selectedConsultationPatient.id}
                  doctorId={doctor.id}
                />
                <div className="mt-5">
                  <VitalParametersMonitor
                    consultationId={selectedConsultation.id}
                    patientId={selectedConsultationPatient.id}
                    doctorId={doctor.id}
                    userType="doctor"
                    compact
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50">
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Consultation Tools</h3>
                    <p className="mt-1 text-sm text-slate-500">Use these while the video remains open above.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ['chat', 'Chat'],
                      ['vitals', 'Vitals'],
                      ['notes', 'Notes'],
                      ['prescription', 'Prescription'],
                      ['labs', 'Lab request'],
                      ['record', 'Full record'],
                      ['referral', 'Refer specialty'],
                    ].map(([panel, label]) => (
                      <button
                        key={panel}
                        type="button"
                        onClick={() => setActiveConsultTool(panel)}
                        className={`rounded-2xl px-4 py-2 text-sm font-semibold ring-1 ${
                          activeConsultTool === panel
                            ? 'bg-brand-700 text-white ring-brand-700'
                            : 'bg-slate-50 text-slate-700 ring-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeConsultTool === 'chat' && (
                  <ChatPanel consultationId={selectedConsultation.id} userId={doctor.id} userType="doctor" recipientId={selectedConsultationPatient.id} recipientType="patient" patientId={selectedConsultationPatient.id} doctorId={doctor.id} />
                )}
                {activeConsultTool === 'vitals' && (
                  <VitalParametersMonitor consultationId={selectedConsultation.id} patientId={selectedConsultationPatient.id} doctorId={doctor.id} userType="doctor" />
                )}
                {activeConsultTool === 'notes' && (
                  <DoctorPatientNotes patientId={selectedConsultationPatient.id} doctorId={doctor.id} consultationId={selectedConsultation.id} />
                )}
                {activeConsultTool === 'prescription' && (
                  <PrescriptionManager mode="doctor" consultationId={selectedConsultation.id} patientId={selectedConsultationPatient.id} patientName={selectedConsultationPatient.name} doctor={doctor} facilityId={selectedConsultation.facility_id} />
                )}
                {activeConsultTool === 'labs' && (
                  <LabRequestManager mode="doctor" consultationId={selectedConsultation.id} patientId={selectedConsultationPatient.id} patientName={selectedConsultationPatient.name} doctor={doctor} />
                )}
                {activeConsultTool === 'referral' && (
                  <DoctorSpecialtyReferralPanel doctor={doctor} patient={selectedConsultationPatient} consultationId={selectedConsultation.id} />
                )}
                {activeConsultTool === 'record' && (
                  <PatientRecordReview initialPatientId={selectedConsultationPatient.id} autoLoad />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <NotificationCenter userId={doctor.id} userType="doctor" />
      )}
    </section>
  )
}

export default AdminDashboard
