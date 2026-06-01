import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'
import { supabase } from '../lib/supabaseClient'

function isSupabaseConfigured() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_KEY)
}

function hasRequiredProfile(user, role) {
  const data = user?.user_metadata || {}
  if (role === 'doctor') return Boolean(data.full_name && data.specialty && data.location && data.license_number)
  return Boolean(data.full_name && data.date_of_birth && data.phone && data.country)
}

function AuthCallback({ onNavigate, onDoctorAuth, onPatientNavigate }) {
  const [status, setStatus] = useState('Processing sign-in...')
  const [error, setError] = useState('')

  const params = useMemo(() => {
    const url = new URL(window.location.href)
    return {
      code: url.searchParams.get('code') || '',
      role: (url.searchParams.get('role') || '').toLowerCase(),
      next: url.searchParams.get('next') || '',
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const url = new URL(window.location.href)
      const providerError = url.searchParams.get('error_description') || url.searchParams.get('error')
      if (providerError) {
        setError(providerError)
        setStatus('')
        return
      }

      if (!isSupabaseConfigured()) {
        setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY.')
        setStatus('')
        return
      }

      try {
        const isOAuthCallback = url.searchParams.has('code')

        if (isOAuthCallback) {
          setStatus('Finalizing OAuth session...')
          const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(params.code)

          if (sessionError) {
            if (sessionError.message?.toLowerCase().includes('pkce code verifier not found')) {
              const { data: existingSession } = await supabase.auth.getSession()
              if (!existingSession?.session) {
                setError('Authentication session expired. Please sign in again from the same browser.')
                setStatus('')
                return
              }
            } else {
              throw sessionError
            }
          }

          if (!sessionData?.session) {
            const { data: existingSession } = await supabase.auth.getSession()
            if (existingSession?.session) {
              window.history.replaceState({}, document.title, window.location.pathname)
            } else {
              throw new Error('OAuth session was not created. Please sign in again.')
            }
          }

          // Clean callback query params from the URL after sign-in.
          window.history.replaceState({}, document.title, window.location.pathname)
        }

        setStatus('Loading profile...')
        const { data: sessionState, error: sessionStateError } = await supabase.auth.getSession()
        if (sessionStateError) {
          throw sessionStateError
        }

        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
          throw userError
        }

        const user = userData?.user || sessionState?.session?.user
        if (!user?.email) {
          throw new Error(
            'Unable to read signed-in user from Supabase. Confirm /auth/callback is whitelisted in Supabase Auth redirect URLs.'
          )
        }

        const role = params.role === 'doctor' ? 'doctor' : 'patient'

        if (!hasRequiredProfile(user, role)) {
          const key = role === 'doctor' ? 'gd_pending_doctor_profile' : 'gd_pending_patient_profile'
          window.localStorage.setItem(
            key,
            JSON.stringify({
              email: user.email,
              name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
            })
          )
          setStatus('Profile needs a few more details before the dashboard opens.')
          window.setTimeout(() => {
            if (role === 'doctor') onNavigate?.('doctor-auth')
            else onPatientNavigate?.()
          }, 900)
          return
        }

        setStatus('Preparing dashboard...')
        let response
        try {
          const metadata = user.user_metadata || {}
          response = await apiFetch('/api/auth/oauth/bridge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role,
              email: user.email,
              name: metadata.full_name || metadata.name || user.email.split('@')[0],
              dateOfBirth: metadata.date_of_birth || '',
              phone: metadata.phone || '',
              country: metadata.country || '',
              language: metadata.preferred_language || '',
              specialty: metadata.specialty || '',
              location: metadata.location || '',
              licenseNumber: metadata.license_number || '',
              licenseIssuer: metadata.license_issuer || '',
              licenseExpiry: metadata.license_expiry || '',
              signatureDataUrl: metadata.signature_data_url || '',
              passportDataUrl: metadata.passport_data_url || '',
            }),
          })
        } catch (networkError) {
          throw new Error(
            'Sign-in succeeded, but the medical server could not be reached to load your records.'
          )
        }
        const data = await response.json().catch(() => ({}))
        if (response.status === 403 && data?.pendingApproval && role === 'doctor') {
          setStatus(data.message || data.error || 'Your doctor account is pending platform admin approval.')
          setError('')
          return
        }
        if (!response.ok) throw new Error(data.error || data.message || 'Failed to initialize local session.')

        if (cancelled) return

        if (data?.admin) {
          try {
            window.localStorage.setItem('gd_platform_admin_session', JSON.stringify(data.admin))
          } catch {
            // ignore
          }
          onDoctorAuth?.({ type: 'admin-login', admin: data.admin })
          onNavigate?.('platform-admin')
          return
        }

        if (role === 'doctor') {
          const doctor = data.doctor
          if (!doctor?.id) throw new Error('Doctor session not returned.')
          try {
            window.localStorage.setItem('gd_doctor_session', JSON.stringify(doctor))
          } catch {
            // ignore
          }
          onDoctorAuth?.({ type: 'login', ...doctor })
          const next = params.next || '/doctor/dashboard'
          if (next.startsWith('/doctor/dashboard')) onNavigate?.('admin')
          else if (next.startsWith('/platform-admin')) onNavigate?.('platform-admin')
          else if (next.startsWith('/doctor')) onNavigate?.('doctor-auth')
          else if (next.startsWith('/facility')) onNavigate?.('facility')
          else if (next.startsWith('/patient')) onNavigate?.('patient')
          else onNavigate?.('landing')
          return
        }

        const patient = data.patient
        if (!patient?.id) throw new Error('Patient session not returned.')
        try {
          window.localStorage.setItem('gd_patient_session', JSON.stringify(patient))
        } catch {
          // ignore
        }

        const next = params.next || '/patient'
        if (next.startsWith('/patient')) onPatientNavigate?.()
        else if (next.startsWith('/facility')) onNavigate?.('facility')
        else if (next.startsWith('/doctor/dashboard')) onNavigate?.('admin')
        else if (next.startsWith('/doctor')) onNavigate?.('doctor-auth')
        else onNavigate?.('landing')
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Authentication failed.')
          setStatus('')
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [onDoctorAuth, onNavigate, onPatientNavigate, params.code, params.next, params.role])

  return (
    <section className="mx-auto mt-16 max-w-2xl px-6 pb-20 sm:px-8">
      <div className="rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/50">
        <h1 className="text-2xl font-bold text-slate-900">Signing you in...</h1>
        {status && <p className="mt-2 text-slate-600">{status}</p>}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onNavigate?.('landing')}
            className="rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Go Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('doctor-auth')}
            className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Doctor Portal
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('patient')}
            className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Patient Portal
          </button>
        </div>
      </div>
    </section>
  )
}

export default AuthCallback
