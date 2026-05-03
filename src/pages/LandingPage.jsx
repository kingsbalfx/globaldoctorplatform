import { useMemo, useState, useEffect } from 'react'
import { fetchDoctors, submitReview, createPaymentSession } from '../lib/kiraApi'

const specialties = ['Cardiology', 'Dermatology', 'Psychiatry', 'Pediatrics', 'Oncology', 'Neurology', 'General Practitioner', 'Urology']
const languages = ['English', 'Spanish', 'Arabic', 'Hindi', 'French']

function LandingPage() {
  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [minRating, setMinRating] = useState(4)
  const [availability, setAvailability] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' })
  const [paymentData, setPaymentData] = useState({ type: 'priority_access' })
  const [processingPayment, setProcessingPayment] = useState(false)

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    setLoading(true)
    try {
      const doctors = await fetchDoctors({})
      setResults(doctors)
    } catch (error) {
      console.error('Failed to load doctors:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const filteredDoctors = useMemo(() => {
    return results.filter((doctor) => {
      const matchesQuery = query.length === 0 || doctor.name.toLowerCase().includes(query.toLowerCase()) || doctor.location.toLowerCase().includes(query.toLowerCase())
      const matchesSpecialty = specialty === '' || doctor.specialty === specialty
      const matchesRating = doctor.rating >= minRating
      const matchesAvailability = availability === '' || doctor.availability.toLowerCase().includes(availability.toLowerCase())
      return matchesQuery && matchesSpecialty && matchesRating && matchesAvailability
    })
  }, [query, specialty, minRating, availability, results])

  const handleSearch = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const doctors = await fetchDoctors({ specialty, minRating, availability, query })
      setResults(doctors)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const heroBackgroundStyle = {
    backgroundImage: "url('/background.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }

  const handleSubmitReview = async (event) => {
    event.preventDefault()
    if (!selectedDoctor) return

    try {
      const result = await submitReview({
        doctorId: selectedDoctor.id,
        patientId: 'patient-demo', // In real app, get from auth
        rating: reviewData.rating,
        comment: reviewData.comment,
        verifiedPatient: true, // In real app, check verification status
      })
      alert('Review submitted successfully!')
      setShowReviewForm(false)
      setReviewData({ rating: 5, comment: '' })
      // Reload doctors to get updated ratings
      await loadDoctors()
    } catch (error) {
      alert('Failed to submit review: ' + error.message)
    }
  }

  const handlePayment = async (event) => {
    event.preventDefault()
    if (!selectedDoctor) return

    setProcessingPayment(true)
    try {
      // Create Kora payment session via backend
      const result = await createPaymentSession({
        patientId: 'patient-demo', // In real app, get from auth
        doctorId: selectedDoctor.id,
        amount: selectedDoctor.fee,
        type: paymentData.type,
      })

      if (result.checkout_url) {
        alert(`Redirecting to Kora for payment: ${result.transaction?.id || result.id}`)
        window.location.href = result.checkout_url;
        setShowPaymentForm(false)
        setPaymentData({ type: 'priority_access' })
      }
    } catch (error) {
      alert('Payment failed: ' + error.message)
    } finally {
      setProcessingPayment(false)
    }
  }

  return (
    <main className="relative mx-auto max-w-7xl px-6 pb-16 sm:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-white/95 px-6 py-10 shadow-xl shadow-slate-200/60 sm:px-10" style={heroBackgroundStyle}>
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-white/80" />
          <img src="/background.png" alt="landing background" className="h-full w-full object-cover" />
        </div>
        <div className="absolute -left-12 top-10 h-40 w-40 rounded-full bg-brand-300/20 blur-3xl animate-pulse" />
        <div className="absolute right-0 top-24 h-56 w-56 rounded-full bg-slate-300/20 blur-3xl animate-pulse" />
        <div className="relative z-10">
          <div className="mb-8 flex items-center gap-4 rounded-3xl bg-white/90 p-4 shadow-lg shadow-slate-200/40">
            <img src="/logo.png" alt="GlobalDoc Connect logo" className="h-12 w-12 rounded-full object-cover shadow-sm" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">GlobalDoc Connect</p>
              <p className="text-xs text-slate-500">Verified clinicians, clear specialties, and fast booking—built for global care.</p>
            </div>
          </div>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="flex flex-col justify-end lg:min-h-[420px]">
              <span className="inline-flex w-fit rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">Global care, anywhere</span>
              <h1 className="mt-10 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Quality care that fits your life.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Search verified doctors by specialty, language, and availability—then book a consultation in minutes.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a href="#search" className="inline-flex items-center justify-center rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600">Search doctors</a>
                <a href="#for-doctors" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">For clinicians</a>
              </div>

              {/* Ads / Trust strip */}
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold text-slate-900">Pay securely</p>
                  <p className="mt-1 text-xs text-slate-500">Protected checkout and verified payments.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold text-slate-900">Verified clinicians</p>
                  <p className="mt-1 text-xs text-slate-500">Profiles screened to reduce impersonation.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold text-slate-900">Fast booking</p>
                  <p className="mt-1 text-xs text-slate-500">Choose time, channel, and preference.</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-8 shadow-inner shadow-slate-200/80">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-semibold text-slate-900">Search doctors</h2>
                <form id="search" onSubmit={handleSearch} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Search by name or city</label>
                    <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500" placeholder="e.g. Dr. Sarah or Nairobi" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Specialities
                      <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500">
                        <option value="">Specialities</option>
                        {specialties.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      Minimum rating
                      <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500">
                        {[4, 4.2, 4.5, 4.8, 5].map((rating) => <option key={rating} value={rating}>{rating}+</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Availability</label>
                    <input value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500" placeholder="Available now, Book for tomorrow" />
                  </div>
                  <button type="submit" className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600">Filter doctors</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-3">
        <article className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
          <h3 className="text-xl font-semibold text-slate-900">Verified global directory</h3>
          <p className="mt-3 text-slate-600">Indexed by location, specialty and language so patients can choose the right doctor no matter where they are.</p>
        </article>
        <article className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
          <h3 className="text-xl font-semibold text-slate-900">Secure consultations</h3>
          <p className="mt-3 text-slate-600">Chat and video options help patients connect with clinicians without complicated steps.</p>
        </article>
        <article className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
          <h3 className="text-xl font-semibold text-slate-900">Patient reviews</h3>
          <p className="mt-3 text-slate-600">A verified rating system keeps reviews authentic and protects against bot or fake feedback.</p>
        </article>
      </section>

      <section id="how-it-works" className="mt-16 rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/60">
        <div className="grid gap-10 lg:grid-cols-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">How it works</p>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">Patient-first experience</h2>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Search globally</h3>
              <p className="mt-2 text-slate-600">Filter by specialty, rating, availability and languages to locate the best doctor fast.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Book with confidence</h3>
              <p className="mt-2 text-slate-600">Book a consultation, share notes ahead of time, and get reminders automatically.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Review only verified clinicians</h3>
              <p className="mt-2 text-slate-600">Only verified patients can submit ratings, and doctors can earn a verified badge when license documents are confirmed.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="for-doctors" className="mt-16 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl bg-brand-700 px-8 py-10 text-white shadow-xl shadow-brand-700/20">
          <h2 className="text-3xl font-bold">For clinicians</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-brand-100">
            A clean workspace for verified profiles, consultations, referrals, and follow-ups—built to keep care organised.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-brand-100/90">
            <li>• Professional profile and license verification</li>
            <li>• Availability, bookings, and reminders</li>
            <li>• Secure chat and video sessions</li>
            <li>• Referrals and patient documentation tools</li>
          </ul>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="rounded-3xl bg-slate-50 p-6">
            <h3 className="text-xl font-semibold text-slate-900">For patients</h3>
            <p className="mt-3 text-slate-600">Find the right doctor faster with clear specialties, verified badges, and quick booking.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { title: 'Search by speciality', body: 'Filter by location, language, availability, and rating.' },
                { title: 'Book in minutes', body: 'Choose a time that works and confirm with one flow.' },
                { title: 'Talk securely', body: 'Use in-app chat and video for consultations.' },
                { title: 'Stay on track', body: 'Reminders and follow-ups help keep care consistent.' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/60" id="contact">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Need help choosing a doctor?</h2>
            <p className="mt-3 max-w-2xl text-slate-600">Reach the support team and get guidance on specialties, bookings, and next steps.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-6 border border-slate-200">
            <p className="text-sm font-semibold text-slate-900">Contact</p>
            <p className="mt-2 text-sm text-slate-600">Email: <a className="text-brand-700 hover:text-brand-600 font-semibold" href="mailto:globaldoctorconnect@gmail.com">globaldoctorconnect@gmail.com</a></p>
            <p className="mt-2 text-xs text-slate-500">Support replies within 24 hours.</p>
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-3xl bg-slate-900 px-8 py-10 text-white">
        <h2 className="text-xl font-semibold">Available doctors</h2>
        {loading && <p className="mt-4 text-slate-300">Loading doctors...</p>}
        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="rounded-3xl bg-slate-950/80 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">{doctor.specialty}</p>
                  <h3 className="mt-2 text-xl font-bold">{doctor.name}</h3>
                </div>
                <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-900">{doctor.verified ? 'Verified' : 'Pending'}</span>
              </div>
              <p className="mt-4 text-sm text-slate-300">{doctor.location}</p>
              <p className="mt-3 text-sm text-slate-300">Languages: {doctor.languages.join(', ')}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-300">
                <span className="rounded-full bg-slate-800 px-3 py-1">{doctor.availability}</span>
                <span className="rounded-full bg-slate-800 px-3 py-1">Rating {doctor.rating}</span>
                <span className="rounded-full bg-slate-800 px-3 py-1">${doctor.fee}/consult</span>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setSelectedDoctor(doctor)
                    setShowReviewForm(true)
                  }}
                  className="flex-1 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
                >
                  Leave Review
                </button>
                <button
                  onClick={() => {
                    setSelectedDoctor(doctor)
                    setShowPaymentForm(true)
                  }}
                  className="flex-1 rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Review Modal */}
      {showReviewForm && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6">
            <h3 className="text-xl font-bold text-slate-900">Review {selectedDoctor.name}</h3>
            <form onSubmit={handleSubmitReview} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Rating</label>
                <select
                  value={reviewData.rating}
                  onChange={(e) => setReviewData({ ...reviewData, rating: Number(e.target.value) })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>{rating} stars</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Comment</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                  rows={4}
                  placeholder="Share your experience..."
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 rounded-full bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600">
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentForm && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6">
            <h3 className="text-xl font-bold text-slate-900">Book Consultation with {selectedDoctor.name}</h3>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Specialty: {selectedDoctor.specialty}</p>
              <p className="text-sm text-slate-600">Location: {selectedDoctor.location}</p>
              <p className="text-lg font-semibold text-slate-900 mt-2">${selectedDoctor.fee}</p>
            </div>
            <form onSubmit={handlePayment} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Consultation Type</label>
                <select
                  value={paymentData.type}
                  onChange={(e) => setPaymentData({ ...paymentData, type: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                >
                  <option value="priority_access">Priority Access</option>
                  <option value="telehealth_consultation">Telehealth Consultation</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 rounded-full bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600">
                  Pay ${selectedDoctor.fee}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default LandingPage
