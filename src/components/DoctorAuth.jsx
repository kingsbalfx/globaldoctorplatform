import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { apiFetch } from '../lib/apiFetch'
import { buildOAuthRedirectUrl } from '../lib/authRedirect'
import { supabase } from '../lib/supabaseClient'
import { useError } from './ErrorHandler'
import ForgotPassword from '../pages/ForgotPassword'   // ← new import
import GoogleSignInButton from './GoogleSignInButton'

// ===== COUNTRY LIST (extend as needed) =====
export const COUNTRIES = [
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
    licenseIssuer: '',
    licenseExpiry: '',
    bankCode: '',
    bankAccount: '',
    currency: 'NGN',
    payoutMethod: 'bank_account',
    mobileMoneyOperator: '',
    mobileMoneyNumber: '',
    signatureDataUrl: '',
    passportDataUrl: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [completingExistingUser, setCompletingExistingUser] = useState(false)

  // NEW – forgot password mode
  const [forgotActive, setForgotActive] = useState(false)

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
  // If forgot password is active, show that component after all hooks have run.
  if (forgotActive) {
    return <ForgotPassword userType="doctor" onBack={() => setForgotActive(false)} />
  }

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
      throw new Error('Your Google account is signed in, but the medical server could not be reached to prepare the doctor dashboard.')
    }

    const result = await response.json().catch(() => ({}))
    if (response.status === 403 && result?.pendingApproval) {
      return { pendingApproval: true, message: result.message || 'Your doctor account is pending platform admin approval.' }
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
      if (!isLogin) {
        const licenseError = validateLicense(formData.licenseNumber, formData.location)
        if (licenseError) {
          addError(licenseError, 'error')
          setLoading(false)
          return
        }
      }

      if (!isLogin && (!formData.signatureDataUrl || !formData.passportDataUrl)) {
        throw new Error('Upload both your signature and passport photo before submitting.')
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
            license_issuer: formData.licenseIssuer,
            license_expiry: formData.licenseExpiry,
            signature_data_url: formData.signatureDataUrl,
            passport_data_url: formData.passportDataUrl,
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
          licenseIssuer: formData.licenseIssuer,
          licenseExpiry: formData.licenseExpiry,
          bankCode: formData.bankCode,
          bankAccount: formData.bankAccount,
          currency: formData.currency,
          payoutMethod: formData.payoutMethod,
          mobileMoneyOperator: formData.mobileMoneyOperator,
          mobileMoneyNumber: formData.mobileMoneyNumber,
          signatureDataUrl: formData.signatureDataUrl,
          passportDataUrl: formData.passportDataUrl,
        })
        if (doctor?.pendingApproval) {
          addError(doctor.message || 'Profile submitted. A platform admin must approve your account before you can sign in.', 'success', 10000)
          setCompletingExistingUser(false)
          setIsLogin(true)
          return
        }
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
            licenseIssuer: formData.licenseIssuer,
            licenseExpiry: formData.licenseExpiry,
            bankCode: formData.bankCode,
            bankAccount: formData.bankAccount,
            currency: formData.currency,
            payoutMethod: formData.payoutMethod,
            mobileMoneyOperator: formData.mobileMoneyOperator,
            mobileMoneyNumber: formData.mobileMoneyNumber,
            signatureDataUrl: formData.signatureDataUrl,
            passportDataUrl: formData.passportDataUrl,
          }

      let response
      try {
        response = await apiFetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch (networkError) {
        throw new Error(
          'Could not reach the medical server. Please check your connection or try again later.'
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

  const handleSignatureUpload = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      addError('Upload a signature image file.', 'warning')
      return
    }
    if (file.size > 300 * 1024) {
      addError('Signature image must be 300KB or less.', 'warning')
      return
    }
    const reader = new FileReader()
    reader.onload = () => handleChange('signatureDataUrl', String(reader.result || ''))
    reader.onerror = () => addError('Could not read signature image.', 'error')
    reader.readAsDataURL(file)
  }

  const handlePassportUpload = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      addError('Upload a passport photo image file.', 'warning')
      return
    }
    if (file.size > 500 * 1024) {
      addError('Passport photo must be 500KB or less.', 'warning')
      return
    }
    const reader = new FileReader()
    reader.onload = () => handleChange('passportDataUrl', String(reader.result || ''))
    reader.onerror = () => addError('Could not read passport photo.', 'error')
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">GlobalDoc Connect</h1>
          <p className="text-slate-600 mt-2">Doctor Portal</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
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
                <div>
                  <label className="block text-sm font-medium text-slate-700">License Issuer / Medical Council</label>
                  <input
                    type="text"
                    value={formData.licenseIssuer}
                    onChange={(e) => handleChange('licenseIssuer', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                    placeholder="e.g., Medical and Dental Council of Nigeria"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">License Expiry Date</label>
                  <input
                    type="date"
                    value={formData.licenseExpiry}
                    onChange={(e) => handleChange('licenseExpiry', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                  />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="block text-sm font-medium text-slate-700">Payout Method</label>
                  <select
                    value={formData.payoutMethod}
                    onChange={(e) => handleChange('payoutMethod', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                  >
                    <option value="bank_account">Bank account</option>
                    <option value="mobile_money">Mobile money</option>
                  </select>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value.toUpperCase())}
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                    placeholder="Currency, e.g. NGN"
                  />
                  {formData.payoutMethod === 'bank_account' ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        value={formData.bankCode}
                        onChange={(e) => handleChange('bankCode', e.target.value)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                        placeholder="Bank code"
                      />
                      <input
                        type="text"
                        value={formData.bankAccount}
                        onChange={(e) => handleChange('bankAccount', e.target.value)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                        placeholder="Bank account number"
                      />
                    </div>
                  ) : (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        value={formData.mobileMoneyOperator}
                        onChange={(e) => handleChange('mobileMoneyOperator', e.target.value)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                        placeholder="Mobile money operator"
                      />
                      <input
                        type="text"
                        value={formData.mobileMoneyNumber}
                        onChange={(e) => handleChange('mobileMoneyNumber', e.target.value)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                        placeholder="Mobile money number"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Signature Image</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => handleSignatureUpload(e.target.files?.[0])}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                    required={!formData.signatureDataUrl}
                  />
                  <p className="mt-1 text-xs text-slate-500">Upload a clear PNG/JPG/WebP signature. Max 300KB.</p>
                  {formData.signatureDataUrl && (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <img src={formData.signatureDataUrl} alt="Signature preview" className="max-h-20 object-contain" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Passport Photo</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => handlePassportUpload(e.target.files?.[0])}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                    required={!formData.passportDataUrl}
                  />
                  <p className="mt-1 text-xs text-slate-500">Upload a clear doctor passport/headshot. Max 500KB.</p>
                  {formData.passportDataUrl && (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <img src={formData.passportDataUrl} alt="Passport preview" className="h-24 w-24 rounded-2xl object-cover" />
                    </div>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : completingExistingUser ? 'Complete Profile' : 'Register'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold text-slate-500">OR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="mt-5">
            <GoogleSignInButton onClick={handleGoogleSignIn} />
          </div>

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
