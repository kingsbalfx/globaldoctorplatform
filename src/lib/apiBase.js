let apiBase = String(import.meta.env.VITE_API_BASE || '').trim()

if (import.meta.env.PROD) {
  if (!apiBase || apiBase.includes('localhost') || apiBase.includes('127.0.0.1')) {
    apiBase = ''
  }
} else if (!apiBase) {
  apiBase = 'http://localhost:4000'
}

export const API_BASE = apiBase.replace(/\/+$/, '')

