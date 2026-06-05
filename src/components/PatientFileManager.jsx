import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'
import { useError } from './ErrorHandler'

function PatientFileManager({ patientId }) {
  const { addError } = useError()
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (patientId) loadFiles()
  }, [patientId])

  const loadFiles = async () => {
    setLoading(true)
    try {
      const response = await apiFetch(`/api/patients/files?patientId=${encodeURIComponent(patientId)}`)
      const data = await response.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error('Failed to load patient files', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !patientId) return

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1]
        const response = await apiFetch(`/api/patients/files/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId,
            name: selectedFile.name,
            mimeType: selectedFile.type,
            size: selectedFile.size,
            contentBase64: base64,
          }),
        })
        if (!response.ok) {
          throw new Error('File upload failed')
        }
        await loadFiles()
        setSelectedFile(null)
        addError('File uploaded successfully.', 'success')
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      addError(error.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (fileId) => {
    try {
      const response = await apiFetch(`/api/patients/files/${fileId}/download?patientId=${encodeURIComponent(patientId)}`)
      if (!response.ok) {
        throw new Error('Download failed')
      }
      const data = await response.json()
      const blob = new Blob([Uint8Array.from(atob(data.contentBase64), (c) => c.charCodeAt(0))], { type: data.mimeType })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = data.name
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      addError(error.message, 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">
        <h2 className="text-xl font-semibold text-slate-900">Health Records</h2>
        <p className="mt-2 text-sm text-slate-500">Upload documents, test results, or video notes for your doctor.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
          <label className="flex w-full cursor-pointer items-center justify-between rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 hover:border-brand-500 hover:bg-white">
            {selectedFile ? selectedFile.name : 'Choose a file to upload'}
            <input type="file" accept="application/pdf,video/*,image/*,.doc,.docx" className="hidden" onChange={handleFileChange} />
          </label>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="rounded-3xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40">Loading files...</div>
      ) : files.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40 text-slate-600">You have no uploaded records yet.</div>
      ) : (
        <div className="space-y-4">
          {files.map((file) => (
            <div key={file.id} className="rounded-3xl bg-white p-5 shadow-lg shadow-slate-200/40 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-semibold text-slate-900">{file.name}</p>
                <p className="text-sm text-slate-500">{file.mimeType} · {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-1">Uploaded {new Date(file.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => handleDownload(file.id)}
                className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PatientFileManager
