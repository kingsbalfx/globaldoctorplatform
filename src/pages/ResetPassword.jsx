import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'  // or use window.location
import { apiFetch } from '../lib/apiFetch'
import { useError } from '../components/ErrorHandler'

function ResetPassword() {
  const { addError } = useError()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const searchParams = new URLSearchParams(window.location.search)
  const token = searchParams.get('token') || ''
  const userType = searchParams.get('userType') || 'patient'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) return addError('Passwords do not match.', 'warning')
    setLoading(true)
    try {
      const response = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password, userType }),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Reset failed')
      }
      setSuccess(true)
    } catch (error) {
      addError(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Password reset</h1>
          <p className="mt-4 text-slate-600">Your password has been changed. You can now log in.</p>
          <a href={userType === 'doctor' ? '/doctor' : '/patient'}
             className="mt-6 inline-block text-brand-700 hover:text-brand-600 font-medium">
            Go to login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-slate-900">Set new password</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
            placeholder="New password"
            required
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
            placeholder="Confirm new password"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword