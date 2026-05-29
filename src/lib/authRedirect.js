const PRODUCTION_ORIGIN = 'https://globaldoctorplattform.vercel.app'

export function getAppOrigin() {
  const envOrigin = String(import.meta.env.VITE_PUBLIC_APP_URL || '').trim().replace(/\/+$/, '')
  if (envOrigin) return envOrigin

  if (typeof window === 'undefined') return PRODUCTION_ORIGIN

  const { origin, protocol } = window.location
  if (protocol === 'capacitor:' || protocol === 'ionic:') return PRODUCTION_ORIGIN
  return origin || PRODUCTION_ORIGIN
}

export function buildOAuthRedirectUrl({ role, next }) {
  const url = new URL('/auth/callback', getAppOrigin())
  url.searchParams.set('role', role === 'doctor' ? 'doctor' : 'patient')
  if (next) url.searchParams.set('next', next)
  return url.toString()
}
