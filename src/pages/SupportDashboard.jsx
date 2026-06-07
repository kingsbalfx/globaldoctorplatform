import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock, ExternalLink, FileText, Inbox, Loader2, RefreshCw, Search, UserCheck } from 'lucide-react'
import { apiFetch } from '../lib/apiFetch'

const statusOptions = ['all', 'new', 'open', 'assigned', 'closed']

function badgeClass(status) {
  const value = String(status || 'new').toLowerCase()
  if (value === 'closed') return 'bg-emerald-50 text-emerald-700 ring-emerald-100'
  if (value === 'open' || value === 'assigned') return 'bg-blue-50 text-blue-700 ring-blue-100'
  return 'bg-amber-50 text-amber-700 ring-amber-100'
}

function formatSize(bytes) {
  const value = Number(bytes || 0)
  if (!value) return '0KB'
  if (value < 1024 * 1024) return `${Math.ceil(value / 1024)}KB`
  return `${(value / (1024 * 1024)).toFixed(1)}MB`
}

function fileStatusClass(status) {
  const value = String(status || '').toLowerCase()
  if (value.includes('stored')) return 'text-emerald-700 bg-emerald-50 ring-emerald-100'
  if (value.includes('failed')) return 'text-red-700 bg-red-50 ring-red-100'
  return 'text-amber-700 bg-amber-50 ring-amber-100'
}

function SupportDashboard() {
  const [tickets, setTickets] = useState([])
  const [selected, setSelected] = useState(null)
  const [status, setStatus] = useState('all')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')
  const [assignedTo, setAssignedTo] = useState('')

  const selectedFiles = selected?.support_files || []

  const filteredTickets = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return tickets
    return tickets.filter((ticket) => [ticket.id, ticket.full_name, ticket.email, ticket.subject, ticket.status].some((value) => String(value || '').toLowerCase().includes(term)))
  }, [tickets, query])

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      new: tickets.filter((ticket) => String(ticket.status || 'new') === 'new').length,
      open: tickets.filter((ticket) => ['open', 'assigned'].includes(String(ticket.status || ''))).length,
      closed: tickets.filter((ticket) => String(ticket.status || '') === 'closed').length,
    }
  }, [tickets])

  const loadTickets = async (nextStatus = status) => {
    setLoading(true)
    setError('')
    try {
      const suffix = nextStatus && nextStatus !== 'all' ? `?status=${encodeURIComponent(nextStatus)}` : ''
      const response = await apiFetch(`/api/support/tickets${suffix}`)
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Could not load requests.')
      const nextTickets = payload.tickets || []
      setTickets(nextTickets)
      setSelected((current) => {
        if (current?.id) return nextTickets.find((ticket) => ticket.id === current.id) || nextTickets[0] || null
        return nextTickets[0] || null
      })
    } catch (loadError) {
      setError(loadError.message || 'Could not load requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets('all')
  }, [])

  useEffect(() => {
    if (selected) {
      setNotes(selected.notes || '')
      setAssignedTo(selected.assigned_to || '')
    }
  }, [selected])

  const selectTicket = (ticket) => setSelected(ticket)

  const updateTicket = async (nextStatus = selected?.status || 'open') => {
    if (!selected?.id) return
    setSaving(true)
    setError('')
    try {
      const response = await apiFetch('/api/support/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: selected.id, status: nextStatus, notes, assignedTo }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Could not update request.')
      setSelected(payload.ticket)
      setTickets((current) => current.map((ticket) => ticket.id === payload.ticket.id ? payload.ticket : ticket))
    } catch (saveError) {
      setError(saveError.message || 'Could not update request.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex items-center rounded-full bg-brand-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-brand-700">Agent workspace</p>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">Support requests</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">Review submitted requests, uploaded documents, status, and internal notes.</p>
          </div>
          <button onClick={() => loadTickets(status)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {[['Total', stats.total, Inbox], ['New', stats.new, Clock], ['Open', stats.open, UserCheck], ['Closed', stats.closed, CheckCircle2]].map(([label, value, Icon]) => (
            <div key={label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <Icon className="h-5 w-5 text-brand-700" />
              <p className="mt-3 text-sm font-semibold text-slate-500">{label}</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by ID, name, email, subject..." className="min-w-0 flex-1 outline-none" />
          </div>
          <select value={status} onChange={(event) => { setStatus(event.target.value); loadTickets(event.target.value) }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 outline-none">
            {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>

        {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="max-h-[620px] space-y-3 overflow-y-auto pr-1">
            {loading && <div className="rounded-3xl bg-slate-50 p-6 text-center text-slate-600"><Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />Loading requests...</div>}
            {!loading && filteredTickets.length === 0 && <div className="rounded-3xl bg-slate-50 p-6 text-center text-slate-600">No requests found.</div>}
            {filteredTickets.map((ticket) => {
              const count = (ticket.support_files || []).length
              return (
                <button key={ticket.id} type="button" onClick={() => selectTicket(ticket)} className={`block w-full rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 ${selected?.id === ticket.id ? 'border-brand-300 bg-brand-50' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{ticket.id}</p>
                      <h3 className="mt-2 font-bold text-slate-900">{ticket.subject || 'Request'}</h3>
                      <p className="mt-1 text-sm text-slate-600">{ticket.full_name || 'Unknown'} · {ticket.email}</p>
                      <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-700 ring-1 ring-brand-100"><FileText className="h-3.5 w-3.5" /> {count} file{count === 1 ? '' : 's'}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${badgeClass(ticket.status)}`}>{ticket.status || 'new'}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            {!selected ? (
              <p className="text-slate-600">Select a request to view details.</p>
            ) : (
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{selected.id}</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">{selected.subject || 'Request details'}</h2>
                    <p className="mt-2 text-sm text-slate-600">{selected.full_name} · {selected.email}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${badgeClass(selected.status)}`}>{selected.status || 'new'}</span>
                </div>
                <div className="mt-5 rounded-2xl bg-white p-4 text-sm leading-7 text-slate-700 whitespace-pre-wrap">{selected.complaint || 'No details provided.'}</div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm font-semibold text-slate-700">Assigned to<input value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400" placeholder="Agent name or email" /></label>
                  <label className="space-y-1 text-sm font-semibold text-slate-700">Status<select value={selected.status || 'new'} onChange={(event) => setSelected((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400"><option>new</option><option>open</option><option>assigned</option><option>closed</option></select></label>
                </div>
                <label className="mt-4 block space-y-1 text-sm font-semibold text-slate-700">Internal notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400" /></label>
                <div className="mt-4 rounded-2xl bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900">Uploaded documents</p>
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 ring-1 ring-brand-100">{selectedFiles.length}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {selectedFiles.length === 0 && <p className="text-sm text-slate-500">No uploaded documents found for this request.</p>}
                    {selectedFiles.map((file) => (
                      <div key={file.id} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700 ring-1 ring-slate-100">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">{file.file_name || 'Uploaded file'}</p>
                            <p className="mt-1 text-xs text-slate-500">{file.file_type || 'file'} · {formatSize(file.file_size)} · {file.created_at ? new Date(file.created_at).toLocaleString() : 'No date'}</p>
                            <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${fileStatusClass(file.storage_status)}`}>{file.storage_status || 'recorded'}</span>
                          </div>
                          {file.file_url ? (
                            <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600">
                              Open document <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <span className="shrink-0 rounded-xl bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 ring-1 ring-amber-100">No link available</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => updateTicket(selected.status || 'open')} disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:bg-slate-300">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save request
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default SupportDashboard
