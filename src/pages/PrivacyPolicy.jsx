import Footer from '../components/Footer'

function PrivacyPolicy({ onNavigate }) {
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
          <h1 className="text-3xl font-bold text-slate-900 mb-4 text-center">Privacy Policy</h1>
          <p className="text-slate-600 mb-8 text-center"><strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
            <p className="font-semibold text-blue-900">Health data requires special protection</p>
            <p className="mt-2 text-blue-900">This policy explains how GlobalDoc Connect collects, uses, protects, shares, retains, and responds to requests about personal information and health information. It is written for a global launch and may be supplemented by country-specific notices.</p>
          </div>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">1. Who we are</h2>
            <p>GlobalDoc Connect provides telehealth technology, patient intake, professional consultation support, support ticketing, facility workflows, payment coordination, and health record tools. Depending on the country and service, GlobalDoc Connect may act as a data controller, data processor, service provider, or technology provider for licensed healthcare professionals and facilities.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">2. Information we collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identity and contact data: name, email, phone, location, date of birth, language, profile details, account identifiers, and support identifiers.</li>
              <li>Health and clinical data: symptoms, medical history, allergies, medications, pregnancy information where supplied, consultation notes, prescriptions, lab requests, lab results, care plans, uploaded documents, and clinician summaries.</li>
              <li>Professional data: doctor/facility credentials, licences, practice details, availability, payout details, and verification status.</li>
              <li>Operational data: appointments, queue records, referrals, pharmacy/lab workflow records, payments, invoices, support tickets, audit logs, and consent history.</li>
              <li>Technical data: device type, browser, IP address, crash logs, security events, cookies, and usage information needed for platform safety and performance.</li>
            </ul>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">3. Why we use information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To create accounts, verify users, and provide patient, doctor, facility, and support workflows.</li>
              <li>To connect patients with licensed healthcare professionals and maintain consultation records.</li>
              <li>To support consent capture, care plans, prescriptions, lab workflows, referrals, follow-up, safety notices, and support requests.</li>
              <li>To process payments, invoices, refunds, credits, sponsorships, and reconciliation where applicable.</li>
              <li>To protect users, detect abuse, investigate incidents, and maintain audit logs.</li>
              <li>To comply with legal, regulatory, licensing, tax, accounting, data protection, medical record, and professional obligations.</li>
            </ul>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">4. AI and automated assistance</h2>
            <p>AI features may help organize intake text, summarize support requests, prepare doctor-facing summaries, translate or structure information, and suggest routing notes. AI is not used as a final medical decision-maker, final diagnosis, final prescription authority, or emergency responder. Human review is required for clinical use.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">5. Sharing information</h2>
            <p>We share information only where needed for the service, safety, legal compliance, or user-authorized care. Recipients may include the patient’s selected doctor, authorised facility users, payment providers, hosting/storage providers, communication providers, support personnel, auditors, legal advisers, regulators, or emergency contacts where legally permitted or necessary for safety.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">6. International transfers</h2>
            <p>Because GlobalDoc Connect is intended for cross-border telehealth, information may be stored, accessed, or processed outside the user’s country. We use technical, contractual, organisational, and access-control safeguards appropriate to the type of data and applicable law. Some countries may require local hosting, local representatives, or additional patient notices before launch.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">7. Security measures</h2>
            <p>We use role-based access controls, authentication, audit records, encryption in transit, provider-level storage security, restricted service-role access, backup practices, and security monitoring. No online platform can guarantee absolute security. Users must protect their accounts and report suspected misuse immediately.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">8. Data retention</h2>
            <p>Health records, prescription records, lab results, audit logs, consent records, and payment records may be retained for the period required by medical, legal, tax, professional, and safety obligations. Where deletion is requested, some records may need to be retained, restricted, archived, or anonymised instead of fully deleted when law or clinical safety requires retention.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">9. Your rights</h2>
            <p>Depending on your country, you may have rights to access, correct, update, export, restrict, object to processing, withdraw consent, request deletion, request portability, complain to a regulator, or request review of automated processing. Some rights may be limited by medical record retention, fraud prevention, clinical safety, or legal obligations.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">10. Cookies and analytics</h2>
            <p>We may use essential cookies for login, security, preferences, and service functionality. Analytics or marketing cookies should be used only where permitted and, where required, with user consent. Users may manage cookie settings through browser controls and platform preference tools where available.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">11. Children and guardians</h2>
            <p>Children should use the platform only through a parent, legal guardian, authorised facility, or clinician where required by law. Additional consent and identity checks may be required for minors.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">12. Contact and requests</h2>
            <p>Privacy, access, correction, deletion, export, complaint, or consent requests may be sent to globaldoctorconnect@gmail.com. We may need to verify identity before processing a request.</p>
          </section>
        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}

export default PrivacyPolicy
