import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, FileText, Video, HelpCircle, BookOpen, Stethoscope } from 'lucide-react'

const languageNames = {
  en: 'English',
  ha: 'Hausa',
  yo: 'Yoruba',
  sw: 'Swahili',
  ar: 'Arabic',
  fr: 'French',
}

const library = {
  patient: [
    { id: 'patient-complete-guide', title: 'Patient Complete Guide', type: 'md', icon: BookOpen, description: 'Registration, booking, tokens, files, chat, video, accessibility, and emergency support.' },
    { id: 'patient-quick-start', title: 'Patient Quick Start Checklist', type: 'md', icon: FileText, description: 'A short operational checklist for first-time patients.' },
    { id: 'patient-robot-video-guide', title: 'Humanoid Robot Video Guide', type: 'html', icon: Video, description: 'Interactive visual guide for using the portal and starting a video visit.' },
    { id: 'patient-faq', title: 'Patient FAQ and Troubleshooting', type: 'md', icon: HelpCircle, description: 'Answers for login, payments, appointments, files, camera access, and notifications.' },
  ],
  doctor: [
    { id: 'doctor-complete-guide', title: 'Doctor Complete Guide', type: 'md', icon: Stethoscope, description: 'Approval, dashboard, referrals, files, consultations, financials, and support workflow.' },
    { id: 'doctor-quick-start', title: 'Doctor Quick Start Checklist', type: 'md', icon: FileText, description: 'A concise checklist for newly approved doctors.' },
    { id: 'doctor-robot-video-guide', title: 'Humanoid Robot Doctor Guide', type: 'html', icon: Video, description: 'Interactive visual guide for running consultations and using doctor tools.' },
    { id: 'doctor-faq', title: 'Doctor FAQ and Troubleshooting', type: 'md', icon: HelpCircle, description: 'Answers for approval, profile status, patients, video, payouts, and notifications.' },
  ],
}

function buildMarkdownManual(manual, userType, language) {
  const audience = userType === 'doctor' ? 'Doctor' : 'Patient'
  const commonSupport = [
    'Support email: globaldoctorconnect@gmail.com',
    'Use the in-app notification panel for account-specific updates.',
    'Never share passwords, patient IDs, PINs, private medical documents, or payment references in public chats.',
  ]

  const sections = userType === 'doctor'
    ? [
        ['Account approval', ['Register with your real name, email, specialty, country or location, and medical license number.', 'Your account remains pending until the platform admin reviews and approves it.', 'After approval, you receive an email notification and can sign in to the doctor dashboard.']],
        ['Dashboard overview', ['Use Overview for profile status and activity.', 'Use Community for doctor-admin communication.', 'Use Referrals for patient referral coordination.', 'Use Patients to review patient records when authorized.', 'Use Financials for payout details and withdrawal requests.']],
        ['Consultation workflow', ['Confirm patient identity before clinical advice.', 'Review uploaded files before the video or chat session.', 'Document important decisions in chat or notes.', 'Use referrals when a patient needs a different specialist, facility, PHC, clinic, or lab.']],
        ['License and compliance', ['Keep license number, issuer, expiry, and country accurate.', 'Admin approval means the platform has reviewed your supplied details; external medical council verification still depends on each region allowing API or manual lookup.', 'Expired or unverifiable licenses should be corrected before patient access is expanded.']],
        ['Payouts', ['Enter bank or mobile money details carefully.', 'Minimum withdrawal is controlled by platform settings.', 'Kora payout processing depends on Kora credentials being configured on the server.']],
      ]
    : [
        ['Getting started', ['Create a patient account or sign in with Google.', 'Complete name, date of birth, phone, country, and preferred language.', 'Select a doctor or facility workflow and keep your patient ID safe.']],
        ['Appointments', ['Choose a verified doctor from the approved doctor list.', 'Pick an available date and time.', 'Confirm the booking and watch your notifications for reminders.']],
        ['Medical files', ['Upload prescriptions, lab results, scans, discharge notes, and referral documents.', 'Use clear file names so doctors can review quickly.', 'Only upload files that belong to the patient account being used.']],
        ['Tokens and payments', ['Buy tokens before booking paid consultations.', 'After payment, return to the platform success page to verify and credit tokens.', 'Contact support with the payment reference if credit does not appear.']],
        ['Video consultation', ['Allow camera and microphone permissions.', 'Use a stable connection and quiet room.', 'Keep the patient present during the call unless a legal guardian is handling the session.']],
      ]

  return [
    `# ${manual.title}`,
    '',
    `Audience: ${audience}`,
    `Language: ${languageNames[language] || language}`,
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Purpose',
    `This manual gives complete operational guidance for using the ${audience.toLowerCase()} portal safely and consistently.`,
    '',
    ...sections.flatMap(([heading, items]) => [
      `## ${heading}`,
      ...items.map((item) => `- ${item}`),
      '',
    ]),
    '## Troubleshooting',
    '- If data fails to load, refresh once and confirm you are signed into the correct portal.',
    '- If Google sign-in succeeds but the dashboard does not open, confirm the Supabase redirect URL and backend API are deployed.',
    '- If video does not start, allow camera and microphone permission and reload the page.',
    '- If payment or token data is missing, verify the payment reference from the Payment Success page.',
    '',
    '## Safety notes',
    ...commonSupport.map((item) => `- ${item}`),
    '',
  ].join('\n')
}

function buildRobotGuide(manual, userType, language) {
  const steps = userType === 'doctor'
    ? ['Wait for admin approval', 'Sign in to Doctor Portal', 'Review patient records', 'Start chat or video', 'Record referrals and follow-up', 'Update payout details']
    : ['Sign in or create account', 'Complete profile', 'Choose verified doctor', 'Book appointment', 'Upload medical files', 'Start video visit']

  return `<!doctype html>
<html lang="${language}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${manual.title}</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f8fafc; color: #0f172a; }
    main { max-width: 980px; margin: 0 auto; padding: 32px; }
    .stage { display: grid; gap: 24px; grid-template-columns: 260px 1fr; align-items: center; background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 28px; }
    .robot { width: 190px; height: 250px; margin: auto; position: relative; }
    .head { width: 120px; height: 86px; border-radius: 28px; background: #2563eb; margin: auto; position: relative; animation: nod 2.4s infinite; }
    .eye { width: 18px; height: 18px; border-radius: 50%; background: white; position: absolute; top: 34px; }
    .eye.left { left: 30px; } .eye.right { right: 30px; }
    .body { width: 150px; height: 120px; border-radius: 32px; background: #0f172a; margin: 16px auto 0; position: relative; }
    .panel { width: 72px; height: 42px; border-radius: 14px; background: #22c55e; position: absolute; top: 34px; left: 39px; }
    .arm { width: 24px; height: 96px; border-radius: 14px; background: #64748b; position: absolute; top: 110px; }
    .arm.left { left: 4px; transform: rotate(14deg); } .arm.right { right: 4px; transform: rotate(-14deg); animation: wave 1.8s infinite; }
    .leg { width: 28px; height: 72px; border-radius: 14px; background: #64748b; position: absolute; bottom: 0; }
    .leg.left { left: 64px; } .leg.right { right: 64px; }
    ol { display: grid; gap: 12px; padding-left: 24px; }
    li { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px 14px; }
    @keyframes wave { 0%,100%{ transform: rotate(-14deg); } 50%{ transform: rotate(-42deg); } }
    @keyframes nod { 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(6px); } }
    @media (max-width: 760px) { .stage { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <h1>${manual.title}</h1>
    <p>This interactive guide uses a humanoid robot coach to walk users through the ${userType} workflow.</p>
    <section class="stage">
      <div class="robot" aria-label="Humanoid robot guide">
        <div class="head"><span class="eye left"></span><span class="eye right"></span></div>
        <div class="arm left"></div><div class="arm right"></div>
        <div class="body"><div class="panel"></div></div>
        <div class="leg left"></div><div class="leg right"></div>
      </div>
      <div>
        <h2>Guided steps</h2>
        <ol>${steps.map((step) => `<li>${step}</li>`).join('')}</ol>
      </div>
    </section>
  </main>
</body>
</html>`
}

function ManualDownload({ userType = 'patient' }) {
  const { i18n } = useTranslation()
  const [downloading, setDownloading] = useState(null)
  const manuals = library[userType] || library.patient

  const handleDownload = async (manual) => {
    setDownloading(manual.id)
    try {
      const language = i18n.language || 'en'
      const content = manual.type === 'html'
        ? buildRobotGuide(manual, userType, language)
        : buildMarkdownManual(manual, userType, language)
      const blob = new Blob([content], { type: manual.type === 'html' ? 'text/html' : 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${manual.id}_${language}.${manual.type}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <Download className="h-6 w-6 text-blue-700" />
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Manuals and Guides</h2>
          <p className="text-sm text-slate-600">Current language: {languageNames[i18n.language] || i18n.language || 'English'}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {manuals.map((manual) => {
          const Icon = manual.icon
          const isDownloading = downloading === manual.id
          return (
            <div key={manual.id} className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start gap-4">
                <Icon className="mt-1 h-8 w-8 text-blue-700" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">{manual.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{manual.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-1 uppercase">{manual.type}</span>
                    {Object.keys(languageNames).map((code) => (
                      <span key={code} className="rounded-full bg-slate-100 px-2 py-1">{languageNames[code]}</span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload(manual)}
                    disabled={isDownloading}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    {isDownloading ? 'Preparing...' : 'Download'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ManualDownload
