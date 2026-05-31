// ==================== PRODUCTION API URL ====================
const PRODUCTION_ORIGIN = 'https://globaldoctorplatform.vercel.app'

// ==================== UTILITY ====================
function normalizeApiBase(rawValue) {
  const value = String(rawValue || '').trim()
  if (!value) return ''
  if (value.includes('localhost') || value.includes('127.0.0.1')) return ''
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return url.origin
  } catch { return '' }
}

// ==================== DETERMINE API BASE ====================
let apiBase = ''

// In production (Vite build), ALWAYS use the live domain – no exceptions.
if (import.meta.env.PROD) {
  apiBase = PRODUCTION_ORIGIN
}
// In development (npm run dev), use the env variable or localhost.
else {
  apiBase = normalizeApiBase(import.meta.env.VITE_API_BASE) || 'http://localhost:4000'
}

// Final safety net – just in case
export const API_BASE = (apiBase || PRODUCTION_ORIGIN).replace(/\/+$/, '')