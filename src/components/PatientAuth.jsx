import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { apiFetch } from '../lib/apiFetch'
import { buildOAuthRedirectUrl } from '../lib/authRedirect'
import { supabase } from '../lib/supabaseClient'
import { useError } from './ErrorHandler'
import ForgotPassword from '../pages/ForgotPassword'  // ← new import

function PatientAuth({ onAuth }) {
  const { t } = useTranslation()
  const { addError } = useError()
  const [mode, setMode] = useState('email') // 'email' | 'facility'
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    dateOfBirth: '',
    phone: '',
    country: '',
    language: 'English',
  })
  const [facilityLogin, setFacilityLogin] = useState({
    patientId: '',
    fullName: '',
    pin: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [completingExistingUser, setCompletingExistingUser] = useState(false)

  // NEW – forgot password mode
  const [forgotActive, setForgotActive] = useState(false)

  // If forgot password is active, show that component
  if (forgotActive) {
    return <ForgotPassword userType="patient" onBack={() => setForgotActive(false)} />
  }

  useEffect(() => {
    try {
      const pending = JSON.parse(window.localStorage.getItem('gd_pending_patient_profile') || 'null')
      if (!pending?.email) return
      setMode('email')
      setCompletingExistingUser(true)
      setIsLogin(false)
      setFormData((prev) => ({
        ...prev,
        email: pending.email,
        name: pending.name || prev.name,
      }))
      window.localStorage.removeItem('gd_pending_patient_profile')
    } catch {
      // ignore
    }
  }, [])

  const isPatientProfileComplete = (user) => {
    const data = user?.user_metadata || {}
    return Boolean(data.full_name && data.date_of_birth && data.phone && data.country)
  }

  const handleGoogleSignIn = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_KEY) {
      addError(t('errors.server'), 'error')
      return
    }
    const redirectTo = buildOAuthRedirectUrl({ role: 'patient', next: '/patient' })
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, queryParams: { prompt: 'select_account' } },
    })
    if (error) addError(error.message || t('auth.authFailed'), 'error')
  }

  const buildSupabasePatientSession = (user) => ({
    id: `supabase-patient-${user.id}`,
    email: user.email,
    name: user.user_metadata?.full_name || user.user_metadata?.name || formData.name || user.email?.split('@')[0] || 'Patient',
    dateOfBirth: user.user_metadata?.date_of_birth || formData.dateOfBirth || '',
    phone: user.user_metadata?.phone || formData.phone || '',
    country: user.user_metadata?.country || formData.country || 'NG',
    language: user.user_metadata?.preferred_language || formData.language || 'English',
    tokens: 0,
    isOnline: true,
  })

  const createBackendPatientSession = async (profile) => {
    let response
    try {
      response = await apiFetch('/api/auth/oauth/bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'patient', ...profile }),
      })
    } catch {
      throw new Error('Your Google account is signed in, but the medical server could not be reached to load your records.')
    }

    const result = await response.json().catch(() => ({}))
    if (!response.ok || !result?.patient?.id) {
      throw new Error(result.error || 'Could not prepare your patient dashboard.')
    }
    return result.patient
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_KEY) {
        throw new Error(
          'Supabase auth is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_KEY.'
        )
      }

      if (mode === 'facility') {
        const response = await apiFetch('/api/patients/facility/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: facilityLogin.patientId.trim() || undefined,
            fullName: facilityLogin.fullName.trim() || undefined,
            pin: facilityLogin.pin.trim(),
          }),
        })

        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          throw new Error(error.error || 'Authentication failed')
        }

        const result = await response.json()
        onAuth({ type: 'login', patient: result.patient })
        return
      }

      if (!formData.email || (isLogin && !formData.password)) {
        throw new Error('Please enter your email and password.')
      }

      let endpoint = '/api/patients/login'
      let payload = {
        email: formData.email,
        password: formData.password,
      }

      let supabaseUser = null
      if (isLogin) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (authError) {
          throw authError
        }
        supabaseUser = authData?.user || null
        if (!isPatientProfileComplete(supabaseUser)) {
          setCompletingExistingUser(true)
          setIsLogin(false)
          setFormData((prev) => ({
            ...prev,
            name: supabaseUser?.user_metadata?.full_name || prev.name,
            dateOfBirth: supabaseUser?.user_metadata?.date_of_birth || prev.dateOfBirth,
            phone: supabaseUser?.user_metadata?.phone || prev.phone,
            country: supabaseUser?.user_metadata?.country || prev.country,
            language: supabaseUser?.user_metadata?.preferred_language || prev.language,
          }))
          addError('Complete your patient profile before entering the portal.', 'warning', 8000)
          return
        }
      } else {
        if (completingExistingUser) {
          const { data: updateData, error: updateError } = await supabase.auth.updateUser({
            data: {
              full_name: formData.name,
              date_of_birth: formData.dateOfBirth,
              phone: formData.phone,
              country: formData.country,
              preferred_language: formData.language,
            },
          })
          if (updateError) throw updateError
          supabaseUser = updateData?.user || supabaseUser
          const patient = await createBackendPatientSession({
            email: supabaseUser.email || formData.email,
            name: formData.name,
            dateOfBirth: formData.dateOfBirth,
            phone: formData.phone,
            country: formData.country,
            language: formData.language,
          })
          onAuth({ type: 'login', patient })
          return
        } else {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                full_name: formData.name,
                date_of_birth: formData.dateOfBirth,
                phone: formData.phone,
                country: formData.country,
                preferred_language: formData.language,
              },
            },
          })
          if (signUpError) {
            throw signUpError
          }
          if (!signUpData?.user) {
            throw new Error('Could not create patient account. Please try again.')
          }
          supabaseUser = signUpData.user
        }

        endpoint = '/api/patients/register'
        payload = formData
      }

      let response
      try {
        response = await apiFetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch {
        if (supabaseUser) {
          onAuth({ type: completingExistingUser ? 'login' : isLogin ? 'login' : 'register', patient: buildSupabasePatientSession(supabaseUser) })
          return
        }
        throw new Error('Could not reach the app server. Please check the API URL and internet connection.')
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        if (supabaseUser && [401, 409].includes(response.status)) {
          onAuth({ type: completingExistingUser ? 'login' : isLogin ? 'login' : 'register', patient: buildSupabasePatientSession(supabaseUser) })
          return
        }
        throw new Error(error.error || 'Authentication failed')
      }

      const result = await response.json()
      onAuth({ type: completingExistingUser ? 'login' : isLogin ? 'login' : 'register', patient: result.patient })
    } catch (error) {
      addError(error.message || t('auth.authFailed'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">GlobalDoc Connect</h1>
          <p className="text-slate-600 mt-2">Patient Portal</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Continue with Google
          </button>
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold text-slate-500">OR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="flex mb-6 gap-2">
            <button
              onClick={() => setMode('email')}
              className={`flex-1 py-2 px-4 rounded-2xl font-semibold transition ${
                mode === 'email' ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setMode('facility')}
              className={`flex-1 py-2 px-4 rounded-2xl font-semibold transition ${
                mode === 'facility' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Clinic / PHC PIN
            </button>
          </div>

          {mode === 'email' && (
            <div className="flex mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-2xl font-semibold transition ${
                  isLogin ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-2xl font-semibold transition ml-2 ${
                  !isLogin ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'email' && !isLogin && completingExistingUser && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Complete your profile details. Your Supabase session is active, so password is optional here.
              </div>
            )}
            {mode === 'email' && !isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                    required
                  >
                    <option value="">Select country</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="KE">Kenya</option>
                    <option value="NG">Nigeria</option>
                    <option value="ZA">South Africa</option>
                    <option value="IN">India</option>
                    <option value="BR">Brazil</option>
                    <option value="MX">Mexico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Preferred Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Swahili">Swahili</option>
                    <option value="Portuguese">Portuguese</option>
                  </select>
                </div>
              </>
            )}

            {mode === 'email' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      required={!completingExistingUser}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                {/* NEW – Forgot password link (only on login) */}
                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setForgotActive(true)}
                      className="text-sm text-brand-700 hover:text-brand-600 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Patient ID (recommended)</label>
                  <input
                    type="text"
                    value={facilityLogin.patientId}
                    onChange={(e) => setFacilityLogin((prev) => ({ ...prev, patientId: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                    placeholder="patient-123 or patient-171..."
                  />
                  <p className="mt-2 text-xs text-slate-500">If you don&apos;t have your Patient ID, use Full Name + PIN.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={facilityLogin.fullName}
                    onChange={(e) => setFacilityLogin((prev) => ({ ...prev, fullName: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">6-digit PIN</label>
                  <input
                    inputMode="numeric"
                    value={facilityLogin.pin}
                    onChange={(e) => setFacilityLogin((prev) => ({ ...prev, pin: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                    placeholder="123456"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (mode === 'facility' ? 'Login' : (isLogin ? 'Login' : completingExistingUser ? 'Complete Profile' : 'Create Account'))}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.href = '/'}
              className="text-sm text-brand-700 hover:text-brand-600"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientAuth
