import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/apiFetch'
import { useError } from './ErrorHandler'

function CalendarScheduler({ patient, doctor, subscriptionType, onAppointmentScheduled }) {
  const { addError } = useError()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [availableSlots, setAvailableSlots] = useState({})
  const [loading, setLoading] = useState(false)
  const [consultationType, setConsultationType] = useState('general')

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate, doctor])

  const fetchAvailableSlots = async (date) => {
    setLoading(true)
    try {
      const dateStr = date.toISOString().split('T')[0]
      const response = await apiFetch(`/api/doctors/${doctor.id}/availability?date=${dateStr}`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to load availability')
      setAvailableSlots(data.slots || {})
    } catch (error) {
      setAvailableSlots({})
      addError(error.message || 'Failed to fetch available appointment slots.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isPast = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isWeekend = (date) => {
    const day = date.getDay()
    return day === 0 || day === 6 // Sunday or Saturday
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleDateSelect = (date) => {
    if (!isPast(date) && !isWeekend(date)) {
      setSelectedDate(date)
      setSelectedTime(null)
    }
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
  }

  const handleScheduleAppointment = async () => {
    if (!selectedDate || !selectedTime) return

    try {
      const appointmentData = {
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledDate: new Date(`${selectedDate.toISOString().split('T')[0]}T${selectedTime}:00`).toISOString(),
        consultationType,
        subscriptionType,
        tokensRequired: subscriptionType === 'basic' ? (doctor.price?.basic || 50) : (doctor.price?.premium || 100)
      }

      const response = await apiFetch(`/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      })

      const result = await response.clone().json().catch(async () => {
        const text = await response.text().catch(() => '')
        return { error: text || 'Failed to schedule appointment' }
      })
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to schedule appointment')
      }

      onAppointmentScheduled(result.appointment)
      addError('Appointment scheduled successfully.', 'success')
    } catch (error) {
      addError('Failed to schedule appointment: ' + error.message, 'error')
    }
  }

  const timeSlots = Object.keys(availableSlots).sort()

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Schedule Your Appointment</h1>
          <p className="text-slate-600 mt-2">Choose a date and time that works for you</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                className="p-2 hover:bg-slate-100 rounded-2xl transition"
              >
                ←
              </button>
              <h2 className="text-xl font-semibold text-slate-900">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                className="p-2 hover:bg-slate-100 rounded-2xl transition"
              >
                →
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth(currentDate).map((date, index) => (
                <div key={index} className="aspect-square">
                  {date ? (
                    <button
                      onClick={() => handleDateSelect(date)}
                      disabled={isPast(date) || isWeekend(date)}
                      className={`w-full h-full rounded-2xl text-sm font-medium transition ${
                        isToday(date)
                          ? 'bg-brand-100 text-brand-700 border-2 border-brand-500'
                          : selectedDate && date.toDateString() === selectedDate.toDateString()
                          ? 'bg-brand-700 text-white'
                          : isPast(date) || isWeekend(date)
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'hover:bg-slate-100 text-slate-900'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Time Slots and Details */}
          <div className="space-y-6">
            {/* Selected Date */}
            {selectedDate && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {formatDate(selectedDate)}
                </h3>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700 mx-auto"></div>
                    <p className="mt-2 text-slate-600">Loading available times...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {timeSlots.map(time => (
                      <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        disabled={!availableSlots[time]}
                        className={`p-3 rounded-2xl text-sm font-medium transition ${
                          selectedTime === time
                            ? 'bg-brand-700 text-white'
                            : availableSlots[time]
                            ? 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                            : 'bg-red-50 text-red-400 cursor-not-allowed'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Consultation Type */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Consultation Type</h3>
              <div className="space-y-3">
                {[
                  { value: 'general', label: 'General Consultation', desc: 'Routine check-up or general health concerns' },
                  { value: 'followup', label: 'Follow-up Visit', desc: 'Continuing care from previous appointment' },
                  { value: 'urgent', label: 'Urgent Care', desc: 'Immediate medical attention needed' },
                  { value: 'specialist', label: 'Specialist Referral', desc: 'Referred by general doctor to specialist' }
                ].map(type => (
                  <label key={type.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="consultationType"
                      value={type.value}
                      checked={consultationType === type.value}
                      onChange={(e) => setConsultationType(e.target.value)}
                      className="mt-1 text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <span className="font-medium text-slate-900">{type.label}</span>
                      <p className="text-sm text-slate-600">{type.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Appointment Summary */}
            {selectedDate && selectedTime && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Appointment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Doctor:</span>
                    <span className="font-medium text-slate-900">{doctor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Date:</span>
                    <span className="font-medium text-slate-900">{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Time:</span>
                    <span className="font-medium text-slate-900">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Type:</span>
                    <span className="font-medium text-slate-900">{consultationType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subscription:</span>
                    <span className="font-medium text-slate-900">{subscriptionType}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-slate-600">Cost:</span>
                    <span className="font-bold text-brand-700">
                      {subscriptionType === 'basic' ? (doctor.price?.basic || 50) : (doctor.price?.premium || 100)} tokens
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleScheduleAppointment}
                  className="w-full mt-6 bg-brand-700 text-white py-3 px-6 rounded-2xl font-semibold hover:bg-brand-600 transition"
                >
                  Schedule Appointment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarScheduler
