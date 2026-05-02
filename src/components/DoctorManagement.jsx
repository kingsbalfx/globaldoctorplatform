import { useEffect, useState } from 'react'
import { getSpecialtyInfo, getSpecialtyLogo } from '../lib/specialtyRegistry'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
const specialties = ['General Practitioner', 'Neurology', 'Cardiology', 'Dermatology', 'Psychiatry', 'Pediatrics', 'Oncology', 'Orthopedics', 'Obstetrics & GYN', 'Ophthalmology']

function DoctorManagement() {
  const [showForm, setShowForm] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDoctorList()
  }, [])

  const fetchDoctorList = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/doctors`)
      if (!response.ok) throw new Error('Failed to load doctors')
      const data = await response.json()
      setDoctors(data.doctors || [])
    } catch (error) {
      console.error('Failed to fetch doctor list', error)
    }
  }
  const [formData, setFormData] = useState({
    name: '',
    specialty: 'General Practitioner',
    location: '',
    languages: 'English',
    fee: '20',
    licenseNumber: '',
    licenseIssuer: '',
    licenseExpiry: '',
    bankAccount: '',
  })

  const handleAddDoctor = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/admin/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          languages: formData.languages.split(',').map(l => l.trim()),
          consultation_fee: parseFloat(formData.fee),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add doctor')
      }

      const result = await response.json()
      setDoctors([...doctors, result.doctor])
      setFormData({
        name: '',
        specialty: 'Cardiology',
        location: '',
        languages: 'English',
        fee: '50',
        licenseNumber: '',
        licenseIssuer: '',
        licenseExpiry: '',
      })
      setShowForm(false)
      alert('Doctor added successfully!')
    } catch (error) {
      alert('Error adding doctor: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return

    try {
      const response = await fetch(`${API_BASE}/api/admin/doctors/${doctorId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) throw new Error('Failed to delete doctor')
      setDoctors(doctors.filter(d => d.id !== doctorId))
      alert('Doctor deleted successfully!')
    } catch (error) {
      alert('Error deleting doctor: ' + error.message)
    }
  }

  const handleVerifyDoctor = async (doctorId) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/doctors/${doctorId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) throw new Error('Failed to verify doctor')
      const result = await response.json()
      setDoctors(doctors.map(d => d.id === doctorId ? result.doctor : d))
      alert('Doctor verified!')
    } catch (error) {
      alert('Error verifying doctor: ' + error.message)
    }
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Doctor Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-brand-700 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          {showForm ? 'Cancel' : '+ Add Doctor'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddDoctor} className="mb-8 rounded-3xl bg-slate-50 p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
              required
            />
            <select
              value={formData.specialty}
              onChange={(e) => handleChange('specialty', e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
            >
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              type="text"
              placeholder="Bank Account (Routing/Account Number)"
              value={formData.bankAccount}
              onChange={(e) => handleChange('bankAccount', e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
            />
            <input
              type="text"
              placeholder="Location (City, Country)"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
              required
            />
            <input
              type="text"
              placeholder="Languages (comma-separated)"
              value={formData.languages}
              onChange={(e) => handleChange('languages', e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
            />
            <input
              type="text"
              placeholder="License Number"
              value={formData.licenseNumber}
              onChange={(e) => handleChange('licenseNumber', e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
              required
            />
            <input
              type="text"
              placeholder="License Issuer"
              value={formData.licenseIssuer}
              onChange={(e) => handleChange('licenseIssuer', e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
            />
            <input
              type="date"
              placeholder="License Expiry"
              value={formData.licenseExpiry}
              onChange={(e) => handleChange('licenseExpiry', e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
            />
            <input
              type="number"
              placeholder="Consultation Fee ($)"
              value={formData.fee}
              onChange={(e) => handleChange('fee', e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
              step="0.01"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Doctor'}
          </button>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => {
          const specialtyInfo = getSpecialtyInfo(doctor.specialty)
          return (
            <div key={doctor.id} className="rounded-2xl border border-slate-200 p-4 shadow-md hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{getSpecialtyLogo(doctor.specialty)}</div>
                <div className="flex items-center gap-2">
                  {doctor.isOnline && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Online
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${doctor.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {doctor.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
              <h3 className="font-bold text-slate-900">{doctor.name}</h3>
              <p className="text-sm text-slate-600" style={{ color: specialtyInfo.color }}>
                {specialtyInfo.name}
              </p>
              <p className="text-xs text-slate-500 mt-2">{doctor.location}</p>
              <p className="text-xs text-slate-500">License: {doctor.license_number}</p>
              <p className="text-sm font-semibold text-slate-900 mt-3">{doctor.consultation_fee || doctor.fee} Tokens/consult</p>
              <p className="text-xs font-medium text-green-600">Earned: {doctor.earningsTokens?.toFixed(1) || 0} Tokens</p>
              <div className="flex gap-2 mt-4">
                {!doctor.verified && (
                  <button
                    onClick={() => handleVerifyDoctor(doctor.id)}
                    className="flex-1 rounded-full bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                  >
                    Verify
                  </button>
                )}
                <button
                  onClick={() => handleDeleteDoctor(doctor.id)}
                  className="flex-1 rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DoctorManagement
