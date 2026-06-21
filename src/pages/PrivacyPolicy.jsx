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

      <main className="max-w-5xl mx-auto px-6 py-12 sm:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4 text-center">GlobalDoctorConnect Privacy Policy</h1>
          <p className="text-slate-600 mb-8 text-center"><strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
            <p className="font-semibold text-blue-900">Advanced health-data privacy notice</p>
            <p className="mt-2 text-blue-900">GlobalDoctorConnect handles personal data and health data. This Privacy Policy is written in clear English and is designed to support compliance with applicable health privacy, data protection, telehealth, consumer protection, medical record, and cross-border transfer regulations. It must be reviewed with local counsel before opening services in each country.</p>
          </div>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">1. Who we are</h2>
            <p>GlobalDoctorConnect provides a telehealth technology platform for patient intake, doctor consultation support, clinical documentation, facility workflows, support requests, payment coordination, care summaries, and health record tools. Depending on the service, location, contract, and user role, GlobalDoctorConnect may act as a data controller, data processor, service provider, technology provider, or business associate/equivalent service provider for licensed healthcare professionals and facilities.</p>
            <p>This policy applies to patients, doctors, facilities, pharmacies, laboratories, support users, administrators, visitors, and other people who use or interact with GlobalDoctorConnect.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">2. Regulatory framework</h2>
            <p>GlobalDoctorConnect is designed to operate under a country-by-country compliance model. Relevant laws may include the Nigeria Data Protection Act and NDPC rules, GDPR and UK GDPR for European users, HIPAA/HITECH where United States covered-entity or business-associate relationships apply, and other national health privacy, medical record, consumer protection, payment, and telemedicine laws.</p>
            <p>No single privacy policy can automatically authorise medical practice in every country. Before launching clinical services in a country, GlobalDoctorConnect must confirm local rules for telemedicine, doctor licensing, prescription handling, pharmacy/lab operations, patient consent, data hosting, cross-border transfers, breach notification, and data subject rights.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">3. Information we collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Identity and contact data:</strong> name, email, phone number, address/location, date of birth, gender, language, account identifiers, patient codes, facility codes, support IDs, and emergency contacts.</li>
              <li><strong>Health and clinical data:</strong> symptoms, medical history, allergies, medications, pregnancy-related information where supplied, vital signs, uploaded documents, consultation notes, SOAP notes, care plans, prescriptions, lab requests, lab results, referrals, pharmacy records, and doctor summaries.</li>
              <li><strong>Professional and facility data:</strong> doctor credentials, licence information, speciality, facility affiliation, availability, verification status, pharmacy/lab details, professional documents, and payout records.</li>
              <li><strong>Operational data:</strong> appointments, queue entries, triage records, payments, invoices, support tickets, audit events, consent events, file access logs, security events, and data request records.</li>
              <li><strong>Technical data:</strong> IP address, device type, browser, app version, cookie or session information, usage logs, error logs, and security telemetry.</li>
              <li><strong>AI assistance data:</strong> intake text, support summaries, doctor-facing summaries, language preference, routing notes, and safety-review records.</li>
            </ul>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">4. Sources of information</h2>
            <p>We may receive information directly from you, from doctors and facilities involved in your care, from authorised staff, from uploaded files, from payment providers, from support interactions, from device/browser logs, and from regulatory or verification processes. Users must not upload another person’s data unless they are legally authorised to do so.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">5. Legal bases for processing</h2>
            <p>Depending on the country and service, GlobalDoctorConnect may process data based on consent, performance of a contract, legitimate interests, legal obligations, vital interests, public-health obligations, healthcare provision, medical record keeping, billing, security, or explicit consent for special-category health data where required. Where consent is the basis, you may withdraw consent, but withdrawal may not affect lawful processing already completed or records we must keep for legal/clinical reasons.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">6. How we use information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To create, authenticate, and manage accounts.</li>
              <li>To connect patients with licensed healthcare professionals and facilities.</li>
              <li>To support clinical intake, consultation notes, prescriptions, lab workflows, referrals, care plans, and follow-up.</li>
              <li>To process payments, invoices, refunds, sponsorships, claims, and reconciliations where applicable.</li>
              <li>To provide support, investigate complaints, and respond to patient or professional requests.</li>
              <li>To maintain audit trails, file access logs, security controls, fraud prevention, and abuse detection.</li>
              <li>To comply with legal, regulatory, professional, tax, accounting, medical record, data protection, and safety obligations.</li>
            </ul>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">7. AI and automated assistance</h2>
            <p>AI tools may assist with intake structuring, language support, routing notes, support summaries, symptom summaries, doctor-facing summaries, and administrative review. AI is not a doctor, nurse, pharmacist, laboratory scientist, final diagnosis engine, prescription authority, or emergency responder. Any clinical use of AI output requires review by a qualified human professional.</p>
            <p>We maintain a no-diagnosis guardrail: AI assistance should not give final diagnoses, guarantee outcomes, independently prescribe medicine, or replace emergency care.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">8. Sharing and disclosures</h2>
            <p>We may share information with your selected doctor, authorised facility staff, pharmacies, laboratories, payment processors, cloud and storage providers, messaging/email providers, support staff, auditors, legal advisers, insurers/sponsors where authorised, regulators, and emergency contacts where legally permitted or necessary for safety.</p>
            <p>We do not sell patient health records to advertisers. We do not allow staff or partners to access health information unless there is a legitimate role-based reason.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">9. International transfers</h2>
            <p>GlobalDoctorConnect may involve cross-border storage, support, hosting, communication, or clinical workflows. Where required, we use safeguards such as contracts, access controls, data minimisation, local addenda, transfer assessments, or local hosting options. Some countries may require patient data to remain in-country or require regulator notification before cross-border transfer.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">10. Security controls</h2>
            <p>We use technical and organisational measures such as HTTPS, authentication, role-based permissions, audit logs, file access logs, restricted service-role credentials, backup procedures, provider-level storage security, and monitoring. Additional controls required for production include Supabase RLS enforcement, admin MFA, least-privilege staff access, penetration testing, incident-response rehearsal, and clinician/facility access review.</p>
            <p>No system can be guaranteed completely secure. Users must protect passwords, devices, recovery channels, and patient identifiers.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">11. Retention</h2>
            <p>Health records, clinical notes, prescriptions, lab results, consent records, audit logs, support records, and payment records may be retained for as long as required by law, medical-record rules, tax/accounting obligations, professional standards, safety needs, fraud prevention, and dispute resolution. Deletion requests may result in deletion, restriction, anonymisation, or archival depending on legal and clinical requirements.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">12. Patient and user rights</h2>
            <p>Depending on your location, you may have the right to be informed, access your data, correct inaccurate data, request deletion/erasure, restrict processing, object to processing, request portability/export, withdraw consent, complain to a supervisory authority, and request review of automated processing. Identity verification may be required before we respond.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">13. Children and guardians</h2>
            <p>Minors may use the platform only through a parent, legal guardian, authorised healthcare professional, or approved facility workflow where required by law. Additional consent, identity verification, and medical responsibility rules may apply.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">14. Cookies and analytics</h2>
            <p>We may use essential cookies and similar technologies for login, security, routing, preferences, and service functionality. Analytics or marketing cookies should be used only where permitted and, where required, after consent. Browser controls may allow you to delete or block cookies, but some platform features may stop working.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">15. Breach and incident response</h2>
            <p>If we identify a security or privacy incident affecting personal or health data, we will assess the incident, contain it, preserve evidence, notify affected users and regulators where required, and document corrective actions. Notification timelines and content vary by country and regulator.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">16. Country-specific supplements</h2>
            <p>Nigeria users may be covered by NDPA/NDPC requirements. EU/UK users may be covered by GDPR/UK GDPR. United States healthcare relationships may trigger HIPAA/HITECH obligations where GlobalDoctorConnect acts for covered entities or business associates. Other countries may impose additional requirements. Country-specific notices, contracts, or consent forms may supplement this policy.</p>
          </section>

          <section className="mb-8 space-y-4 text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">17. Contact and privacy requests</h2>
            <p>Privacy requests, data access/export requests, correction requests, deletion/restriction requests, complaints, and consent questions may be sent to globaldoctorconnect@gmail.com. We may ask for identity verification and enough information to locate the relevant records.</p>
          </section>
        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}

export default PrivacyPolicy
