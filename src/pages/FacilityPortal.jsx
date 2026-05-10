import { useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../lib/apiBase'

const FACILITY_TYPES = [
  { id: 'phc', label: 'Primary Health Care (PHC)' },
  { id: 'private_clinic', label: 'Private Clinic' },
  { id: 'lab', label: 'Laboratory' },
]

function FacilityPortal() {
  const [step, setStep] = useState('login') // login -> dashboard
  const [facilityType, setFacilityType] = useState('phc')
  const [facilities, setFacilities] = useState([])
  const [facilityId, setFacilityId] = useState('')
  const [pin, setPin] = useState('')

  const [facility, setFacility] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [redeemCode, setRedeemCode] = useState('')
  const [redeemResult, setRedeemResult] = useState(null)

  const loadFacilities = async (type) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/api/facilities?type=${encodeURIComponent(type)}`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to load facilities')
      setFacilities(Array.isArray(data.facilities) ? data.facilities : [])
      setFacilityId('')
    } catch (err) {
      setFacilities([])
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadFacilities(facilityType)
  }, [facilityType])

  const login = async (event) => {
    event.preventDefault()
    if (!facilityId || !pin.trim()) {
      setError('Select a facility and enter the 6-digit PIN.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/api/facilities/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityId, pin: pin.trim() }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Login failed')

      setFacility(data.facility || null)
      setWallet(data.wallet || null)
      setTransactions(Array.isArray(data.transactions) ? data.transactions : [])
      setStep('dashboard')
      setRedeemResult(null)
      setRedeemCode('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    if (!facility?.id) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/api/facilities/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityId: facility.id, pin: pin.trim() }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Refresh failed')
      setWallet(data.wallet || null)
      setTransactions(Array.isArray(data.transactions) ? data.transactions : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const redeem = async (event) => {
    event.preventDefault()
    if (!facility?.id) return
    if (!redeemCode.trim()) {
      setError('Enter a referral code.')
      return
    }

    setLoading(true)
    setError('')
    setRedeemResult(null)
    try {
      const response = await fetch(`${API_BASE}/api/referrals/facility/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: facility.id,
          pin: pin.trim(),
          code: redeemCode.trim().toUpperCase(),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Redeem failed')
      setRedeemResult(data.referral || null)
      setRedeemCode('')
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setStep('login')
    setFacility(null)
    setWallet(null)
    setTransactions([])
    setRedeemCode('')
    setRedeemResult(null)
    setError('')
  }

  const facilityLabel = useMemo(() => {
    return FACILITY_TYPES.find((t) => t.id === facilityType)?.label || 'Facility'
  }, [facilityType])

  if (step === 'login') {
    return (
      <section className="mx-auto mt-16 max-w-3xl px-6 pb-20 sm:px-8">
        <div className="rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/50">
          <h1 className="text-3xl font-bold text-slate-900">Facility Portal</h1>
          <p className="mt-2 text-slate-600">
            For PHC nurses/OCs, clinics, and labs. Select your facility and enter your 6-digit PIN.
          </p>

          <form onSubmit={login} className="mt-8 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Facility type
              <select
                value={facilityType}
                onChange={(e) => setFacilityType(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
              >
                {FACILITY_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Select {facilityLabel}
              <select
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
              >
                <option value="">{loading ? 'Loading...' : 'Choose one'}</option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} {f.state ? `- ${f.state}` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              PIN
              <input
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                placeholder="6-digit PIN"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto mt-16 max-w-7xl px-6 pb-20 sm:px-8">
      <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{facility?.name || 'Facility'}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {facility?.type?.replace(/_/g, ' ') || ''} {facility?.state ? `• ${facility.state}` : ''}{' '}
              {facility?.lga ? `• ${facility.lga}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={refresh}
              className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              disabled={loading}
            >
              Refresh
            </button>
            <button
              onClick={logout}
              className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-6 border border-slate-200">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Wallet balance</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">₦{wallet?.balance_ngn ?? 0}</p>
            <p className="mt-2 text-xs text-slate-500">Used for PHC topups, referral payouts, and lab settlements.</p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-6 border border-slate-200 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">Redeem referral code</h2>
            <p className="mt-1 text-sm text-slate-600">Enter the code shown on the patient’s paper or phone.</p>

            <form onSubmit={redeem} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg font-semibold tracking-wider text-slate-900 outline-none focus:border-brand-500"
                placeholder="GD-PHC-ABC123"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-brand-700 px-6 py-4 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
              >
                Redeem
              </button>
            </form>

            {redeemResult && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
                <p className="text-sm font-semibold">Redeemed</p>
                <p className="mt-1 text-sm">Code: {redeemResult.code}</p>
                <p className="mt-1 text-sm">Payout: ₦{redeemResult.payout_ngn || 0}</p>
              </div>
            )}

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">Recent wallet activity</h3>
            <span className="text-xs text-slate-500">Showing latest 20</span>
          </div>

          {transactions.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-6 text-slate-600">No wallet activity yet.</div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="bg-white">
                      <td className="px-4 py-3 text-slate-600">{new Date(tx.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{tx.direction}</td>
                      <td className={`px-4 py-3 font-semibold ${tx.direction === 'credit' ? 'text-emerald-700' : 'text-red-700'}`}>
                        {tx.direction === 'credit' ? '+' : '-'}₦{tx.amount_ngn}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{tx.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default FacilityPortal

