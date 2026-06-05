import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'

function readPaymentMetadata(payment) {
  const metadata = payment?.metadata
  if (!metadata) return {}
  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata)
    } catch {
      return {}
    }
  }
  return metadata
}

function PaymentSuccess({ onNavigate }) {
  const [status, setStatus] = useState('Verifying payment...')
  const [error, setError] = useState('')
  const [tokens, setTokens] = useState(null)

  const reference = useMemo(() => {
    const url = new URL(window.location.href)
    return url.searchParams.get('payment_reference')
      || url.searchParams.get('reference')
      || url.searchParams.get('transaction_reference')
      || url.searchParams.get('trxref')
      || ''
  }, [])

  useEffect(() => {
    let redirectTimer
    const maxAttempts = 8
    const scheduleRetry = (attempt, message = 'Kora is still confirming your card payment...') => {
      setStatus(`${message} Attempt ${attempt + 1}/${maxAttempts}.`)
      redirectTimer = window.setTimeout(() => {
        void verify(attempt + 1)
      }, 2500)
    }
    const verify = async (attempt = 1) => {
      if (!reference) {
        setStatus('')
        setError('Payment reference was not found.')
        return
      }

      try {
        const response = await apiFetch(`/api/payments/kora/verify/${encodeURIComponent(reference)}`)
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          if (attempt < maxAttempts && [404, 425, 429, 500, 502, 503, 504].includes(response.status)) {
            scheduleRetry(attempt)
            return
          }
          throw new Error(data.error || data.details || 'Payment verification failed')
        }

        if (data.status === 'success') {
          let nextTokens = data.tokens ?? null
          setStatus(data.credited ? 'Payment verified and tokens credited.' : 'Payment verified.')
          const metadata = readPaymentMetadata(data.payment)
          const patientId = data.payment?.patient_id || metadata.patientId || metadata.patient_id
          if (patientId) {
            const balanceResponse = await apiFetch(`/api/patients/${encodeURIComponent(patientId)}/tokens`).catch(() => null)
            if (balanceResponse?.ok) {
              const balanceData = await balanceResponse.json().catch(() => ({}))
              if (Number.isFinite(Number(balanceData.tokens))) nextTokens = Number(balanceData.tokens)
            }
          }
          setTokens(nextTokens)
          if (patientId) {
            try {
              const stored = JSON.parse(window.localStorage.getItem('gd_patient_session') || 'null')
              if (stored?.id === patientId) {
                const nextPatient = { ...stored, tokens: nextTokens ?? stored.tokens ?? 0 }
                window.localStorage.setItem('gd_patient_session', JSON.stringify(nextPatient))
                window.localStorage.setItem('gd_active_portal', 'patient')
                window.localStorage.setItem('gd_patient_return_dashboard', '1')
              }
            } catch {
              // ignore local session refresh failures
            }
          }
          redirectTimer = window.setTimeout(() => {
            onNavigate?.('patient')
          }, 1600)
        } else {
          const nextStatus = String(data.status || 'pending').toLowerCase()
          if (attempt < maxAttempts && ['pending', 'processing', 'unknown'].includes(nextStatus)) {
            scheduleRetry(attempt, `Payment status is ${nextStatus}. Waiting for final confirmation...`)
            return
          }
          setStatus(`Payment status: ${data.status || 'pending'}. Please refresh in a moment.`)
        }
      } catch (err) {
        setStatus('')
        setError(err.message || 'Payment verification failed')
      }
    }

    void verify()
    return () => {
      if (redirectTimer) window.clearTimeout(redirectTimer)
    }
  }, [onNavigate, reference])

  return (
    <section className="mx-auto mt-16 max-w-2xl px-6 pb-20 sm:px-8">
      <div className="rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-200/50">
        <h1 className="text-3xl font-bold text-slate-900">Payment return</h1>
        {status && <p className="mt-3 text-slate-600">{status}</p>}
        {tokens !== null && <p className="mt-3 text-lg font-bold text-brand-700">Current balance: {tokens} tokens</p>}
        {tokens !== null && !error && <p className="mt-2 text-sm text-slate-500">Returning to your patient dashboard...</p>}
        {error && <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate?.('patient')}
            className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Back to Patient Portal
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Verify again
          </button>
        </div>
      </div>
    </section>
  )
}

export default PaymentSuccess
