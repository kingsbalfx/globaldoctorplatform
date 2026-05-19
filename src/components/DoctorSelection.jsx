import { useEffect, useMemo, useState } from 'react'
import { Search, Stethoscope, WalletCards } from 'lucide-react'
import { API_BASE } from '../lib/apiBase'

const consultationTypes = [
  { id: 'basic', label: 'Basic', tokens: 50, description: 'Focused visit for common concerns.' },
  { id: 'premium', label: 'Premium', tokens: 100, description: 'Extended visit with specialist review.' },
]

function DoctorSelection({ patient, onDoctorSelected }) {
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscriptionType, setSubscriptionType] = useState('basic')
  const [tokens, setTokens] = useState(patient?.tokens || 0)
  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [showPurchase, setShowPurchase] = useState(false)
  const [purchaseUSD, setPurchaseUSD] = useState(10)
  const [purchaseLoading, setPurchaseLoading] = useState(false)

  useEffect(() => {
    void fetchDoctors()
    void fetchPatientTokens()
  }, [])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/doctors`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to load doctors')
      const sortedDoctors = (data.doctors || []).sort((a, b) => Number(Boolean(b.isOnline)) - Number(Boolean(a.isOnline)))
      setDoctors(sortedDoctors)
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientTokens = async () => {
    if (!patient?.id) return
    try {
      const response = await fetch(`${API_BASE}/api/patients/${encodeURIComponent(patient.id)}/tokens`)
      const data = await response.json().catch(() => ({}))
      if (response.ok) setTokens(data.tokens || 0)
    } catch (error) {
      console.error('Failed to fetch tokens:', error)
    }
  }

  const specialties = useMemo(() => {
    return Array.from(new Set(doctors.map((doctor) => doctor.specialty).filter(Boolean))).sort()
  }, [doctors])

  const filteredDoctors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return doctors.filter((doctor) => {
      const matchesSpecialty = !specialty || doctor.specialty === specialty
      const fields = [doctor.name, doctor.specialty, doctor.location, ...(doctor.languages || [])]
        .join(' ')
        .toLowerCase()
      const matchesQuery = !normalizedQuery || fields.includes(normalizedQuery)
      return matchesSpecialty && matchesQuery
    })
  }, [doctors, query, specialty])

  const selectedType = consultationTypes.find((item) => item.id === subscriptionType) || consultationTypes[0]

  const getDoctorPrice = (doctor, type = subscriptionType) => {
    if (!doctor) return selectedType.tokens
    return Number(doctor.price?.[type] || selectedType.tokens)
  }

  const selectedPrice = getDoctorPrice(selectedDoctor)
  const canAffordSelected = Boolean(selectedDoctor) && tokens >= selectedPrice

  const handleGeneralDoctor = () => {
    const generalDoctor =
      doctors.find((doctor) => ['General Practitioner', 'General Practice'].includes(doctor.specialty)) ||
      doctors[0] || {
        id: 'general',
        name: 'General Doctor',
        specialty: 'General Practitioner',
        location: 'GlobalDoc virtual desk',
        languages: ['English'],
        rating: 4.8,
        price: { basic: 50, premium: 100 },
        isOnline: true,
        isVirtual: true,
      }
    setSelectedDoctor(generalDoctor)
  }

  const handleConfirmSelection = () => {
    if (!selectedDoctor) return
    if (!canAffordSelected) {
      setShowPurchase(true)
      return
    }
    onDoctorSelected(selectedDoctor, subscriptionType)
  }

  const handlePurchaseTokens = async () => {
    const amountUSD = Math.max(10, Math.round(Number(purchaseUSD) || 10))
    setPurchaseLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/patients/${encodeURIComponent(patient.id)}/tokens/purchase/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUSD,
          email: patient.email,
          name: patient.name,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Payment initialization failed')
      if (data.checkout_url) window.location.href = data.checkout_url
    } catch (error) {
      alert(error.message)
    } finally {
      setPurchaseLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-brand-700" />
          <p className="mt-4 text-slate-600">Loading available doctors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-200">Patient specialist matching</p>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Choose a specialist that fits the case</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Filter by specialty, pick a consultation type, then continue to appointment scheduling.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="flex items-center gap-3">
                <WalletCards className="h-6 w-6 text-teal-200" aria-hidden="true" />
                <div>
                  <p className="text-xs uppercase text-slate-300">Token balance</p>
                  <p className="text-2xl font-bold">{tokens} tokens</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPurchase((value) => !value)}
                className="mt-4 w-full rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-teal-50"
              >
                {showPurchase ? 'Hide purchase' : 'Buy tokens'}
              </button>
            </div>
          </div>
        </div>

        {showPurchase && (
          <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
              <label className="text-sm font-semibold text-slate-700">
                Token purchase amount (minimum $10)
                <input
                  type="number"
                  min="10"
                  step="1"
                  value={purchaseUSD}
                  onChange={(event) => setPurchaseUSD(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
                />
              </label>
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Expected: <span className="font-bold text-slate-950">{Math.max(10, Number(purchaseUSD) || 10) * 10} tokens</span>
              </div>
              <button
                type="button"
                onClick={handlePurchaseTokens}
                disabled={purchaseLoading}
                className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {purchaseLoading ? 'Starting...' : 'Pay with Kora'}
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Consultation type</h2>
              <div className="mt-4 grid gap-3">
                {consultationTypes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSubscriptionType(item.id)}
                    className={`rounded-xl border p-4 text-left transition ${
                      subscriptionType === item.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-900">{item.label}</span>
                      <span className="text-sm font-bold text-brand-700">{item.tokens} tokens</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Specialty</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSpecialty('')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${!specialty ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  All
                </button>
                {specialties.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSpecialty(item)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${specialty === item ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleGeneralDoctor}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Stethoscope className="h-4 w-4" aria-hidden="true" />
                Start with general doctor
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Available doctors</h2>
                <p className="mt-1 text-sm text-slate-600">{filteredDoctors.length} matching profile(s)</p>
              </div>
              <label className="relative block sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500"
                  placeholder="Search name, city, language"
                />
              </label>
            </div>

            {filteredDoctors.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="font-semibold text-slate-900">No specialist found for this filter.</p>
                <p className="mt-2 text-sm text-slate-600">Clear filters or start with a general doctor for referral guidance.</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {filteredDoctors.map((doctor) => {
                  const price = getDoctorPrice(doctor)
                  const affordable = tokens >= price
                  return (
                    <button
                      key={doctor.id}
                      type="button"
                      onClick={() => setSelectedDoctor(doctor)}
                      className={`rounded-2xl border p-5 text-left transition ${
                        selectedDoctor?.id === doctor.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-lg font-bold text-teal-700">
                            {String(doctor.name || 'D').charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{doctor.name}</p>
                            <p className="text-sm text-slate-600">{doctor.specialty}</p>
                            <p className="mt-1 text-xs text-slate-500">{doctor.location || 'Virtual care'}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${doctor.isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {doctor.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-slate-600">Rating {doctor.rating || 4.8}/5</span>
                        <span className={`text-sm font-bold ${affordable ? 'text-brand-700' : 'text-red-600'}`}>
                          {price} tokens
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {selectedDoctor ? `${selectedDoctor.name} - ${selectedDoctor.specialty}` : 'Select a doctor to continue'}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {selectedDoctor ? `${selectedType.label} consultation: ${selectedPrice} tokens` : 'Specialists appear above after filtering.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleConfirmSelection}
              disabled={!selectedDoctor}
              className="rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {!selectedDoctor ? 'Choose a specialist' : canAffordSelected ? 'Continue to scheduling' : 'Go to subscription'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorSelection
