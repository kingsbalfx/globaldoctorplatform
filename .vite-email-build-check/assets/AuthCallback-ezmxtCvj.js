import { r as reactExports, j as jsxRuntimeExports } from "./react-Bu4vr6vE.js";
import { a as apiFetch } from "./index-DCY3-JaP.js";
import { s as supabase } from "./supabaseClient-iq1FVAJ-.js";
import "./vendor-Qe2gXTEC.js";
import "./icons-Ci-JEzBE.js";
import "./i18n-D-V3U9NC.js";
import "./supabase-CHf_0O8y.js";
function isSupabaseConfigured() {
  return Boolean("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcmRrYXNxbmluamhoc2xqbHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NDA4NDgsImV4cCI6MjA5MzIxNjg0OH0.DuKCIp34Q36ZwSN1PWgwSiiXTzm9azjMdnqkZhNW_-k");
}
function hasRequiredProfile(user, role) {
  const data = (user == null ? void 0 : user.user_metadata) || {};
  if (role === "doctor") return Boolean(data.full_name && data.specialty && data.location && data.license_number);
  return Boolean(data.full_name && data.date_of_birth && data.phone && data.country);
}
function AuthCallback({ onNavigate, onDoctorAuth, onPatientNavigate }) {
  const [status, setStatus] = reactExports.useState("Processing sign-in...");
  const [error, setError] = reactExports.useState("");
  const params = reactExports.useMemo(() => {
    const url = new URL(window.location.href);
    return {
      code: url.searchParams.get("code") || "",
      role: (url.searchParams.get("role") || "").toLowerCase(),
      next: url.searchParams.get("next") || ""
    };
  }, []);
  reactExports.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      var _a, _b, _c, _d, _e, _f, _g;
      const url = new URL(window.location.href);
      const providerError = url.searchParams.get("error_description") || url.searchParams.get("error");
      if (providerError) {
        setError(providerError);
        setStatus("");
        return;
      }
      if (!isSupabaseConfigured()) {
        setError("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY.");
        setStatus("");
        return;
      }
      try {
        const isOAuthCallback = url.searchParams.has("code");
        if (isOAuthCallback) {
          setStatus("Finalizing OAuth session...");
          const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(params.code);
          if (sessionError) {
            if ((_a = sessionError.message) == null ? void 0 : _a.toLowerCase().includes("pkce code verifier not found")) {
              const { data: existingSession } = await supabase.auth.getSession();
              if (!(existingSession == null ? void 0 : existingSession.session)) {
                setError("Authentication session expired. Please sign in again from the same browser.");
                setStatus("");
                return;
              }
            } else {
              throw sessionError;
            }
          }
          if (!(sessionData == null ? void 0 : sessionData.session)) {
            const { data: existingSession } = await supabase.auth.getSession();
            if (existingSession == null ? void 0 : existingSession.session) {
              window.history.replaceState({}, document.title, window.location.pathname);
            } else {
              throw new Error("OAuth session was not created. Please sign in again.");
            }
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        setStatus("Loading profile...");
        const { data: sessionState, error: sessionStateError } = await supabase.auth.getSession();
        if (sessionStateError) {
          throw sessionStateError;
        }
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          throw userError;
        }
        const user = (userData == null ? void 0 : userData.user) || ((_b = sessionState == null ? void 0 : sessionState.session) == null ? void 0 : _b.user);
        if (!(user == null ? void 0 : user.email)) {
          throw new Error(
            "Unable to read signed-in user from Supabase. Confirm /auth/callback is whitelisted in Supabase Auth redirect URLs."
          );
        }
        const role = params.role === "doctor" ? "doctor" : "patient";
        const metadata = user.user_metadata || {};
        if (role === "doctor") {
          setStatus("Checking doctor profile...");
          let response2;
          try {
            response2 = await apiFetch("/api/auth/oauth/bridge", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                role,
                email: user.email,
                name: metadata.full_name || metadata.name || user.email.split("@")[0],
                specialty: metadata.specialty || "",
                location: metadata.location || "",
                licenseNumber: metadata.license_number || "",
                licenseIssuer: metadata.license_issuer || "",
                licenseExpiry: metadata.license_expiry || "",
                gender: metadata.gender || "",
                profilePhotoUrl: metadata.profile_photo_url || metadata.avatar_url || "",
                signatureDataUrl: metadata.signature_data_url || "",
                passportDataUrl: metadata.passport_data_url || ""
              })
            });
          } catch {
            throw new Error(
              "Sign-in succeeded, but the medical server could not be reached to load your doctor account."
            );
          }
          const data2 = await response2.json().catch(() => ({}));
          if (response2.status === 428 && (data2 == null ? void 0 : data2.profileRequired)) {
            window.localStorage.setItem(
              "gd_pending_doctor_profile",
              JSON.stringify({
                email: user.email,
                name: metadata.full_name || metadata.name || user.email.split("@")[0],
                gender: metadata.gender || "",
                profilePhotoUrl: metadata.profile_photo_url || metadata.avatar_url || ""
              })
            );
            setStatus(data2.message || "Complete your doctor profile before admin approval.");
            window.setTimeout(() => onNavigate == null ? void 0 : onNavigate("doctor-auth"), 900);
            return;
          }
          if (response2.status === 403 && (data2 == null ? void 0 : data2.pendingApproval)) {
            setStatus(data2.message || data2.error || "Your doctor account is pending platform admin approval.");
            setError("");
            return;
          }
          if (!response2.ok) throw new Error(data2.error || data2.message || "Failed to initialize doctor session.");
          const doctor = data2.doctor;
          if (!(doctor == null ? void 0 : doctor.id)) throw new Error("Doctor session not returned.");
          try {
            window.localStorage.setItem("gd_doctor_session", JSON.stringify(doctor));
          } catch {
          }
          if (cancelled) return;
          onDoctorAuth == null ? void 0 : onDoctorAuth({ type: "login", ...doctor });
          onNavigate == null ? void 0 : onNavigate("admin");
          return;
        }
        if (!hasRequiredProfile(user, role)) {
          const key = role === "doctor" ? "gd_pending_doctor_profile" : "gd_pending_patient_profile";
          window.localStorage.setItem(
            key,
            JSON.stringify({
              email: user.email,
              name: ((_c = user.user_metadata) == null ? void 0 : _c.full_name) || ((_d = user.user_metadata) == null ? void 0 : _d.name) || user.email.split("@")[0],
              gender: ((_e = user.user_metadata) == null ? void 0 : _e.gender) || "",
              profilePhotoUrl: ((_f = user.user_metadata) == null ? void 0 : _f.profile_photo_url) || ((_g = user.user_metadata) == null ? void 0 : _g.avatar_url) || ""
            })
          );
          setStatus("Profile needs a few more details before the dashboard opens.");
          window.setTimeout(() => {
            if (role === "doctor") onNavigate == null ? void 0 : onNavigate("doctor-auth");
            else onPatientNavigate == null ? void 0 : onPatientNavigate();
          }, 900);
          return;
        }
        setStatus("Preparing dashboard...");
        let response;
        try {
          response = await apiFetch("/api/auth/oauth/bridge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role,
              email: user.email,
              name: metadata.full_name || metadata.name || user.email.split("@")[0],
              dateOfBirth: metadata.date_of_birth || "",
              phone: metadata.phone || "",
              country: metadata.country || "",
              language: metadata.preferred_language || "",
              specialty: metadata.specialty || "",
              location: metadata.location || "",
              licenseNumber: metadata.license_number || "",
              licenseIssuer: metadata.license_issuer || "",
              licenseExpiry: metadata.license_expiry || "",
              gender: metadata.gender || "",
              profilePhotoUrl: metadata.profile_photo_url || metadata.avatar_url || "",
              signatureDataUrl: metadata.signature_data_url || "",
              passportDataUrl: metadata.passport_data_url || ""
            })
          });
        } catch (networkError) {
          throw new Error(
            "Sign-in succeeded, but the medical server could not be reached to load your records."
          );
        }
        const data = await response.json().catch(() => ({}));
        if (response.status === 403 && (data == null ? void 0 : data.pendingApproval) && role === "doctor") {
          setStatus(data.message || data.error || "Your doctor account is pending platform admin approval.");
          setError("");
          return;
        }
        if (!response.ok) throw new Error(data.error || data.message || "Failed to initialize local session.");
        if (cancelled) return;
        if (data == null ? void 0 : data.admin) {
          try {
            window.localStorage.setItem("gd_platform_admin_session", JSON.stringify(data.admin));
          } catch {
          }
          onDoctorAuth == null ? void 0 : onDoctorAuth({ type: "admin-login", admin: data.admin });
          onNavigate == null ? void 0 : onNavigate("platform-admin");
          return;
        }
        if (role === "doctor") {
          const doctor = data.doctor;
          if (!(doctor == null ? void 0 : doctor.id)) throw new Error("Doctor session not returned.");
          try {
            window.localStorage.setItem("gd_doctor_session", JSON.stringify(doctor));
          } catch {
          }
          onDoctorAuth == null ? void 0 : onDoctorAuth({ type: "login", ...doctor });
          const next2 = params.next || "/doctor/dashboard";
          if (next2.startsWith("/doctor/dashboard")) onNavigate == null ? void 0 : onNavigate("admin");
          else if (next2.startsWith("/platform-admin")) onNavigate == null ? void 0 : onNavigate("platform-admin");
          else if (next2.startsWith("/doctor")) onNavigate == null ? void 0 : onNavigate("doctor-auth");
          else if (next2.startsWith("/facility")) onNavigate == null ? void 0 : onNavigate("facility");
          else if (next2.startsWith("/patient")) onNavigate == null ? void 0 : onNavigate("patient");
          else onNavigate == null ? void 0 : onNavigate("landing");
          return;
        }
        const patient = data.patient;
        if (!(patient == null ? void 0 : patient.id)) throw new Error("Patient session not returned.");
        try {
          window.localStorage.setItem("gd_patient_session", JSON.stringify(patient));
        } catch {
        }
        const next = params.next || "/patient";
        if (next.startsWith("/patient")) onPatientNavigate == null ? void 0 : onPatientNavigate();
        else if (next.startsWith("/facility")) onNavigate == null ? void 0 : onNavigate("facility");
        else if (next.startsWith("/doctor/dashboard")) onNavigate == null ? void 0 : onNavigate("admin");
        else if (next.startsWith("/doctor")) onNavigate == null ? void 0 : onNavigate("doctor-auth");
        else onNavigate == null ? void 0 : onNavigate("landing");
      } catch (err) {
        if (!cancelled) {
          setError((err == null ? void 0 : err.message) || "Authentication failed.");
          setStatus("");
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [onDoctorAuth, onNavigate, onPatientNavigate, params.code, params.next, params.role]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto mt-16 max-w-2xl px-6 pb-20 sm:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-slate-900", children: "Signing you in..." }),
    status && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-slate-600", children: status }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => onNavigate == null ? void 0 : onNavigate("landing"),
          className: "rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200",
          children: "Go Home"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => onNavigate == null ? void 0 : onNavigate("doctor-auth"),
          className: "rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600",
          children: "Doctor Portal"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => onNavigate == null ? void 0 : onNavigate("patient"),
          className: "rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600",
          children: "Patient Portal"
        }
      )
    ] })
  ] }) });
}
export {
  AuthCallback as default
};
