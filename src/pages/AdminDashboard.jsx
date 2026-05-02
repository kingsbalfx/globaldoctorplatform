import { useState } from 'react'
import DoctorManagement from '../components/DoctorManagement'
import PatientReviewManager from '../components/PatientReviewManager'
import ReferralManager from '../components/ReferralManager'
import FileManager from '../components/FileManager'
import NotificationCenter from '../components/NotificationCenter'
import AdminSettings from '../components/AdminSettings'
import { getSpecialtyInfo } from '../lib/specialtyRegistry'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

function AdminDashboard({ doctor, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')
  const adminSpecialty = doctor?.specialty || 'General Practice'
  const adminSpecialtyInfo = getSpecialtyInfo(adminSpecialty)
  const adminHeaderStyle = {
    backgroundImage: `linear-gradient(135deg, ${adminSpecialtyInfo.color}, ${adminSpecialtyInfo.bgColor})`,
  }
  const [withdrawing, setWithdrawing] = useState(false)

  const handleWithdraw = async () => {
    if (!window.confirm(`Withdraw ${doctor.earningsTokens} tokens as $${((doctor.earningsTokens / 100) * 10).toFixed(2)}?`)) return
    
    setWithdrawing(true)
    try {
      const response = await fetch(`${API_BASE}/api/doctors/${doctor.id}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      alert('Success: ' + data.message)
      window.location.reload()
    } catch (err) {
      alert(err.message)
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
      {/* Header */}
      <div className="rounded-3xl px-8 py-10 text-white shadow-xl shadow-brand-700/20 mb-8" style={adminHeaderStyle}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold">Admin Portal</h2>
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
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'doctors', label: 'Doctors', icon: '👨‍⚕️' },
          { id: 'reviews', label: 'Reviews', icon: '⭐' },
          { id: 'referrals', label: 'Referrals', icon: '🔄' },
          { id: 'settings', label: 'Settings', icon: '⚙️' },
          { id: 'files', label: 'Files', icon: '📎' },
          { id: 'wallet', label: 'Financials', icon: '💰' },
          { id: 'notifications', label: 'Notifications', icon: '🔔' },
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
            {tab.icon} {tab.label}
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
                    <strong className="text-2xl">${((doctor.earningsTokens || 0) / 10).toFixed(2)}</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm">
                    <span>Profile views</span>
                    <strong className="text-2xl">156</strong>
                  </div>
                </div>
              </div>
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
                <p className="text-5xl font-bold text-brand-900 mt-2">{doctor.earningsTokens || 0}</p>
                <p className="text-brand-600 mt-4 text-sm">Estimated Payout: <span className="font-bold">${((doctor.earningsTokens || 0) / 10).toFixed(2)}</span></p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                <p className="text-slate-600 font-medium">Withdrawal Method</p>
                <p className="text-slate-900 font-bold mt-2">{doctor.bankAccount ? `Bank: ${doctor.bankAccount}` : 'No bank account linked'}</p>
                <p className="text-slate-500 text-xs mt-1">Currency: {doctor.currency || 'USD'}</p>
                <button 
                  disabled={withdrawing || (doctor.earningsTokens || 0) < 50}
                  onClick={handleWithdraw}
                  className="mt-6 w-full bg-brand-700 text-white rounded-2xl py-4 font-bold hover:bg-brand-600 disabled:opacity-50 transition-all"
                >
                  {withdrawing ? 'Processing...' : (doctor.earningsTokens || 0) < 50 ? 'Min. 50 Tokens to Withdraw ($5)' : 'Withdraw to Bank'}
                </button>
              </div>
            </div>
            <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <h4 className="text-blue-900 font-semibold mb-2">Withdrawal Policy</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Payout conversion rate: 10 Tokens = $1 USD.</li>
                <li>• Minimum withdrawal amount is 50 Tokens ($5).</li>
                <li>• Payouts are processed via Kora automatically.</li>
                <li>• Ensure your bank account name matches your registered name.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Doctors Tab */}
      {activeTab === 'doctors' && <DoctorManagement />}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && <PatientReviewManager />}

      {/* Referrals Tab */}
      {activeTab === 'referrals' && <ReferralManager />}

      {/* Files Tab */}
      {activeTab === 'files' && <FileManager />}
      {/* Settings Tab */}
      {activeTab === 'settings' && <AdminSettings />}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <NotificationCenter userId={doctor.id} userType="doctor" />
      )}
    </section>
  )
}

export default AdminDashboard
