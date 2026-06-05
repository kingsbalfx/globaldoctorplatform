import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'
import { useError } from './ErrorHandler'

function FileManager({ headers = null }) {
  const { addError } = useError()
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [deleteFileId, setDeleteFileId] = useState('')

  const loadFiles = async () => {
    try {
      const response = await apiFetch('/api/admin/files', { headers: headers || undefined })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to load files')
      setFiles(Array.isArray(data.files) ? data.files : [])
    } catch (error) {
      addError(error.message, 'error')
    }
  }

  useEffect(() => {
    if (headers) void loadFiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers])

  const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      resolve(result.includes(',') ? result.split(',').pop() : result)
    }
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`))
    reader.readAsDataURL(file)
  })

  const handleFileUpload = async (event) => {
    const uploadedFiles = event.target.files
    if (!uploadedFiles.length) return
    if (!headers) {
      addError('Missing admin credentials. Please log in again.', 'error')
      return
    }

    setUploading(true)
    try {
      const filesToUpload = await Promise.all(Array.from(uploadedFiles).map(async (file) => ({
        name: file.name,
        mimeType: file.type,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        contentBase64: await readFileAsBase64(file),
      })))
      const response = await apiFetch('/api/admin/files/upload', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: filesToUpload }),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Upload failed')
      setFiles((current) => [...(result.files || []), ...current])
      addError('Files uploaded successfully.', 'success')
    } catch (error) {
      addError(`Upload error: ${error.message}`, 'error')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleDeleteFile = async (fileId) => {
    try {
      const response = await apiFetch(`/api/admin/files/${fileId}`, {
        method: 'DELETE',
        headers: headers || undefined,
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Delete failed')
      setFiles((current) => current.filter((file) => file.id !== fileId))
      setDeleteFileId('')
      addError('File deleted.', 'success')
    } catch (error) {
      addError(error.message, 'error')
    }
  }

  const getFileBadge = (type) => {
    const normalizedType = String(type || '').toLowerCase()
    if (normalizedType.includes('pdf')) return 'PDF'
    if (normalizedType.includes('image')) return 'IMG'
    if (normalizedType.includes('video')) return 'VID'
    if (normalizedType.includes('word')) return 'DOC'
    return 'FILE'
  }

  const filteredFiles = files.filter((file) => {
    const normalizedType = String(file.type || '').toLowerCase()
    if (filter === 'documents') return normalizedType.includes('pdf') || normalizedType.includes('word')
    if (filter === 'images') return normalizedType.includes('image')
    if (filter === 'videos') return normalizedType.includes('video')
    return true
  })

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Admin File Library</h2>
          <p className="mt-1 text-sm text-slate-600">Upload platform manuals, guides, and approved media into durable storage.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadFiles}
            className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Refresh
          </button>
          <label className="cursor-pointer rounded-full bg-brand-700 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-600">
            {uploading ? 'Uploading...' : 'Upload Files'}
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov"
            />
          </label>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'documents', 'images', 'videos'].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === option
                ? 'bg-brand-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {filteredFiles.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-8 text-center">
          <p className="text-slate-600">No files yet. Upload to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFiles.map((file) => (
            <div key={file.id} className="rounded-2xl border border-slate-200 p-4 transition hover:shadow-md">
              <div className="mb-3 flex items-start justify-between">
                <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
                  {getFileBadge(file.type)}
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteFileId(file.id)}
                  className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
              {deleteFileId === file.id && (
                <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 p-3">
                  <p className="text-xs font-bold text-red-800">Delete this file?</p>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => handleDeleteFile(file.id)} className="rounded-full bg-red-700 px-3 py-1.5 text-xs font-bold text-white">Delete</button>
                    <button type="button" onClick={() => setDeleteFileId('')} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200">Cancel</button>
                  </div>
                </div>
              )}
              <p className="truncate font-semibold text-slate-900">{file.name}</p>
              <p className="mt-1 text-xs text-slate-600">{file.size || 'Stored file'}</p>
              <p className="mt-2 text-xs text-slate-500">
                Uploaded: {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileManager
