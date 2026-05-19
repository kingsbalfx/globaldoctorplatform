function normalizeApiBase(rawValue) {
  const value = String(rawValue || '').trim()
  if (!value) return ''
  if (value.includes('localhost') || value.includes('127.0.0.1')) return ''

  const tryParse = (candidate) => {
    try {
      const url = new URL(candidate)
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
      return url.origin
    } catch {
      return ''
    }
  }

  const absolute = tryParse(value)
  if (absolute) return absolute

  // Allow values like "my-app.vercel.app" (Vercel's `VERCEL_URL` has no protocol).
  return tryParse(`https://${value}`)
}

let apiBase = normalizeApiBase(import.meta.env.VITE_API_BASE)

if (!apiBase && typeof window !== 'undefined') {
  const protocol = window.location?.protocol || ''
  if (protocol === 'capacitor:' || protocol === 'ionic:') {
    apiBase = 'https://globaldoctorplatform.vercel.app'
  }
}

if (!import.meta.env.PROD && !apiBase) {
  apiBase = 'http://localhost:4000'
}

export const API_BASE = apiBase.replace(/\/+$/, '')
