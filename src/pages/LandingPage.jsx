import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe2, Languages } from 'lucide-react'
import { fetchDoctors } from '../lib/kiraApi'
import AnnouncementBanner from '../components/AnnouncementBanner'
import LanguageSelector from '../components/LanguageSelector'
import ProfileAvatar, { getGenderLabel } from '../components/ProfileAvatar'
import { LandingAdArt, TelehealthHeroArt } from '../components/TelehealthArt'
import { useError } from '../components/ErrorHandler'
import { consultationTokensToUsd, getFairConsultationTokens } from '../lib/consultationPricing'

const specialties = [
  'Cardiology',
  'Dermatology',
  'Psychiatry',
  'Pediatrics',
  'Oncology',
  'Orthopedics',
  'Neurology',
  'General Practitioner',
  'Urology',
  'Gynaecologist',
  'Obstetrics & Gynecology',
  'Ophthalmology',
]

const languages = ['English', 'Spanish', 'Arabic', 'Hindi', 'French', 'Hausa', 'Yoruba', 'Swahili', 'Igbo']

const normalizeSpecialty = (value = '') => String(value)
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]/g, '')

const specialtyAliases = {
  gynaecologist: 'gynaecology',
  gynaecology: 'gynaecology',
  gynecologist: 'gynaecology',
  gynecology: 'gynaecology',
  obstetricsandgynecology: 'gynaecology',
  obstetricsgynecology: 'gynaecology',
  obgyn: 'gynaecology',
  generalpractice: 'generalpractitioner',
  gp: 'generalpractitioner',
}

const specialtyKey = (value) => {
  const normalized = normalizeSpecialty(value)
  return specialtyAliases[normalized] || normalized
}

function LandingPage() {
  const { t } = useTranslation()
  const { addError } = useError()
  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [language, setLanguage] = useState('')
  const [minRating, setMinRating] = useState(4)
  const [availability, setAvailability] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')

  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' })
  const [paymentData, setPaymentData] = useState({ type: 'priority_access' })
  const [processingPayment, setProcessingPayment] = useState(false)

  useEffect(() => {
    void loadDoctors()

    // Initialize Google Translate
    const addGoogleTranslateScript = () => {
      if (!document.querySelector('#google-translate-script')) {
        const script = document.createElement('script')
        script.id = 'google-translate-script'
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
        script.async = true
        document.head.appendChild(script)

        window.googleTranslateElementInit = () => {
          new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,ha,yo,sw,ar,fr,ig',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          }, 'google_translate_element')
        }
      }
    }

    addGoogleTranslateScript()
  }, [])

  const loadDoctors = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const doctors = await fetchDoctors({})
      setResults(doctors)
    } catch (error) {
      console.error('Failed to load doctors:', error)
      setLoadError('We could not load the directory right now. Please try again.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const filteredDoctors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const normalizedAvailability = availability.trim().toLowerCase()

    return results.filter((doctor) => {
      const name = String(doctor?.name || '').toLowerCase()
      const location = String(doctor?.location || '').toLowerCase()
      const doctorAvailability = String(doctor?.availability || '').toLowerCase()
      const doctorSpecialty = String(doctor?.specialty || '')
      const doctorLanguages = Array.isArray(doctor?.languages) ? doctor.languages : []
      const doctorRating = Number(doctor?.rating || 0)

      const matchesQuery =
        normalizedQuery.length === 0 ||
        name.includes(normalizedQuery) ||
        location.includes(normalizedQuery) ||
        doctorSpecialty.toLowerCase().includes(normalizedQuery)

      const matchesSpecialty = specialty === '' || specialtyKey(doctorSpecialty) === specialtyKey(specialty)
      const matchesLanguage =
        language === '' || doctorLanguages.some((item) => String(item).toLowerCase() === language.toLowerCase())
      const matchesRating = doctorRating >= minRating
      const matchesAvailability = normalizedAvailability === '' || doctorAvailability.includes(normalizedAvailability)

      return matchesQuery && matchesSpecialty && matchesLanguage && matchesRating && matchesAvailability
    })
  }, [availability, language, minRating, query, results, specialty])

  const handleSearch = async (event) => {
    event.preventDefault()
    setLoading(true)
    setLoadError('')
    try {
      const doctors = await fetchDoctors({ specialty, language, minRating, availability, query })
      setResults(doctors)
    } catch (error) {
      console.error('Search failed:', error)
      setLoadError('Search failed. Please try again.')
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
      window.localStorage.setItem('gd_landing_review_doctor', JSON.stringify({
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        rating: reviewData.rating,
        comment: reviewData.comment,
        savedAt: Date.now(),
      }))
      window.location.href = '/patient'
    } catch (error) {
      addError('Could not prepare review handoff: ' + error.message, 'error')
    }
  }

  const handlePayment = async (event) => {
    event.preventDefault()
    if (!selectedDoctor) return

    setProcessingPayment(true)
    try {
      window.localStorage.setItem('gd_landing_selected_doctor', JSON.stringify({
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        consultationType: paymentData.type,
        savedAt: Date.now(),
      }))
      window.location.href = '/patient'
    } catch (error) {
      addError('Could not prepare booking handoff: ' + error.message, 'error')
    } finally {
      setProcessingPayment(false)
    }
  }

  const openBooking = (doctor) => {
    setSelectedDoctor(doctor)
    setShowPaymentForm(true)
    setShowReviewForm(false)
    try {
      window.localStorage.setItem('gd_landing_selected_doctor', JSON.stringify({
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        savedAt: Date.now(),
      }))
    } catch {
      // ignore storage restrictions
    }
  }

  const openReview = (doctor) => {
    setSelectedDoctor(doctor)
    setShowReviewForm(true)
    setShowPaymentForm(false)
  }

  const resetFilters = () => {
    setQuery('')
    setSpecialty('')
    setLanguage('')
    setMinRating(4)
    setAvailability('')
    void loadDoctors()
  }

  return (
    <main className="relative mx-auto max-w-7xl px-6 pb-16 sm:px-8">
      <AnnouncementBanner audience="landing" />
      <section
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-xl shadow-slate-200/60 sm:px-10"
        style={heroBackgroundStyle}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/96 via-white/90 to-emerald-50/84" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-6">
            {/* Language Selector */}
            <div className="flex justify-end">
              <LanguageSelector />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/60 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Verified profiles • Secure consultations • Fast booking
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-md shadow-brand-700/30">
                <span className="text-2xl font-bold">G</span>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">GlobalDoc Connect</p>
                <h1 className="mt-1 text-3xl font-bold text-slate-900 sm:text-5xl">{t('landing.heroTitle')}</h1>
              </div>
            </div>

            <p className="max-w-xl text-lg leading-8 text-slate-700">
              {t('landing.heroSubtitle')}
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#search"
                className="rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/30 hover:bg-brand-600"
              >
                {t('landing.getStarted')}
              </a>
              <a
                href="#how-it-works"
                className="rounded-full border border-slate-200 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white"
              >
                See how it works
              </a>
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-sm">
              <div className="grid gap-0 sm:grid-cols-[0.95fr_1.05fr]">
                <div className="relative min-h-[128px] bg-slate-50">
                  <img
                    src="/translation-art.svg"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    aria-hidden="true"
                  />
                </div>
                <div className="p-4">
                  <div className="mb-3 flex items-center gap-2 text-teal-800">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50">
                      <Languages className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Translate this page</p>
                      <p className="text-xs text-slate-500">Choose a language for easier care access.</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                      <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Google Translate
                    </div>
                    <div id="google_translate_element" className="min-h-[44px]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { title: 'Trusted directory', body: 'Profiles reviewed to reduce impersonation risk.' },
                { title: 'Privacy minded', body: 'Designed for patient confidentiality and safety.' },
                { title: 'Global access', body: 'Search by specialty, location, and language.' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
            <TelehealthHeroArt theme="landing" className="mt-6" />
          </div>

          <div className="rounded-3xl bg-white/70 p-4 shadow-inner shadow-slate-200/80 ring-1 ring-slate-200/60 backdrop-blur">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Search doctors</h2>
                  <p className="mt-2 text-sm text-slate-600">Filter by specialty, rating, availability, and language.</p>
                </div>
                <a href="#directory" className="text-sm font-semibold text-brand-700 hover:text-brand-600">
                  View directory
                </a>
              </div>

              <form id="search" onSubmit={handleSearch} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Search by name or city</label>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                    placeholder="e.g. Dr. Amina or Nairobi"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Specialty
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                    >
                      <option value="">All specialties</option>
                      {specialties.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Language
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                    >
                      <option value="">Any language</option>
                      {languages.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Minimum rating
                    <select
                      value={minRating}
                      onChange={(e) => setMinRating(Number(e.target.value))}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                    >
                      {[4, 4.2, 4.5, 4.8, 5].map((rating) => (
                        <option key={rating} value={rating}>
                          {rating}+
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Availability
                    <input
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                      placeholder="Available now, Book for tomorrow"
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600"
                  >
                    Filter doctors
                  </button>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Reset
                  </button>
                </div>

                {loadError && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {loadError}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      <LandingAdArt />

      <section className="mt-12 grid gap-8 lg:grid-cols-3">
        <article className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
          <h3 className="text-xl font-semibold text-slate-900">Verified global directory</h3>
          <p className="mt-3 text-slate-600">Search by location, specialty, and language so patients can choose with confidence.</p>
        </article>
        <article className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
          <h3 className="text-xl font-semibold text-slate-900">Secure consultations</h3>
          <p className="mt-3 text-slate-600">Chat and video options help patients connect with clinicians without complicated steps.</p>
        </article>
        <article className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
          <h3 className="text-xl font-semibold text-slate-900">Patient reviews</h3>
          <p className="mt-3 text-slate-600">Verified reviews encourage authenticity and reduce bot or fake feedback.</p>
        </article>
      </section>

      <section id="how-it-works" className="mt-16 rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/60">
        <div className="grid gap-10 lg:grid-cols-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">How it works</p>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">Patient-first experience</h2>
            <p className="mt-4 text-slate-600">
              Compare specialists, book quickly, and keep care organised—without juggling multiple apps.
            </p>
          </div>
          <div className="space-y-6 lg:col-span-2">
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { step: '01', title: 'Search globally', body: 'Filter by specialty, rating, language, and location.' },
                { step: '02', title: 'Book confidently', body: 'Choose consultation type and confirm in one flow.' },
                { step: '03', title: 'Review safely', body: 'Verified patients keep ratings more authentic.' },
              ].map((item) => (
                <div key={item.step} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-xs font-semibold text-brand-700">{item.step}</p>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.body}</p>
                </div>
              ))}
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
                { title: 'Search by specialty', body: 'Filter by location, language, availability, and rating.' },
                { title: 'Book in minutes', body: 'Choose a time that works and confirm in one flow.' },
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
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900">Contact</p>
            <p className="mt-2 text-sm text-slate-600">
              Email:{' '}
              <a className="font-semibold text-brand-700 hover:text-brand-600" href="mailto:globaldoctorconnect@gmail.com">
                globaldoctorconnect@gmail.com
              </a>
            </p>
            <p className="mt-2 text-xs text-slate-500">Support replies within 24 hours.</p>
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-3xl bg-slate-900 px-8 py-10 text-white" id="directory">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Available doctors</h2>
            <p className="mt-1 text-sm text-slate-300">Browse, review, and book securely.</p>
          </div>
          <a href="#search" className="text-sm font-semibold text-brand-300 hover:text-brand-200">
            Update filters
          </a>
        </div>

        {loading && (
          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="rounded-3xl bg-slate-950/70 p-6 animate-pulse">
                <div className="h-4 w-24 rounded bg-slate-800" />
                <div className="mt-3 h-7 w-48 rounded bg-slate-800" />
                <div className="mt-6 space-y-2">
                  <div className="h-4 w-40 rounded bg-slate-800" />
                  <div className="h-4 w-56 rounded bg-slate-800" />
                </div>
                <div className="mt-6 flex gap-3">
                  <div className="h-10 flex-1 rounded-full bg-slate-800" />
                  <div className="h-10 flex-1 rounded-full bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredDoctors.length === 0 && (
          <div className="mt-6 rounded-3xl border border-slate-700 bg-slate-950/40 p-6">
            <p className="text-sm text-slate-200">No doctors match your filters yet.</p>
            <p className="mt-2 text-sm text-slate-400">Try widening the specialty, language, or rating filters.</p>
          </div>
        )}

        {!loading && filteredDoctors.length > 0 && (
          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="rounded-3xl bg-slate-950/80 p-6 ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-slate-900/90">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar person={doctor} role="doctor" size="lg" />
                    <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">{doctor.specialty}</p>
                    <h3 className="mt-2 text-xl font-bold">{doctor.name}</h3>
                      <p className="mt-1 text-xs font-semibold text-slate-400">{getGenderLabel(doctor)}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-900">
                    {doctor.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <p className="mt-4 text-sm text-slate-300">{doctor.location}</p>
                <p className="mt-3 text-sm text-slate-300">Languages: {Array.isArray(doctor.languages) ? doctor.languages.join(', ') : '—'}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-300">
                  <span className="rounded-full bg-slate-800 px-3 py-1">{doctor.availability}</span>
                  <span className="rounded-full bg-slate-800 px-3 py-1">Rating {doctor.rating}</span>
                  <span className="rounded-full bg-slate-800 px-3 py-1">
                    {getFairConsultationTokens(doctor, 'basic')} tokens / ${consultationTokensToUsd(getFairConsultationTokens(doctor, 'basic'))}
                  </span>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      openReview(doctor)
                    }}
                    className="flex-1 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
                  >
                    Leave Review
                  </button>
                  <button
                    onClick={() => {
                      openBooking(doctor)
                    }}
                    className="flex-1 rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showReviewForm && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6">
            <h3 className="text-xl font-bold text-slate-900">Review {selectedDoctor.name}</h3>
            <p className="mt-2 text-sm text-slate-600">Reviews are completed from the patient portal so they attach to a real patient record.</p>
            <form onSubmit={handleSubmitReview} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Rating</label>
                <select
                  value={reviewData.rating}
                  onChange={(e) => setReviewData({ ...reviewData, rating: Number(e.target.value) })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} stars
                    </option>
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
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600"
                >
                  Continue to Patient Portal
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

      {showPaymentForm && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6">
            <div className="flex items-center gap-3">
              <ProfileAvatar person={selectedDoctor} role="doctor" size="lg" />
              <div>
                <h3 className="text-xl font-bold text-slate-900">Book Consultation</h3>
                <p className="text-sm font-semibold text-slate-600">{selectedDoctor.name}</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-brand-50 p-4">
              <p className="text-sm text-slate-600">Specialty: {selectedDoctor.specialty}</p>
              <p className="text-sm text-slate-600">Sex: {getGenderLabel(selectedDoctor)}</p>
              <p className="text-sm text-slate-600">Location: {selectedDoctor.location}</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {getFairConsultationTokens(selectedDoctor, 'basic')} tokens / ${consultationTokensToUsd(getFairConsultationTokens(selectedDoctor, 'basic'))}
              </p>
              <p className="mt-2 text-xs text-slate-500">Continue to the patient portal to sign in, confirm tokens, and complete the booking safely.</p>
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
                <button
                  type="submit"
                  disabled={processingPayment}
                  className="flex-1 rounded-full bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processingPayment ? 'Opening portal...' : 'Continue to Patient Portal'}
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
