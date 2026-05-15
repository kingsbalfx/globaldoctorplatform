import { useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../lib/apiBase'
import { supabase } from '../lib/supabaseClient'

function isSupabaseConfigured() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_KEY)
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
        if (params.code) {
          setStatus('Finalizing session...')
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(params.code)
          if (exchangeError) {
            // Handle PKCE verifier not found error specifically
            if (exchangeError.message?.includes('PKCE code verifier not found')) {
              setError('Authentication session expired. Please try signing in again.')
              setStatus('')
              return
            }
            throw exchangeError
          }
        } else if (supabase.auth.getSessionFromUrl) {
          setStatus('Retrieving session from callback URL...')
          const { error: urlError } = await supabase.auth.getSessionFromUrl({ storeSession: true })
          if (urlError) {
            // Handle PKCE verifier not found error specifically
            if (urlError.message?.includes('PKCE code verifier not found')) {
              setError('Authentication session expired. Please try signing in again.')
              setStatus('')
              return
            }
            throw urlError
          }
        }
            throw urlError
          }
        }

        setStatus('Loading profile...')
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        const user = userData?.user
        if (!user?.email) throw new Error('No email returned from OAuth provider.')

        const role = params.role === 'doctor' ? 'doctor' : 'patient'

        setStatus('Preparing dashboard...')
        const response = await fetch(`${API_BASE}/api/auth/oauth/bridge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
          }),
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || 'Failed to initialize local session.')

        if (cancelled) return

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
          setError(err.message || 'Authentication failed.')
          setStatus('')
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [onDoctorAuth, onNavigate, onPatientNavigate, params.code, params.role])

  return (
    <section className="mx-auto mt-16 max-w-2xl px-6 pb-20 sm:px-8">
      <div className="rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/50">
        <h1 className="text-2xl font-bold text-slate-900">Signing you in…</h1>
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
