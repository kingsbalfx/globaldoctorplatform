import { useState, useEffect } from 'react'
import { getSpecialtyLogo } from '../lib/specialtyRegistry'
import { apiFetch } from '../lib/apiFetch'
import { useError } from './ErrorHandler'

function PatientReviewManager() {
  const { addError } = useError()
  const [reviews, setReviews] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState(null)

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const response = await apiFetch(`/api/admin/reviews`)
      if (!response.ok) throw new Error('Failed to load reviews')
      const data = await response.json()
      setReviews(data.reviews || [])
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewAction = async (reviewId, action) => {
    try {
      const response = await apiFetch(`/api/admin/reviews/${reviewId}/${action}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) throw new Error(`Failed to ${action} review`)
      const result = await response.json()
      setReviews(reviews.map(r => r.id === reviewId ? result.review : r))
      addError(`Review ${action}ed successfully.`, 'success')
    } catch (error) {
      addError('Error: ' + error.message, 'error')
    }
  }

  const filteredReviews = reviews.filter(r => {
    if (filter === 'verified') return r.verified
    if (filter === 'pending') return !r.verified
    return true
  })

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Patient Reviews</h2>
        <div className="flex gap-2">
          {['all', 'verified', 'pending'].map(option => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === option
                  ? 'bg-brand-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-600">Loading reviews...</p>
      ) : (
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <p className="text-slate-600 text-center py-8">No reviews found</p>
          ) : (
            filteredReviews.map(review => (
              <div
                key={review.id}
                className="rounded-2xl border border-slate-200 p-4 hover:border-brand-300 hover:shadow-md transition cursor-pointer"
                onClick={() => setSelectedReview(selectedReview?.id === review.id ? null : review)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl">{getSpecialtyLogo(review.doctor_specialty)}</div>
                      <div>
                        <p className="font-semibold text-slate-900">{review.doctor_name}</p>
                        <p className="text-xs text-slate-600">by {review.patient_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? '⭐' : '☆'}>
                            {i < review.rating ? '⭐' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{review.rating}/5</span>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    review.verified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {review.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>

                {selectedReview?.id === review.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-700 mb-4">{review.comment}</p>
                    <p className="text-xs text-slate-500 mb-4">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                    {!review.verified && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleReviewAction(review.id, 'verify')
                          }}
                          className="flex-1 rounded-full bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          Verify
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleReviewAction(review.id, 'reject')
                          }}
                          className="flex-1 rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default PatientReviewManager
