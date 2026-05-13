import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { API_BASE } from '../lib/apiBase'
import { supabase } from '../lib/supabaseClient'
import { useError } from './ErrorHandler'

function DoctorAuth({ onAuth }) {
  const { t } = useTranslation()
  const { addError } = useError()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    specialty: '',
    location: '',
    licenseNumber: '',
  })
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_KEY) {
      addError(t('errors.server'), 'error')
      return
    }

    const redirectTo = `${window.location.origin}/auth/callback?role=doctor&next=${encodeURIComponent('/doctor/dashboard')}`
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
      } else {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              specialty: formData.specialty,
              location: formData.location,
              license_number: formData.licenseNumber,
            },
          },
        })
        if (signUpError) {
          throw signUpError
        }
        if (!signUpData?.user) {
          throw new Error('Could not create doctor account. Please try again.')
        }
      }

      const endpoint = isLogin ? '/api/doctors/login' : '/api/doctors/register'
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Authentication failed')
      }

      const result = await response.json()

      if (result?.admin) {
        onAuth({
          type: 'admin-login',
          admin: result.admin,
          credentials: { email: formData.email, password: formData.password },
        })
        return
      }

      if (result?.doctor) {
        onAuth({ type: isLogin ? 'login' : 'register', ...result.doctor })
        return
      }

      throw new Error('Unexpected authentication response')
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
          <p className="text-slate-600 mt-2">Doctor Portal</p>
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
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
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
                  <label className="block text-sm font-medium text-slate-700">Specialty</label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => handleChange('specialty', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                    required
                  >
                    <option value="">Select specialty</option>
                    <option value="General Practitioner">General Practitioner</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Oncology">Oncology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Urology">Urology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                    placeholder="City, Country"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Medical License Number</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => handleChange('licenseNumber', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                    required
                  />
                </div>
              </>
            )}

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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.href = '/'}
              className="text-sm text-brand-700 hover:text-brand-600"
            >
              ← Back to patient portal
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorAuth
