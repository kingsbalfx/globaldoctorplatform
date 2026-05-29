// ==================== PRODUCTION API URL ====================
const PRODUCTION_ORIGIN = 'https://globaldoctorplattform.vercel.app'

// ==================== UTILITY ====================
function normalizeApiBase(rawValue) {
  const value = String(rawValue || '').trim()
  if (!value) return ''
  if (value.includes('localhost') || value.includes('127.0.0.1')) return ''
  const tryParse = (candidate) => {
    try {
      const url = new URL(candidate)
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
      return url.origin
    } catch { return '' }
  }
  const absolute = tryParse(value)
  if (absolute) return absolute
  return tryParse(`https://${value}`)
}

// ==================== DETECT ENVIRONMENT ====================
let apiBase = ''

if (typeof window !== 'undefined') {
  const { origin, protocol, hostname } = window.location
  const configuredApiBase = normalizeApiBase(import.meta.env.VITE_API_BASE)
  // Capacitor / Ionic / WebView running as mobile app
  if (
    protocol === 'capacitor:' ||
    protocol === 'ionic:'
  ) {
    apiBase = configuredApiBase || PRODUCTION_ORIGIN
  } else if (import.meta.env.PROD && origin) {
    apiBase = origin
  } else if (configuredApiBase) {
    apiBase = configuredApiBase
  } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
    apiBase = 'http://localhost:4000'
  }
}

// If not set yet, fallback to build mode
if (!apiBase) {
  if (import.meta.env.PROD) {
    // Normal browser (Vercel) – use the actual domain
    apiBase = window.location.origin
  } else {
    // Local development
    apiBase = normalizeApiBase(import.meta.env.VITE_API_BASE) || 'http://localhost:4000'
  }
}

// Ultimate safety net
if (!apiBase) {
  apiBase = PRODUCTION_ORIGIN
}

export const API_BASE = apiBase.replace(/\/+$/, '')
