import { r as reactExports, j as jsxRuntimeExports } from "./react-Bu4vr6vE.js";
import { u as useError, a as apiFetch, r as readApiJson } from "./index-DCY3-JaP.js";
const PRODUCTION_ORIGIN = "https://globaldoctorplattform.vercel.app";
function getAppOrigin() {
  const envOrigin = String("").trim().replace(/\/+$/, "");
  if (envOrigin) return envOrigin;
  if (typeof window === "undefined") return PRODUCTION_ORIGIN;
  const { origin, protocol } = window.location;
  if (protocol === "capacitor:" || protocol === "ionic:") return PRODUCTION_ORIGIN;
  return origin || PRODUCTION_ORIGIN;
}
function buildOAuthRedirectUrl({ role, next }) {
  const url = new URL("/auth/callback", getAppOrigin());
  url.searchParams.set("role", role === "doctor" ? "doctor" : "patient");
  if (next) url.searchParams.set("next", next);
  return url.toString();
}
function ForgotPassword({ userType, onBack }) {
  const { addError } = useError();
  const [email, setEmail] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [sent, setSent] = reactExports.useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return addError("Please enter your email address.", "warning");
    setLoading(true);
    try {
      const response = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), userType })
      });
      const data = await readApiJson(response);
      if (!response.ok) throw new Error(data.error || "Unable to send the reset email. Please try again.");
      if (data.delivered === false) addError(data.message || "If the account exists, a reset email will be sent.", "info");
      setSent(true);
    } catch (error) {
      addError(error.message, "error");
    } finally {
      setLoading(false);
    }
  };
  if (sent) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-slate-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-slate-900", children: "Check your email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-slate-600", children: [
        "A reset link was requested for ",
        email,
        ". Check your inbox and spam folder."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onBack,
          className: "mt-6 text-brand-700 hover:text-brand-600 font-medium",
          children: "← Back to login"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-slate-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md bg-white rounded-3xl shadow-xl p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-slate-900", children: "Reset Password" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Enter your email address and we'll send you a reset link." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "mt-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "email",
          value: email,
          onChange: (e) => setEmail(e.target.value),
          className: "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500",
          placeholder: "you@example.com",
          required: true
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50",
          children: loading ? "Sending…" : "Send reset link"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: onBack,
        className: "mt-6 text-sm text-brand-700 hover:text-brand-600 font-medium",
        children: "← Back to login"
      }
    )
  ] }) });
}
const googleLogo = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 48 48%22%3E%3Cpath fill=%22%23FFC107%22 d=%22M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z%22/%3E%3Cpath fill=%22%23FF3D00%22 d=%22M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z%22/%3E%3Cpath fill=%22%234CAF50%22 d=%22M24 44c5.1 0 9.8-2 13.3-5.2l-6.2-5.2C29.1 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.4 39.6 16.1 44 24 44z%22/%3E%3Cpath fill=%22%231976D2%22 d=%22M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C36.9 39.1 44 34 44 24c0-1.3-.1-2.4-.4-3.5z%22/%3E%3C/svg%3E";
function GoogleSignInButton({ onClick, label = "Continue with Gmail" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: "flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:border-brand-200 hover:bg-slate-50",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: googleLogo, alt: "", className: "h-6 w-6", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label })
      ]
    }
  );
}
export {
  ForgotPassword as F,
  GoogleSignInButton as G,
  buildOAuthRedirectUrl as b
};
