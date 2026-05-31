import { API_BASE, PRODUCTION_ORIGIN } from './apiBase'

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).replace(/\/+$/, '')))]
}

export function getApiBaseCandidates() {
  const sameOrigin = typeof window !== 'undefined' ? window.location.origin : ''
  return unique([API_BASE, PRODUCTION_ORIGIN, sameOrigin])
}

export async function apiFetch(path, options = {}) {
  const normalizedPath = String(path || '').startsWith('/') ? path : `/${path}`
  let lastError

  for (const base of getApiBaseCandidates()) {
    try {
      return await fetch(`${base}${normalizedPath}`, options)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('Network request failed')
}

export default apiFetch
