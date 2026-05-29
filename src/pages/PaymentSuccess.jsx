import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'

function PaymentSuccess({ onNavigate }) {
  const [status, setStatus] = useState('Verifying payment...')
  const [error, setError] = useState('')
  const [tokens, setTokens] = useState(null)

  const reference = useMemo(() => {
    const url = new URL(window.location.href)
    return url.searchParams.get('reference') || ''
  }, [])

  useEffect(() => {
    const verify = async () => {
      if (!reference) {
        setStatus('')
        setError('Payment reference was not found.')
        return
      }

      try {
        const response = await apiFetch(`/api/payments/kora/verify/${encodeURIComponent(reference)}`)
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || 'Payment verification failed')

        if (data.status === 'success') {
          setTokens(data.tokens ?? null)
          setStatus(data.credited ? 'Payment verified and tokens credited.' : 'Payment verified.')
        } else {
          setStatus(`Payment status: ${data.status || 'pending'}. Please refresh in a moment.`)
        }
      } catch (err) {
        setStatus('')
        setError(err.message || 'Payment verification failed')
      }
    }

    void verify()
  }, [reference])

  return (
    <section className="mx-auto mt-16 max-w-2xl px-6 pb-20 sm:px-8">
      <div className="rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-200/50">
        <h1 className="text-3xl font-bold text-slate-900">Payment return</h1>
        {status && <p className="mt-3 text-slate-600">{status}</p>}
        {tokens !== null && <p className="mt-3 text-lg font-bold text-brand-700">Current balance: {tokens} tokens</p>}
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
