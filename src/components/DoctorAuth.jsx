import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { API_BASE } from '../lib/apiBase'
import { apiFetch } from '../lib/apiFetch'
import { buildOAuthRedirectUrl } from '../lib/authRedirect'
import { supabase } from '../lib/supabaseClient'
import { useError } from './ErrorHandler'

// ===== COUNTRY LIST (extend as needed) =====
const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia',
  'Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi',
  'Cabo Verde','Cambodia','Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia','Comoros',
  'Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominica','Dominican Republic',
  'Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia',
  'Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana',
  'Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan',
  'Kazakhstan','Kenya','Kiribati','Korea, North','Korea, South','Kosovo','Kuwait','Kyrgyzstan',
  'Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg',
  'Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar',
  'Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Macedonia','Norway',
  'Oman','Pakistan','Palau','Palestine','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal',
  'Qatar','Romania','Russia','Rwanda',
  'Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria',
  'Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu',
  'Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan',
  'Vanuatu','Vatican City','Venezuela','Vietnam',
  'Yemen','Zambia','Zimbabwe'
]

// ===== LICENSE VALIDATION BY COUNTRY =====
function getLicensePattern(country) {
  const lower = country.toLowerCase()
  if (lower.includes('united states')) return /^[A-Z]{2}\d{6,8}$/       // e.g., CA12345678
  if (lower.includes('united kingdom')) return /^\d{7}$/                // e.g., 7123456
  if (lower.includes('nigeria')) return /^MDCN\/\d{4,6}$/               // e.g., MDCN/12345
  if (lower.includes('india')) return /^[A-Z]{2}\/\d{4,6}$/             // e.g., MH/12345
  if (lower.includes('kenya')) return /^[A-Z]\d{5}$/                   // e.g., A12345
  if (lower.includes('canada')) return /^\d{5,6}$/                     // varies
  return null   // any non-empty accepted
}

function validateLicense(license, country) {
  if (!license || !license.trim()) return 'License number is required.'
  const pattern = getLicensePattern(country)
  if (pattern && !pattern.test(license.trim())) {
    return `Invalid format for ${country}. Example: ${pattern}`
  }
  return null
}

// ============================================================

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
  const [showPassword, setShowPassword] = useState(false)
  const [completingExistingUser, setCompletingExistingUser] = useState(false)

  // Restore pending profile after OAuth (if any)
  useEffect(() => {
    try {
      const pending = JSON.parse(window.localStorage.getItem('gd_pending_doctor_profile') || 'null')
      if (!pending?.email) return
      setCompletingExistingUser(true)
      setIsLogin(false)
      setFormData((prev) => ({
        ...prev,
        email: pending.email,
        name: pending.name || prev.name,
      }))
      window.localStorage.removeItem('gd_pending_doctor_profile')
    } catch {
      // ignore
    }
  }, [])

  // ========== GOOGLE SIGN‑IN (doctors only, not admin) ==========
  const handleGoogleSignIn = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_KEY) {
      addError(t('errors.server'), 'error')
      return
    }
    const redirectTo = buildOAuthRedirectUrl({ role: 'doctor', next: '/doctor/dashboard' })
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, queryParams: { prompt: 'select_account' } },
    })
    if (error) addError(error.message || t('auth.authFailed'), 'error')
  }

  const createBackendDoctorSession = async (profile) => {
    let response
    try {
      response = await apiFetch('/api/auth/oauth/bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'doctor', ...profile }),
      })
    } catch {
      throw new Error(`Could not reach the app server at ${API_BASE}. Your Google account is signed in, but the doctor dashboard needs the app server.`)
    }

    const result = await response.json().catch(() => ({}))
    if (response.status === 403 && result?.pendingApproval) {
      throw new Error(result.message || 'Your doctor account is pending platform admin approval.')
    }
    if (!response.ok || !result?.doctor?.id) {
      throw new Error(result.error || 'Could not prepare your doctor dashboard.')
    }
    return result.doctor
  }

  // ========== EMAIL / PASSWORD LOGIN (admin + doctor) ==========
  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      // 1. Validate license number when registering
      if (!isLogin && !completingExistingUser) {
        const licenseError = validateLicense(formData.licenseNumber, formData.location)
        if (licenseError) {
          addError(licenseError, 'error')
          setLoading(false)
          return
        }
      }

      if (!formData.email || (isLogin && !formData.password)) {
        throw new Error('Please enter your email and password.')
      }

      if (!isLogin && completingExistingUser) {
        const { data: updateData, error: updateError } = await supabase.auth.updateUser({
          data: {
            full_name: formData.name,
            specialty: formData.specialty,
            location: formData.location,
            license_number: formData.licenseNumber,
          },
        })
        if (updateError) throw updateError

        const user = updateData?.user
        const doctor = await createBackendDoctorSession({
          email: user?.email || formData.email,
          name: formData.name,
          specialty: formData.specialty,
          location: formData.location,
          licenseNumber: formData.licenseNumber,
        })
        onAuth({ type: 'login', ...doctor })
        return
      }

      // 2. ALWAYS call the local API first for email/password login
      const endpoint = isLogin ? '/api/doctors/login' : '/api/doctors/register'
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            email: formData.email,
            password: formData.password,
            name: formData.name,
            specialty: formData.specialty,
            location: formData.location,
            licenseNumber: formData.licenseNumber,
          }

      let response
      try {
        response = await apiFetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch (networkError) {
        // If the API is completely unreachable, show a clear error
        throw new Error(
          `Could not reach the server at ${API_BASE}. Please check your connection or try again later.`
        )
      }

      const result = await response.json().catch(() => ({}))

      // 3. Handle admin login
      if (result?.admin) {
        onAuth({
          type: 'admin-login',
          admin: result.admin,
          credentials: { email: formData.email, password: formData.password },
        })
        return
      }

      // 4. Handle doctor login / register
      if (response.status === 403 && result?.pendingApproval) {
        throw new Error(result.error || result.message || 'Your doctor account is pending platform admin approval.')
      }

      if (!response.ok) {
        throw new Error(result.error || 'Authentication failed')
      }

      if (result?.pendingApproval) {
        addError(result.message || 'Registration submitted. A platform admin must approve your account before you can sign in.', 'success', 10000)
        setIsLogin(true)
        return
      }

      if (result?.doctor) {
        onAuth({ type: isLogin ? 'login' : 'register', ...result.doctor })
      } else {
        throw new Error('Unexpected response from server')
      }
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
          {/* Google sign-in (for doctors only) */}
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

          {/* Login / Register toggle */}
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
            {!isLogin && completingExistingUser && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Complete your profile details. Your Supabase session is active, so password is optional here.
              </div>
            )}

            {/* Registration fields */}
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
                    {/* Add more as needed */}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Country</label>
                  <select
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                    required
                  >
                    <option value="">Select your country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Medical License Number
                    <span className="ml-1 text-xs text-slate-400">(must match your country’s format)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => handleChange('licenseNumber', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                    placeholder="e.g., MDCN/12345"
                    required
                  />
                  {formData.location && (
                    <p className="mt-1 text-xs text-slate-500">
                      Expected format: {getLicensePattern(formData.location)?.toString() || 'Any non‑empty value'}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Email & Password */}
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
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : completingExistingUser ? 'Complete Profile' : 'Register'}
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
