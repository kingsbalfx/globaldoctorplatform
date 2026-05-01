import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

function TokenManager({ patient, onTokensUpdated }) {
  const [tokens, setTokens] = useState(0)
  const [subscription, setSubscription] = useState(null)
  const [showPurchase, setShowPurchase] = useState(false)
  const [purchaseAmount, setPurchaseAmount] = useState(100)
  const [minSubscriptionUSD, setMinSubscriptionUSD] = useState(5)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (patient) {
      fetchTokenBalance()
      fetchSubscription()
      fetchSettings()
    }
  }, [patient])

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/settings`)
      if (response.ok) {
        const data = await response.json()
        setMinSubscriptionUSD(data.settings.minimumSubscriptionUSD || 5)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const fetchTokenBalance = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/patients/${patient.id}/tokens`)
      if (response.ok) {
        const data = await response.json()
        setTokens(data.tokens || 0)
        onTokensUpdated?.(data.tokens || 0)
      }
    } catch (error) {
      console.error('Failed to fetch tokens:', error)
    }
  }

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/patients/${patient.id}/subscription`)
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
      // Integrate with Kora Payments
      const paymentData = {
        amount: purchaseAmount,
        currency: 'USD',
        description: `${purchaseAmount} GlobalDoc Tokens`,
        customer: {
          email: patient.email,
          name: patient.name,
          phone: patient.phone
        }
      }

      const response = await fetch(`${API_BASE}/api/payments/kora/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        throw new Error('Payment initialization failed')
      }

      const result = await response.json()

      // Redirect to Kora payment page (in real implementation)
      if (result.checkout_url) {
        alert(`Redirecting to Kora... Reference: ${result.reference}`)
        // window.location.href = result.checkout_url;
      }

      // Simulate payment success and add tokens
      await addTokensToAccount(purchaseAmount)
    } catch (error) {
      alert('Payment failed: ' + error.message)
    } finally {
      setLoading(false)
      setShowPurchase(false)
    }
  }

  const addTokensToAccount = async (amount) => {
    try {
      const response = await fetch(`${API_BASE}/api/patients/${patient.id}/tokens/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      if (response.ok) {
        await fetchTokenBalance()
        alert(`Successfully added ${amount} tokens to your account!`)
      }
    } catch (error) {
      console.error('Failed to add tokens:', error)
    }
  }

  const handleSubscribe = async (plan) => {
    setLoading(true)
    try {
      const subscriptionData = {
        plan,
        patientId: patient.id,
        price: plan === 'monthly' ? 500 : plan === 'yearly' ? 5000 : minSubscriptionUSD,
        tokensIncluded: plan === 'monthly' ? 500 : plan === 'yearly' ? 6000 : 100
      }

      const response = await fetch(`${API_BASE}/api/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData),
      })

      if (!response.ok) {
        throw new Error('Subscription failed')
      }

      const result = await response.json()
      alert(`Subscription activated! ${subscriptionData.tokensIncluded} tokens added to your account.`)
      await fetchTokenBalance()
      await fetchSubscription()

    } catch (error) {
      alert('Subscription failed: ' + error.message)
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

      {/* Subscription Status */}
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

      {/* Subscription Plans */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Subscription Plans</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border border-slate-200 rounded-2xl p-4 hover:border-brand-300 transition">
            <h4 className="font-semibold text-slate-900">Pay-per-Use</h4>
            <p className="text-sm text-slate-600 mt-1">100 tokens</p>
            <p className="text-lg font-bold text-brand-700 mt-2">${minSubscriptionUSD}</p>
            <button
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
              onClick={() => handleSubscribe('monthly')}
              disabled={loading}
              className="w-full mt-3 bg-brand-700 text-white py-2 px-4 rounded-2xl text-sm font-semibold hover:bg-brand-600 transition disabled:opacity-50"
            >
              Subscribe
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl p-4 hover:border-brand-300 transition">
            <h4 className="font-semibold text-slate-900">Yearly</h4>
            <p className="text-sm text-slate-600 mt-1">600 tokens/year</p>
            <p className="text-lg font-bold text-brand-700 mt-2">$500</p>
            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={loading}
              className="w-full mt-3 bg-green-600 text-white py-2 px-4 rounded-2xl text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Token Purchase Modal */}
      {showPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Buy Tokens</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Amount
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[100, 250, 500].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setPurchaseAmount(amount)}
                      className={`p-3 rounded-2xl text-sm font-medium transition ${
                        purchaseAmount === amount
                          ? 'bg-brand-700 text-white'
                          : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      {amount} tokens
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Amount:</span>
                  <span className="font-semibold text-slate-900">{purchaseAmount} tokens</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-slate-600">Price:</span>
                  <span className="font-semibold text-brand-700">${(purchaseAmount / 10).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPurchase(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 px-4 rounded-2xl font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchaseTokens}
                  disabled={loading}
                  className="flex-1 bg-brand-700 text-white py-3 px-4 rounded-2xl font-semibold hover:bg-brand-600 transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Pay with Kora'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TokenManager