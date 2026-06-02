import { useEffect, useState } from 'react'
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
  const adminSpecialty = doctor?.specialty || 'General Practitioner'
  const adminSpecialtyInfo = getSpecialtyInfo(adminSpecialty)
  const adminHeaderStyle = {
    backgroundImage: `linear-gradient(135deg, ${adminSpecialtyInfo.color}, ${adminSpecialtyInfo.bgColor})`,
  }
  const [withdrawing, setWithdrawing] = useState(false)
  const [savingPayoutDetails, setSavingPayoutDetails] = useState(false)
  const [withdrawalResult, setWithdrawalResult] = useState(null)
  const minWithdrawTokens = 50
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
  const earningsTokens = Number(financials?.earningsTokens ?? doctor?.earningsTokens ?? doctor?.earnings_tokens ?? 0) || 0
  const estimatedUsd = financials?.estimatedUsd ?? (earningsTokens / 10)

  const loadConsultationPatients = async (limit = consultationPatientLimit, search = consultationPatientSearch) => {
    if (!doctor?.id) return
    setLoadingConsultationPatients(true)
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: '0' })
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
  }, [doctor?.id])

  useEffect(() => {
    if (consultationPatients.some((patient) => patient.latest_consultation?.status === 'in_progress')) {
      setActiveTab('patients')
    }
  }, [consultationPatients])

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
    if (tokens < minWithdrawTokens) {
      addError(`Minimum withdrawal is ${minWithdrawTokens} tokens ($5).`, 'error')
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
        body: JSON.stringify({ tokens })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
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

  return (
    <section className="mx-auto mt-16 max-w-7xl px-6 pb-20 sm:px-8">
      <AnnouncementBanner audience="doctor" />
      {/* Header */}
      <div className="rounded-3xl px-8 py-10 text-white shadow-xl shadow-brand-700/20 mb-8" style={adminHeaderStyle}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold">Doctor Dashboard</h2>
            <p className="text-brand-100 mt-2">Welcome back, Dr. {doctor.name}</p>
            <p className="mt-2 inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white">
              {adminSpecialtyInfo.logo} {adminSpecialty}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-full bg-white/20 hover:bg-white/30 px-6 py-3 text-sm font-semibold text-white transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: 'Stats' },
          { id: 'community', label: 'Community', icon: 'Chat' },
          { id: 'referrals', label: 'Referrals', icon: 'Flow' },
          { id: 'patients', label: 'Patients', icon: 'Records' },
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
                    min={minWithdrawTokens}
                    step="1"
                    value={withdrawTokenAmount}
                    onChange={(e) => setWithdrawTokenAmount(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-300"
                    placeholder={`Minimum ${minWithdrawTokens}`}
                  />
                  <p className="mt-2 text-xs text-brand-700/90">Minimum withdrawal: {minWithdrawTokens} tokens ($5). Conversion: 10 tokens = $1.</p>
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
                      disabled={withdrawing || earningsTokens < minWithdrawTokens}
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
                <li>Conversion rate: 10 Tokens = $1 USD.</li>
                <li>Minimum withdrawal amount is 50 Tokens ($5).</li>
                <li>Payouts are processed via Kora when configured.</li>
                <li>Ensure payout details match your registered identity.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'manuals' && <ManualDownload userType="doctor" />}

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
              <div className="mt-5 grid gap-3">
                {consultationPatients.length === 0 ? (
                  <div className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-600">No active consultation patients yet.</div>
                ) : (
                  consultationPatients.map((patient, index) => (
                    <button
                      key={patient.latest_consultation?.id || patient.id}
                      type="button"
                      onClick={() => openPatientWorkspace(patient, 'video')}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left hover:border-brand-200"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-sm font-black uppercase tracking-[0.18em]" style={{ color: adminSpecialtyInfo.color }}>
                            {patient.source === 'direct_patient' ? 'Direct patient' : `Queue #${index + 1}`}
                          </p>
                          <h4 className="mt-1 text-lg font-bold text-slate-900">{patient.name || 'Unnamed patient'}</h4>
                          <p className="mt-1 text-xs font-semibold text-slate-500">ID: {patient.id}</p>
                        </div>
                        <div className="text-sm text-slate-600 lg:text-right">
                          <p className="font-semibold text-slate-900">{patient.latest_consultation?.channel?.replace(/_/g, ' ') || 'Consultation'}</p>
                          <p className="mt-1 font-bold text-emerald-700">{patient.latest_consultation?.status || 'in_progress'}</p>
                          {patient.video_waiting && <p className="mt-2 text-xs font-black text-emerald-700">Patient waiting to join</p>}
                        </div>
                      </div>
                    </button>
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
