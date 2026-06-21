import Footer from '../components/Footer'

function TermsOfService({ onNavigate }) {
  const handleBackToHome = () => {
    onNavigate('landing')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="GlobalDoc Connect logo" className="h-8 w-8 rounded-full" />
              <span className="text-xl font-bold text-brand-700">GlobalDoc Connect</span>
            </div>
            <button onClick={handleBackToHome} className="text-brand-700 hover:text-brand-600 font-medium">← Back to Home</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 sm:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4 text-center">Terms of Service</h1>
          <p className="text-slate-600 mb-8 text-center"><strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8">
            <p className="font-semibold text-amber-900">Important medical and regulatory notice</p>
            <p className="mt-2 text-amber-900">GlobalDoc Connect is a telehealth technology platform. It is not a hospital, emergency ambulance service, pharmacy, insurer, or regulator. Medical decisions, prescriptions, diagnoses, and treatment plans must be made by licensed healthcare professionals acting within the scope of their licence and the laws of the patient’s location.</p>
          </div>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">1. Acceptance of these Terms</h2>
            <p>These Terms govern access to the GlobalDoc Connect website, applications, dashboards, telehealth workflows, support tools, payment flows, and related services. By using the platform, you agree to these Terms and any additional consent forms, clinical policies, privacy notices, or professional agreements that apply to your role.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">2. Platform role</h2>
            <p>GlobalDoc Connect provides software for patient intake, appointment coordination, secure communication, health records, doctor consultation support, clinical documentation, facility workflows, and administrative support. The platform does not itself practise medicine.</p>
            <p>Healthcare professionals are independent professionals or authorised facility users. They are responsible for their own clinical judgment, licensing, documentation, patient communication, prescriptions, follow-up instructions, and compliance with professional rules.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">3. Emergency limitations</h2>
            <p>The platform is not a replacement for local emergency services. If a user may be facing an emergency, life-threatening symptom, severe injury, severe allergic reaction, loss of consciousness, chest pain, difficulty breathing, stroke-like symptom, severe bleeding, poisoning, overdose, or risk of self-harm, the user must contact local emergency services or go to the nearest emergency facility immediately.</p>
            <p>AI tools, support agents, facility users, and online clinicians may provide routing guidance, but they cannot guarantee emergency response time or replace emergency care.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">4. Healthcare professional requirements</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Doctors and clinical users must hold valid licences, registrations, and permissions required in each jurisdiction where they provide care.</li>
              <li>Professionals must provide truthful credential information and keep licences, malpractice/indemnity cover, and practice details current.</li>
              <li>Professionals must decline or refer cases that cannot safely be handled by telehealth.</li>
              <li>Professionals must document consultations appropriately and protect patient confidentiality.</li>
              <li>Professionals must comply with applicable medical, pharmacy, laboratory, health facility, consumer protection, advertising, and data protection laws.</li>
            </ul>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">5. Patient responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Patients must provide accurate identity, contact, symptom, medication, allergy, pregnancy, medical history, and emergency contact information.</li>
              <li>Patients must not rely on AI summaries or platform content as a final diagnosis or treatment decision.</li>
              <li>Patients must seek in-person or emergency care when advised or when symptoms are severe.</li>
              <li>Patients must use prescriptions, lab requests, and care instructions only as issued by authorised clinicians.</li>
            </ul>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">6. AI and automation limits</h2>
            <p>AI features may help with intake, translation support, routing, support summaries, symptom summaries, doctor-facing summaries, and administrative assistance. AI must not be treated as a doctor, final diagnosis, prescription authority, or emergency responder. All clinical outputs require review by a qualified human professional.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">7. Payments, refunds, and professional fees</h2>
            <p>Fees are shown before payment where applicable. Payments may be processed through approved payment partners available in the user’s country. Refunds, cancellations, chargebacks, taxes, and professional payouts may vary by country, payment provider, and facility agreement.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">8. Privacy and health data</h2>
            <p>Use of the platform involves personal information and health information. Users must review the Privacy Policy and any consent forms before using clinical workflows. Access to health data is role-restricted and should be used only for legitimate care, support, compliance, billing, or safety purposes.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">9. Prohibited uses</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Practising medicine, pharmacy, laboratory services, or facility operations without proper authority.</li>
              <li>Uploading false documents, forged licences, fake identities, or misleading medical records.</li>
              <li>Using the platform for unlawful prescribing, controlled substances, fraud, harassment, spam, or exploitation.</li>
              <li>Attempting to bypass access controls, view another user’s records, or misuse support/document uploads.</li>
            </ul>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">10. Suspension and termination</h2>
            <p>GlobalDoc Connect may suspend or terminate access for safety, suspected fraud, unauthorised clinical practice, data misuse, non-payment, legal risk, or violation of these Terms. Where legally required, medical records and data requests will be handled according to applicable retention and data protection rules.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">11. No guarantee of outcome</h2>
            <p>Healthcare involves uncertainty. The platform does not guarantee diagnosis, cure, availability of any specific doctor, treatment outcome, prescription approval, refund approval, or emergency response. Clinical responsibility remains with the treating professional and facility where applicable.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">12. Governing law and country rules</h2>
            <p>These Terms are designed for a global telehealth platform. Local laws may require additional terms, permits, facility approvals, data registrations, clinical licences, or patient notices. Where local law conflicts with these Terms, local mandatory law controls for users in that location.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">13. Contact</h2>
            <p>Questions about these Terms, clinical safety, data protection, or support requests may be sent to globaldoctorconnect@gmail.com.</p>
          </section>
        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}

export default TermsOfService
