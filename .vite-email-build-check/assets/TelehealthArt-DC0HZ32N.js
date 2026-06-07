import { j as jsxRuntimeExports } from "./react-Bu4vr6vE.js";
import { b as Sparkles, f as ShieldCheck, V as Video, Q as LockKeyhole, Y as Activity, G as Globe2, p as Stethoscope, _ as HeartPulse } from "./icons-Ci-JEzBE.js";
const themeMap = {
  landing: {
    bg: "from-sky-900 via-teal-800 to-slate-950",
    soft: "from-sky-50 via-white to-emerald-50",
    line: "#38bdf8",
    accent: "#34d399",
    warm: "#fbbf24",
    title: "Global telehealth, human care",
    body: "A polished care journey for patients, doctors, and facilities with secure video, records, language access, and live clinical documents."
  },
  patient: {
    bg: "from-emerald-800 via-teal-800 to-sky-900",
    soft: "from-emerald-50 via-white to-sky-50",
    line: "#10b981",
    accent: "#0284c7",
    warm: "#a78bfa",
    title: "Your care space",
    body: "Friendly booking, video, vitals, files, prescriptions, labs, and reminders in one calm dashboard."
  },
  doctor: {
    bg: "from-sky-900 via-indigo-900 to-slate-950",
    soft: "from-sky-50 via-white to-indigo-50",
    line: "#60a5fa",
    accent: "#14b8a6",
    warm: "#f59e0b",
    title: "Clinical command center",
    body: "Review patients, keep video open, request vitals, chat, prescribe, order labs, and refer across specialties."
  },
  facility: {
    bg: "from-teal-900 via-emerald-800 to-slate-950",
    soft: "from-teal-50 via-white to-emerald-50",
    line: "#2dd4bf",
    accent: "#22c55e",
    warm: "#38bdf8",
    title: "Facility-assisted care",
    body: "Create patients, find online doctors, start consultations, and keep documents visible for local care teams."
  },
  admin: {
    bg: "from-slate-950 via-sky-900 to-teal-900",
    soft: "from-slate-50 via-white to-sky-50",
    line: "#0ea5e9",
    accent: "#14b8a6",
    warm: "#f97316",
    title: "Governance and trust",
    body: "Manage approvals, announcements, facilities, audit trails, and community communication with clarity."
  }
};
function getTheme(theme) {
  return themeMap[theme] || themeMap.landing;
}
function NetworkIllustration({ theme = "landing", compact = false }) {
  const t = getTheme(theme);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 620 420", role: "img", "aria-label": "Secure international telehealth network", className: "h-full w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: `gd-${theme}-screen`, x1: "0", x2: "1", y1: "0", y2: "1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#ffffff", stopOpacity: "0.98" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#e0f2fe", stopOpacity: "0.92" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: `gd-${theme}-line`, x1: "0", x2: "1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: t.line }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: t.accent })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "50", y: "62", width: "520", height: "296", rx: "34", fill: "rgba(255,255,255,0.12)", stroke: "rgba(255,255,255,0.22)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M112 282 C188 188 258 338 330 222 C394 120 448 265 526 168", fill: "none", stroke: `url(#gd-${theme}-line)`, strokeWidth: "8", strokeLinecap: "round", opacity: "0.9" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M116 286 L176 232 L230 276 L286 210 L350 246 L414 166 L506 198", fill: "none", stroke: "rgba(255,255,255,0.5)", strokeWidth: "2", strokeDasharray: "8 10" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { transform: "translate(92 88)", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "178", height: "122", rx: "24", fill: `url(#gd-${theme}-screen)` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "58", cy: "50", r: "25", fill: "#dbeafe" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M38 92 C49 66 69 66 80 92", fill: "#bfdbfe" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "98", y: "34", width: "52", height: "10", rx: "5", fill: "#0f172a", opacity: "0.78" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "98", y: "54", width: "38", height: "9", rx: "4.5", fill: t.line, opacity: "0.9" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "30", y: "92", width: "118", height: "10", rx: "5", fill: "#cbd5e1", opacity: "0.72" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { transform: "translate(354 90)", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "170", height: "134", rx: "26", fill: "#ffffff", opacity: "0.95" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "26", y: "24", width: "118", height: "18", rx: "9", fill: "#e0f2fe" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M42 82 H128", stroke: t.accent, strokeWidth: "8", strokeLinecap: "round" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M84 40 V74 M54 70 H114", stroke: "#0f766e", strokeWidth: "10", strokeLinecap: "round" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "32", y: "100", width: "106", height: "12", rx: "6", fill: "#cbd5e1", opacity: "0.7" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { transform: "translate(210 240)", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "210", height: "86", rx: "24", fill: "#ffffff", opacity: "0.96" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "50", cy: "43", r: "24", fill: "#dcfce7" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M39 44 L48 53 L63 32", fill: "none", stroke: "#047857", strokeWidth: "7", strokeLinecap: "round", strokeLinejoin: "round" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "88", y: "27", width: "82", height: "11", rx: "5.5", fill: "#0f172a", opacity: "0.8" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "88", y: "49", width: "62", height: "10", rx: "5", fill: t.warm, opacity: "0.95" })
    ] }),
    [72, 520, 120, 520, 520].map((x, index) => {
      const y = [254, 244, 360, 118, 330][index];
      return /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: x, cy: y, r: compact ? 7 : 11, fill: index % 2 ? t.accent : t.line, opacity: "0.88" }, `${x}-${y}`);
    })
  ] });
}
function TelehealthHeroArt({ theme = "landing", className = "" }) {
  const t = getTheme(theme);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `relative overflow-hidden rounded-3xl bg-gradient-to-br ${t.bg} p-5 text-white shadow-xl ring-1 ring-white/10 ${className}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 lg:grid-cols-[1fr_1.1fr] lg:items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4", "aria-hidden": "true" }),
        "Secure care network"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold tracking-normal text-white", children: t.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-6 text-white/78", children: t.body })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-3", children: [
        ["Video", Video],
        ["Records", LockKeyhole],
        ["Vitals", Activity]
      ].map(([label, Icon]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/15", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4", "aria-hidden": "true" }),
        label
      ] }, label)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[230px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NetworkIllustration, { theme }) })
  ] }) });
}
function PortalArtBanner({ theme = "patient", title, body, className = "" }) {
  const t = getTheme(theme);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br ${t.soft} p-5 shadow-sm ${className}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-5 md:flex-row md:items-center md:justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase text-slate-700 ring-1 ring-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4", "aria-hidden": "true" }),
        "Care experience"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 text-2xl font-bold tracking-normal text-slate-950", children: title || t.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-6 text-slate-700", children: body || t.body })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-36 min-w-[230px] md:w-80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NetworkIllustration, { theme, compact: true }) })
  ] }) });
}
function LandingAdArt() {
  const items = [
    { icon: Globe2, title: "International access", body: "Search doctors by specialty, language, location, and availability." },
    { icon: Stethoscope, title: "Clinical continuity", body: "Prescriptions, labs, vitals, notes, and files stay connected to the visit." },
    { icon: HeartPulse, title: "Patient-friendly care", body: "Clear dashboards, live prompts, and downloadable documents for every patient." }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-14 overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-2xl ring-1 ring-slate-800 sm:p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-black uppercase tracking-normal text-sky-200", children: "GlobalDoc telehealth program" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 text-3xl font-bold tracking-normal text-white", children: "Elegant digital care for patients, doctors, and facilities." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm leading-7 text-slate-300", children: "Built around secure video, human-readable records, facility-assisted access, and specialist referral pathways." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 md:grid-cols-3", children: items.map(({ icon: Icon, title, body }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white/8 p-5 ring-1 ring-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-400/15 text-sky-200 ring-1 ring-sky-300/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5", "aria-hidden": "true" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-base font-bold text-white", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs leading-6 text-slate-300", children: body })
    ] }, title)) })
  ] }) });
}
export {
  LandingAdArt as L,
  PortalArtBanner as P,
  TelehealthHeroArt as T
};
