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
  return tryParse(`https://${value}`)
}

let apiBase = ''

// If running in production (Vite build), always use the current domain.
// This ensures the API works on Vercel without env vars.
if (import.meta.env.PROD) {
  apiBase = window.location.origin
} else {
  // Development: try VITE_API_BASE env, then fallback to localhost
  apiBase = normalizeApiBase(import.meta.env.VITE_API_BASE) || 'http://localhost:4000'
}

// Safety net for Capacitor/Ionic hybrid apps
if (typeof window !== 'undefined') {
  const protocol = window.location?.protocol || ''
  if (protocol === 'capacitor:' || protocol === 'ionic:') {
    apiBase = 'https://globaldoctorplatform.vercel.app'
  }
}

export const API_BASE = apiBase.replace(/\/+$/, '')