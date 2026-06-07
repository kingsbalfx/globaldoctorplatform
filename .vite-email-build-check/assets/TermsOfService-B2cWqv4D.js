import { r as reactExports, j as jsxRuntimeExports } from "./react-Bu4vr6vE.js";
import { F as Footer } from "./index-DCY3-JaP.js";
import "./vendor-Qe2gXTEC.js";
import "./icons-Ci-JEzBE.js";
import "./i18n-D-V3U9NC.js";
function TermsOfService({ onNavigate }) {
  const [currentView, setCurrentView] = reactExports.useState("landing");
  const handleBackToHome = () => {
    onNavigate("landing");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-slate-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "bg-white shadow-sm border-b border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-6 py-4 sm:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/logo.png", alt: "GlobalDoc Connect logo", className: "h-8 w-8 rounded-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold text-brand-700", children: "GlobalDoc Connect" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleBackToHome,
          className: "text-brand-700 hover:text-brand-600 font-medium",
          children: "← Back to Home"
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "max-w-4xl mx-auto px-6 py-12 sm:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-8 md:p-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-slate-900 mb-8 text-center", children: "Terms of Service" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "prose prose-slate max-w-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-slate-600 mb-8 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Last Updated:" }),
          " ",
          (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "1. Introduction" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: 'Welcome to GlobalDoc Connect ("our"). These Terms of Service ("Terms") govern your use of our telehealth platform that connects patients with healthcare professionals worldwide. By accessing or using our services, you agree to be bound by these Terms.' }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "Our platform provides secure video consultations, emergency medical support, appointment scheduling, payment processing, and related healthcare services. Our team is committed to maintaining the highest standards of medical care, privacy, and security." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "2. Definitions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: '"Platform"' }),
              " means the GlobalDoc Connect website, mobile applications, and related services."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: '"Patient"' }),
              " means any individual seeking medical consultation or healthcare services through our platform."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: '"Healthcare Professional" or "Doctor"' }),
              " means licensed medical practitioners who provide services through our platform."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: '"Consultation"' }),
              " means video calls, chat sessions, or other forms of medical communication between patients and healthcare professionals."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: '"Emergency Services"' }),
              " means urgent medical care provided through our 24/7 emergency support system."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "3. User Eligibility" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "For Patients:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You must be at least 18 years old or have parental/guardian consent" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You must provide accurate and complete medical information" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You must have access to necessary technology for video consultations" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You must be located in a jurisdiction where telehealth services are permitted" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "For Healthcare Professionals:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You must hold a valid medical license in your jurisdiction" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You must provide proof of credentials and malpractice insurance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You must maintain patient confidentiality and follow medical ethics" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You must complete our verification and training process" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "4. Services Provided" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "Patient Services:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Search and connect with verified healthcare professionals" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Schedule video consultations and appointments" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Secure payment processing for medical services" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Access to medical records and consultation history" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "24/7 emergency medical support" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Multi-language support (English, Arabic, Swahili, Hindi, French, Spanish)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "Healthcare Professional Services:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Access to global patient base" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Secure consultation platform" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Payment processing and fee collection" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Patient record management" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Emergency consultation support" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Continuing medical education resources" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "5. Payment Terms" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "All fees for medical consultations are clearly displayed before booking. Payments are processed securely through Stripe and other certified payment processors." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Consultation fees are charged per session or package" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Emergency consultations may have different pricing" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Refunds are available within 24 hours for cancelled appointments" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Healthcare professionals receive 70-80% of consultation fees after platform fees" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "All payments are in USD or local currency equivalents" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "6. Medical Disclaimer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-yellow-800 font-medium", children: "Important Medical Notice:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-yellow-800", children: "Our platform facilitates telehealth consultations but does not replace emergency medical care. In case of medical emergencies, please call your local emergency services immediately." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Telehealth consultations are not appropriate for all medical conditions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Healthcare professionals may decline to provide care based on medical judgment" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You are responsible for providing complete and accurate medical information" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Follow-up care may be recommended for complex medical issues" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "7. Privacy and Data Protection" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "Your privacy is our top priority. All medical consultations are encrypted and confidential. Please refer to our Privacy Policy for detailed information about data handling." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "All consultations use end-to-end encryption" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Medical records are stored securely and access is restricted" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Our platform complies with HIPAA and international privacy regulations" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You control access to your medical information" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "8. User Responsibilities" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "All Users:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Maintain accurate account information" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Use the platform only for lawful medical purposes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Respect the privacy and dignity of other users" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Report any technical issues or inappropriate behavior" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Keep login credentials secure and confidential" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "Patients:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Provide complete medical history and current symptoms" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Follow healthcare professional recommendations" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Attend scheduled appointments or cancel in advance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Rate and review consultations honestly" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "Healthcare Professionals:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Maintain professional standards and ethics" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Provide accurate medical advice based on available information" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Document consultations appropriately" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Respond to patient inquiries in a timely manner" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Maintain current medical licensure" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "9. Prohibited Activities" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "The following activities are strictly prohibited:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Using the platform for non-medical purposes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Sharing false or misleading medical information" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Harassing or abusing other users" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Attempting to access other users' accounts" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Violating medical privacy or confidentiality" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Practicing medicine without proper licensure" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Discriminating against patients based on race, religion, or background" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "10. Account Termination" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "Our platform reserves the right to suspend or terminate accounts that violate these Terms or engage in harmful behavior. Termination may result in loss of access to medical records and services." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Immediate termination for serious violations" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Written notice for minor violations with opportunity to correct" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Appeal process available for disputed terminations" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Data export available upon reasonable request" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "11. Limitation of Liability" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "While our platform strives to provide reliable telehealth services, healthcare involves inherent risks. Our liability is limited to the amount paid for services in the preceding 12 months." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Our platform is not liable for medical outcomes or treatment effectiveness" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Platform availability is provided "as is" without warranties' }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Users assume responsibility for technology requirements" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Disputes between patients and healthcare professionals are handled separately" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "12. Dispute Resolution" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "Our team encourages users to resolve disputes amicably. For unresolved issues:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Contact support at globaldoctorconnect@gmail.com" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Medical disputes may involve independent review" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Payment disputes are handled through our payment processor" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Legal disputes will be resolved in competent courts" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "13. Updates to Terms" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "Our team may update these Terms periodically to reflect changes in our services or legal requirements. Users will be notified of significant changes via email or platform notifications." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Continued use constitutes acceptance of updated Terms" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Major changes require explicit user consent" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Previous versions remain accessible for reference" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "14. Contact Information" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "For questions about these Terms or our services:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 p-4 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-slate-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Email:" }),
              " globaldoctorconnect@gmail.com"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-slate-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Emergency Support:" }),
              " Available 24/7"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-slate-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Address:" }),
              " GlobalDoc Connect, Telehealth Services Worldwide"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "15. Governing Law" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "These Terms are governed by international healthcare standards and applicable local laws. Users are responsible for complying with laws in their jurisdiction." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border-l-4 border-blue-400 p-6 mt-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-blue-900 mb-2", children: "Acknowledgment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-blue-800", children: "By using GlobalDoc Connect, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-blue-800 mt-2", children: "Remember: Your health and privacy are our top priorities. Our platform connects you with quality healthcare professionals worldwide." })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, { onNavigate })
  ] });
}
export {
  TermsOfService as default
};
