const PRODUCTION_ORIGIN = 'https://globaldoctorplatform.vercel.app'

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

// Detect Capacitor / Ionic or any localhost scenario
if (typeof window !== 'undefined') {
  const protocol = window.location?.protocol || ''
  if (
    protocol === 'capacitor:' ||
    protocol === 'ionic:' ||
    window.location.hostname === 'localhost'
  ) {
    apiBase = PRODUCTION_ORIGIN
  }
}

if (!apiBase) {
  if (import.meta.env.PROD) {
    // Normal browser – use the current origin (your Vercel domain)
    apiBase = window.location.origin
  } else {
    // Development – use VITE_API_BASE or fallback to localhost:4000
    apiBase = normalizeApiBase(import.meta.env.VITE_API_BASE) || 'http://localhost:4000'
  }
}

// Final safety net
if (!apiBase) {
  apiBase = PRODUCTION_ORIGIN
}

export const API_BASE = apiBase.replace(/\/+$/, '')