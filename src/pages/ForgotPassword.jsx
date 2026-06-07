import { useState } from 'react'
import { apiFetch, readApiJson } from '../lib/apiFetch'
import { useError } from '../components/ErrorHandler'

function ForgotPassword({ userType, onBack }) {
  const { addError } = useError()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return addError('Please enter your email address.', 'warning')
    setLoading(true)
    try {
      const response = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), userType }),
      })
      const data = await readApiJson(response)
      if (!response.ok) throw new Error(data.error || 'Unable to send the reset email. Please try again.')
      if (data.delivered === false) addError(data.message || 'If the account exists, a reset email will be sent.', 'info')
      setSent(true)
    } catch (error) {
      addError(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
          <p className="mt-4 text-slate-600">A reset link was requested for {email}. Check your inbox and spam folder.</p>
          <button
            onClick={onBack}
            className="mt-6 text-brand-700 hover:text-brand-600 font-medium"
          >
            ← Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your email address and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
            placeholder="you@example.com"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <button
          onClick={onBack}
          className="mt-6 text-sm text-brand-700 hover:text-brand-600 font-medium"
        >
          ← Back to login
        </button>
      </div>
    </div>
  )
}

export default ForgotPassword
