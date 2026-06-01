import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'
import { useError } from './ErrorHandler'

const COMPANY_NAME = 'GlobalDoc'

function escapeHtml(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

function buildLabRequestHtml(order, fallback = {}) {
  const tests = Array.isArray(order.tests) ? order.tests : []
  return `<!doctype html>
<html><head><meta charset="utf-8" /><title>Lab Request - ${escapeHtml(order.patient_name || fallback.patientName)}</title>
<style>
body{font-family:Arial,sans-serif;background:#f8fafc;color:#0f172a;margin:0}.page{max-width:840px;margin:28px auto;background:#fff;border:1px solid #e2e8f0;padding:36px}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #0f766e;padding-bottom:20px}.brand{display:flex;gap:14px;align-items:center}.logo{width:62px;height:62px;border-radius:18px;background:#0f766e;color:white;display:grid;place-items:center;font-weight:900;font-size:26px}h1,p{margin:0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:22px}.box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px}.label{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.08em}.value{margin-top:6px;font-weight:700}.tests{margin-top:28px}.tests li{margin:8px 0;font-weight:700}.signature{margin-top:42px;text-align:right}.signature img{max-width:220px;max-height:80px;object-fit:contain;display:block;margin-left:auto}.line{margin-left:auto;width:260px;border-top:1px solid #0f172a;padding-top:8px;font-weight:700;text-align:center}@media print{body{background:#fff}.page{margin:0;border:0}}
</style></head>
<body><main class="page">
<section class="header"><div class="brand"><div class="logo">GD</div><div><h1>${COMPANY_NAME}</h1><p>Laboratory / USS Request Form</p></div></div><div><p class="label">Date</p><p class="value">${new Date(order.created_at || Date.now()).toLocaleString()}</p></div></section>
<section class="grid">
<div class="box"><p class="label">Patient Name</p><p class="value">${escapeHtml(order.patient_name || fallback.patientName || order.patient_id)}</p></div>
<div class="box"><p class="label">Patient ID</p><p class="value">${escapeHtml(order.patient_id)}</p></div>
<div class="box"><p class="label">Doctor Name</p><p class="value">Dr. ${escapeHtml(order.doctor_name || fallback.doctorName || order.doctor_id)}</p></div>
<div class="box"><p class="label">Doctor R/N Number</p><p class="value">${escapeHtml(order.doctor_license_number || fallback.doctorLicenseNumber || 'Not provided')}</p></div>
<div class="box"><p class="label">Request ID</p><p class="value">${escapeHtml(order.id)}</p></div>
<div class="box"><p class="label">Company</p><p class="value">${escapeHtml(order.company_name || COMPANY_NAME)}</p></div>
</section>
<section class="tests"><p class="label">Requested Tests / Imaging</p><ul>${tests.map((test) => `<li>${escapeHtml(typeof test === 'string' ? test : test.name || JSON.stringify(test))}</li>`).join('')}</ul></section>
<section class="signature">${order.doctor_signature_data_url || fallback.doctorSignatureDataUrl ? `<img src="${escapeHtml(order.doctor_signature_data_url || fallback.doctorSignatureDataUrl)}" alt="Doctor signature" />` : ''}<div class="line">Dr. ${escapeHtml(order.doctor_name || fallback.doctorName || order.doctor_id)}</div></section>
</main></body></html>`
}

function downloadLabRequest(order, fallback) {
  const blob = new Blob([buildLabRequestHtml(order, fallback)], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `lab-request-${order.patient_name || order.patient_id || order.id}.html`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function LabRequestManager({ mode = 'list', consultationId, patientId, patientName, doctor, facilityId }) {
  const { addError } = useError()
  const [orders, setOrders] = useState([])
  const [testsText, setTestsText] = useState('')
  const [total, setTotal] = useState('1000')
  const [labFacilityId, setLabFacilityId] = useState(facilityId || '')
  const [loading, setLoading] = useState(false)

  const loadOrders = async () => {
    const params = new URLSearchParams()
    if (patientId) params.set('patientId', patientId)
    if (doctor?.id) params.set('doctorId', doctor.id)
    if (facilityId) params.set('facilityId', facilityId)
    if (consultationId) params.set('consultationId', consultationId)
    const response = await apiFetch(`/api/labs/orders?${params.toString()}`)
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Failed to load lab requests')
    setOrders(Array.isArray(data.orders) ? data.orders : [])
  }

  useEffect(() => {
    if (patientId || doctor?.id || facilityId || consultationId) void loadOrders().catch((error) => addError(error.message, 'error'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, doctor?.id, facilityId, consultationId])

  const createOrder = async (event) => {
    event.preventDefault()
    const tests = testsText.split('\n').map((item) => item.trim()).filter(Boolean)
    if (!patientId || !doctor?.id || tests.length === 0) {
      addError('Patient, doctor, and tests are required.', 'warning')
      return
    }
    setLoading(true)
    try {
      const response = await apiFetch('/api/labs/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId,
          patientId,
          patientName,
          doctorId: doctor.id,
          doctorName: doctor.name,
          doctorLicenseNumber: doctor.licenseNumber || doctor.license_number || doctor.rnNumber || '',
          doctorSignatureDataUrl: doctor.signatureDataUrl || doctor.signature_data_url || '',
          facilityId: labFacilityId || null,
          tests,
          total_price_ngn: Number(total) || 1000,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to create lab request')
      setTestsText('')
      addError('Lab request created. Patient can download it.', 'success')
      await loadOrders()
    } catch (error) {
      addError(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const fallback = {
    patientName,
    doctorName: doctor?.name,
    doctorLicenseNumber: doctor?.licenseNumber || doctor?.license_number || doctor?.rnNumber,
    doctorSignatureDataUrl: doctor?.signatureDataUrl || doctor?.signature_data_url
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Lab / USS Requests</h2>
          <p className="text-sm text-slate-500">Create and download official request forms.</p>
        </div>
        <button type="button" onClick={() => loadOrders().catch((error) => addError(error.message, 'error'))} className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">Refresh</button>
      </div>

      {mode === 'doctor' && (
        <form onSubmit={createOrder} className="mt-5 space-y-4">
          <input value={labFacilityId} onChange={(event) => setLabFacilityId(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500" placeholder="Optional lab facility ID" />
          <textarea value={testsText} onChange={(event) => setTestsText(event.target.value)} rows={4} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500" placeholder="One test per line e.g. FBC, Malaria test, USS abdomen" />
          <input type="number" value={total} onChange={(event) => setTotal(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500" placeholder="Estimated price NGN" />
          <button type="submit" disabled={loading} className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">{loading ? 'Creating...' : 'Create request form'}</button>
        </form>
      )}

      <div className="mt-5 space-y-3">
        {orders.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No lab requests yet.</p> : orders.map((order) => (
          <div key={order.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">{(order.tests || []).join(', ')}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(order.created_at).toLocaleString()} | {order.status}</p>
              </div>
              <button type="button" onClick={() => downloadLabRequest(order, fallback)} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">Download request</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LabRequestManager
