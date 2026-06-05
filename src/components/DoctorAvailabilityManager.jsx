import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'
import { useError } from './ErrorHandler'

const toDateInput = (date) => {
  const value = new Date(date)
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset())
  return value.toISOString().slice(0, 10)
}

function DoctorAvailabilityManager({ doctor }) {
  const { addError } = useError()
  const [selectedDate, setSelectedDate] = useState(() => toDateInput(new Date()))
  const [slots, setSlots] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const doctorId = doctor?.id

  const slotEntries = useMemo(() => Object.entries(slots).sort(([left], [right]) => left.localeCompare(right)), [slots])
  const availableCount = slotEntries.filter(([, available]) => available).length

  const loadAvailability = async () => {
    if (!doctorId || !selectedDate) return
    setLoading(true)
    try {
      const response = await apiFetch(`/api/doctors/${doctorId}/availability?date=${encodeURIComponent(selectedDate)}`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to load availability')
      setSlots(data.slots || {})
    } catch (error) {
      setSlots({})
      addError(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAvailability()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, selectedDate])

  const setAllSlots = (available) => {
    setSlots((current) => Object.fromEntries(Object.keys(current).map((time) => [time, available])))
  }

  const saveAvailability = async () => {
    if (!doctorId || !selectedDate) return
    setSaving(true)
    try {
      const response = await apiFetch(`/api/doctors/${doctorId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, slots }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to save availability')
      setSlots(data.slots || slots)
      addError('Availability saved.', 'success')
    } catch (error) {
      addError(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Appointment Availability</h3>
            <p className="mt-2 text-sm text-slate-600">
              Control the appointment times patients can book. Existing booked appointments remain protected.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-brand-500"
            />
            <button
              type="button"
              onClick={loadAvailability}
              disabled={loading}
              className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-brand-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">Open slots</p>
            <p className="mt-2 text-3xl font-black text-brand-950">{availableCount}</p>
          </div>
          <button
            type="button"
            onClick={() => setAllSlots(true)}
            disabled={slotEntries.length === 0}
            className="rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
          >
            Open all visible slots
          </button>
          <button
            type="button"
            onClick={() => setAllSlots(false)}
            disabled={slotEntries.length === 0}
            className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-bold text-red-800 hover:bg-red-100 disabled:opacity-50"
          >
            Close all visible slots
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-600">Loading slots...</div>
          ) : slotEntries.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-600">No slots are configured for this date.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {slotEntries.map(([time, available]) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSlots((current) => ({ ...current, [time]: !current[time] }))}
                  className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                    available
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <span className="block">{time}</span>
                  <span className="mt-1 block text-xs font-semibold">{available ? 'Open' : 'Closed'}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={saveAvailability}
          disabled={saving || slotEntries.length === 0}
          className="mt-6 rounded-full bg-brand-700 px-7 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Availability'}
        </button>
      </div>
    </div>
  )
}

export default DoctorAvailabilityManager
