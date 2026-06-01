import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'
import { useError } from './ErrorHandler'

function DoctorPatientNotes({ patientId, doctorId, consultationId }) {
  const { addError } = useError()
  const [notes, setNotes] = useState([])
  const [diagnosis, setDiagnosis] = useState('')
  const [plan, setPlan] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadNotes = async () => {
    if (!patientId) return
    setLoading(true)
    try {
      const response = await apiFetch(`/api/patients/${encodeURIComponent(patientId)}/clinical-notes`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to load clinical notes')
      setNotes(Array.isArray(data.notes) ? data.notes : [])
    } catch (error) {
      addError(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadNotes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId])

  const saveNote = async (event) => {
    event.preventDefault()
    if (!patientId || !doctorId || !diagnosis.trim() || !plan.trim()) {
      addError('Diagnosis and care plan are required before saving.', 'warning')
      return
    }
    setSaving(true)
    try {
      const response = await apiFetch(`/api/patients/${encodeURIComponent(patientId)}/clinical-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          consultationId,
          diagnosis: diagnosis.trim(),
          plan: plan.trim(),
          followUp: followUp.trim(),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to save clinical note')
      setDiagnosis('')
      setPlan('')
      setFollowUp('')
      addError('Clinical note saved for care continuation.', 'success')
      await loadNotes()
    } catch (error) {
      addError(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Clinical Continuation Notes</h2>
          <p className="text-sm text-slate-500">Save diagnosis, care plan, and follow-up notes for future doctors.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {notes.length} saved
        </span>
      </div>

      <form onSubmit={saveNote} className="mt-5 grid gap-3">
        <textarea
          value={diagnosis}
          onChange={(event) => setDiagnosis(event.target.value)}
          rows={3}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500"
          placeholder="Diagnosis / clinical impression"
        />
        <textarea
          value={plan}
          onChange={(event) => setPlan(event.target.value)}
          rows={4}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500"
          placeholder="Treatment plan, medication advice, lifestyle advice, next steps"
        />
        <textarea
          value={followUp}
          onChange={(event) => setFollowUp(event.target.value)}
          rows={2}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500"
          placeholder="Follow-up timing or escalation instructions"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save clinical note'}
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No clinical notes saved yet.</p>
        ) : (
          notes.slice(0, 6).map((note) => (
            <div key={note.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">{new Date(note.created_at).toLocaleString()}</p>
              <p className="mt-2 text-sm font-bold text-slate-900">Diagnosis</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{note.diagnosis}</p>
              <p className="mt-3 text-sm font-bold text-slate-900">Plan</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{note.plan}</p>
              {note.follow_up && (
                <>
                  <p className="mt-3 text-sm font-bold text-slate-900">Follow-up</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{note.follow_up}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DoctorPatientNotes
