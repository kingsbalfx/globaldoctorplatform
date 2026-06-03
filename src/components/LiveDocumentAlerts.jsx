import { useEffect, useRef, useState } from 'react'
import { FileText, FlaskConical, X } from 'lucide-react'
import { apiFetch } from '../lib/apiFetch'
import { downloadPrescription } from './PrescriptionManager'
import { downloadLabRequest } from './LabRequestManager'

function LiveDocumentAlerts({ consultationId, patientId, patientName, doctor, facilityId }) {
  const [latestItem, setLatestItem] = useState(null)
  const [recentItems, setRecentItems] = useState([])
  const seenRef = useRef(new Set())
  const initializedRef = useRef(false)
  const contextKey = `${consultationId || ''}:${patientId || ''}:${facilityId || ''}`

  useEffect(() => {
    seenRef.current = new Set()
    initializedRef.current = false
    setLatestItem(null)
    setRecentItems([])
  }, [contextKey])

  useEffect(() => {
    if (!patientId && !consultationId) return undefined
    let cancelled = false

    const loadDocuments = async () => {
      const prescriptionParams = new URLSearchParams()
      const labParams = new URLSearchParams()
      if (patientId) {
        prescriptionParams.set('patientId', patientId)
        labParams.set('patientId', patientId)
      }
      if (consultationId) {
        prescriptionParams.set('consultationId', consultationId)
        labParams.set('consultationId', consultationId)
      }
      if (facilityId) {
        prescriptionParams.set('facilityId', facilityId)
        labParams.set('facilityId', facilityId)
      }

      const [prescriptionResponse, labResponse] = await Promise.all([
        apiFetch(`/api/prescriptions?${prescriptionParams.toString()}`),
        apiFetch(`/api/labs/orders?${labParams.toString()}`),
      ])
      const [prescriptionData, labData] = await Promise.all([
        prescriptionResponse.json().catch(() => ({})),
        labResponse.json().catch(() => ({})),
      ])
      if (!prescriptionResponse.ok || !labResponse.ok || cancelled) return

      const prescriptions = Array.isArray(prescriptionData.prescriptions) ? prescriptionData.prescriptions : []
      const labs = Array.isArray(labData.orders) ? labData.orders : []
      const items = [
        ...prescriptions.map((item) => ({
          id: `prescription:${item.id}`,
          type: 'prescription',
          title: 'New prescription received',
          subtitle: item.medications || item.prescription_text || 'Prescription from your doctor',
          createdAt: item.issued_at || item.created_at,
          data: item,
        })),
        ...labs.map((item) => ({
          id: `lab:${item.id}`,
          type: 'lab',
          title: 'New lab request received',
          subtitle: (item.tests || []).map((test) => (typeof test === 'string' ? test : test.name)).filter(Boolean).join(', ') || 'Lab / USS request form',
          createdAt: item.created_at,
          data: item,
        })),
      ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      setRecentItems(items.slice(0, 4))

      if (!initializedRef.current) {
        items.forEach((item) => seenRef.current.add(item.id))
        initializedRef.current = true
        return
      }

      const nextItem = items.find((item) => !seenRef.current.has(item.id))
      if (!nextItem) return
      seenRef.current.add(nextItem.id)
      setLatestItem(nextItem)
      window.setTimeout(() => {
        if (nextItem.type === 'prescription') downloadPrescription(nextItem.data)
        if (nextItem.type === 'lab') {
          downloadLabRequest(nextItem.data, {
            patientName,
            doctorName: doctor?.name,
            doctorLicenseNumber: doctor?.licenseNumber || doctor?.license_number || doctor?.rnNumber,
            doctorSignatureDataUrl: doctor?.signatureDataUrl || doctor?.signature_data_url,
          })
        }
      }, 350)
    }

    void loadDocuments().catch(() => null)
    const interval = window.setInterval(() => {
      void loadDocuments().catch(() => null)
    }, 2500)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [consultationId, patientId, patientName, doctor, facilityId])

  if (!latestItem && recentItems.length === 0) return null

  const downloadItem = (item) => {
    if (item.type === 'prescription') downloadPrescription(item.data)
    if (item.type === 'lab') {
      downloadLabRequest(item.data, {
        patientName,
        doctorName: doctor?.name,
        doctorLicenseNumber: doctor?.licenseNumber || doctor?.license_number || doctor?.rnNumber,
        doctorSignatureDataUrl: doctor?.signatureDataUrl || doctor?.signature_data_url,
      })
    }
  }
  const Icon = latestItem?.type === 'prescription' ? FileText : FlaskConical

  return (
    <div className="space-y-4">
      {latestItem && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-lg shadow-emerald-100/70">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Live document</p>
                <h3 className="mt-1 text-lg font-black text-slate-900">{latestItem.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{latestItem.subtitle}</p>
                <p className="mt-2 text-xs font-semibold text-emerald-800">Download started. You can download again here or review it later in the normal section.</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => downloadItem(latestItem)} className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800">
                Download
              </button>
              <button type="button" onClick={() => setLatestItem(null)} className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-500 ring-1 ring-emerald-100 hover:text-slate-900">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {recentItems.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/40">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Current consultation documents</p>
              <h3 className="text-lg font-black text-slate-900">Quick downloads</h3>
            </div>
            <p className="text-xs font-semibold text-slate-500">Saved in Prescriptions or Lab Requests for later review.</p>
          </div>
          <div className="mt-4 grid gap-3">
            {recentItems.map((item) => {
              const ItemIcon = item.type === 'prescription' ? FileText : FlaskConical
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => downloadItem(item)}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-emerald-700 ring-1 ring-slate-200">
                      <ItemIcon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-slate-900">{item.title}</span>
                      <span className="line-clamp-1 text-xs text-slate-500">{item.subtitle}</span>
                    </span>
                  </span>
                  <span className="rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white">Download</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default LiveDocumentAlerts
