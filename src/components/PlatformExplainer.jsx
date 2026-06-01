function PlatformExplainer() {
  const steps = [
    { id: '01', title: 'Patients search globally', body: 'Find doctors by specialty, language, rating, and availability from anywhere.' },
    { id: '02', title: 'Book and confirm', body: 'Choose consultation type, schedule fast, and join chat or video when ready.' },
    { id: '03', title: 'Doctors deliver care', body: 'Consultations, notes, prescriptions, and follow-up happen inside one workspace.' },
    { id: '04', title: 'Facilities coordinate', body: 'Referrals and support teams stay aligned through a shared telehealth workflow.' },
  ]

  return (
    <section className="mt-16 rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-xl">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-300">2 minute walkthrough</p>
          <h2 className="mt-4 text-3xl font-bold">How GlobalDoc Connect works</h2>
          <p className="mt-4 text-slate-300 leading-8">
            A quick visual summary of how patients, doctors, facilities, and platform admins connect inside one secure telehealth ecosystem.
          </p>
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-brand-700 via-slate-800 to-slate-950 p-6">
              <div className="grid h-full gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4">👩 Patient search + booking</div>
                <div className="rounded-2xl bg-white/10 p-4">🩺 Doctor consultation</div>
                <div className="rounded-2xl bg-white/10 p-4">🏥 Facility coordination</div>
                <div className="rounded-2xl bg-white/10 p-4">🤖 AI guidance + admin oversight</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((step) => (
            <div key={step.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs font-semibold text-brand-300">{step.id}</p>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PlatformExplainer
