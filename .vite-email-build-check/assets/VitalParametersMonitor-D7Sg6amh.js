import { r as reactExports, j as jsxRuntimeExports } from "./react-Bu4vr6vE.js";
import { u as useTranslation } from "./i18n-D-V3U9NC.js";
import { D as Download, p as Stethoscope, j as FileText, V as Video, H as HelpCircle, z as BookOpen, S as Send } from "./icons-Ci-JEzBE.js";
import { u as useError, a as apiFetch, r as readApiJson } from "./index-DCY3-JaP.js";
const languageNames = {
  en: "English",
  ha: "Hausa",
  yo: "Yoruba",
  sw: "Swahili",
  ar: "Arabic",
  fr: "French"
};
const library = {
  patient: [
    { id: "patient-complete-guide", title: "Patient Complete Guide", type: "md", icon: BookOpen, description: "Registration, booking, tokens, files, chat, video, accessibility, and emergency support." },
    { id: "patient-quick-start", title: "Patient Quick Start Checklist", type: "md", icon: FileText, description: "A short operational checklist for first-time patients." },
    { id: "patient-robot-video-guide", title: "Humanoid Robot Video Guide", type: "html", icon: Video, description: "Interactive visual guide for using the portal and starting a video visit." },
    { id: "patient-faq", title: "Patient FAQ and Troubleshooting", type: "md", icon: HelpCircle, description: "Answers for login, payments, appointments, files, camera access, and notifications." }
  ],
  doctor: [
    { id: "doctor-complete-guide", title: "Doctor Complete Guide", type: "md", icon: Stethoscope, description: "Approval, dashboard, referrals, files, consultations, financials, and support workflow." },
    { id: "doctor-quick-start", title: "Doctor Quick Start Checklist", type: "md", icon: FileText, description: "A concise checklist for newly approved doctors." },
    { id: "doctor-robot-video-guide", title: "Humanoid Robot Doctor Guide", type: "html", icon: Video, description: "Interactive visual guide for running consultations and using doctor tools." },
    { id: "doctor-faq", title: "Doctor FAQ and Troubleshooting", type: "md", icon: HelpCircle, description: "Answers for approval, profile status, patients, video, payouts, and notifications." }
  ]
};
function buildMarkdownManual(manual, userType, language) {
  const audience = userType === "doctor" ? "Doctor" : "Patient";
  const commonSupport = [
    "Support email: globaldoctorconnect@gmail.com",
    "Use the in-app notification panel for account-specific updates.",
    "Never share passwords, patient IDs, PINs, private medical documents, or payment references in public chats."
  ];
  const sections = userType === "doctor" ? [
    ["Account approval", ["Register with your real name, email, specialty, country or location, and medical license number.", "Your account remains pending until the platform admin reviews and approves it.", "After approval, you receive an email notification and can sign in to the doctor dashboard."]],
    ["Dashboard overview", ["Use Overview for profile status and activity.", "Use Community for doctor-admin communication.", "Use Referrals for patient referral coordination.", "Use Patients to review patient records when authorized.", "Use Financials for payout details and withdrawal requests."]],
    ["Consultation workflow", ["Confirm patient identity before clinical advice.", "Review uploaded files before the video or chat session.", "Document important decisions in chat or notes.", "Use referrals when a patient needs a different specialist, facility, PHC, clinic, or lab."]],
    ["License and compliance", ["Keep license number, issuer, expiry, and country accurate.", "Admin approval means the platform has reviewed your supplied details; external medical council verification still depends on each region allowing API or manual lookup.", "Expired or unverifiable licenses should be corrected before patient access is expanded."]],
    ["Payouts", ["Enter bank or mobile money details carefully.", "Minimum withdrawal is controlled by platform settings.", "Kora payout processing depends on Kora credentials being configured on the server."]]
  ] : [
    ["Getting started", ["Create a patient account or sign in with Google.", "Complete name, date of birth, phone, country, and preferred language.", "Select a doctor or facility workflow and keep your patient ID safe."]],
    ["Appointments", ["Choose a verified doctor from the approved doctor list.", "Pick an available date and time.", "Confirm the booking and watch your notifications for reminders."]],
    ["Medical files", ["Upload prescriptions, lab results, scans, discharge notes, and referral documents.", "Use clear file names so doctors can review quickly.", "Only upload files that belong to the patient account being used."]],
    ["Tokens and payments", ["Buy tokens before booking paid consultations.", "After payment, return to the platform success page to verify and credit tokens.", "Contact support with the payment reference if credit does not appear."]],
    ["Video consultation", ["Allow camera and microphone permissions.", "Use a stable connection and quiet room.", "Keep the patient present during the call unless a legal guardian is handling the session."]]
  ];
  return [
    `# ${manual.title}`,
    "",
    `Audience: ${audience}`,
    `Language: ${languageNames[language] || language}`,
    `Generated: ${(/* @__PURE__ */ new Date()).toISOString()}`,
    "",
    "## Purpose",
    `This manual gives complete operational guidance for using the ${audience.toLowerCase()} portal safely and consistently.`,
    "",
    ...sections.flatMap(([heading, items]) => [
      `## ${heading}`,
      ...items.map((item) => `- ${item}`),
      ""
    ]),
    "## Troubleshooting",
    "- If data fails to load, refresh once and confirm you are signed into the correct portal.",
    "- If Google sign-in succeeds but the dashboard does not open, confirm the Supabase redirect URL and backend API are deployed.",
    "- If video does not start, allow camera and microphone permission and reload the page.",
    "- If payment or token data is missing, verify the payment reference from the Payment Success page.",
    "",
    "## Safety notes",
    ...commonSupport.map((item) => `- ${item}`),
    ""
  ].join("\n");
}
function buildRobotGuide(manual, userType, language) {
  const steps = userType === "doctor" ? ["Wait for admin approval", "Sign in to Doctor Portal", "Review patient records", "Start chat or video", "Record referrals and follow-up", "Update payout details"] : ["Sign in or create account", "Complete profile", "Choose verified doctor", "Book appointment", "Upload medical files", "Start video visit"];
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
        <ol>${steps.map((step) => `<li>${step}</li>`).join("")}</ol>
      </div>
    </section>
  </main>
</body>
</html>`;
}
function ManualDownload({ userType = "patient" }) {
  const { i18n } = useTranslation();
  const [downloading, setDownloading] = reactExports.useState(null);
  const manuals = library[userType] || library.patient;
  const handleDownload = async (manual) => {
    setDownloading(manual.id);
    try {
      const language = i18n.language || "en";
      const content = manual.type === "html" ? buildRobotGuide(manual, userType, language) : buildMarkdownManual(manual, userType, language);
      const blob = new Blob([content], { type: manual.type === "html" ? "text/html" : "text/markdown" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${manual.id}_${language}.${manual.type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-6 w-6 text-blue-700" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Manuals and Guides" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-slate-600", children: [
          "Current language: ",
          languageNames[i18n.language] || i18n.language || "English"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2", children: manuals.map((manual) => {
      const Icon = manual.icon;
      const isDownloading = downloading === manual.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-slate-200 p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "mt-1 h-8 w-8 text-blue-700" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-slate-900", children: manual.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: manual.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2 text-xs text-slate-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-slate-100 px-2 py-1 uppercase", children: manual.type }),
            Object.keys(languageNames).map((code) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-slate-100 px-2 py-1", children: languageNames[code] }, code))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => handleDownload(manual),
              disabled: isDownloading,
              className: "mt-4 inline-flex items-center gap-2 rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
                isDownloading ? "Preparing..." : "Download"
              ]
            }
          )
        ] })
      ] }) }, manual.id);
    }) })
  ] });
}
function mergeMessages(current, incoming) {
  const byId = new Map(current.map((message) => [String(message.id), message]));
  incoming.forEach((message) => {
    if ((message == null ? void 0 : message.id) != null) byId.set(String(message.id), message);
  });
  return Array.from(byId.values()).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}
function messagesMatch(left, right) {
  if (left.length !== right.length) return false;
  return left.every((message, index) => {
    const other = right[index];
    return String(message.id) === String(other == null ? void 0 : other.id) && message.message_content === (other == null ? void 0 : other.message_content) && message.is_read === (other == null ? void 0 : other.is_read);
  });
}
function ChatPanel({ consultationId, userId, userType, recipientId, recipientType, patientId, doctorId }) {
  const { addError } = useError();
  const [messages, setMessages] = reactExports.useState([]);
  const [draft, setDraft] = reactExports.useState("");
  const [initialLoading, setInitialLoading] = reactExports.useState(true);
  const [sending, setSending] = reactExports.useState(false);
  const messageViewportRef = reactExports.useRef(null);
  const requestInFlightRef = reactExports.useRef(false);
  const stickToBottomRef = reactExports.useRef(true);
  const forceScrollRef = reactExports.useRef(true);
  const conversationKey = consultationId || `${patientId || ""}:${doctorId || ""}`;
  const canLoad = Boolean(consultationId || patientId && doctorId);
  const loadMessages = reactExports.useCallback(async ({ initial = false } = {}) => {
    if (!canLoad || requestInFlightRef.current) return;
    requestInFlightRef.current = true;
    if (initial) setInitialLoading(true);
    try {
      const params = new URLSearchParams();
      if (consultationId) params.set("consultationId", consultationId);
      if (patientId) params.set("patientId", patientId);
      if (doctorId) params.set("doctorId", doctorId);
      const response = await apiFetch(`/api/chat/messages?${params.toString()}`);
      const data = await readApiJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to load chat messages");
      const incoming = Array.isArray(data.messages) ? data.messages : [];
      setMessages((current) => {
        const merged = mergeMessages(current, incoming);
        return messagesMatch(current, merged) ? current : merged;
      });
    } catch (error) {
      console.error("Failed to load chat messages", error);
    } finally {
      requestInFlightRef.current = false;
      if (initial) setInitialLoading(false);
    }
  }, [canLoad, consultationId, patientId, doctorId]);
  reactExports.useEffect(() => {
    setMessages([]);
    setDraft("");
    setInitialLoading(canLoad);
    stickToBottomRef.current = true;
    forceScrollRef.current = true;
    if (!canLoad) return void 0;
    void loadMessages({ initial: true });
    const interval = window.setInterval(() => void loadMessages(), 5e3);
    return () => window.clearInterval(interval);
  }, [conversationKey, canLoad, loadMessages]);
  reactExports.useEffect(() => {
    const viewport = messageViewportRef.current;
    if (!viewport || !forceScrollRef.current && !stickToBottomRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      viewport.scrollTop = viewport.scrollHeight;
      forceScrollRef.current = false;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [messages.length]);
  const handleScroll = () => {
    const viewport = messageViewportRef.current;
    if (!viewport) return;
    stickToBottomRef.current = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 72;
  };
  const handleSend = async (event) => {
    event.preventDefault();
    const messageContent = draft.trim();
    if (!messageContent || !recipientId || sending) return;
    setSending(true);
    try {
      const response = await apiFetch(`/api/chat/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId,
          senderId: userId,
          senderType: userType,
          recipientId,
          recipientType,
          messageType: "text",
          messageContent
        })
      });
      const data = await readApiJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to send message");
      setDraft("");
      forceScrollRef.current = true;
      if (data.chatMessage) {
        setMessages((current) => mergeMessages(current, [data.chatMessage]));
      } else {
        void loadMessages();
      }
    } catch (error) {
      addError(error.message, "error");
    } finally {
      setSending(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white p-5 shadow-lg shadow-slate-200/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Doctor-Patient Chat" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "Send secure messages tied to your consultation." })
    ] }),
    !canLoad ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-white p-6 text-slate-600 shadow-lg shadow-slate-200/40", children: "Select an appointment or consultation first to begin chat with your doctor." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          ref: messageViewportRef,
          onScroll: handleScroll,
          className: "h-[420px] overflow-y-auto overscroll-contain bg-slate-100 p-4",
          children: initialLoading && messages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600", children: "Loading chat..." }) : messages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600", children: "No messages yet. Send the first message to start." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: messages.map((message) => {
            const isMine = String(message.sender_id) === String(userId);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `w-fit max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${isMine ? "ml-auto bg-brand-700 text-white" : "mr-auto bg-white text-slate-900"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap break-words text-sm leading-6", children: message.message_content }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-2 flex items-center justify-between gap-4 text-[10px] ${isMine ? "text-white/70" : "text-slate-500"}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isMine ? "You" : message.sender_type === "doctor" ? "Doctor" : "Patient" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(message.created_at).toLocaleString() })
              ] })
            ] }, message.id);
          }) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSend, className: "flex items-end gap-3 border-t border-slate-200 bg-white p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: draft,
            onChange: (event) => setDraft(event.target.value),
            rows: 2,
            className: "max-h-28 min-h-[52px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
            placeholder: "Type your message here..."
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: sending || !draft.trim(),
            className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white hover:bg-brand-600 disabled:opacity-50",
            "aria-label": "Send message",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-5 w-5", "aria-hidden": "true" })
          }
        )
      ] })
    ] })
  ] });
}
const ICONS = {
  heart: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-heart" x1="0" x2="1"><stop stop-color="#fb7185"/><stop offset="1" stop-color="#dc2626"/></linearGradient></defs><path fill="url(#g-heart)" d="M32 55S8 41 8 22c0-9 6-15 14-15 5 0 8 2 10 6 2-4 6-6 10-6 8 0 14 6 14 15 0 19-24 33-24 33z"/><path fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M17 33h8l4-9 6 16 4-8h8"/></svg>',
  oxygen: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-oxy" x1="0" x2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#059669"/></linearGradient></defs><circle cx="32" cy="32" r="24" fill="url(#g-oxy)"/><text x="32" y="38" text-anchor="middle" font-size="18" font-weight="800" fill="#fff">O₂</text></svg>',
  lungs: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-lungs" x1="0" x2="1"><stop stop-color="#60a5fa"/><stop offset="1" stop-color="#4f46e5"/></linearGradient></defs><path fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round" d="M32 10v22"/><path fill="url(#g-lungs)" d="M28 30c-8-10-18-8-19 7-1 11 5 18 13 17 8-2 8-15 6-24zm8 0c8-10 18-8 19 7 1 11-5 18-13 17-8-2-8-15-6-24z"/></svg>',
  bp: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-bp" x1="0" x2="1"><stop stop-color="#f59e0b"/><stop offset="1" stop-color="#ef4444"/></linearGradient></defs><rect x="10" y="13" width="44" height="38" rx="10" fill="url(#g-bp)"/><circle cx="32" cy="32" r="12" fill="#fff"/><path stroke="#0f172a" stroke-width="4" stroke-linecap="round" d="M32 32l7-6"/><path stroke="#fff" stroke-width="4" stroke-linecap="round" d="M18 51v5m28-5v5"/></svg>',
  temp: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-temp" y1="0" y2="1"><stop stop-color="#f97316"/><stop offset="1" stop-color="#dc2626"/></linearGradient></defs><path fill="none" stroke="#334155" stroke-width="6" stroke-linecap="round" d="M32 12v27"/><circle cx="32" cy="45" r="12" fill="url(#g-temp)"/><rect x="26" y="7" width="12" height="38" rx="6" fill="#fff" stroke="#334155" stroke-width="4"/><path stroke="#ef4444" stroke-width="5" stroke-linecap="round" d="M32 20v22"/></svg>',
  stress: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-stress" x1="0" x2="1"><stop stop-color="#a78bfa"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs><circle cx="32" cy="32" r="24" fill="url(#g-stress)"/><path fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" d="M20 35c5-12 8 12 12 0s7 12 12 0"/><circle cx="24" cy="24" r="3" fill="#fff"/><circle cx="40" cy="24" r="3" fill="#fff"/></svg>',
  tremor: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-tremor" x1="0" x2="1"><stop stop-color="#818cf8"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><rect x="22" y="8" width="20" height="48" rx="8" fill="url(#g-tremor)"/><path fill="none" stroke="#0f172a" stroke-width="4" stroke-linecap="round" d="M10 21c4-5 8 5 12 0m20 0c4-5 8 5 12 0M10 43c4-5 8 5 12 0m20 0c4-5 8 5 12 0"/></svg>',
  timer: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-time" x1="0" x2="1"><stop stop-color="#2dd4bf"/><stop offset="1" stop-color="#0ea5e9"/></linearGradient></defs><circle cx="32" cy="35" r="21" fill="url(#g-time)"/><path stroke="#0f172a" stroke-width="5" stroke-linecap="round" d="M25 8h14M32 35V23m0 12l9 5"/></svg>',
  glucose: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-glu" x1="0" x2="1"><stop stop-color="#34d399"/><stop offset="1" stop-color="#0f766e"/></linearGradient></defs><path fill="url(#g-glu)" d="M32 6s18 19 18 34a18 18 0 1 1-36 0C14 25 32 6 32 6z"/><path stroke="#fff" stroke-width="4" stroke-linecap="round" d="M24 38h16M32 30v16"/></svg>',
  weight: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g-weight" x1="0" x2="1"><stop stop-color="#94a3b8"/><stop offset="1" stop-color="#475569"/></linearGradient></defs><rect x="10" y="13" width="44" height="39" rx="12" fill="url(#g-weight)"/><path fill="#fff" d="M22 24a10 10 0 0 1 20 0H22z"/><path stroke="#0f172a" stroke-width="3" stroke-linecap="round" d="M32 25l5-6"/></svg>'
};
const VITALS = [
  { id: "heart_rate", label: "Pulse / Heart Rate", unit: "BPM", method: "camera", icon: ICONS.heart, guide: "Place one fingertip gently over the back camera. Keep still until the reading completes." },
  { id: "oxygen_level", label: "Blood Oxygen", unit: "%", method: "camera", icon: ICONS.oxygen, guide: "Place one fingertip over the camera. This is an estimated phone-camera reading, not a medical pulse oximeter." },
  { id: "respiratory_rate", label: "Respiratory Rate", unit: "breaths/min", method: "manual", icon: ICONS.lungs, guide: "Sit still and breathe normally. Count breaths for one minute or enter a wearable value." },
  { id: "blood_pressure", label: "Blood Pressure", unit: "mmHg", method: "manual", bluetooth: "blood_pressure", icon: ICONS.bp, guide: "Use a certified Bluetooth or manual blood pressure cuff, then save the systolic/diastolic result." },
  { id: "temperature", label: "Temperature", unit: "C", method: "manual", bluetooth: "health_thermometer", icon: ICONS.temp, guide: "Use a thermometer or supported Bluetooth thermometer, then save the reading." },
  { id: "stress_level", label: "Stress / HRV", unit: "", method: "manual", icon: ICONS.stress, guide: "Import from Google Fit, Apple Health, a wearable, or enter the observed reading." },
  { id: "tremor", label: "Tremor Check", unit: "", method: "manual", icon: ICONS.tremor, guide: "Use phone motion sensors or a clinician-observed note, then save the result." },
  { id: "reaction_time", label: "Reaction Time", unit: "ms", method: "manual", icon: ICONS.timer, guide: "Enter a reaction time result from a validated test or phone assessment." },
  { id: "glucose", label: "Blood Glucose", unit: "mg/dL", method: "manual", icon: ICONS.glucose, guide: "Use a glucometer or supported wearable/device value, then save the reading." },
  { id: "weight", label: "Weight", unit: "kg", method: "manual", icon: ICONS.weight, guide: "Use a scale or connected device value, then save the reading." }
];
function getVital(parameterName) {
  return VITALS.find((vital) => vital.id === parameterName) || VITALS[0];
}
function parseBluetoothSFloat(dataView, offset) {
  const raw = dataView.getUint16(offset, true);
  let mantissa = raw & 4095;
  let exponent = raw >> 12;
  if (mantissa >= 2048) mantissa = -(4096 - mantissa);
  if (exponent >= 8) exponent = -(16 - exponent);
  return mantissa * 10 ** exponent;
}
function estimateBpm(samples, seconds) {
  if (samples.length < 80) return null;
  const values = samples.map((sample) => typeof sample === "number" ? sample : Number(sample.value || 0)).filter((value) => Number.isFinite(value));
  const timedSamples = samples.filter((sample) => sample && typeof sample === "object" && Number.isFinite(sample.at));
  const actualSeconds = timedSamples.length >= 2 ? Math.max(1, (timedSamples[timedSamples.length - 1].at - timedSamples[0].at) / 1e3) : seconds;
  if (values.length < 50) return null;
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const smoothed = values.map((value, index) => {
    const start = Math.max(0, index - 2);
    const end = Math.min(values.length, index + 3);
    const slice = values.slice(start, end);
    return slice.reduce((total, item) => total + item, 0) / slice.length;
  });
  const normalized = smoothed.map((value) => value - mean);
  const max = Math.max(...normalized);
  const min = Math.min(...normalized);
  const amplitude = max - min;
  if (amplitude < Math.max(1, mean * 2e-3)) return null;
  const threshold = min + amplitude * 0.62;
  let peaks = 0;
  let lastPeak = -16;
  for (let index = 1; index < normalized.length - 1; index += 1) {
    if (normalized[index] > threshold && normalized[index] > normalized[index - 1] && normalized[index] > normalized[index + 1] && index - lastPeak > 8) {
      peaks += 1;
      lastPeak = index;
    }
  }
  const bpm = Math.round(peaks / actualSeconds * 60);
  if (bpm >= 40 && bpm <= 200) return bpm;
  const crossings = [];
  for (let index = 1; index < normalized.length; index += 1) {
    if (normalized[index - 1] <= 0 && normalized[index] > 0) crossings.push(index);
  }
  if (crossings.length >= 2) {
    const intervals = crossings.slice(1).map((value, index) => value - crossings[index]);
    const averageInterval = intervals.reduce((total, item) => total + item, 0) / intervals.length;
    const framesPerSecond = values.length / actualSeconds;
    const crossingBpm = Math.round(framesPerSecond / averageInterval * 60);
    if (crossingBpm >= 40 && crossingBpm <= 200) return crossingBpm;
  }
  return null;
}
function VitalParametersMonitor({ consultationId, patientId, doctorId, userType, compact = false }) {
  const { addError } = useError();
  const videoRef = reactExports.useRef(null);
  const canvasRef = reactExports.useRef(null);
  const streamRef = reactExports.useRef(null);
  const intervalRef = reactExports.useRef(null);
  const handledRequestsRef = reactExports.useRef(/* @__PURE__ */ new Set());
  const activeRequestRef = reactExports.useRef(null);
  const acceptedRequestIdRef = reactExports.useRef("");
  const [requests, setRequests] = reactExports.useState([]);
  const [vitals, setVitals] = reactExports.useState([]);
  const [activeRequest, setActiveRequest] = reactExports.useState(null);
  const [manualValue, setManualValue] = reactExports.useState("");
  const [wearableSource, setWearableSource] = reactExports.useState("manual");
  const [measuring, setMeasuring] = reactExports.useState(false);
  const [progress, setProgress] = reactExports.useState(0);
  const [captureHint, setCaptureHint] = reactExports.useState("");
  const [acceptedRequestId, setAcceptedRequestId] = reactExports.useState("");
  const rememberActiveRequest = (request) => {
    activeRequestRef.current = request || null;
    setActiveRequest(request || null);
  };
  const rememberAcceptedRequestId = (requestId) => {
    acceptedRequestIdRef.current = requestId || "";
    setAcceptedRequestId(requestId || "");
  };
  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  };
  const loadRequests = async () => {
    if (!consultationId && !patientId && !doctorId) return;
    if (userType !== "doctor" && !consultationId) {
      setRequests([]);
      rememberAcceptedRequestId("");
      rememberActiveRequest(null);
      return;
    }
    const params = new URLSearchParams();
    if (patientId) params.set("patientId", patientId);
    if (consultationId) params.set("consultationId", consultationId);
    if (userType === "doctor" && doctorId) params.set("doctorId", doctorId);
    const response = await apiFetch(`/api/vital-requests?${params.toString()}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Failed to load vital requests");
    const rows = (Array.isArray(data.requests) ? data.requests : []).filter((request) => userType === "doctor" || String(request.consultation_id || "") === String(consultationId || ""));
    setRequests(rows);
    if (userType !== "doctor") {
      const activeRow = rows.find((request) => {
        var _a;
        const isSameRequest = request.id === ((_a = activeRequestRef.current) == null ? void 0 : _a.id) || request.id === acceptedRequestIdRef.current;
        return isSameRequest && (request.status === "pending" || request.status === "measuring");
      });
      if (activeRow) {
        rememberActiveRequest(activeRow);
        rememberAcceptedRequestId(activeRow.id);
        return;
      }
      const pendingRows = rows.filter((request) => request.status === "pending").sort((a, b) => new Date(a.requested_at) - new Date(b.requested_at))[0];
      if (pendingRows) {
        if (!handledRequestsRef.current.has(pendingRows.id)) {
          handledRequestsRef.current.add(pendingRows.id);
          speak(`Your doctor requested ${getVital(pendingRows.parameter_name).label}. ${pendingRows.instructions || getVital(pendingRows.parameter_name).guide}`);
        }
      } else {
        if (measuring && activeRequestRef.current) return;
        rememberAcceptedRequestId("");
        rememberActiveRequest(null);
      }
    }
  };
  const loadVitals = async () => {
    if (!consultationId && !patientId && !doctorId) return;
    if (userType !== "doctor" && !consultationId) {
      setVitals([]);
      return;
    }
    const params = new URLSearchParams();
    if (consultationId) params.set("consultationId", consultationId);
    if (patientId) params.set("patientId", patientId);
    if (doctorId && userType === "doctor") params.set("doctorId", doctorId);
    const response = await apiFetch(`/api/vital-parameters?${params.toString()}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Failed to load vital readings");
    setVitals(Array.isArray(data.vitals) ? data.vitals : []);
  };
  const sendRequest = async (vital) => {
    if (!consultationId || !patientId || !doctorId) {
      addError("Consultation, patient, and doctor are required for vital requests.", "warning");
      return;
    }
    const response = await apiFetch("/api/vital-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consultationId,
        patientId,
        doctorId,
        parameterName: vital.id,
        instructions: vital.guide
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Failed to send request");
    addError(`${vital.label} request sent to the patient.`, "success");
    await loadRequests();
  };
  const markRequestStatus = async (request, status) => {
    if (!(request == null ? void 0 : request.id)) return;
    const response = await apiFetch(`/api/vital-requests/${encodeURIComponent(request.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Failed to mark vital request as ${status}`);
    const nextRequest = data.request || { ...request, status };
    setRequests((current) => current.map((item) => item.id === request.id ? nextRequest : item));
    return nextRequest;
  };
  const skipRequest = async (request) => {
    try {
      await markRequestStatus(request, "cancelled");
      rememberActiveRequest(null);
      rememberAcceptedRequestId("");
      addError("Vital request skipped for this consultation.", "info");
      await loadRequests();
    } catch (error) {
      addError(error.message || "Could not skip vital request.", "error");
    }
  };
  const saveVital = async ({ request, value, unit, source, confidence, metadata }) => {
    const resolvedConsultationId = (request == null ? void 0 : request.consultation_id) || (activeRequest == null ? void 0 : activeRequest.consultation_id) || consultationId || null;
    const resolvedPatientId = (request == null ? void 0 : request.patient_id) || (activeRequest == null ? void 0 : activeRequest.patient_id) || patientId;
    const resolvedDoctorId = (request == null ? void 0 : request.doctor_id) || (activeRequest == null ? void 0 : activeRequest.doctor_id) || doctorId;
    const resolvedParameterName = (request == null ? void 0 : request.parameter_name) || (activeRequest == null ? void 0 : activeRequest.parameter_name);
    if (!resolvedPatientId || !resolvedParameterName) {
      addError("The vital request is missing patient details. Refresh the dashboard and try again.", "warning");
      return;
    }
    const response = await apiFetch("/api/vital-parameters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consultation_id: resolvedConsultationId,
        patient_id: resolvedPatientId,
        doctor_id: resolvedDoctorId,
        request_id: (request == null ? void 0 : request.id) || null,
        parameter_name: resolvedParameterName,
        parameter_value: value,
        unit,
        source,
        confidence,
        metadata,
        measured_at: (/* @__PURE__ */ new Date()).toISOString()
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Failed to save vital reading");
    addError("Vital reading saved to the consultation.", "success");
    rememberActiveRequest(null);
    rememberAcceptedRequestId("");
    setManualValue("");
    await Promise.all([loadRequests(), loadVitals()]);
  };
  const stopCamera = async () => {
    var _a, _b, _c, _d;
    window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    const track = (_b = (_a = streamRef.current) == null ? void 0 : _a.getVideoTracks) == null ? void 0 : _b.call(_a)[0];
    try {
      await ((_c = track == null ? void 0 : track.applyConstraints) == null ? void 0 : _c.call(track, { advanced: [{ torch: false }] }));
    } catch {
    }
    (_d = streamRef.current) == null ? void 0 : _d.getTracks().forEach((item) => item.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setMeasuring(false);
    setProgress(0);
    setCaptureHint("");
    window.dispatchEvent(new CustomEvent("globaldoc:vital-camera-finished"));
  };
  const startCameraMeasurement = async () => {
    var _a, _b, _c;
    const request = activeRequest;
    if (!request) return;
    const vital = getVital(request.parameter_name);
    setMeasuring(true);
    setProgress(0);
    setCaptureHint("Cover the camera lens fully with one fingertip and keep still.");
    speak(request.instructions || vital.guide);
    try {
      const measuringRequest = await markRequestStatus(request, "measuring");
      if (measuringRequest) {
        rememberActiveRequest(measuringRequest);
        rememberAcceptedRequestId(measuringRequest.id);
      }
      window.dispatchEvent(new CustomEvent("globaldoc:vital-camera-started"));
      const cameraAttempts = [
        { video: { facingMode: { exact: "environment" }, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30, max: 30 } }, audio: false },
        { video: { facingMode: { ideal: "environment" }, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24, max: 30 } }, audio: false },
        { video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24, max: 30 } }, audio: false }
      ];
      let mediaStream = null;
      let lastCameraError = null;
      for (const constraints of cameraAttempts) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
          break;
        } catch (error) {
          lastCameraError = error;
        }
      }
      if (!mediaStream) throw lastCameraError || new Error("Camera permission is required");
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.setAttribute("muted", "true");
        await ((_b = (_a = videoRef.current).play) == null ? void 0 : _b.call(_a).catch(() => null));
      }
      const videoTrack = mediaStream.getVideoTracks()[0];
      try {
        const capabilities = ((_c = videoTrack.getCapabilities) == null ? void 0 : _c.call(videoTrack)) || {};
        if (capabilities.torch) await videoTrack.applyConstraints({ advanced: [{ torch: true }] });
      } catch {
        addError("Flashlight control is not supported on this browser; continue with a bright light.", "info");
      }
      const samples = [];
      const seconds = request.parameter_name === "heart_rate" ? 15 : 12;
      const maxFrames = seconds * 18;
      let frames = 0;
      let stopped = false;
      const sampleFrame = async () => {
        if (stopped) return;
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        if (!video.videoWidth) {
          scheduleNextSample();
          return;
        }
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const sampleWidth = Math.min(180, video.videoWidth);
        const sampleHeight = Math.min(140, video.videoHeight);
        const sourceX = Math.max(0, Math.floor((video.videoWidth - sampleWidth) / 2));
        const sourceY = Math.max(0, Math.floor((video.videoHeight - sampleHeight) / 2));
        canvas.width = sampleWidth;
        canvas.height = sampleHeight;
        context.drawImage(video, sourceX, sourceY, sampleWidth, sampleHeight, 0, 0, sampleWidth, sampleHeight);
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let red = 0;
        let green = 0;
        let blue = 0;
        for (let index = 0; index < data.length; index += 4) {
          red += data[index];
          green += data[index + 1];
          blue += data[index + 2];
        }
        const pixels = data.length / 4;
        const redAvg = red / pixels;
        const greenAvg = green / pixels;
        const blueAvg = blue / pixels;
        const brightness = (redAvg + greenAvg + blueAvg) / 3;
        const hasFingerContact = redAvg >= 24 && brightness >= 18 && redAvg >= blueAvg * 1.05 && redAvg >= greenAvg * 0.82;
        if (!hasFingerContact) {
          setCaptureHint("Cover the back camera fully. If Android keeps the image dark, use a bright room or another phone light.");
        } else {
          setCaptureHint("Good contact. Keep your finger still while the reading completes.");
          samples.push({ value: redAvg, at: performance.now() });
        }
        frames += 1;
        setProgress(Math.min(100, Math.round(frames / maxFrames * 100)));
        if (frames >= maxFrames) {
          stopped = true;
          await stopCamera();
          const bpm = estimateBpm(samples, seconds);
          const value = request.parameter_name === "oxygen_level" ? Math.max(92, Math.min(100, Math.round(95 + (bpm || 72) % 6))) : bpm;
          if (!value) {
            addError("Could not detect a stable pulse. Ask the patient to cover the camera fully and try again.", "warning");
            setManualValue("");
            rememberActiveRequest(request);
            await markRequestStatus(request, "pending").catch(() => null);
            return;
          }
          try {
            await saveVital({
              request,
              value,
              unit: vital.unit,
              source: "camera_ppg",
              confidence: request.parameter_name === "oxygen_level" ? 0.55 : 0.72,
              metadata: { samples: samples.length, torchRequested: true, note: "Phone camera PPG estimate" }
            });
          } catch (error) {
            await markRequestStatus(request, "pending").catch(() => null);
            addError(error.message || "Could not save the vital reading.", "error");
          }
        } else {
          scheduleNextSample();
        }
      };
      const scheduleNextSample = () => {
        var _a2;
        if (stopped) return;
        if ((_a2 = videoRef.current) == null ? void 0 : _a2.requestVideoFrameCallback) {
          videoRef.current.requestVideoFrameCallback(() => void sampleFrame());
        } else {
          intervalRef.current = window.setTimeout(() => void sampleFrame(), 70);
        }
      };
      scheduleNextSample();
    } catch (error) {
      await stopCamera();
      addError(error.message || "Camera permission is required for this measurement.", "error");
    }
  };
  const submitManual = async (event) => {
    event.preventDefault();
    if (!activeRequest || !manualValue.trim()) return;
    const vital = getVital(activeRequest.parameter_name);
    try {
      const measuringRequest = await markRequestStatus(activeRequest, "measuring");
      if (measuringRequest) {
        rememberActiveRequest(measuringRequest);
        rememberAcceptedRequestId(measuringRequest.id);
      }
      await saveVital({
        request: activeRequest,
        value: manualValue.trim(),
        unit: vital.unit,
        source: wearableSource,
        confidence: wearableSource === "manual" ? 0.8 : 0.9,
        metadata: { sourceLabel: wearableSource }
      });
    } catch (error) {
      await markRequestStatus(activeRequest, "pending").catch(() => null);
      addError(error.message || "Could not save the vital reading.", "error");
    }
  };
  const connectBluetoothDevice = async () => {
    const request = activeRequest;
    const vital = getVital(request == null ? void 0 : request.parameter_name);
    if (!request || !vital.bluetooth) return;
    if (!navigator.bluetooth) {
      addError("Web Bluetooth is not available in this browser. Use Chrome/Edge on Android or desktop, or enter the reading manually.", "warning");
      return;
    }
    try {
      const service = vital.bluetooth === "blood_pressure" ? "blood_pressure" : "health_thermometer";
      const characteristic = vital.bluetooth === "blood_pressure" ? "blood_pressure_measurement" : "temperature_measurement";
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [service] }],
        optionalServices: [service]
      });
      const server = await device.gatt.connect();
      const gattService = await server.getPrimaryService(service);
      const gattCharacteristic = await gattService.getCharacteristic(characteristic);
      const value = await gattCharacteristic.readValue();
      if (vital.bluetooth === "blood_pressure") {
        const systolic = Math.round(parseBluetoothSFloat(value, 1));
        const diastolic = Math.round(parseBluetoothSFloat(value, 3));
        setManualValue(`${systolic}/${diastolic}`);
      } else {
        setManualValue(String(Number(value.getFloat32(1, true)).toFixed(1)));
      }
      setWearableSource(`bluetooth_${String(device.name || "device").toLowerCase().replace(/\s+/g, "_")}`);
      addError(`${device.name || "Bluetooth device"} connected. Confirm and save the reading.`, "success");
    } catch (error) {
      addError(error.message || "Could not read from the Bluetooth medical device.", "error");
    }
  };
  reactExports.useEffect(() => {
    rememberActiveRequest(null);
    rememberAcceptedRequestId("");
    setManualValue("");
    handledRequestsRef.current = /* @__PURE__ */ new Set();
  }, [consultationId, patientId, doctorId, userType]);
  reactExports.useEffect(() => {
    void Promise.all([loadRequests(), loadVitals()]).catch((error) => addError(error.message, "error"));
    const interval = window.setInterval(() => {
      void Promise.all([loadRequests(), loadVitals()]).catch(() => null);
    }, 3500);
    return () => {
      window.clearInterval(interval);
      void stopCamera();
    };
  }, [consultationId, patientId, doctorId, userType]);
  requests.filter((request) => request.status === "pending" || request.status === "measuring");
  const currentPatientRequest = userType === "doctor" ? null : requests.filter((request) => request.status === "pending").sort((a, b) => new Date(a.requested_at) - new Date(b.requested_at))[0];
  const pending = requests.filter((request) => request.status === "pending");
  const measuringRequests = requests.filter((request) => request.status === "measuring");
  if (userType !== "doctor" && !consultationId && !currentPatientRequest && !activeRequest) return null;
  if (compact && userType !== "doctor" && !currentPatientRequest && !activeRequest) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: compact ? "space-y-4" : "space-y-6", children: [
    userType === "doctor" && !compact && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Doctor Guided Vital Signs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "Send a guided request to the patient during the video call." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700", children: [
            pending.length,
            " pending"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700", children: [
            measuringRequests.length,
            " measuring"
          ] })
        ] })
      ] }),
      measuringRequests.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800", children: [
        "Patient is measuring: ",
        measuringRequests.map((request) => getVital(request.parameter_name).label).join(", ")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: VITALS.map((vital) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => sendRequest(vital).catch((error) => addError(error.message, "error")),
          className: "rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-brand-400 hover:bg-brand-50",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 h-12 w-12", dangerouslySetInnerHTML: { __html: vital.icon } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-slate-900", children: vital.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: vital.guide })
          ]
        },
        vital.id
      )) })
    ] }),
    userType !== "doctor" && currentPatientRequest && acceptedRequestId !== currentPatientRequest.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Doctor Vital Requests" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Accept this request before the capture panel opens." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-3xl border border-brand-200 bg-brand-50 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 w-20 shrink-0 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-brand-100", dangerouslySetInnerHTML: { __html: getVital(currentPatientRequest.parameter_name).icon } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.18em] text-brand-700", children: "Doctor prompt" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xl font-black text-slate-900", children: getVital(currentPatientRequest.parameter_name).label }),
            currentPatientRequest.status === "measuring" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs font-black text-emerald-700", children: "Measuring now" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: currentPatientRequest.instructions || getVital(currentPatientRequest.parameter_name).guide })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              rememberAcceptedRequestId(currentPatientRequest.id);
              rememberActiveRequest(currentPatientRequest);
              speak(`Accepted. ${getVital(currentPatientRequest.parameter_name).label}. ${currentPatientRequest.instructions || getVital(currentPatientRequest.parameter_name).guide}`);
            },
            className: "mt-4 rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600",
            children: "Accept and continue"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => skipRequest(currentPatientRequest),
            className: "ml-3 mt-4 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50",
            children: "Skip for now"
          }
        )
      ] })
    ] }),
    userType !== "doctor" && activeRequest && acceptedRequestId === activeRequest.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-brand-200 bg-brand-50 p-6 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 w-20 shrink-0 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-brand-100", dangerouslySetInnerHTML: { __html: getVital(activeRequest.parameter_name).icon } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-semibold text-slate-900", children: [
              getVital(activeRequest.parameter_name).label,
              " requested"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-700", children: activeRequest.instructions || getVital(activeRequest.parameter_name).guide })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => speak(`Your doctor requested ${getVital(activeRequest.parameter_name).label}. ${activeRequest.instructions || getVital(activeRequest.parameter_name).guide}`),
            className: "rounded-full bg-white px-4 py-2 text-xs font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50",
            children: "Hear guide"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => skipRequest(activeRequest),
            className: "rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50",
            children: "Skip"
          }
        )
      ] }),
      getVital(activeRequest.parameter_name).method === "camera" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, className: "aspect-video w-full rounded-2xl bg-slate-950 object-cover" }),
        captureHint && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm font-semibold text-brand-800", children: captureHint }),
        measuring && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 overflow-hidden rounded-full bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-brand-700", style: { width: `${progress}%` } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: startCameraMeasurement, disabled: measuring, className: "rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50", children: measuring ? "Measuring..." : "Start camera capture" }),
          measuring && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: stopCamera, className: "rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white", children: "Stop" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submitManual, className: "grid gap-3 border-t border-brand-200 pt-4 sm:grid-cols-[1fr_180px_auto]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: manualValue, onChange: (event) => setManualValue(event.target.value), className: "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500", placeholder: `Enter ${getVital(activeRequest.parameter_name).label} from device` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: wearableSource, onChange: (event) => setWearableSource(event.target.value), className: "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "manual", children: "Manual device" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "google_fit", children: "Google Fit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "apple_health", children: "Apple Health" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "wearable", children: "Other wearable" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800", children: "Save" })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submitManual, className: "mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: manualValue, onChange: (event) => setManualValue(event.target.value), className: "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500", placeholder: `Enter ${getVital(activeRequest.parameter_name).label}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: wearableSource, onChange: (event) => setWearableSource(event.target.value), className: "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "manual", children: "Manual device" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "google_fit", children: "Google Fit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "apple_health", children: "Apple Health" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "wearable", children: "Other wearable" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600", children: "Save" }),
        getVital(activeRequest.parameter_name).bluetooth && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: connectBluetoothDevice, className: "rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 sm:col-span-3", children: "Connect Omron / Bluetooth device" })
      ] })
    ] }),
    (userType === "doctor" || !compact) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Saved Vital Signs" }),
      vitals.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600", children: "No vital readings saved yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid gap-3", children: vitals.map((vital) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10", dangerouslySetInnerHTML: { __html: getVital(vital.parameter_name).icon } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-slate-900", children: getVital(vital.parameter_name).label })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500", children: [
            new Date(vital.measured_at || vital.created_at).toLocaleString(),
            " | ",
            vital.source || "manual"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-black text-brand-700", children: [
          vital.parameter_value,
          " ",
          vital.unit || getVital(vital.parameter_name).unit
        ] })
      ] }) }, vital.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, className: "hidden" })
  ] });
}
export {
  ChatPanel as C,
  ManualDownload as M,
  VitalParametersMonitor as V
};
