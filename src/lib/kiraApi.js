const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export async function fetchDoctors({ specialty, minRating, availability, query }) {
  const params = new URLSearchParams()
  if (specialty) params.set('specialty', specialty)
  if (minRating) params.set('minRating', minRating)
  if (availability) params.set('availability', availability)
  if (query) params.set('query', query)

  const response = await fetch(`${API_BASE}/api/doctors?${params.toString()}`)
  if (!response.ok) {
    console.error('Failed to fetch doctors', await response.text())
    return []
  }

  return response.json()
}

export async function submitReview(reviewData) {
  const response = await fetch(`${API_BASE}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData),
  })

  if (!response.ok) {
    throw new Error('Review submission failed')
  }

  return response.json()
}

export async function createPaymentSession(paymentData) {
  const response = await fetch(`${API_BASE}/api/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Payment creation failed: ${body}`)
  }

  return response.json()
}
