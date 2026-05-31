import { apiFetch } from './apiFetch'

export async function fetchDoctors({ specialty, minRating, availability, query, language }) {
  const params = new URLSearchParams()
  if (specialty) params.set('specialty', specialty)
  if (minRating) params.set('minRating', minRating)
  if (availability) params.set('availability', availability)
  if (query) params.set('query', query)
  if (language) params.set('language', language)

  const response = await apiFetch(`/api/doctors?${params.toString()}`)
  if (!response.ok) {
    console.error('Failed to fetch doctors', await response.text())
    return []
  }

  const payload = await response.json()
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.doctors)) return payload.doctors
  return []
}

export async function submitReview(reviewData) {
  const response = await apiFetch(`/api/reviews`, {
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
  const response = await apiFetch(`/api/payments/kora/initialize`, {
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

// NEW: Doctor withdrawal request – calls the existing backend endpoint
export async function requestDoctorWithdrawal(doctorId, tokens) {
  const response = await apiFetch(`/api/doctors/${encodeURIComponent(doctorId)}/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokens }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || 'Withdrawal failed')
  }

  return response.json()
}
