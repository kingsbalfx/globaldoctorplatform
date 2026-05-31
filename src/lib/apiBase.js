export const PRODUCTION_ORIGIN = 'https://globaldoctorplatform.vercel.app'

function normalizeApiBase(rawValue) {
  const value = String(rawValue || '').trim()
  if (!value) return ''

  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return url.origin
  } catch {
    return ''
  }
}

let apiBase = ''

if (typeof window !== 'undefined' && import.meta.env.PROD && window.location.origin) {
  apiBase = window.location.origin
} else {
  apiBase = normalizeApiBase(import.meta.env.VITE_API_BASE) || PRODUCTION_ORIGIN
}

export const API_BASE = (apiBase || PRODUCTION_ORIGIN).replace(/\/+$/, '')
