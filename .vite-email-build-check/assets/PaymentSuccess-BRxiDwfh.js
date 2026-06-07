import { r as reactExports, j as jsxRuntimeExports } from "./react-Bu4vr6vE.js";
import { a as apiFetch } from "./index-DCY3-JaP.js";
import "./vendor-Qe2gXTEC.js";
import "./icons-Ci-JEzBE.js";
import "./i18n-D-V3U9NC.js";
function readPaymentMetadata(payment) {
  const metadata = payment == null ? void 0 : payment.metadata;
  if (!metadata) return {};
  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata);
    } catch {
      return {};
    }
  }
  return metadata;
}
function PaymentSuccess({ onNavigate }) {
  const [status, setStatus] = reactExports.useState("Verifying payment...");
  const [error, setError] = reactExports.useState("");
  const [tokens, setTokens] = reactExports.useState(null);
  const [verifyRun, setVerifyRun] = reactExports.useState(0);
  const retryTimerRef = reactExports.useRef(null);
  const reference = reactExports.useMemo(() => {
    const url = new URL(window.location.href);
    return url.searchParams.get("payment_reference") || url.searchParams.get("reference") || url.searchParams.get("transaction_reference") || url.searchParams.get("trxref") || "";
  }, []);
  reactExports.useEffect(() => {
    let redirectTimer;
    const maxAttempts = 12;
    if (retryTimerRef.current) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    setError("");
    setTokens(null);
    setStatus("Verifying payment...");
    const scheduleRetry = (attempt, message = "Kora is still confirming your payment...") => {
      setStatus(`${message} Attempt ${attempt + 1}/${maxAttempts}.`);
      retryTimerRef.current = window.setTimeout(() => {
        void verify(attempt + 1);
      }, 2500);
    };
    const verify = async (attempt = 1) => {
      var _a;
      if (!reference) {
        setStatus("");
        setError("Payment reference was not found.");
        return;
      }
      try {
        const response = await apiFetch(`/api/payments/kora/verify/${encodeURIComponent(reference)}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (attempt < maxAttempts && [404, 425, 429, 500, 502, 503, 504].includes(response.status)) {
            scheduleRetry(attempt);
            return;
          }
          throw new Error(data.error || data.details || "Payment verification failed");
        }
        const normalizedStatus = String(data.status || "").toLowerCase();
        if (["success", "successful", "completed", "paid", "succeeded", "approved", "captured"].includes(normalizedStatus)) {
          let nextTokens = data.tokens ?? null;
          setStatus(data.credited ? "Payment verified and tokens credited." : "Payment verified.");
          const metadata = readPaymentMetadata(data.payment);
          const patientId = ((_a = data.payment) == null ? void 0 : _a.patient_id) || metadata.patientId || metadata.patient_id;
          if (patientId) {
            const balanceResponse = await apiFetch(`/api/patients/${encodeURIComponent(patientId)}/tokens`).catch(() => null);
            if (balanceResponse == null ? void 0 : balanceResponse.ok) {
              const balanceData = await balanceResponse.json().catch(() => ({}));
              if (Number.isFinite(Number(balanceData.tokens))) nextTokens = Number(balanceData.tokens);
            }
          }
          setTokens(nextTokens);
          if (patientId) {
            try {
              const stored = JSON.parse(window.localStorage.getItem("gd_patient_session") || "null");
              if (String((stored == null ? void 0 : stored.id) || "") === String(patientId)) {
                const nextPatient = { ...stored, tokens: nextTokens ?? stored.tokens ?? 0 };
                window.localStorage.setItem("gd_patient_session", JSON.stringify(nextPatient));
                window.localStorage.setItem("gd_active_portal", "patient");
                window.localStorage.setItem("gd_patient_return_dashboard", "1");
              }
            } catch {
            }
          }
          redirectTimer = window.setTimeout(() => {
            onNavigate == null ? void 0 : onNavigate("patient");
          }, 1600);
        } else {
          if (attempt < maxAttempts && ["pending", "processing", "unknown"].includes(normalizedStatus || "pending")) {
            scheduleRetry(attempt, `Payment status is ${normalizedStatus || "pending"}. Waiting for final confirmation...`);
            return;
          }
          setStatus(`Payment status: ${data.status || "pending"}. Please refresh in a moment.`);
        }
      } catch (err) {
        setStatus("");
        setError(err.message || "Payment verification failed");
      }
    };
    void verify();
    return () => {
      if (redirectTimer) window.clearTimeout(redirectTimer);
      if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current);
    };
  }, [onNavigate, reference, verifyRun]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto mt-16 max-w-2xl px-6 pb-20 sm:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-200/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Payment return" }),
    status && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-slate-600", children: status }),
    tokens !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-lg font-bold text-brand-700", children: [
      "Current balance: ",
      tokens,
      " tokens"
    ] }),
    tokens !== null && !error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-500", children: "Returning to your patient dashboard..." }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap justify-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => onNavigate == null ? void 0 : onNavigate("patient"),
          className: "rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600",
          children: "Back to Patient Portal"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setVerifyRun((value) => value + 1),
          className: "rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200",
          children: "Verify again"
        }
      )
    ] })
  ] }) });
}
export {
  PaymentSuccess as default
};
