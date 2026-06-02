import { useMemo, useState } from 'react'
import { CheckCircle2, FileUp, Loader2, Mail, Send, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { apiFetch } from '../../lib/apiFetch'

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const MAX_FILES = 5
const MAX_FILE_BYTES = 2 * 1024 * 1024

function emptyForm() {
  return {
    fullName: '',
    email: '',
    country: '',
    language: 'English',
    preferredContact: 'Email',
    subject: 'Patient support request',
    complaint: '',
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error || new Error('File could not be read'))
    reader.readAsDataURL(file)
  })
}

function formatSize(bytes) {
  if (!bytes) return '0KB'
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function SupportIntakeForm({ onSubmitted }) {
  const [form, setForm] = useState(emptyForm)
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  const canSubmit = useMemo(() => {
    return form.fullName.trim() && isValidEmail(form.email) && form.complaint.trim() && !submitting
  }, [form, submitting])

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const addFiles = (fileList) => {
    setError('')
    const incoming = Array.from(fileList || [])
    const nextFiles = [...files]
    for (const file of incoming) {
      if (nextFiles.length >= MAX_FILES) {
        setError(`You can upload up to ${MAX_FILES} files.`)
        break
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Only PDF, PNG, JPG, JPEG, and DOCX files are allowed.')
        continue
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(`${file.name} is too large. Maximum size is 2MB per file.`)
        continue
      }
      nextFiles.push(file)
    }
    setFiles(nextFiles)
  }

  const removeFile = (index) => {
    setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  const submitCase = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess(null)

    if (!form.fullName.trim()) return setError('Full name is required.')
    if (!isValidEmail(form.email)) return setError('A valid email address is required.')
    if (!form.complaint.trim()) return setError('Complaint or request details are required.')

    setSubmitting(true)
    try {
      const encodedFiles = await Promise.all(files.map(async (file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        base64: await readFileAsDataUrl(file),
      })))

      const response = await apiFetch('/api/support/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, files: encodedFiles }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Support case could not be submitted.')

      const submitted = {
        caseId: payload.caseId,
        emailSent: Boolean(payload.emailSent),
        stored: Boolean(payload.stored),
        fullName: form.fullName,
        email: form.email,
      }
      setSuccess(submitted)
      onSubmitted?.(submitted)
    } catch (submitError) {
      setError(submitError.message || 'Support case could not be submitted.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-5 text-emerald-900">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" />
          <div>
            <h3 className="text-base font-bold">Case submitted</h3>
            <p className="mt-1 text-sm leading-6">Your case ID is <span className="font-bold">{success.caseId}</span>. Our support agent receives submissions at globaldoctorconnect@gmail.com.</p>
            <p className="mt-2 text-xs text-emerald-700">You can now continue chatting with the AI assistant using this case as context.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submitCase} className="space-y-4">
      <div className="rounded-[1.5rem] border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-slate-50 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-700 text-white"><ShieldCheck className="h-5 w-5" /></span>
          <div>
            <h3 className="font-bold text-slate-900">Submit your case before chat</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">Enter your email, describe your complaint or request, and attach useful documents. The support agent email is globaldoctorconnect@gmail.com.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-semibold text-slate-700">
          Full name *
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <UserRound className="h-4 w-4 text-slate-400" />
            <input value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Your name" />
          </div>
        </label>
        <label className="space-y-1 text-sm font-semibold text-slate-700">
          Email address *
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <Mail className="h-4 w-4 text-slate-400" />
            <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" placeholder="you@email.com" />
          </div>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-semibold text-slate-700">
          Country
          <input value={form.country} onChange={(event) => updateField('country', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-brand-400" placeholder="Nigeria" />
        </label>
        <label className="space-y-1 text-sm font-semibold text-slate-700">
          Preferred language
          <select value={form.language} onChange={(event) => updateField('language', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-brand-400">
            <option>English</option>
            <option>Hausa</option>
            <option>Arabic</option>
            <option>French</option>
            <option>Yoruba</option>
            <option>Igbo</option>
          </select>
        </label>
      </div>

      <label className="space-y-1 text-sm font-semibold text-slate-700">
        Subject
        <input value={form.subject} onChange={(event) => updateField('subject', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-brand-400" />
      </label>

      <label className="space-y-1 text-sm font-semibold text-slate-700">
        Complaint or request details *
        <textarea value={form.complaint} onChange={(event) => updateField('complaint', event.target.value)} rows={4} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-brand-400" placeholder="Explain what you need help with..." />
      </label>

      <div className="rounded-[1.5rem] border border-dashed border-brand-200 bg-white p-4">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center">
          <FileUp className="h-7 w-7 text-brand-700" />
          <span className="text-sm font-bold text-slate-900">Upload documents</span>
          <span className="text-xs text-slate-500">PDF, PNG, JPG, JPEG, DOCX. Max 5 files, 2MB each.</span>
          <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={(event) => addFiles(event.target.files)} className="hidden" />
        </label>
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                <span className="min-w-0 truncate text-slate-700">{file.name} · {formatSize(file.size)}</span>
                <button type="button" onClick={() => removeFile(index)} className="rounded-full p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      <button type="submit" disabled={!canSubmit} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-700/20 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {submitting ? 'Submitting case...' : 'Submit case and start chat'}
      </button>
    </form>
  )
}

export default SupportIntakeForm
