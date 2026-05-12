import { useEffect, useState } from 'react'
import { API_BASE } from '../lib/apiBase'

function AppointmentScheduler({ patientId, onScheduled }) {
  const [doctors, setDoctors] = useState([])
  const [doctorId, setDoctorId] = useState('')
  const [consultationType, setConsultationType] = useState('telehealth')
  const [scheduledDate, setScheduledDate] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/doctors`)
      const data = await response.json().catch(() => ({}))
      const list = Array.isArray(data.doctors) ? data.doctors : []
      setDoctors(list)
      if (list.length > 0) setDoctorId(list[0].id)
    } catch (err) {
      console.error('Failed to fetch doctors', err)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!doctorId || !scheduledDate) {
      setError('Please select a doctor and appointment date/time.')
      return
    }
    setSaving(true)
    try {
      const response = await fetch(`${API_BASE}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          doctorId,
          scheduledDate,
          consultationType,
          notes,
        }),
      })
      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.error || 'Failed to schedule appointment')
      }
      const data = await response.json()
      setScheduledDate('')
      setNotes('')
      setConsultationType('telehealth')
      onScheduled && onScheduled(data.appointment)
      alert('Appointment scheduled successfully! You will receive reminders 24 hours and 1 hour before the consultation.')
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Schedule Appointment</h2>
          <p className="text-sm text-slate-500">Book a consultation and automatically create reminder notifications for both you and your doctor.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Doctor</label>
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
          >
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} — {doctor.specialty}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Appointment date and time</label>
          <input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Consultation type</label>
          <select
            value={consultationType}
            onChange={(e) => setConsultationType(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
          >
            <option value="telehealth">Telehealth</option>
            <option value="in_person">In-person</option>
            <option value="follow_up">Follow-up</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Notes for doctor</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
            placeholder="Describe symptoms or what you want to discuss..."
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-3xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:opacity-50"
        >
          {saving ? 'Scheduling...' : 'Schedule Appointment'}
        </button>
      </form>
    </div>
  )
}

export default AppointmentScheduler
