import { useState, useEffect } from 'react'
import { API_BASE } from '../lib/apiBase'

function DoctorSelection({ patient, onDoctorSelected }) {
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscriptionType, setSubscriptionType] = useState('basic')
  const [tokens, setTokens] = useState(0)

  useEffect(() => {
    fetchDoctors()
    fetchPatientTokens()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/doctors`)
      if (response.ok) {
        const data = await response.json()
        const sortedDoctors = (data.doctors || []).sort((a, b) => {
          return (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0)
        })
        setDoctors(sortedDoctors)
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientTokens = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/patients/${patient.id}/tokens`)
      if (response.ok) {
        const data = await response.json()
        setTokens(data.tokens || 0)
      }
    } catch (error) {
      console.error('Failed to fetch tokens:', error)
    }
  }

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor)
  }

  const handleConfirmSelection = () => {
    if (selectedDoctor) {
      onDoctorSelected(selectedDoctor, subscriptionType)
    }
  }

  const handleGeneralDoctor = () => {
    const generalDoctor = doctors.find(d => d.specialty === 'General Practitioner' || d.specialty === 'General Practice')
    if (generalDoctor) {
      setSelectedDoctor(generalDoctor)
    } else {
      // Create a virtual general doctor if none exists
      const virtualGeneral = {
        id: 'general',
        name: 'General Doctor',
        specialty: 'General Practitioner',
        experience: '10+ years',
        rating: 4.8,
        price: { basic: 50, premium: 100 },
        isVirtual: true
      }
      setSelectedDoctor(virtualGeneral)
    }
  }

  const getDoctorPrice = (doctor, type) => {
    if (!doctor.price) return 0
    return doctor.price[type] || doctor.price.basic || 0
  }

  const canAfford = (doctor, type) => {
    const price = getDoctorPrice(doctor, type)
    return tokens >= price
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-700 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading doctors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Choose Your Doctor</h1>
          <p className="text-slate-600 mt-2">Select a specialist or start with a general practitioner</p>
          <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-slate-600">Your Token Balance: <span className="font-semibold text-brand-700">{tokens} tokens</span></p>
          </div>
        </div>

        {/* Subscription Type Selection */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Choose Subscription Type</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div
              onClick={() => setSubscriptionType('basic')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                subscriptionType === 'basic' ? 'border-brand-500 bg-brand-50' : 'border-slate-200'
              }`}
            >
              <h3 className="font-semibold text-slate-900">Basic Consultation</h3>
              <p className="text-sm text-slate-600 mt-1">Standard consultation with general doctor</p>
              <p className="text-lg font-bold text-brand-700 mt-2">50 tokens</p>
            </div>
            <div
              onClick={() => setSubscriptionType('premium')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                subscriptionType === 'premium' ? 'border-brand-500 bg-brand-50' : 'border-slate-200'
              }`}
            >
              <h3 className="font-semibold text-slate-900">Premium Consultation</h3>
              <p className="text-sm text-slate-600 mt-1">Extended consultation with specialist</p>
              <p className="text-lg font-bold text-brand-700 mt-2">100 tokens</p>
            </div>
          </div>
        </div>

        {/* Quick General Doctor Option */}
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-3xl shadow-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Start with General Doctor</h2>
              <p className="text-brand-100">Get initial assessment and referral to specialists if needed</p>
              <p className="text-lg font-bold mt-2">{subscriptionType === 'basic' ? '50 tokens' : '100 tokens'}</p>
            </div>
            <button
              onClick={handleGeneralDoctor}
              className="bg-white text-brand-700 px-6 py-3 rounded-2xl font-semibold hover:bg-brand-50 transition"
            >
              Select General Doctor
            </button>
          </div>
        </div>

        {/* Doctor Selection */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Choose a Specialist</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                onClick={() => handleDoctorSelect(doctor)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition ${
                  selectedDoctor?.id === doctor.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-brand-700 font-semibold text-lg">
                      {doctor.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{doctor.name}</h3>
                      {doctor.isOnline && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Online
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{doctor.specialty}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-slate-600">Experience: {doctor.experience}</p>
                  <p className="text-sm text-slate-600">Rating: ⭐ {doctor.rating}/5</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Price:</p>
                    <p className="font-semibold text-brand-700">
                      {subscriptionType === 'basic' ? doctor.price?.basic || 50 : doctor.price?.premium || 100} tokens
                    </p>
                  </div>
                  {!canAfford(doctor, subscriptionType) && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      Insufficient tokens
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Doctor Summary */}
        {selectedDoctor && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mt-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Selected Doctor</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-brand-700 font-semibold text-xl">
                    {selectedDoctor.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedDoctor.name}</h3>
                  <p className="text-slate-600">{selectedDoctor.specialty}</p>
                  <p className="text-sm text-slate-500">
                    {subscriptionType === 'basic' ? selectedDoctor.price?.basic || 50 : selectedDoctor.price?.premium || 100} tokens
                  </p>
                </div>
              </div>
              <button
                onClick={handleConfirmSelection}
                disabled={!canAfford(selectedDoctor, subscriptionType)}
                className="bg-brand-700 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm & Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorSelection
