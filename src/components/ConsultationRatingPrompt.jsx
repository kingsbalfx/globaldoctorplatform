import { useCallback, useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { apiFetch, readApiJson } from '../lib/apiFetch'
import ProfileAvatar from './ProfileAvatar'
import { useError } from './ErrorHandler'

function ConsultationRatingPrompt({ patientId, sessionProof, refreshSignal = 0, onRated }) {
  const { addError } = useError()
  const [pending, setPending] = useState([])
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadPending = useCallback(async () => {
    if (!patientId) return
    const response = await apiFetch(`/api/reviews/pending?patientId=${encodeURIComponent(patientId)}`, {
      headers: { 'x-session-proof': sessionProof || '' },
    })
    const data = await readApiJson(response)
    if (!response.ok) throw new Error(data.error || 'Unable to load consultation ratings')
    setPending(data.consultations || [])
  }, [patientId, sessionProof])

  useEffect(() => {
    void loadPending().catch(() => null)
    const timer = window.setInterval(() => void loadPending().catch(() => null), 30 * 1000)
    return () => window.clearInterval(timer)
  }, [loadPending, refreshSignal])

  const consultation = pending[0]
  if (!consultation) return null

  const submitRating = async () => {
    if (!rating) {
      addError('Choose a rating from 1 to 5 stars.', 'info')
      return
    }
    setSubmitting(true)
    try {
      const response = await apiFetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId: consultation.id,
          doctorId: consultation.doctor_id,
          patientId,
          rating,
          comment,
          verifiedPatient: true,
          actionProof: consultation.action_proof,
        }),
      })
      const data = await readApiJson(response)
      if (!response.ok) throw new Error(data.error || 'Unable to submit doctor rating')
      setPending((current) => current.filter((item) => item.id !== consultation.id))
      setRating(0)
      setComment('')
      addError(data.message || 'Thank you. Your rating was recorded.', 'success')
      onRated?.(data)
    } catch (error) {
      addError(error.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/55 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/80 bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-emerald-600 to-slate-900 px-7 py-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">Consultation complete</p>
          <h2 className="mt-2 text-2xl font-bold">Rate your doctor</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-50">Your rating helps patients choose confidently and helps doctors improve their care.</p>
        </div>
        <div className="space-y-5 p-7">
          <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
            <ProfileAvatar person={consultation.doctor} role="doctor" size="md" />
            <div>
              <p className="font-bold text-slate-900">{consultation.doctor?.name || 'Your doctor'}</p>
              <p className="text-sm text-slate-600">{consultation.doctor?.specialty || 'Medical consultation'}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">How was your care experience?</p>
            <div className="mt-3 flex justify-center gap-2" role="radiogroup" aria-label="Doctor rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="rounded-full p-2 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label={`${value} star${value === 1 ? '' : 's'}`}
                  aria-checked={rating === value}
                  role="radio"
                >
                  <Star className={`h-9 w-9 ${value <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Share a short comment about the consultation (optional)"
            className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <button
            type="button"
            onClick={submitRating}
            disabled={!rating || submitting}
            className="w-full rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Submitting rating...' : 'Submit rating and continue'}
          </button>
          <p className="text-center text-xs text-slate-500">A rating is required after each completed consultation.</p>
        </div>
      </div>
    </div>
  )
}

export default ConsultationRatingPrompt
