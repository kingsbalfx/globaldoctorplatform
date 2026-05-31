import { API_BASE } from './apiBase'

/**
 * Thin wrapper around fetch that always uses the correct API base URL.
 * Every frontend component uses this to talk to the backend.
 */
export async function apiFetch(path, options = {}) {
  const normalizedPath = String(path || '').startsWith('/') ? path : `/${path}`
  const fullUrl = `${API_BASE}${normalizedPath}`

  // Standard fetch – no fallback loops, no extra origins
  return fetch(fullUrl, options)
}

export default apiFetch