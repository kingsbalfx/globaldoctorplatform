import { useState } from 'react'
import { apiFetch } from '../lib/apiFetch'
import { useError } from './ErrorHandler'

function PatientClinicalSummaryDownload({ patient }) {
  const { addError } = useError()
  const [loading, setLoading] = useState(false)

  const downloadPdf = async () => {
    if (!patient?.id) return
    setLoading(true)
    try {
      const response = await apiFetch(`/api/patients/${encodeURIComponent(patient.id)}/record`)
      const record = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(record.error || 'Failed to load review')
      const html = `<!doctype html><html><head><title>Clinical Review - ${patient.name}</title><style>body{font-family:Arial,sans-serif;color:#0f172a;padding:30px}h1{color:#0f766e}.box{border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin:10px 0}table{width:100%;border-collapse:collapse;margin-top:12px}td,th{border:1px solid #e2e8f0;padding:8px;text-align:left}</style></head><body><h1>GlobalDoc Clinical Review</h1><div class="box"><b>${patient.name || patient.id}</b><br/>${patient.id}</div><h2>Vital Signs</h2><table><tr><th>Parameter</th><th>Value</th><th>Source</th><th>Date</th></tr>${(record.vitals || []).map((v) => `<tr><td>${v.parameter_name}</td><td>${v.parameter_value} ${v.unit || ''}</td><td>${v.source || ''}</td><td>${new Date(v.measured_at || v.created_at).toLocaleString()}</td></tr>`).join('')}</table><h2>Doctor Reviews</h2>${(record.reviews || []).map((r) => `<div class="box"><b>${r.rating}/5</b><p>${r.comment || ''}</p></div>`).join('')}<h2>Referrals</h2>${(record.referrals?.facility || []).map((r) => `<div class="box"><b>${r.code}</b> - ${r.status}<p>${r.reason || ''}</p><p>${r.notes || ''}</p></div>`).join('')}<h2>Lab Requests</h2>${(record.labs?.orders || []).map((o) => `<div class="box"><b>${o.id}</b><p>${(o.tests || []).join(', ')}</p></div>`).join('')}</body></html>`
      const win = window.open('', '_blank')
      win.document.write(html)
      win.document.close()
      win.focus()
      win.print()
    } catch (error) {
      addError(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button type="button" onClick={downloadPdf} disabled={loading} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
      {loading ? 'Preparing...' : 'Download clinical review PDF'}
    </button>
  )
}

export default PatientClinicalSummaryDownload
