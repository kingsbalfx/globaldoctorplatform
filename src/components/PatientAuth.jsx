import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { API_BASE } from '../lib/apiBase'
import { supabase } from '../lib/supabaseClient'
import { useError } from './ErrorHandler'

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

  const handleGoogleSignIn = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_KEY) {
      addError(t('errors.server'), 'error')
      return
    }
    const redirectTo = `${window.location.origin}/auth/callback?role=patient&next=${encodeURIComponent('/patient')}`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (error) addError(error.message || t('auth.authFailed'), 'error')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      if (mode === 'facility') {
        const response = await fetch(`${API_BASE}/api/patients/facility/login`, {
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
        onAuth({ type: 'login', ...result.patient })
        return
      }

      if (!formData.email || !formData.password) {
        throw new Error('Please enter your email and password.')
      }

      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (authError) {
          throw authError
        }

        // Only send email and password for login
        const loginPayload = {
          email: formData.email,
          password: formData.password,
        }

        const endpoint = '/api/patients/login'
        const response = await fetch(`${API_BASE}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginPayload),
        })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Authentication failed')
      }

      const result = await response.json()
      onAuth({ type: isLogin ? 'login' : 'register', ...result.patient })
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
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                    required
                  />
                </div>
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
              {loading ? 'Processing...' : (mode === 'facility' ? 'Login' : (isLogin ? 'Login' : 'Create Account'))}
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
