import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'
import { useError } from './ErrorHandler'

const COMPANY_NAME = 'GlobalDoc'

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function buildPrescriptionHtml(prescription) {
  const issued = prescription.issued_at || prescription.created_at || new Date().toISOString()
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Prescription - ${escapeHtml(prescription.patient_name)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f8fafc; color: #0f172a; }
    .page { max-width: 840px; margin: 28px auto; background: #fff; border: 1px solid #e2e8f0; padding: 36px; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #0f766e; padding-bottom: 20px; }
    .brand { display: flex; gap: 14px; align-items: center; }
    .logo { width: 62px; height: 62px; border-radius: 18px; background: #0f766e; color: #fff; display: grid; place-items: center; font-size: 26px; font-weight: 800; }
    h1, h2, p { margin: 0; }
    h1 { font-size: 28px; }
    h2 { margin-top: 28px; font-size: 16px; color: #0f766e; text-transform: uppercase; letter-spacing: 0.08em; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 22px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; }
    .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; }
    .value { margin-top: 6px; font-size: 15px; font-weight: 700; }
    pre { white-space: pre-wrap; font: 15px/1.6 Arial, sans-serif; background: #f8fafc; padding: 18px; border-radius: 14px; border: 1px solid #e2e8f0; }
    .footer { margin-top: 36px; display: flex; justify-content: space-between; gap: 24px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
    .signature { min-width: 260px; text-align: center; }
    .signature img { max-width: 220px; max-height: 80px; object-fit: contain; display: block; margin: 0 auto 8px; }
    .signature-line { border-top: 1px solid #0f172a; padding-top: 8px; font-weight: 700; }
    @media print { body { background: #fff; } .page { margin: 0; border: 0; } }
  </style>
</head>
<body>
  <main class="page">
    <section class="header">
      <div class="brand">
        <div class="logo">GD</div>
        <div>
          <h1>${COMPANY_NAME}</h1>
          <p>Digital Healthcare Prescription</p>
        </div>
      </div>
      <div>
        <p class="label">Date</p>
        <p class="value">${new Date(issued).toLocaleString()}</p>
      </div>
    </section>
    <section class="grid">
      <div class="box"><p class="label">Patient Name</p><p class="value">${escapeHtml(prescription.patient_name)}</p></div>
      <div class="box"><p class="label">Patient ID</p><p class="value">${escapeHtml(prescription.patient_id)}</p></div>
      <div class="box"><p class="label">Doctor Name</p><p class="value">Dr. ${escapeHtml(prescription.doctor_name)}</p></div>
      <div class="box"><p class="label">Doctor R/N Number</p><p class="value">${escapeHtml(prescription.doctor_license_number || prescription.rn_number || 'Not provided')}</p></div>
    </section>
    <h2>Prescription</h2>
    <pre>${escapeHtml(prescription.medications || prescription.prescription_text)}</pre>
    <h2>Clinical Notes</h2>
    <pre>${escapeHtml(prescription.notes || 'No additional notes.')}</pre>
    <section class="footer">
      <div>
        <p class="label">Company</p>
        <p class="value">${COMPANY_NAME}</p>
      </div>
      <div class="signature">
        ${prescription.doctor_signature_data_url ? `<img src="${escapeHtml(prescription.doctor_signature_data_url)}" alt="Doctor signature" />` : ''}
        <div class="signature-line">Dr. ${escapeHtml(prescription.doctor_name)}</div>
      </div>
    </section>
  </main>
</body>
</html>`
}

export function downloadPrescription(prescription) {
  const html = buildPrescriptionHtml(prescription)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `prescription-${prescription.patient_name || prescription.patient_id || prescription.id}.html`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function PrescriptionManager({ mode = 'list', patientId, patientName, doctor, consultationId, facilityId }) {
  const { addError } = useError()
  const [prescriptions, setPrescriptions] = useState([])
  const [medications, setMedications] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const loadPrescriptions = async () => {
    const params = new URLSearchParams()
    if (patientId) params.set('patientId', patientId)
    if (doctor?.id) params.set('doctorId', doctor.id)
    if (facilityId) params.set('facilityId', facilityId)
    if (consultationId) params.set('consultationId', consultationId)
    const response = await apiFetch(`/api/prescriptions?${params.toString()}`)
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Failed to load prescriptions')
    setPrescriptions(Array.isArray(data.prescriptions) ? data.prescriptions : [])
  }

  useEffect(() => {
    if (patientId || doctor?.id || facilityId || consultationId) {
      void loadPrescriptions().catch((error) => addError(error.message, 'error'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, doctor?.id, facilityId, consultationId])

  const submitPrescription = async (event) => {
    event.preventDefault()
    if (!patientId || !doctor?.id || !consultationId || !medications.trim()) {
      addError('Patient, consultation, doctor, and prescription text are required.', 'warning')
      return
    }
    setLoading(true)
    try {
      const response = await apiFetch('/api/prescriptions', {
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
          facilityId,
          medications,
          notes,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to send prescription')
      setMedications('')
      setNotes('')
      addError('Prescription sent to patient and facility records.', 'success')
      await loadPrescriptions()
    } catch (error) {
      addError(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Prescriptions</h2>
          <p className="text-sm text-slate-500">Create, share, and download official GlobalDoc prescriptions.</p>
        </div>
        <button type="button" onClick={() => loadPrescriptions().catch((error) => addError(error.message, 'error'))} className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">
          Refresh
        </button>
      </div>

      {mode === 'doctor' && (
        <form onSubmit={submitPrescription} className="mt-5 space-y-4">
          <textarea
            value={medications}
            onChange={(event) => setMedications(event.target.value)}
            rows={5}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500"
            placeholder="Medication, dosage, frequency, duration..."
          />
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500"
            placeholder="Diagnosis, instructions, follow-up notes..."
          />
          <button type="submit" disabled={loading} className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
            {loading ? 'Sending...' : 'Send prescription'}
          </button>
        </form>
      )}

      <div className="mt-5 space-y-3">
        {prescriptions.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No prescriptions yet.</p>
        ) : (
          prescriptions.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.patient_name || item.patient_id}</p>
                  <p className="mt-1 text-xs text-slate-500">Dr. {item.doctor_name} | {new Date(item.issued_at || item.created_at).toLocaleString()}</p>
                </div>
                <button type="button" onClick={() => downloadPrescription(item)} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                  Download
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default PrescriptionManager
