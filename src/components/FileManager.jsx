import { useState } from 'react'
import { API_BASE } from '../lib/apiBase'

function FileManager() {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState('all')

  const handleFileUpload = async (event) => {
    const uploadedFiles = event.target.files
    if (!uploadedFiles.length) return

    setUploading(true)
    const formData = new FormData()

    for (let file of uploadedFiles) {
      formData.append('files', file)
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/files/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')
      const result = await response.json()
      setFiles([...files, ...result.files])
      alert('Files uploaded successfully!')
    } catch (error) {
      alert('Upload error: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Delete this file?')) return

    try {
      const response = await fetch(`${API_BASE}/api/admin/files/${fileId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Delete failed')
      setFiles(files.filter(f => f.id !== fileId))
      alert('File deleted!')
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('image')) return '🖼️'
    if (type.includes('video')) return '🎬'
    if (type.includes('word')) return '📝'
    return '📎'
  }

  const filteredFiles = files.filter(f => {
    if (filter === 'documents') return f.type.includes('pdf') || f.type.includes('word')
    if (filter === 'images') return f.type.includes('image')
    if (filter === 'videos') return f.type.includes('video')
    return true
  })

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">File Manager</h2>
        <label className="cursor-pointer rounded-full bg-brand-700 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-600">
          {uploading ? 'Uploading...' : '+ Upload Files'}
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

      <div className="flex gap-2 mb-6">
        {['all', 'documents', 'images', 'videos'].map(option => (
          <button
            key={option}
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
          {filteredFiles.map(file => (
            <div key={file.id} className="rounded-2xl border border-slate-200 p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{getFileIcon(file.type)}</div>
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  className="text-red-600 hover:text-red-700 text-lg"
                >
                  ✕
                </button>
              </div>
              <p className="font-semibold text-slate-900 truncate">{file.name}</p>
              <p className="text-xs text-slate-600 mt-1">{file.size}</p>
              <p className="text-xs text-slate-500 mt-2">
                Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileManager
