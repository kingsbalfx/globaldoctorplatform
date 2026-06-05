import { useEffect, useMemo, useState } from 'react'
import { getSpecialtyInfo, getSpecialtyLogo } from '../lib/specialtyRegistry'
import { apiFetch } from '../lib/apiFetch'
import { useError } from '../components/ErrorHandler'
import { COUNTRIES } from './DoctorAuth'

const specialties = ['General Practitioner', 'Neurology', 'Urology', 'Gynaecologist', 'Cardiology', 'Dermatology', 'Psychiatry', 'Pediatrics', 'Oncology', 'Orthopedics', 'Obstetrics & GYN', 'Ophthalmology']

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
  signatureDataUrl: '',
  passportDataUrl: '',
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
    signatureDataUrl: doctor.signature_data_url || '',
    passportDataUrl: doctor.passport_data_url || '',
  }
}

function DoctorManagement({ adminHeaders }) {
  const { addError } = useError()
  const [showForm, setShowForm] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [statusDraft, setStatusDraft] = useState(null)
  const [deleteDoctorId, setDeleteDoctorId] = useState('')

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
      addError(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (field, file, maxKb) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      addError('Upload an image file.', 'warning')
      return
    }
    if (file.size > maxKb * 1024) {
      addError(`Image must be ${maxKb}KB or less.`, 'warning')
      return
    }
    const reader = new FileReader()
    reader.onload = () => handleChange(field, String(reader.result || ''))
    reader.onerror = () => addError('Could not read image file.', 'error')
    reader.readAsDataURL(file)
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
      addError(editing ? 'Doctor updated.' : 'Doctor added, approved, and notified by email when SMTP is configured.', 'success')
    } catch (error) {
      addError(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDoctor = async (doctorId) => {
    setLoading(true)
    try {
      const response = await apiFetch(`/api/admin/doctors/${encodeURIComponent(doctorId)}`, {
        method: 'DELETE',
        headers: adminHeaders,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to delete doctor')
      setDoctors((current) => current.filter((doctor) => doctor.id !== doctorId))
      setDeleteDoctorId('')
      addError('Doctor deleted.', 'success')
    } catch (error) {
      addError(error.message, 'error')
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
      addError(result.email?.sent ? 'Doctor approved and email sent.' : `Doctor approved. Email notice was not sent: ${result.email?.reason || 'SMTP not configured'}`, 'success')
    } catch (error) {
      addError(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const openDoctorStatusPanel = (doctor, status) => {
    if (status === 'active') {
      void submitDoctorStatus(doctor, status, '')
      return
    }
    setStatusDraft({
      doctorId: doctor.id,
      status,
      reason: doctor.suspension_reason || doctor.suspensionReason || 'Account paused pending platform admin review.',
    })
  }

  const submitDoctorStatus = async (doctor, status, reason) => {
    setLoading(true)
    try {
      const response = await apiFetch(`/api/admin/doctors/${encodeURIComponent(doctor.id)}/account-status`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ status, reason }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Failed to update doctor account status')
      setDoctors((current) => current.map((item) => item.id === doctor.id ? result.doctor : item))
      setStatusDraft(null)
      addError(status === 'active' ? 'Doctor resumed.' : status === 'stopped' ? 'Doctor stopped and query message saved.' : 'Doctor paused and query message saved.', 'success')
    } catch (error) {
      addError(error.message, 'error')
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
            <select value={formData.location} onChange={(e) => handleChange('location', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" required>
              <option value="">Select country</option>
              {COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}
            </select>
            <input type="text" placeholder="Languages, comma separated" value={formData.languages} onChange={(e) => handleChange('languages', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" />
            <input type="text" placeholder="License number" value={formData.licenseNumber} onChange={(e) => handleChange('licenseNumber', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" required />
            <input type="text" placeholder="License issuer / council" value={formData.licenseIssuer} onChange={(e) => handleChange('licenseIssuer', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" />
            <input type="date" value={formData.licenseExpiry} onChange={(e) => handleChange('licenseExpiry', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" />
            <input type="number" placeholder="Consultation fee" value={formData.fee} onChange={(e) => handleChange('fee', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" required />
            <input type="text" placeholder="Bank code" value={formData.bankCode} onChange={(e) => handleChange('bankCode', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" />
            <input type="text" placeholder="Bank account" value={formData.bankAccount} onChange={(e) => handleChange('bankAccount', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" />
            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              Signature image
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => handleImageUpload('signatureDataUrl', e.target.files?.[0], 300)} className="mt-2 w-full text-xs" required={!formData.id && !formData.signatureDataUrl} />
              {formData.signatureDataUrl && <img src={formData.signatureDataUrl} alt="Signature preview" className="mt-2 max-h-16 object-contain" />}
            </label>
            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              Passport photo
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => handleImageUpload('passportDataUrl', e.target.files?.[0], 500)} className="mt-2 w-full text-xs" required={!formData.id && !formData.passportDataUrl} />
              {formData.passportDataUrl && <img src={formData.passportDataUrl} alt="Passport preview" className="mt-2 h-20 w-20 rounded-2xl object-cover" />}
            </label>
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

      <DoctorGrid
        title={`Pending review (${pendingDoctors.length})`}
        doctors={pendingDoctors}
        statusDraft={statusDraft}
        deleteDoctorId={deleteDoctorId}
        onStatusDraftChange={setStatusDraft}
        onDeleteDraftChange={setDeleteDoctorId}
        onApprove={handleApproveDoctor}
        onEdit={handleEdit}
        onDelete={handleDeleteDoctor}
        onStatus={openDoctorStatusPanel}
        onSubmitStatus={submitDoctorStatus}
        loading={loading}
      />
      <DoctorGrid
        title={`Approved doctors (${approvedDoctors.length})`}
        doctors={approvedDoctors}
        statusDraft={statusDraft}
        deleteDoctorId={deleteDoctorId}
        onStatusDraftChange={setStatusDraft}
        onDeleteDraftChange={setDeleteDoctorId}
        onApprove={handleApproveDoctor}
        onEdit={handleEdit}
        onDelete={handleDeleteDoctor}
        onStatus={openDoctorStatusPanel}
        onSubmitStatus={submitDoctorStatus}
        loading={loading}
      />
    </div>
  )
}

function DoctorGrid({ title, doctors, statusDraft, deleteDoctorId, onStatusDraftChange, onDeleteDraftChange, onApprove, onEdit, onDelete, onStatus, onSubmitStatus, loading }) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {doctors.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No doctors in this group.</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => {
            const specialtyInfo = getSpecialtyInfo(doctor.specialty)
            const accountStatus = doctor.account_status || doctor.accountStatus || 'active'
            const isPaused = accountStatus === 'paused' || accountStatus === 'stopped'
            const activeDraft = statusDraft?.doctorId === doctor.id ? statusDraft : null
            const deleteDraftActive = deleteDoctorId === doctor.id
            return (
              <div key={doctor.id} className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="text-3xl">{getSpecialtyLogo(doctor.specialty)}</div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${doctor.verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {doctor.verified ? 'Approved' : 'Pending'}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${isPaused ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isPaused ? accountStatus : 'Active'}
                    </span>
                  </div>
                </div>
                <h4 className="font-bold text-slate-900">{doctor.name}</h4>
                <p className="text-sm font-medium" style={{ color: specialtyInfo.color }}>{specialtyInfo.name}</p>
                <p className="mt-2 text-xs text-slate-500">{doctor.email}</p>
                <p className="text-xs text-slate-500">{doctor.location}</p>
                <p className="mt-2 text-xs text-slate-600">License: {doctor.license_number || 'Not supplied'}</p>
                <p className="text-xs text-slate-600">Fee: {doctor.fee || doctor.consultation_fee || 50}</p>
                {isPaused && (
                  <p className="mt-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                    {doctor.suspension_reason || doctor.suspensionReason || 'Paused pending admin review.'}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {!doctor.verified && (
                    <button onClick={() => onApprove(doctor.id)} className="rounded-full bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700">
                      Approve
                    </button>
                  )}
                  <button onClick={() => onEdit(doctor)} className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                    Edit
                  </button>
                  <button onClick={() => onStatus(doctor, isPaused ? 'active' : 'paused')} className={`rounded-full px-3 py-2 text-xs font-semibold text-white ${isPaused ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  {!isPaused && (
                    <button onClick={() => onStatus(doctor, 'stopped')} className="rounded-full bg-orange-700 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-800">
                      Stop
                    </button>
                  )}
                  <button onClick={() => onDeleteDraftChange(doctor.id)} className="rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700">
                    Delete
                  </button>
                </div>
                {deleteDraftActive && (
                  <div className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 shadow-sm">
                    <p className="text-sm font-bold text-red-800">Delete Dr. {doctor.name}?</p>
                    <p className="mt-1 text-xs text-red-700">This removes the doctor account and profile from the platform.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => onDelete(doctor.id)}
                        className="rounded-full bg-red-700 px-4 py-2 text-xs font-bold text-white hover:bg-red-800 disabled:opacity-50"
                      >
                        {loading ? 'Deleting...' : 'Confirm delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteDraftChange('')}
                        className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {activeDraft && (
                  <div
                    className="mt-4 overflow-hidden rounded-3xl border bg-white shadow-lg"
                    style={{ borderColor: `${specialtyInfo.color}55`, boxShadow: `0 18px 40px ${specialtyInfo.color}18` }}
                  >
                    <div className="px-4 py-3 text-white" style={{ background: `linear-gradient(135deg, ${specialtyInfo.color}, #0f172a)` }}>
                      <p className="text-xs font-black uppercase tracking-[0.18em]">{activeDraft.status === 'stopped' ? 'Stop doctor access' : 'Pause doctor access'}</p>
                      <p className="mt-1 text-sm font-semibold">{specialtyInfo.name} account control</p>
                    </div>
                    <div className="space-y-3 p-4">
                      <p className="text-sm text-slate-600">
                        This message will appear on Dr. {doctor.name}'s dashboard as the query or review reason.
                      </p>
                      <textarea
                        value={activeDraft.reason}
                        onChange={(event) => onStatusDraftChange({ ...activeDraft, reason: event.target.value })}
                        className="min-h-[104px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:bg-white"
                        style={{ '--tw-ring-color': specialtyInfo.color }}
                        placeholder="Explain why this account is being paused or stopped..."
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={loading || !activeDraft.reason.trim()}
                          onClick={() => onSubmitStatus(doctor, activeDraft.status, activeDraft.reason)}
                          className="rounded-full px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ backgroundColor: specialtyInfo.color }}
                        >
                          {loading ? 'Saving...' : activeDraft.status === 'stopped' ? 'Confirm stop' : 'Confirm pause'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onStatusDraftChange(null)}
                          className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DoctorManagement
