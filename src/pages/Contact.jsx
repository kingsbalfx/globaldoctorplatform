import { useState } from 'react'
import Footer from '../components/Footer'

function Contact({ onNavigate }) {
  const [currentView, setCurrentView] = useState('landing')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    userType: 'patient'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const handleBackToHome = () => {
    onNavigate('landing')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000))

      setSubmitMessage('Thank you for your message! We\'ll get back to you within 24 hours.')
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        userType: 'patient'
      })
    } catch (error) {
      setSubmitMessage('Sorry, there was an error sending your message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="GlobalDoc Connect logo" className="h-8 w-8 rounded-full" />
              <span className="text-xl font-bold text-brand-700">GlobalDoc Connect</span>
            </div>
            <button
              onClick={handleBackToHome}
              className="text-brand-700 hover:text-brand-600 font-medium"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">
              Contact Us
            </h1>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Get in Touch</h2>
                <p className="text-slate-700 mb-6">
                  We're here to help! Whether you have questions about our services, need technical support, or want to partner with us, don't hesitate to reach out.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Email Support</h3>
                    <a href="mailto:shafiuabdulahi.sa3@gmail.com" className="text-brand-600 hover:text-brand-700">
                      shafiuabdulahi.sa3@gmail.com
                    </a>
                    <p className="text-sm text-slate-600 mt-1">We respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Emergency Support</h3>
                    <p className="text-slate-700">Available 24/7 for urgent medical consultations</p>
                    <p className="text-sm text-slate-600 mt-1">For medical emergencies, contact local emergency services first</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Global Community</h3>
                    <p className="text-slate-700">Serving patients and doctors worldwide</p>
                    <p className="text-sm text-slate-600 mt-1">Multiple languages supported</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-3">Response Times</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">General inquiries:</span>
                    <span className="text-slate-900">Within 24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Technical support:</span>
                    <span className="text-slate-900">Within 12 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Medical consultations:</span>
                    <span className="text-slate-900">Immediate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Emergency support:</span>
                    <span className="text-slate-900">24/7 available</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Need Immediate Help?</h3>
                <p className="text-blue-800 text-sm mb-3">
                  For medical emergencies or urgent healthcare needs, our platform provides 24/7 access to qualified healthcare professionals.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Start Emergency Consultation
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Send us a Message
            </h2>

            {submitMessage && (
              <div className={`p-4 rounded-lg mb-6 ${submitMessage.includes('error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="userType" className="block text-sm font-medium text-slate-700 mb-2">
                  I am a:
                </label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Healthcare Professional</option>
                  <option value="partner">Business Partner</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Brief description of your inquiry"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-vertical"
                  placeholder="Please provide details about your inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-brand-700 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Prefer to email directly?{' '}
                <a href="mailto:shafiuabdulahi.sa3@gmail.com" className="text-brand-600 hover:text-brand-700 font-medium">
                  shafiuabdulahi.sa3@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">How quickly do you respond?</h3>
              <p className="text-slate-700 text-sm">We respond to all inquiries within 24 hours, with technical support responding within 12 hours.</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Do you offer phone support?</h3>
              <p className="text-slate-700 text-sm">Currently, we provide support through email and our platform messaging system for the best documentation.</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">What languages do you support?</h3>
              <p className="text-slate-700 text-sm">We support English, Arabic, Swahili, Hindi, French, and Spanish for our global community.</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">How do I report a problem?</h3>
              <p className="text-slate-700 text-sm">Use the contact form above or email us directly. Include screenshots and detailed descriptions for faster resolution.</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Can I request a feature?</h3>
              <p className="text-slate-700 text-sm">Absolutely! We love hearing from users. Share your ideas through the contact form or email.</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">How do I become a healthcare partner?</h3>
              <p className="text-slate-700 text-sm">Contact us with your credentials and experience. We'll guide you through our verification process.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Contact