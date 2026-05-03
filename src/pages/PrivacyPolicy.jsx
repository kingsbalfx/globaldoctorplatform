import { useState } from 'react'
import Footer from '../components/Footer'

function PrivacyPolicy({ onNavigate }) {
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
            Privacy Policy
          </h1>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-8 text-center">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>

            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-8">
              <p className="text-green-800 font-medium">Your Privacy Matters</p>
              <p className="text-green-800">
                At GlobalDoc Connect, we are committed to protecting your personal and medical information. This Privacy Policy explains how we collect, use, and safeguard your data.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Introduction</h2>
              <p className="text-slate-700 mb-4">
                GlobalDoc Connect ("we," "us," or "our") operates a telehealth platform that connects patients with healthcare professionals worldwide. We are committed to protecting your privacy and ensuring the security of your personal and medical information.
              </p>
              <p className="text-slate-700 mb-4">
                This Privacy Policy describes what information we collect, how we use it, and the choices you have regarding your information. By using our platform, you consent to the collection and use of information as described in this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Personal Information:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Name, email address, phone number, and date of birth</li>
                <li>Mailing address and location information</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Profile pictures and identification documents</li>
                <li>Language preferences and communication settings</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Medical Information:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Medical history, current symptoms, and health conditions</li>
                <li>Medications, allergies, and treatment history</li>
                <li>Test results, diagnoses, and treatment plans</li>
                <li>Consultation notes and healthcare professional observations</li>
                <li>Emergency contact information and medical directives</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Technical Information:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Device information, IP address, and browser type</li>
                <li>Usage patterns and platform interaction data</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Location data for service availability</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. How We Use Your Information</h2>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Providing Healthcare Services:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Connect patients with appropriate healthcare professionals</li>
                <li>Facilitate secure video consultations and messaging</li>
                <li>Process payments for medical services</li>
                <li>Maintain medical records and consultation history</li>
                <li>Provide emergency medical support when needed</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Platform Operations:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Verify healthcare professional credentials</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Improve our services and develop new features</li>
                <li>Send important notifications about your account and services</li>
                <li>Comply with legal and regulatory requirements</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Communication:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Send appointment reminders and follow-up care information</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Share important updates about our services</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-slate-700 mb-4">
                We take your privacy seriously and only share your information in limited circumstances:
              </p>

              <h3 className="text-xl font-medium text-slate-800 mb-3">With Healthcare Professionals:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Medical information is shared with your chosen healthcare professional</li>
                <li>Consultation history is available to your healthcare team</li>
                <li>Emergency contacts may be notified in urgent situations</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Service Providers:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Payment processors (Stripe) for secure transactions</li>
                <li>Cloud hosting providers for data storage</li>
                <li>Analytics services to improve our platform</li>
                <li>Customer support tools for assistance</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Legal Requirements:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>When required by law or legal process</li>
                <li>To protect our rights and prevent harm</li>
                <li>In case of medical emergencies requiring disclosure</li>
                <li>To comply with healthcare regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Data Security</h2>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800 font-medium">Bank-Level Security</p>
                <p className="text-blue-800">
                  We use industry-leading security measures to protect your information, including end-to-end encryption for all medical consultations.
                </p>
              </div>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Security Measures:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>End-to-end encryption for all video consultations and messaging</li>
                <li>Secure data centers with 24/7 monitoring</li>
                <li>Regular security audits and penetration testing</li>
                <li>Multi-factor authentication for healthcare professionals</li>
                <li>Automatic data encryption at rest and in transit</li>
                <li>Regular backups with secure storage</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Access Controls:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Role-based access to medical information</li>
                <li>Audit logs for all data access</li>
                <li>Regular staff training on privacy and security</li>
                <li>Immediate account suspension for suspicious activity</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. International Data Transfers</h2>
              <p className="text-slate-700 mb-4">
                As a global telehealth platform, we may transfer your information to countries other than your own. We ensure that such transfers comply with applicable data protection laws.
              </p>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Data is transferred only to countries with adequate privacy protections</li>
                <li>Standard contractual clauses are used for international transfers</li>
                <li>Your data is processed in secure, certified data centers</li>
                <li>You can request information about international transfers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-slate-700 mb-4">
                We use cookies and similar technologies to improve your experience and analyze platform usage.
              </p>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Types of Cookies:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand usage patterns</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing Cookies:</strong> Used for targeted communications (with consent)</li>
              </ul>

              <p className="text-slate-700 mb-4">
                You can control cookie preferences through your browser settings or our cookie consent banner.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Your Rights and Choices</h2>
              <p className="text-slate-700 mb-4">
                You have several rights regarding your personal information:
              </p>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Access and Control:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Restriction:</strong> Limit how we process your information</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Communication Preferences:</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Opt out of marketing communications</li>
                <li>Choose notification preferences</li>
                <li>Control sharing with third parties</li>
                <li>Manage cookie preferences</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Data Retention</h2>
              <p className="text-slate-700 mb-4">
                We retain your information only as long as necessary for the purposes described in this policy:
              </p>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li><strong>Medical Records:</strong> Retained for minimum 7 years or as required by law</li>
                <li><strong>Account Information:</strong> Retained while account is active and for 3 years after closure</li>
                <li><strong>Payment Information:</strong> Retained only as required for tax and legal purposes</li>
                <li><strong>Analytics Data:</strong> Anonymized after 2 years</li>
              </ul>
              <p className="text-slate-700 mb-4">
                You can request deletion of your information at any time, subject to legal and medical record retention requirements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Children's Privacy</h2>
              <p className="text-slate-700 mb-4">
                Our services are not intended for children under 18 without parental consent. We do not knowingly collect personal information from children under 13.
              </p>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Parental consent is required for users under 18</li>
                <li>Parents can review and request deletion of their child's information</li>
                <li>We comply with COPPA and similar children's privacy laws</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Third-Party Services</h2>
              <p className="text-slate-700 mb-4">
                Our platform integrates with third-party services. These services have their own privacy policies:
              </p>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li><strong>Stripe:</strong> Payment processing - see Stripe's privacy policy</li>
                <li><strong>Supabase:</strong> Database services - see Supabase's privacy policy</li>
                <li><strong>Video Platforms:</strong> Secure video calls - HIPAA compliant</li>
                <li><strong>Analytics:</strong> Usage tracking - anonymized data only</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Changes to This Policy</h2>
              <p className="text-slate-700 mb-4">
                We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements.
              </p>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>Material changes will be notified via email or platform notification</li>
                <li>Continued use constitutes acceptance of updated policy</li>
                <li>Previous versions remain accessible for reference</li>
                <li>We encourage regular review of this policy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. Contact Us</h2>
              <p className="text-slate-700 mb-4">
                If you have questions about this Privacy Policy or our data practices:
              </p>
              <div className="bg-slate-50 p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Privacy Officer</h4>
                    <p className="text-slate-700">Email: globaldoctorconnect@gmail.com</p>
                    <p className="text-slate-700">Subject: "Privacy Inquiry"</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Data Protection</h4>
                    <p className="text-slate-700">Response time: Within 30 days</p>
                    <p className="text-slate-700">Languages: English, Arabic, French</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-slate-600 text-sm">
                    For urgent privacy concerns or data breaches, contact us immediately. We take all privacy matters seriously and respond promptly to protect your rights.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">14. Compliance and Certifications</h2>
              <p className="text-slate-700 mb-4">
                We maintain compliance with international privacy standards:
              </p>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
                <li>HIPAA compliant for healthcare data in the United States</li>
                <li>GDPR compliant for European Union users</li>
                <li>PIPEDA compliant for Canadian users</li>
                <li>SOC 2 Type II certified for security and availability</li>
                <li>Regular third-party security audits</li>
              </ul>
            </section>

            <div className="bg-green-50 border-l-4 border-green-400 p-6 mt-8">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Your Trust is Important to Us</h3>
              <p className="text-green-800">
                We are committed to maintaining the highest standards of privacy and security for your healthcare information. Your trust enables us to provide quality telehealth services worldwide.
              </p>
              <p className="text-green-800 mt-2">
                If you ever have concerns about your privacy or data security, please don't hesitate to contact us. We're here to help and ensure your information remains protected.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  )
}

export default PrivacyPolicy
