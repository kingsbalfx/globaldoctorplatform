import { r as reactExports, j as jsxRuntimeExports } from "./react-Bu4vr6vE.js";
import { F as Footer } from "./index-DCY3-JaP.js";
import "./vendor-Qe2gXTEC.js";
import "./icons-Ci-JEzBE.js";
import "./i18n-D-V3U9NC.js";
function PrivacyPolicy({ onNavigate }) {
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-slate-900 mb-8 text-center", children: "Privacy Policy" }),
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border-l-4 border-green-400 p-4 mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-800 font-medium", children: "Your Privacy Matters" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-800", children: "At GlobalDoc Connect, our commitment is protecting your personal and medical information. This Privacy Policy explains how our platform collects, uses, and safeguards your data." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "1. Introduction" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: 'GlobalDoc Connect ("our") operates a telehealth platform that connects patients with healthcare professionals worldwide. Our commitment is protecting your privacy and ensuring the security of your personal and medical information.' }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "This Privacy Policy describes what information our platform collects, how our platform uses it, and the choices you have regarding your information. By using our platform, you consent to the collection and use of information as described in this policy." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "2. Information Our Platform Collects" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "Personal Information:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Name, email address, phone number, and date of birth" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Mailing address and location information" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Payment information (processed securely through third-party providers)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Profile pictures and identification documents" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Language preferences and communication settings" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "Medical Information:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Medical history, current symptoms, and health conditions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Medications, allergies, and treatment history" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Test results, diagnoses, and treatment plans" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Consultation notes and healthcare professional observations" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Emergency contact information and medical directives" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "Technical Information:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Device information, IP address, and browser type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Usage patterns and platform interaction data" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Cookies and similar tracking technologies" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Location data for service availability" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "3. How Our Platform Uses Your Information" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "Providing Healthcare Services:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Connect patients with appropriate healthcare professionals" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Facilitate secure video consultations and messaging" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Process payments for medical services" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Maintain medical records and consultation history" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Provide emergency medical support when needed" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "Platform Operations:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Verify healthcare professional credentials" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Ensure platform security and prevent fraud" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Improve our services and develop new features" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Send important notifications about your account and services" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Comply with legal and regulatory requirements" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "Communication:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Send appointment reminders and follow-up care information" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Provide customer support and respond to inquiries" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Share important updates about our services" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Send marketing communications (with your consent)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "4. Information Sharing and Disclosure" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "Our platform takes your privacy seriously and only shares your information in limited circumstances:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "With Healthcare Professionals:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Medical information is shared with your chosen healthcare professional" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Consultation history is available to your healthcare team" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Emergency contacts may be notified in urgent situations" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "Service Providers:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Payment processors (Stripe) for secure transactions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Cloud hosting providers for data storage" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Analytics services to improve our platform" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Customer support tools for assistance" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "Legal Requirements:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "When required by law or legal process" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "To protect our rights and prevent harm" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "In case of medical emergencies requiring disclosure" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "To comply with healthcare regulations" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "5. Data Security" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border-l-4 border-blue-400 p-4 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-blue-800 font-medium", children: "Bank-Level Security" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-blue-800", children: "Our platform uses industry-leading security measures to protect your information, including end-to-end encryption for all medical consultations." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "Security Measures:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "End-to-end encryption for all video consultations and messaging" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Secure data centers with 24/7 monitoring" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Regular security audits and penetration testing" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Multi-factor authentication for healthcare professionals" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Automatic data encryption at rest and in transit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Regular backups with secure storage" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "Access Controls:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Role-based access to medical information" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Audit logs for all data access" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Regular staff training on privacy and security" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Immediate account suspension for suspicious activity" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "6. International Data Transfers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "As a global telehealth platform, our service may transfer your information to countries other than your own. Our safeguards ensure that such transfers comply with applicable data protection laws." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Data is transferred only to countries with adequate privacy protections" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Standard contractual clauses are used for international transfers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Your data is processed in secure, certified data centers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "You can request information about international transfers" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "7. Cookies and Tracking Technologies" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "Our platform uses cookies and similar technologies to improve your experience and analyze platform usage." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "Types of Cookies:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Essential Cookies:" }),
              " Required for platform functionality"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Analytics Cookies:" }),
              " Help our team understand usage patterns"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Preference Cookies:" }),
              " Remember your settings and preferences"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Marketing Cookies:" }),
              " Used for targeted communications (with consent)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "You can control cookie preferences through your browser settings or our cookie consent banner." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "8. Your Rights and Choices" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "You have several rights regarding your personal information:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "Access and Control:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Access:" }),
              " Request a copy of your personal information"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Correction:" }),
              " Update inaccurate or incomplete information"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Deletion:" }),
              " Request deletion of your personal information"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Portability:" }),
              " Receive your data in a structured format"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Restriction:" }),
              " Limit how our platform processes your information"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Objection:" }),
              " Object to processing based on legitimate interests"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-medium text-slate-800 mb-3", children: "Communication Preferences:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Opt out of marketing communications" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Choose notification preferences" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Control sharing with third parties" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Manage cookie preferences" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "9. Data Retention" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "Our platform retains your information only as long as necessary for the purposes described in this policy:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Medical Records:" }),
              " Retained for minimum 7 years or as required by law"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Account Information:" }),
              " Retained while account is active and for 3 years after closure"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Payment Information:" }),
              " Retained only as required for tax and legal purposes"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Analytics Data:" }),
              " Anonymized after 2 years"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "You can request deletion of your information at any time, subject to legal and medical record retention requirements." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "10. Children's Privacy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "Our services are not intended for children under 18 without parental consent. Our platform does not knowingly collect personal information from children under 13." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Parental consent is required for users under 18" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Parents can review and request deletion of their child's information" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Our platform complies with COPPA and similar children's privacy laws" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "11. Third-Party Services" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "Our platform integrates with third-party services. These services have their own privacy policies:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Stripe:" }),
              " Payment processing - see Stripe's privacy policy"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Supabase:" }),
              " Database services - see Supabase's privacy policy"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Video Platforms:" }),
              " Secure video calls - HIPAA compliant"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Analytics:" }),
              " Usage tracking - anonymized data only"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "12. Changes to This Policy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "Our team may update this Privacy Policy periodically to reflect changes in our practices or legal requirements." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Material changes will be notified via email or platform notification" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Continued use constitutes acceptance of updated policy" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Previous versions remain accessible for reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Our team encourages regular review of this policy" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "13. Contact Our Team" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "If you have questions about this Privacy Policy or our data practices:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 p-6 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-slate-900 mb-2", children: "Privacy Officer" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700", children: "Email: globaldoctorconnect@gmail.com" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700", children: 'Subject: "Privacy Inquiry"' })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-slate-900 mb-2", children: "Data Protection" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700", children: "Response time: Within 30 days" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700", children: "Languages: English, Arabic, French" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 pt-4 border-t border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-600 text-sm", children: "For urgent privacy concerns or data breaches, contact our team immediately. Our team takes all privacy matters seriously and responds promptly to protect your rights." }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-slate-900 mb-4", children: "14. Compliance and Certifications" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-4", children: "Our platform maintains compliance with international privacy standards:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-6 text-slate-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "HIPAA compliant for healthcare data in the United States" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "GDPR compliant for European Union users" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "PIPEDA compliant for Canadian users" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "SOC 2 Type II certified for security and availability" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Regular third-party security audits" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border-l-4 border-green-400 p-6 mt-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-green-900 mb-2", children: "Your Trust is Important to Our Team" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-800", children: "Our team is committed to maintaining the highest standards of privacy and security for your healthcare information. Your trust enables our platform to provide quality telehealth services worldwide." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-800 mt-2", children: "If you ever have concerns about your privacy or data security, please contact our team. Our support is here to help and ensure your information remains protected." })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, { onNavigate })
  ] });
}
export {
  PrivacyPolicy as default
};
