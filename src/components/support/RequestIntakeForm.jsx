import { useMemo, useState } from 'react'
import { CheckCircle2, Copy, FileUp, Loader2, Mail, Send, Trash2, UserRound } from 'lucide-react'
import { apiFetch } from '../../lib/apiFetch'

const TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const MAX_FILES = 5
const MAX_BYTES = 2 * 1024 * 1024

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

function readDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error || new Error('File could not be read'))
    reader.readAsDataURL(file)
  })
}

function sizeLabel(bytes) {
  if (!bytes) return '0KB'
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function RequestIntakeForm({ onSubmitted }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    country: '',
    language: 'English',
    preferredContact: 'Email',
    subject: 'Support request',
    complaint: '',
  })
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(null)
  const [copied, setCopied] = useState(false)

  const canSubmit = useMemo(() => form.fullName.trim() && validEmail(form.email) && form.complaint.trim() && !loading, [form, loading])

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const addFiles = (list) => {
    setError('')
    const next = [...files]
    for (const file of Array.from(list || [])) {
      if (next.length >= MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed.`)
        break
      }
      if (!TYPES.includes(file.type)) {
        setError('Only PDF, PNG, JPG, JPEG, and DOCX files are allowed.')
        continue
      }
      if (file.size > MAX_BYTES) {
        setError(`${file.name} is larger than 2MB.`)
        continue
      }
      next.push(file)
    }
    setFiles(next)
  }

  const copyId = async () => {
    if (!done?.caseId) return
    try {
      await navigator.clipboard.writeText(done.caseId)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setDone(null)
    if (!form.fullName.trim()) return setError('Full name is required.')
    if (!validEmail(form.email)) return setError('A valid email address is required.')
    if (!form.complaint.trim()) return setError('Request details are required.')

    setLoading(true)
    try {
      const encoded = await Promise.all(files.map(async (file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        base64: await readDataUrl(file),
      })))
      const response = await apiFetch('/api/support/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, files: encoded }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Request could not be submitted.')
      const submitted = {
        caseId: payload.caseId,
        emailSent: Boolean(payload.emailSent),
        stored: Boolean(payload.stored),
        fullName: form.fullName,
        email: form.email,
      }
      setDone(submitted)
      onSubmitted?.(submitted)
    } catch (err) {
      setError(err.message || 'Request could not be submitted.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-5 text-emerald-900">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold">Request submitted</h3>
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Save this Request ID</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <code className="rounded-xl bg-emerald-900 px-4 py-2 text-lg font-black tracking-wide text-white">{done.caseId}</code>
                <button type="button" onClick={copyId} className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600">
                  <Copy className="h-3.5 w-3.5" /> {copied ? 'Copied' : 'Copy ID'}
                </button>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6">Use this ID whenever you contact support or track your request. Your email <span className="font-bold">{done.email}</span> is linked to it.</p>
            <p className="mt-2 text-xs font-semibold text-emerald-700">Chat is now unlocked.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-[1.5rem] border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-slate-50 p-4">
        <h3 className="font-bold text-slate-900">Submit a request before chat</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">No account is required. Enter a valid email, describe what you need, and attach files if useful. Your Request ID will be shown clearly after submission.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-semibold text-slate-700">Full name *<div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2"><UserRound className="h-4 w-4 text-slate-400" /><input value={form.fullName} onChange={(event) => setField('fullName', event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Your name" /></div></label>
        <label className="space-y-1 text-sm font-semibold text-slate-700">Email address *<div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2"><Mail className="h-4 w-4 text-slate-400" /><input type="email" value={form.email} onChange={(event) => setField('email', event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" placeholder="you@email.com" /></div></label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-semibold text-slate-700">Country<input value={form.country} onChange={(event) => setField('country', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-brand-400" placeholder="Nigeria" /></label>
        <label className="space-y-1 text-sm font-semibold text-slate-700">Preferred language<select value={form.language} onChange={(event) => setField('language', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-brand-400"><option>English</option><option>Hausa</option><option>Arabic</option><option>French</option><option>Yoruba</option><option>Igbo</option></select></label>
      </div>

      <label className="space-y-1 text-sm font-semibold text-slate-700">Subject<input value={form.subject} onChange={(event) => setField('subject', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-brand-400" /></label>
      <label className="space-y-1 text-sm font-semibold text-slate-700">Request details *<textarea value={form.complaint} onChange={(event) => setField('complaint', event.target.value)} rows={4} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-brand-400" placeholder="Explain what you need help with..." /></label>

      <div className="rounded-[1.5rem] border border-dashed border-brand-200 bg-white p-4">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center"><FileUp className="h-7 w-7 text-brand-700" /><span className="text-sm font-bold text-slate-900">Upload documents</span><span className="text-xs text-slate-500">PDF, PNG, JPG, JPEG, DOCX. Max 5 files, 2MB each.</span><input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={(event) => addFiles(event.target.files)} className="hidden" /></label>
        {files.length > 0 && <div className="mt-4 space-y-2">{files.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm"><span className="min-w-0 truncate text-slate-700">{file.name} · {sizeLabel(file.size)}</span><button type="button" onClick={() => setFiles((current) => current.filter((_, i) => i !== index))} className="rounded-full p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div>)}</div>}
      </div>

      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <button type="submit" disabled={!canSubmit} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-700/20 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{loading ? 'Submitting request...' : 'Submit request and start chat'}</button>
    </form>
  )
}

export default RequestIntakeForm
