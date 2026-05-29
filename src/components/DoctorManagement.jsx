import { useEffect, useMemo, useState } from 'react'
import { getSpecialtyInfo, getSpecialtyLogo } from '../lib/specialtyRegistry'
import { apiFetch } from '../lib/apiFetch'

const specialties = ['General Practitioner', 'Neurology', 'Urology', 'Cardiology', 'Dermatology', 'Psychiatry', 'Pediatrics', 'Oncology', 'Orthopedics', 'Obstetrics & GYN', 'Ophthalmology']

const emptyForm = {
  id: '',
  email: '',
  password: '',
  name: '',
  specialty: 'General Practitioner',
  location: '',
  languages: 'English',
  fee: '50',
  licenseNumber: '',
  licenseIssuer: '',
  licenseExpiry: '',
  bankCode: '',
  bankAccount: '',
  currency: '',
}

function doctorToForm(doctor) {
  return {
    id: doctor.id || '',
    email: doctor.email || '',
    password: '',
    name: doctor.name || '',
    specialty: doctor.specialty || 'General Practitioner',
    location: doctor.location || '',
    languages: Array.isArray(doctor.languages) ? doctor.languages.join(', ') : 'English',
    fee: String(doctor.fee || doctor.consultation_fee || 50),
    licenseNumber: doctor.license_number || doctor.licenseNumber || '',
    licenseIssuer: doctor.license_issuer || '',
    licenseExpiry: doctor.license_expiry ? String(doctor.license_expiry).slice(0, 10) : '',
    bankCode: doctor.bank_code || '',
    bankAccount: doctor.bank_account || '',
    currency: doctor.currency || '',
  }
}

function DoctorManagement({ adminHeaders }) {
  const [showForm, setShowForm] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(emptyForm)

  const canManage = Boolean(adminHeaders)
  const pendingDoctors = useMemo(() => doctors.filter((doctor) => !doctor.verified), [doctors])
  const approvedDoctors = useMemo(() => doctors.filter((doctor) => doctor.verified), [doctors])

  useEffect(() => {
    if (canManage) void fetchDoctorList()
  }, [canManage])

  const fetchDoctorList = async () => {
    setLoading(true)
    try {
      const response = await apiFetch('/api/admin/doctors', { headers: adminHeaders })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to load doctors')
      setDoctors(Array.isArray(data.doctors) ? data.doctors : [])
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData(emptyForm)
    setShowForm(false)
  }

  const handleEdit = (doctor) => {
    setFormData(doctorToForm(doctor))
    setShowForm(true)
  }

  const handleSubmitDoctor = async (event) => {
    event.preventDefault()
    setLoading(true)

    const editing = Boolean(formData.id)
    try {
      const response = await apiFetch(editing ? `/api/admin/doctors/${encodeURIComponent(formData.id)}` : '/api/admin/doctors', {
        method: editing ? 'PATCH' : 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          ...formData,
          languages: formData.languages.split(',').map((item) => item.trim()).filter(Boolean),
          consultation_fee: Number(formData.fee) || 50,
        }),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Failed to save doctor')
      await fetchDoctorList()
      resetForm()
      alert(editing ? 'Doctor updated.' : 'Doctor added, approved, and notified by email when SMTP is configured.')
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm('Delete this doctor account and profile?')) return
    setLoading(true)
    try {
      const response = await apiFetch(`/api/admin/doctors/${encodeURIComponent(doctorId)}`, {
        method: 'DELETE',
        headers: adminHeaders,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to delete doctor')
      setDoctors((current) => current.filter((doctor) => doctor.id !== doctorId))
      alert('Doctor deleted.')
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveDoctor = async (doctorId) => {
    setLoading(true)
    try {
      const response = await apiFetch(`/api/admin/doctors/${encodeURIComponent(doctorId)}/verify`, {
        method: 'PATCH',
        headers: adminHeaders,
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Failed to approve doctor')
      setDoctors((current) => current.map((doctor) => doctor.id === doctorId ? result.doctor : doctor))
      alert(result.email?.sent ? 'Doctor approved and email sent.' : `Doctor approved. Email notice was not sent: ${result.email?.reason || 'SMTP not configured'}`)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!canManage) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
        <h2 className="text-2xl font-bold text-slate-900">Doctor Management</h2>
        <p className="mt-2 text-sm text-red-700">Only the platform admin can create, edit, approve, or delete doctors.</p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Doctor Management</h2>
          <p className="mt-1 text-sm text-slate-600">Review registrations, approve access, and manage doctor profiles.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={fetchDoctorList} className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Refresh
          </button>
          <button onClick={() => setShowForm((value) => !value)} className="rounded-full bg-brand-700 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600">
            {showForm ? 'Close form' : 'Add doctor'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmitDoctor} className="mt-6 rounded-3xl bg-slate-50 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input type="email" placeholder="Login email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" required={!formData.id} />
            <input type="text" placeholder={formData.id ? 'New password (optional)' : 'Login password'} value={formData.password} onChange={(e) => handleChange('password', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" required={!formData.id} />
            <input type="text" placeholder="Full name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" required />
            <select value={formData.specialty} onChange={(e) => handleChange('specialty', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500">
              {specialties.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <input type="text" placeholder="Location / country" value={formData.location} onChange={(e) => handleChange('location', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" required />
            <input type="text" placeholder="Languages, comma separated" value={formData.languages} onChange={(e) => handleChange('languages', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" />
            <input type="text" placeholder="License number" value={formData.licenseNumber} onChange={(e) => handleChange('licenseNumber', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" required />
            <input type="text" placeholder="License issuer / council" value={formData.licenseIssuer} onChange={(e) => handleChange('licenseIssuer', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" />
            <input type="date" value={formData.licenseExpiry} onChange={(e) => handleChange('licenseExpiry', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" />
            <input type="number" placeholder="Consultation fee" value={formData.fee} onChange={(e) => handleChange('fee', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" required />
            <input type="text" placeholder="Bank code" value={formData.bankCode} onChange={(e) => handleChange('bankCode', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" />
            <input type="text" placeholder="Bank account" value={formData.bankAccount} onChange={(e) => handleChange('bankAccount', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" disabled={loading} className="rounded-2xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
              {loading ? 'Saving...' : formData.id ? 'Save doctor' : 'Create approved doctor'}
            </button>
            <button type="button" onClick={resetForm} className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100">
              Cancel
            </button>
          </div>
        </form>
      )}

      <DoctorGrid title={`Pending review (${pendingDoctors.length})`} doctors={pendingDoctors} onApprove={handleApproveDoctor} onEdit={handleEdit} onDelete={handleDeleteDoctor} />
      <DoctorGrid title={`Approved doctors (${approvedDoctors.length})`} doctors={approvedDoctors} onApprove={handleApproveDoctor} onEdit={handleEdit} onDelete={handleDeleteDoctor} />
    </div>
  )
}

function DoctorGrid({ title, doctors, onApprove, onEdit, onDelete }) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {doctors.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No doctors in this group.</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => {
            const specialtyInfo = getSpecialtyInfo(doctor.specialty)
            return (
              <div key={doctor.id} className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="text-3xl">{getSpecialtyLogo(doctor.specialty)}</div>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${doctor.verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {doctor.verified ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900">{doctor.name}</h4>
                <p className="text-sm font-medium" style={{ color: specialtyInfo.color }}>{specialtyInfo.name}</p>
                <p className="mt-2 text-xs text-slate-500">{doctor.email}</p>
                <p className="text-xs text-slate-500">{doctor.location}</p>
                <p className="mt-2 text-xs text-slate-600">License: {doctor.license_number || 'Not supplied'}</p>
                <p className="text-xs text-slate-600">Fee: {doctor.fee || doctor.consultation_fee || 50}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {!doctor.verified && (
                    <button onClick={() => onApprove(doctor.id)} className="rounded-full bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700">
                      Approve
                    </button>
                  )}
                  <button onClick={() => onEdit(doctor)} className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                    Edit
                  </button>
                  <button onClick={() => onDelete(doctor.id)} className="rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700">
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DoctorManagement
