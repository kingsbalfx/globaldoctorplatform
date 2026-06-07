import { r as reactExports, j as jsxRuntimeExports } from "./react-Bu4vr6vE.js";
import { F as Footer } from "./index-DCY3-JaP.js";
import "./vendor-Qe2gXTEC.js";
import "./icons-Ci-JEzBE.js";
import "./i18n-D-V3U9NC.js";
function Contact({ onNavigate }) {
  const [currentView, setCurrentView] = reactExports.useState("landing");
  const [formData, setFormData] = reactExports.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    userType: "patient"
  });
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [submitMessage, setSubmitMessage] = reactExports.useState("");
  const handleBackToHome = () => {
    onNavigate("landing");
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      setSubmitMessage("Thank you for your message! Support replies within 24 hours.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        userType: "patient"
      });
    } catch (error) {
      setSubmitMessage("Sorry, there was an error sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-6xl mx-auto px-6 py-12 sm:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-slate-900 mb-6", children: "Contact Us" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-slate-900 mb-4", children: "Get in Touch" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 mb-6", children: "Support is available for questions, technical help, and partnership requests. Reach out anytime." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5 text-brand-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-slate-900", children: "Email Support" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "mailto:globaldoctorconnect@gmail.com", className: "text-brand-600 hover:text-brand-700 block", children: "globaldoctorconnect@gmail.com" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600 mt-1", children: "Response within 24 hours" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-slate-900", children: "Emergency Support" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700", children: "Available 24/7 for urgent medical consultations" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600 mt-1", children: "For medical emergencies, contact local emergency services first" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-slate-900", children: "Global Community" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700", children: "Serving patients and doctors worldwide" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600 mt-1", children: "Multiple languages supported" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 p-6 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-slate-900 mb-3", children: "Response Times" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600", children: "General inquiries:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-900", children: "Within 24 hours" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600", children: "Technical support:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-900", children: "Within 12 hours" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600", children: "Medical consultations:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-900", children: "Immediate" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600", children: "Emergency support:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-900", children: "24/7 available" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 p-6 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-blue-900 mb-2", children: "Need Immediate Help?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-blue-800 text-sm mb-3", children: "For medical emergencies or urgent healthcare needs, 24/7 access is available to qualified healthcare professionals." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors", children: "Start Emergency Consultation" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-slate-900 mb-6", children: "Send a Message" }),
          submitMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-4 rounded-lg mb-6 ${submitMessage.includes("error") ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`, children: submitMessage }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-slate-700 mb-2", children: "Full Name *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    id: "name",
                    name: "name",
                    value: formData.name,
                    onChange: handleInputChange,
                    required: true,
                    className: "w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
                    placeholder: "Your full name"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-slate-700 mb-2", children: "Email Address *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "email",
                    id: "email",
                    name: "email",
                    value: formData.email,
                    onChange: handleInputChange,
                    required: true,
                    className: "w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
                    placeholder: "your.email@example.com"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "userType", className: "block text-sm font-medium text-slate-700 mb-2", children: "I am a:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  id: "userType",
                  name: "userType",
                  value: formData.userType,
                  onChange: handleInputChange,
                  className: "w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "patient", children: "Patient" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "doctor", children: "Healthcare Professional" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "partner", children: "Business Partner" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "other", children: "Other" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "subject", className: "block text-sm font-medium text-slate-700 mb-2", children: "Subject *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  id: "subject",
                  name: "subject",
                  value: formData.subject,
                  onChange: handleInputChange,
                  required: true,
                  className: "w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
                  placeholder: "Brief description of your inquiry"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "message", className: "block text-sm font-medium text-slate-700 mb-2", children: "Message *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  id: "message",
                  name: "message",
                  value: formData.message,
                  onChange: handleInputChange,
                  required: true,
                  rows: 6,
                  className: "w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-vertical",
                  placeholder: "Please provide details about your inquiry..."
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "submit",
                disabled: isSubmitting,
                className: "w-full bg-brand-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-brand-700 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                children: isSubmitting ? "Sending..." : "Send Message"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-slate-600", children: [
            "Prefer to email directly?",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "mailto:globaldoctorconnect@gmail.com", className: "text-brand-600 hover:text-brand-700 font-medium", children: "globaldoctorconnect@gmail.com" })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-16 bg-white rounded-2xl shadow-lg p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-slate-900 mb-8 text-center", children: "Frequently Asked Questions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-slate-900 mb-2", children: "How quickly do you respond?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 text-sm", children: "Most inquiries receive a reply within 24 hours; technical support within 12 hours." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-slate-900 mb-2", children: "Do you offer phone support?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 text-sm", children: "Support is available through email and in-platform messaging for better documentation." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-slate-900 mb-2", children: "What languages do you support?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 text-sm", children: "English, Arabic, Swahili, Hindi, French, and Spanish are supported for the global community." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-slate-900 mb-2", children: "How do I report a problem?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 text-sm", children: "Use the contact form above or email directly. Include screenshots and detailed descriptions for faster resolution." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-slate-900 mb-2", children: "Can I request a feature?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 text-sm", children: "Feature requests are welcome—share ideas through the contact form or email." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-slate-900 mb-2", children: "How do I become a healthcare partner?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 text-sm", children: "Send credentials and experience by email. A verification workflow follows after review." })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, { onNavigate })
  ] });
}
export {
  Contact as default
};
