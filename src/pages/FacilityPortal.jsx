import { useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../lib/apiBase'
import VideoChatPanel from '../components/VideoChatPanel'

const FACILITY_TYPES = [
  { id: 'phc', label: 'Primary Health Care (PHC)' },
  { id: 'private_clinic', label: 'Private Clinic' },
  { id: 'lab', label: 'Laboratory' },
]

function computeNetwork() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  const effectiveType = conn?.effectiveType || ''
  const downlink = Number(conn?.downlink || 0)

  let bars = 0
  let label = 'Offline'
  if (navigator.onLine) {
    if (effectiveType === '4g' || downlink >= 10) {
      bars = 4
      label = 'Strong'
    } else if (effectiveType === '3g' || downlink >= 2) {
      bars = 3
      label = 'Good'
    } else if (effectiveType === '2g' || downlink > 0) {
      bars = 2
      label = 'Weak'
    } else {
      bars = 1
      label = 'Poor'
    }
  }

  return { bars, label }
}

function FacilityPortal() {
  const [step, setStep] = useState('login') // login -> dashboard
  const [facilityType, setFacilityType] = useState('phc')
  const [facilities, setFacilities] = useState([])
  const [facilityId, setFacilityId] = useState('')
  const [pin, setPin] = useState('')

  const [facility, setFacility] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])

  const [activeTab, setActiveTab] = useState('consult') // consult | redeem | wallet
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [redeemCode, setRedeemCode] = useState('')
  const [redeemResult, setRedeemResult] = useState(null)

  const [network, setNetwork] = useState(() => computeNetwork())

  const [doctors, setDoctors] = useState([])
  const [doctorLoading, setDoctorLoading] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState('')

  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [patientPin, setPatientPin] = useState('')
  const [createdPatient, setCreatedPatient] = useState(null)

  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [patientRecord, setPatientRecord] = useState(null)

  const [consultation, setConsultation] = useState(null)
  const [consultSplit, setConsultSplit] = useState(null)
  const [durationMin, setDurationMin] = useState(15)

  const facilityLabel = useMemo(() => {
    return FACILITY_TYPES.find((t) => t.id === facilityType)?.label || 'Facility'
  }, [facilityType])

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

  useEffect(() => {
    const handle = () => setNetwork(computeNetwork())
    window.addEventListener('online', handle)
    window.addEventListener('offline', handle)
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    conn?.addEventListener?.('change', handle)
    return () => {
      window.removeEventListener('online', handle)
      window.removeEventListener('offline', handle)
      conn?.removeEventListener?.('change', handle)
    }
  }, [])

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
      setCreatedPatient(null)
      setPatientRecord(null)
      setConsultation(null)
      setConsultSplit(null)
      setActiveTab('consult')
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

  const loadOnlineDoctors = async () => {
    setDoctorLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/doctors?online=true`)
      const data = await response.json().catch(() => ({}))
      const list = Array.isArray(data.doctors) ? data.doctors : []
      setDoctors(list)
      if (!selectedDoctorId && list.length > 0) setSelectedDoctorId(list[0].id)
    } catch {
      setDoctors([])
    } finally {
      setDoctorLoading(false)
    }
  }

  useEffect(() => {
    if (step !== 'dashboard') return
    if (facility?.type === 'phc' || facility?.type === 'private_clinic') {
      void loadOnlineDoctors()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, facility?.id])

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

  const generatePatientPin = () => {
    const value = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0')
    setPatientPin(value)
  }

  const registerPatient = async (event) => {
    event.preventDefault()
    if (!facility?.id) return

    if (!patientName.trim()) {
      setError('Enter patient full name.')
      return
    }
    if (!/^[0-9]{6}$/.test(patientPin.trim())) {
      setError('Patient PIN must be a 6-digit number.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/api/patients/facility/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: facility.id,
          facilityPin: pin.trim(),
          name: patientName.trim(),
          phone: patientPhone.trim(),
          patientPin: patientPin.trim(),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to register patient')
      setCreatedPatient(data)
      setSelectedPatientId(data.patient?.id || '')
      setPatientRecord(null)
      setPatientName('')
      setPatientPhone('')
      setPatientPin('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadPatientRecord = async () => {
    if (!selectedPatientId.trim()) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/api/patients/${encodeURIComponent(selectedPatientId.trim())}/record`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to load patient record')
      setPatientRecord(data)
    } catch (err) {
      setPatientRecord(null)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const startConsultation = async () => {
    if (!facility?.id) return
    if (!selectedPatientId.trim()) {
      setError('Select or register a patient first.')
      return
    }
    if (!selectedDoctorId) {
      setError('Select a doctor.')
      return
    }

    const channel = facility.type === 'phc' ? 'facility_phc' : 'facility_private'

    setLoading(true)
    setError('')
    setConsultation(null)
    setConsultSplit(null)
    try {
      const response = await fetch(`${API_BASE}/api/consultations/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId.trim(),
          doctorId: selectedDoctorId,
          channel,
          facilityId: facility.id,
          facilityPin: pin.trim(),
          track: 'economy',
          durationMin: Number(durationMin) || 15,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to start consultation')
      setConsultation(data.consultation || null)
      setConsultSplit(data.split || null)
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const endConsultation = async () => {
    if (!consultation?.id) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/api/consultations/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId: consultation.id,
          facilityPin: pin.trim(),
          durationMin: Number(durationMin) || 15,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to complete consultation')
      setConsultation(data.consultation || consultation)
      setConsultSplit(data.split || consultSplit)
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
    setActiveTab('consult')
    setRedeemCode('')
    setRedeemResult(null)
    setDoctors([])
    setSelectedDoctorId('')
    setPatientName('')
    setPatientPhone('')
    setPatientPin('')
    setCreatedPatient(null)
    setSelectedPatientId('')
    setPatientRecord(null)
    setConsultation(null)
    setConsultSplit(null)
    setError('')
  }

  if (step === 'login') {
    return (
      <section className="mx-auto mt-16 max-w-3xl px-6 pb-20 sm:px-8">
        <div className="rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/50">
          <h1 className="text-3xl font-bold text-slate-900">Facility Portal</h1>
          <p className="mt-2 text-slate-600">
            For PHC nurses/OCs, private clinics, and labs. Select your facility and enter your 6-digit PIN.
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
                <option value="">{loading ? 'Loading…' : 'Choose one'}</option>
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
              className="w-full rounded-2xl bg-brand-700 px-5 py-4 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </section>
    )
  }

  const canConsult = facility?.type === 'phc' || facility?.type === 'private_clinic'

  return (
    <section className="mx-auto mt-16 max-w-6xl px-6 pb-20 sm:px-8">
      <div className="rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{facility?.name || 'Facility'}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {facility?.type?.replace(/_/g, ' ') || ''} {facility?.state ? `• ${facility.state}` : ''}{' '}
              {facility?.lga ? `• ${facility.lga}` : ''}
            </p>
            <div className="mt-3 inline-flex items-center gap-3 rounded-full bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700">
              <span>Network</span>
              <div className="flex items-end gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <span
                    key={n}
                    className={`w-1.5 rounded-sm ${n <= network.bars ? 'bg-emerald-600' : 'bg-slate-200'}`}
                    style={{ height: 6 + n * 4 }}
                  />
                ))}
              </div>
              <span className="text-slate-500">{network.label}</span>
            </div>
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

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setActiveTab('consult')}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'consult' ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Start Consultation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('redeem')}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'redeem' ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Redeem Referral
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wallet')}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'wallet' ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Wallet Activity
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {activeTab === 'consult' && (
          <div className="mt-8">
            {!canConsult ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700">
                This facility type does not start consultations. Use “Redeem Referral” or “Wallet Activity”.
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <h2 className="text-lg font-semibold text-slate-900">1) Register patient</h2>
                  <p className="mt-1 text-sm text-slate-600">Create a Patient ID + 6-digit PIN (no email required).</p>

                  <form onSubmit={registerPatient} className="mt-4 space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">
                      Full name
                      <input
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                        placeholder="Patient full name"
                      />
                    </label>

                    <label className="block text-sm font-semibold text-slate-700">
                      Phone (optional)
                      <input
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                        placeholder="080..."
                      />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                      <label className="block text-sm font-semibold text-slate-700">
                        6-digit patient PIN
                        <input
                          inputMode="numeric"
                          value={patientPin}
                          onChange={(e) => setPatientPin(e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold tracking-wider text-slate-900 outline-none focus:border-brand-500"
                          placeholder="123456"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={generatePatientPin}
                        className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Generate
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                    >
                      {loading ? 'Registering…' : 'Register patient'}
                    </button>
                  </form>

                  {createdPatient?.patient?.id && (
                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <p className="text-sm font-semibold text-emerald-900">Patient created</p>
                      <p className="mt-2 text-sm text-emerald-900">
                        Patient ID: <span className="font-bold">{createdPatient.patient.id}</span>
                      </p>
                      <p className="mt-1 text-sm text-emerald-900">
                        PIN: <span className="font-bold">{createdPatient.login?.pin}</span>
                      </p>
                      <p className="mt-2 text-xs text-emerald-900/80">
                        Patient can log in via Patient Portal → “Clinic / PHC PIN”.
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <h2 className="text-lg font-semibold text-slate-900">2) Select doctor & start consult</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Choose any doctor currently online. You can start the video call after starting the consultation.
                  </p>

                  <div className="mt-4 grid gap-3">
                    <label className="text-sm font-semibold text-slate-700">
                      Patient ID
                      <div className="mt-2 flex gap-2">
                        <input
                          value={selectedPatientId}
                          onChange={(e) => setSelectedPatientId(e.target.value)}
                          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                          placeholder="patient-..."
                        />
                        <button
                          type="button"
                          onClick={loadPatientRecord}
                          disabled={loading}
                          className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                        >
                          Load
                        </button>
                      </div>
                    </label>

                    {patientRecord?.patient && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        <p className="font-semibold text-slate-900">{patientRecord.patient.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{patientRecord.patient.id}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          Files: {patientRecord.files?.length || 0} • Referrals:{' '}
                          {patientRecord.referrals?.facility?.length || 0}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-semibold text-slate-700">Online doctors</p>
                      <div className="mt-3 grid gap-2">
                        {doctorLoading ? (
                          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Loading doctors…</div>
                        ) : doctors.length === 0 ? (
                          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                            No doctors online right now.
                          </div>
                        ) : (
                          doctors.slice(0, 12).map((doc) => {
                            const selected = selectedDoctorId === doc.id
                            return (
                              <button
                                key={doc.id}
                                type="button"
                                onClick={() => setSelectedDoctorId(doc.id)}
                                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                                  selected
                                    ? 'border-brand-500 bg-brand-50'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">{doc.name}</p>
                                    <p className="text-xs text-slate-600">{doc.specialty}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                                      Online
                                    </span>
                                    <div className="relative h-6 w-10 rounded-full bg-slate-200 p-1">
                                      <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-emerald-600" />
                                    </div>
                                  </div>
                                </div>
                              </button>
                            )
                          })
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={loadOnlineDoctors}
                        className="mt-3 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        Refresh list
                      </button>
                    </div>

                    <label className="text-sm font-semibold text-slate-700">
                      Duration (minutes)
                      <input
                        type="number"
                        min="5"
                        step="5"
                        value={durationMin}
                        onChange={(e) => setDurationMin(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={startConsultation}
                      disabled={loading}
                      className="rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                      {loading ? 'Starting…' : 'Start consultation'}
                    </button>
                  </div>

                  {consultation?.id && (
                    <div className="mt-6 rounded-3xl border border-indigo-200 bg-indigo-50 p-5">
                      <p className="text-sm font-semibold text-indigo-900">Consultation started</p>
                      <p className="mt-1 text-xs text-indigo-900/80">ID: {consultation.id}</p>
                      <div className="mt-3 grid gap-2 text-sm text-indigo-900 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white px-4 py-3">
                          <p className="text-xs text-slate-500">Total</p>
                          <p className="text-lg font-bold">₦{consultSplit?.total_ngn ?? consultation.total_ngn}</p>
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-3">
                          <p className="text-xs text-slate-500">Patient copay</p>
                          <p className="text-lg font-bold">₦{consultSplit?.patient_copay_ngn ?? 0}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={endConsultation}
                        disabled={loading || consultation.status === 'completed'}
                        className="mt-4 w-full rounded-2xl bg-indigo-700 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
                      >
                        {consultation.status === 'completed' ? 'Completed' : 'End & record split'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {consultation?.id && (
              <div className="mt-6">
                <VideoChatPanel
                  consultationId={consultation.id}
                  userId={facility?.id || ''}
                  userType="facility"
                  patientId={selectedPatientId.trim()}
                  doctorId={selectedDoctorId}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'redeem' && (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-6 border border-slate-200">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Wallet balance</p>
              <p className="mt-2 text-4xl font-bold text-slate-900">₦{wallet?.balance_ngn ?? 0}</p>
              <p className="mt-2 text-xs text-slate-500">Used for PHC topups, referral payouts, and lab settlements.</p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-6 border border-slate-200 lg:col-span-2">
              <h2 className="text-lg font-semibold text-slate-900">Redeem referral code</h2>
              <p className="mt-1 text-sm text-slate-600">Enter the code shown on the patient&apos;s paper or phone.</p>

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
            </div>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="mt-8">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-6 border border-slate-200">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Wallet balance</p>
                <p className="mt-2 text-4xl font-bold text-slate-900">₦{wallet?.balance_ngn ?? 0}</p>
                <p className="mt-2 text-xs text-slate-500">Updated on refresh.</p>
              </div>
              <div className="rounded-3xl bg-white p-6 border border-slate-200 lg:col-span-2">
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
                            <td
                              className={`px-4 py-3 font-semibold ${
                                tx.direction === 'credit' ? 'text-emerald-700' : 'text-red-700'
                              }`}
                            >
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
          </div>
        )}
      </div>
    </section>
  )
}

export default FacilityPortal

