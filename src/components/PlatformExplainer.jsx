function PlatformExplainer() {
  const steps = [
    { id: '01', title: 'Patients search globally', body: 'Find doctors by specialty, language, rating, location, and availability from anywhere.' },
    { id: '02', title: 'Book and confirm', body: 'Choose consultation type, schedule fast, and move into chat or video when ready.' },
    { id: '03', title: 'Doctors deliver care', body: 'Doctors manage consultations, notes, prescriptions, follow-ups, and patient communication.' },
    { id: '04', title: 'Facilities coordinate', body: 'Facilities support referrals, lab requests, documentation, and care routing from one workflow.' },
  ]

  const timeline = [
    'Search doctor',
    'Book consultation',
    'Upload records',
    'Chat or video',
    'Follow up',
  ]

  return (
    <section className="mt-16 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-10">
      <div className="pointer-events-none absolute" />
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="inline-flex items-center rounded-full bg-brand-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-brand-700">
            1–2 minute walkthrough
          </p>
          <h2 className="mt-5 text-3xl font-bold text-slate-900 sm:text-4xl">See the whole platform in one flow</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            A landing-page video-style summary showing how GlobalDoc Connect moves a patient from doctor search to secure consultation, records, facility support, and follow-up.
          </p>

          <div className="mt-8 rounded-[2rem] border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-slate-50 p-4 shadow-inner shadow-slate-200/70">
            <div className="aspect-video overflow-hidden rounded-[1.5rem] border border-white bg-white shadow-lg shadow-slate-200/70">
              <div className="flex h-full flex-col justify-between bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.20),_transparent_35%),linear-gradient(135deg,_#ffffff,_#f8fafc)] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="" className="h-10 w-10 rounded-full object-cover shadow-sm" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">GlobalDoc Connect</p>
                      <p className="text-sm font-semibold text-slate-900">Telehealth journey preview</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Secure flow</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {['Patient portal', 'Doctor workspace', 'Facility support', 'AI guide'].map((item) => (
                    <div key={item} className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                      <p className="text-sm font-bold text-slate-900">{item}</p>
                      <p className="mt-1 text-xs text-slate-500">Connected care step</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-2 sm:grid-cols-5">
                  {timeline.map((item, index) => (
                    <div key={item} className="rounded-full bg-slate-900 px-3 py-2 text-center text-[11px] font-semibold text-white shadow-sm">
                      {index + 1}. {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((step) => (
            <div key={step.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:shadow-slate-200/60">
              <p className="text-xs font-bold text-brand-700">{step.id}</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PlatformExplainer
