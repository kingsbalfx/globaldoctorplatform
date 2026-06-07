import { r as reactExports, j as jsxRuntimeExports } from "./react-Bu4vr6vE.js";
import { u as useError, a as apiFetch, r as readApiJson } from "./index-DCY3-JaP.js";
import "./vendor-Qe2gXTEC.js";
import "./icons-Ci-JEzBE.js";
import "./i18n-D-V3U9NC.js";
function ResetPassword() {
  const { addError } = useError();
  const [password, setPassword] = reactExports.useState("");
  const [confirm, setConfirm] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [success, setSuccess] = reactExports.useState(false);
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token") || "";
  const userType = searchParams.get("userType") || "patient";
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return addError("Passwords do not match.", "warning");
    setLoading(true);
    try {
      const response = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password, userType })
      });
      if (!response.ok) {
        const error = await readApiJson(response);
        throw new Error(error.error || "Reset failed");
      }
      setSuccess(true);
    } catch (error) {
      addError(error.message, "error");
    } finally {
      setLoading(false);
    }
  };
  if (success) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-slate-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-slate-900", children: "Password reset" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-slate-600", children: "Your password has been changed. You can now log in." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: userType === "doctor" ? "/doctor" : "/patient",
          className: "mt-6 inline-block text-brand-700 hover:text-brand-600 font-medium",
          children: "Go to login"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-slate-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md bg-white rounded-3xl shadow-xl p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-slate-900", children: "Set new password" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "mt-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "password",
          value: password,
          onChange: (e) => setPassword(e.target.value),
          className: "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500",
          placeholder: "New password",
          required: true
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "password",
          value: confirm,
          onChange: (e) => setConfirm(e.target.value),
          className: "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500",
          placeholder: "Confirm new password",
          required: true
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50",
          children: loading ? "Resetting…" : "Reset password"
        }
      )
    ] })
  ] }) });
}
export {
  ResetPassword as default
};
