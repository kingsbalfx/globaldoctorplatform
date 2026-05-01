import { useState } from 'react'
import Footer from '../components/Footer'

function TermsOfService({ onNavigate }) {
  const [currentView, setCurrentView] = useState('landing')

  const handleBackToHome = () => {
    onNavigate('landing')
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
      <main className="max-w-4xl mx-auto px-6 py-12 sm:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Terms of Service
          </h1>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-8 text-center">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Introduction</h2>
              <p className="text-slate-700 mb-4">
                Welcome to GlobalDoc Connect ("we," "us," or "our"). These Terms of Service ("Terms") govern your use of our telehealth platform that connects patients with healthcare professionals worldwide. By accessing or using our services, you agree to be bound by these Terms.
              </p>
              <p className="text-slate-700 mb-4">
                Our platform provides secure video consultations, emergency medical support, appointment scheduling, payment processing, and related healthcare services. We are committed to maintaining the highest standards of medical care, privacy, and security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Definitions</h2>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>"Platform"</strong> means the GlobalDoc Connect website, mobile applications, and related services.</li>
                <li><strong>"Patient"</strong> means any individual seeking medical consultation or healthcare services through our platform.</li>
                <li><strong>"Healthcare Professional" or "Doctor"</strong> means licensed medical practitioners who provide services through our platform.</li>
                <li><strong>"Consultation"</strong> means video calls, chat sessions, or other forms of medical communication between patients and healthcare professionals.</li>
                <li><strong>"Emergency Services"</strong> means urgent medical care provided through our 24/7 emergency support system.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. User Eligibility</h2>
              <h3 className="text-xl font-medium text-slate-800 mb-3">For Patients:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>You must be at least 18 years old or have parental/guardian consent</li>
                <li>You must provide accurate and complete medical information</li>
                <li>You must have access to necessary technology for video consultations</li>
                <li>You must be located in a jurisdiction where telehealth services are permitted</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">For Healthcare Professionals:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>You must hold a valid medical license in your jurisdiction</li>
                <li>You must provide proof of credentials and malpractice insurance</li>
                <li>You must maintain patient confidentiality and follow medical ethics</li>
                <li>You must complete our verification and training process</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Services Provided</h2>
              <h3 className="text-xl font-medium text-slate-800 mb-3">Patient Services:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Search and connect with verified healthcare professionals</li>
                <li>Schedule video consultations and appointments</li>
                <li>Secure payment processing for medical services</li>
                <li>Access to medical records and consultation history</li>
                <li>24/7 emergency medical support</li>
                <li>Multi-language support (English, Arabic, Swahili, Hindi, French, Spanish)</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Healthcare Professional Services:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Access to global patient base</li>
                <li>Secure consultation platform</li>
                <li>Payment processing and fee collection</li>
                <li>Patient record management</li>
                <li>Emergency consultation support</li>
                <li>Continuing medical education resources</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Payment Terms</h2>
              <p className="text-slate-700 mb-4">
                All fees for medical consultations are clearly displayed before booking. Payments are processed securely through Stripe and other certified payment processors.
              </p>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Consultation fees are charged per session or package</li>
                <li>Emergency consultations may have different pricing</li>
                <li>Refunds are available within 24 hours for cancelled appointments</li>
                <li>Healthcare professionals receive 70-80% of consultation fees after platform fees</li>
                <li>All payments are in USD or local currency equivalents</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Medical Disclaimer</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-800 font-medium">Important Medical Notice:</p>
                <p className="text-yellow-800">
                  Our platform facilitates telehealth consultations but does not replace emergency medical care. In case of medical emergencies, please call your local emergency services immediately.
                </p>
              </div>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Telehealth consultations are not appropriate for all medical conditions</li>
                <li>Healthcare professionals may decline to provide care based on medical judgment</li>
                <li>You are responsible for providing complete and accurate medical information</li>
                <li>Follow-up care may be recommended for complex medical issues</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Privacy and Data Protection</h2>
              <p className="text-slate-700 mb-4">
                Your privacy is our top priority. All medical consultations are encrypted and confidential. Please refer to our Privacy Policy for detailed information about data handling.
              </p>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>All consultations use end-to-end encryption</li>
                <li>Medical records are stored securely and access is restricted</li>
                <li>We comply with HIPAA and international privacy regulations</li>
                <li>You control access to your medical information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. User Responsibilities</h2>
              <h3 className="text-xl font-medium text-slate-800 mb-3">All Users:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Maintain accurate account information</li>
                <li>Use the platform only for lawful medical purposes</li>
                <li>Respect the privacy and dignity of other users</li>
                <li>Report any technical issues or inappropriate behavior</li>
                <li>Keep login credentials secure and confidential</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Patients:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Provide complete medical history and current symptoms</li>
                <li>Follow healthcare professional recommendations</li>
                <li>Attend scheduled appointments or cancel in advance</li>
                <li>Rate and review consultations honestly</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Healthcare Professionals:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Maintain professional standards and ethics</li>
                <li>Provide accurate medical advice based on available information</li>
                <li>Document consultations appropriately</li>
                <li>Respond to patient inquiries in a timely manner</li>
                <li>Maintain current medical licensure</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Prohibited Activities</h2>
              <p className="text-slate-700 mb-4">The following activities are strictly prohibited:</p>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Using the platform for non-medical purposes</li>
                <li>Sharing false or misleading medical information</li>
                <li>Harassing or abusing other users</li>
                <li>Attempting to access other users' accounts</li>
                <li>Violating medical privacy or confidentiality</li>
                <li>Practicing medicine without proper licensure</li>
                <li>Discriminating against patients based on race, religion, or background</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Account Termination</h2>
              <p className="text-slate-700 mb-4">
                We reserve the right to suspend or terminate accounts that violate these Terms or engage in harmful behavior. Termination may result in loss of access to medical records and services.
              </p>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Immediate termination for serious violations</li>
                <li>Written notice for minor violations with opportunity to correct</li>
                <li>Appeal process available for disputed terminations</li>
                <li>Data export available upon reasonable request</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-slate-700 mb-4">
                While we strive to provide reliable telehealth services, healthcare involves inherent risks. Our liability is limited to the amount paid for services in the preceding 12 months.
              </p>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>We are not liable for medical outcomes or treatment effectiveness</li>
                <li>Platform availability is provided "as is" without warranties</li>
                <li>Users assume responsibility for technology requirements</li>
                <li>Disputes between patients and healthcare professionals are handled separately</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Dispute Resolution</h2>
              <p className="text-slate-700 mb-4">
                We encourage users to resolve disputes amicably. For unresolved issues:
              </p>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Contact our support team at shafiuabdullahi.sa3@gmail.com</li>
                <li>Medical disputes may involve independent review</li>
                <li>Payment disputes are handled through our payment processor</li>
                <li>Legal disputes will be resolved in competent courts</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. Updates to Terms</h2>
              <p className="text-slate-700 mb-4">
                We may update these Terms periodically to reflect changes in our services or legal requirements. Users will be notified of significant changes via email or platform notifications.
              </p>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Continued use constitutes acceptance of updated Terms</li>
                <li>Major changes require explicit user consent</li>
                <li>Previous versions remain accessible for reference</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">14. Contact Information</h2>
              <p className="text-slate-700 mb-4">
                For questions about these Terms or our services:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-700"><strong>Email:</strong> shafiuabdullahi.sa3@gmail.com</p>
                <p className="text-slate-700"><strong>Emergency Support:</strong> Available 24/7</p>
                <p className="text-slate-700"><strong>Address:</strong> GlobalDoc Connect, Telehealth Services Worldwide</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">15. Governing Law</h2>
              <p className="text-slate-700 mb-4">
                These Terms are governed by international healthcare standards and applicable local laws. Users are responsible for complying with laws in their jurisdiction.
              </p>
            </section>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mt-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Acknowledgment</h3>
              <p className="text-blue-800">
                By using GlobalDoc Connect, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
              </p>
              <p className="text-blue-800 mt-2">
                Remember: Your health and privacy are our top priorities. We're here to connect you with quality healthcare professionals worldwide.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default TermsOfService