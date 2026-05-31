import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/apiFetch'
import { useError } from '../components/ErrorHandler'

function TokenManager({ patient, onTokensUpdated }) {
  const { addError } = useError()
  const [tokens, setTokens] = useState(0)
  const [subscription, setSubscription] = useState(null)
  const [showPurchase, setShowPurchase] = useState(false)
  const [purchaseUSD, setPurchaseUSD] = useState(10)
  const [minSubscriptionUSD, setMinSubscriptionUSD] = useState(10)
  const [loading, setLoading] = useState(false)
  const [hasPurchasedBefore, setHasPurchasedBefore] = useState(false)
  const [pendingPurchase, setPendingPurchase] = useState(null)

  useEffect(() => {
    if (patient) {
      fetchTokenBalance()
      fetchSubscription()
      fetchSettings()
    }
  }, [patient])

  const fetchSettings = async () => {
    try {
      const response = await apiFetch(`/api/settings`)
      if (response.ok) {
        const data = await response.json()
        setMinSubscriptionUSD(data.settings.minimumSubscriptionUSD || 10)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const fetchTokenBalance = async () => {
    try {
      const response = await apiFetch(`/api/patients/${patient.id}/tokens`)
      if (response.ok) {
        const data = await response.json()
        setTokens(data.tokens || 0)
        const historyRes = await apiFetch(`/api/patients/${patient.id}/tokens/history`).catch(() => null)
        if (historyRes?.ok) {
          const historyData = await historyRes.json()
          setHasPurchasedBefore((historyData.transactions || []).some(t => t.type === 'purchase'))
        }
        onTokensUpdated?.(data.tokens || 0)
      }
    } catch (error) {
      console.error('Failed to fetch tokens:', error)
    }
  }

  const fetchSubscription = async () => {
    try {
      const response = await apiFetch(`/api/patients/${patient.id}/subscription`)
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    }
  }

  const handlePurchaseTokens = async () => {
    setLoading(true)
    try {
      const amountUSD = Math.max(10, Math.round(Number(purchaseUSD) || 10))
      const response = await apiFetch(`/api/patients/${patient.id}/tokens/purchase/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUSD,
          email: patient.email,
          name: patient.name,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        const details = typeof error.details === 'string'
          ? error.details
          : error.details?.message || error.details?.error || error.details?.data?.message || ''
        throw new Error([error.error || 'Payment initialization failed', details].filter(Boolean).join(': '))
      }

      const result = await response.json()
      const checkoutUrl = String(result.checkout_url || '')
      const checkoutHost = checkoutUrl ? new URL(checkoutUrl, window.location.origin).host : ''
      const isApiUrl = checkoutUrl.includes('/api/')

      setPendingPurchase({
        reference: result.reference,
        tokensExpected: result.tokensExpected,
        checkoutUrl: isApiUrl ? '' : checkoutUrl,
      })

      if (checkoutUrl && !isApiUrl && checkoutHost) window.location.assign(checkoutUrl)
    } catch (error) {
      addError('Payment failed: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const confirmPurchase = async () => {
    if (!pendingPurchase?.reference) return
    try {
      setLoading(true)
      const response = await apiFetch(`/api/payments/kora/verify/${encodeURIComponent(pendingPurchase.reference)}`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to verify payment')

      if (data.status !== 'success') {
        addError(`Payment status: ${data.status || 'pending'}. Please retry in a moment.`, 'warning')
        return
      }

      await fetchTokenBalance()
      setPendingPurchase(null)
      setShowPurchase(false)
      addError('Tokens credited successfully.', 'success')
    } catch (error) {
      addError(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (plan) => {
    setLoading(true)
    try {
      const subscriptionData = {
        plan,
        patientId: patient.id,
        price: plan === 'monthly' ? 50 : plan === 'yearly' ? 500 : Math.max(10, Math.round(Number(purchaseUSD) || minSubscriptionUSD)),
        tokensIncluded: plan === 'monthly' ? 500 : plan === 'yearly' ? 6000 : Math.max(10, Math.round(Number(purchaseUSD) || minSubscriptionUSD)) * 10,
        email: patient.email,
        name: patient.name,
      }

      const response = await apiFetch(`/api/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData),
      })

      if (!response.ok) {
        throw new Error('Subscription failed')
      }

      const result = await response.json()
      addError(`Subscription activated! ${subscriptionData.tokensIncluded} tokens added to your account.`, 'success')
      await fetchTokenBalance()
      await fetchSubscription()
    } catch (error) {
      addError('Subscription failed: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const getTokenStatus = () => {
    if (tokens >= 500) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-100' }
    if (tokens >= 200) return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (tokens >= 50) return { status: 'low', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { status: 'critical', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const tokenStatus = getTokenStatus()

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Token Balance</h2>
        <button
          type="button"
          onClick={() => setShowPurchase(true)}
          className="bg-brand-700 text-white px-4 py-2 rounded-2xl text-sm font-semibold hover:bg-brand-600 transition"
        >
          Buy Tokens
        </button>
      </div>

      <div className="text-center mb-6">
        <div className={`inline-flex items-center px-4 py-2 rounded-2xl ${tokenStatus.bg}`}>
          <span className={`text-2xl font-bold ${tokenStatus.color}`}>{tokens}</span>
          <span className={`ml-2 text-sm font-medium ${tokenStatus.color}`}>tokens</span>
        </div>
        <p className="text-sm text-slate-600 mt-2 capitalize">{tokenStatus.status} balance</p>
      </div>

      {subscription && (
        <div className="bg-slate-50 rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-slate-900 mb-2">Active Subscription</h3>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 capitalize">{subscription.plan} Plan</span>
            <span className="text-sm text-slate-500">
              Expires: {new Date(subscription.expiresAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Subscription Plans</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border border-slate-200 rounded-2xl p-4 hover:border-brand-300 transition">
            <h4 className="font-semibold text-slate-900">Pay-per-Use</h4>
            <p className="text-sm text-slate-600 mt-1">Choose your amount, minimum $10</p>
            <input
              type="number"
              min="10"
              step="1"
              value={purchaseUSD}
              onChange={(event) => setPurchaseUSD(event.target.value)}
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
            <p className="text-lg font-bold text-brand-700 mt-2">${Math.max(10, Number(purchaseUSD) || minSubscriptionUSD)}</p>
            <button
              type="button"
              onClick={() => handleSubscribe('payperuse')}
              disabled={loading}
              className="w-full mt-3 bg-slate-100 text-slate-700 py-2 px-4 rounded-2xl text-sm font-semibold hover:bg-slate-200 transition disabled:opacity-50"
            >
              Subscribe
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl p-4 hover:border-brand-300 transition">
            <h4 className="font-semibold text-slate-900">Monthly</h4>
            <p className="text-sm text-slate-600 mt-1">500 tokens/month</p>
            <p className="text-lg font-bold text-brand-700 mt-2">$50</p>
            <button
              type="button"
              onClick={() => handleSubscribe('monthly')}
              disabled={loading}
              className="w-full mt-3 bg-brand-700 text-white py-2 px-4 rounded-2xl text-sm font-semibold hover:bg-brand-600 transition disabled:opacity-50"
            >
              Subscribe
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl p-4 hover:border-brand-300 transition">
            <h4 className="font-semibold text-slate-900">Yearly</h4>
            <p className="text-sm text-slate-600 mt-1">6000 tokens/year</p>
            <p className="text-lg font-bold text-brand-700 mt-2">$500</p>
            <button
              type="button"
              onClick={() => handleSubscribe('yearly')}
              disabled={loading}
              className="w-full mt-3 bg-green-600 text-white py-2 px-4 rounded-2xl text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {showPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Buy Tokens</h3>

            <div className="space-y-4">
              {pendingPurchase ? (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <p className="text-sm text-slate-700 font-semibold">Payment started</p>
                  <p className="text-xs text-slate-500 mt-1">Reference: {pendingPurchase.reference}</p>
                  <p className="text-xs text-slate-500 mt-1">Expected tokens: {pendingPurchase.tokensExpected}</p>
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => pendingPurchase.checkoutUrl && window.open(pendingPurchase.checkoutUrl, '_blank', 'noopener,noreferrer')}
                      className="flex-1 bg-slate-100 text-slate-700 py-3 px-4 rounded-2xl font-semibold hover:bg-slate-200 transition"
                    >
                      Open Checkout
                    </button>
                    <button
                      type="button"
                      onClick={confirmPurchase}
                      disabled={loading}
                      className="flex-1 bg-brand-700 text-white py-3 px-4 rounded-2xl font-semibold hover:bg-brand-600 transition disabled:opacity-50"
                    >
                      {loading ? 'Checking...' : 'I have paid'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-3">
                    Tokens are credited after payment verification.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Select Deposit Amount (USD)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[10, 20, 50].map(usd => (
                        <button
                          type="button"
                          key={usd}
                          onClick={() => setPurchaseUSD(usd)}
                          className={`p-3 rounded-2xl text-sm font-medium transition ${
                            purchaseUSD === usd
                              ? 'bg-brand-700 text-white'
                              : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                          }`}
                        >
                          ${usd}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min="10"
                      step="1"
                      value={purchaseUSD}
                      onChange={(event) => setPurchaseUSD(event.target.value)}
                      className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
                      placeholder="Enter custom amount"
                    />
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">You will receive:</span>
                      <span className="font-semibold text-slate-900">
                        {hasPurchasedBefore ? Math.max(10, Number(purchaseUSD) || 10) * 7.5 : Math.max(10, Number(purchaseUSD) || 10) * 10} tokens
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-slate-600">Price:</span>
                      <span className="font-semibold text-brand-700">${Math.max(10, Number(purchaseUSD) || 10).toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic">
                      {hasPurchasedBefore ? 'Repurchase rate: $10 = 75 tokens' : 'First-time bonus: $10 = 100 tokens!'}
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPendingPurchase(null)
                        setShowPurchase(false)
                      }}
                      className="flex-1 bg-slate-100 text-slate-700 py-3 px-4 rounded-2xl font-semibold hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handlePurchaseTokens}
                      disabled={loading}
                      className="flex-1 bg-brand-700 text-white py-3 px-4 rounded-2xl font-semibold hover:bg-brand-600 transition disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Pay with Kora'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TokenManager
