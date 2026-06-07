import { r as reactExports, j as jsxRuntimeExports } from "./react-Bu4vr6vE.js";
import { u as useError, a as apiFetch, r as readApiJson } from "./index-DCY3-JaP.js";
import { V as VitalParametersMonitor, C as ChatPanel, M as ManualDownload } from "./VitalParametersMonitor-D7Sg6amh.js";
import { P as PrescriptionManager, L as LabRequestManager, V as VideoChatPanel } from "./LabRequestManager-Bp8fFV9d.js";
import { F as ForgotPassword, G as GoogleSignInButton, b as buildOAuthRedirectUrl } from "./GoogleSignInButton-Um7n1y8i.js";
import { s as supabase } from "./supabaseClient-iq1FVAJ-.js";
import { T as TelehealthHeroArt, P as PortalArtBanner } from "./TelehealthArt-DC0HZ32N.js";
import { u as useTranslation } from "./i18n-D-V3U9NC.js";
import { E as EyeOff, o as Eye, W as WalletCards, p as Stethoscope, q as Search, r as ArrowLeft, s as CalendarCheck, i as Mic, h as MicOff, t as Volume2, u as Type, v as VolumeX, w as MousePointer, Z as Zap } from "./icons-Ci-JEzBE.js";
import { P as ProfileAvatar, g as getGenderLabel } from "./ProfileAvatar-6oVVdv9U.js";
import { g as getSpecialtyInfo } from "./specialtyRegistry-mMIpmDWJ.js";
import { A as AnnouncementBanner } from "./AnnouncementBanner-typdvJzp.js";
import { L as LanguageSelector } from "./LanguageSelector-DIosTXAB.js";
import { L as LiveDocumentAlerts } from "./LiveDocumentAlerts-BpJJtKIZ.js";
import "./vendor-Qe2gXTEC.js";
import "./supabase-CHf_0O8y.js";
function AppointmentScheduler({ patientId, onScheduled }) {
  const { addError } = useError();
  const [doctors, setDoctors] = reactExports.useState([]);
  const [doctorId, setDoctorId] = reactExports.useState("");
  const [consultationType, setConsultationType] = reactExports.useState("telehealth");
  const [scheduledDate, setScheduledDate] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  reactExports.useEffect(() => {
    fetchDoctors();
  }, []);
  const fetchDoctors = async () => {
    try {
      const response = await apiFetch(`/api/doctors`);
      const data = await response.json().catch(() => ({}));
      const list = Array.isArray(data.doctors) ? data.doctors : [];
      setDoctors(list);
      if (list.length > 0) setDoctorId(list[0].id);
    } catch (err) {
      console.error("Failed to fetch doctors", err);
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!doctorId || !scheduledDate) {
      setError("Please select a doctor and appointment date/time.");
      return;
    }
    setSaving(true);
    try {
      const response = await apiFetch(`/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          doctorId,
          scheduledDate,
          slotDate: scheduledDate.slice(0, 10),
          slotTime: scheduledDate.slice(11, 16),
          consultationType,
          notes
        })
      });
      const data = await response.clone().json().catch(async () => {
        const text = await response.text().catch(() => "");
        return { error: text || "Failed to schedule appointment" };
      });
      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to schedule appointment");
      }
      setScheduledDate("");
      setNotes("");
      setConsultationType("telehealth");
      onScheduled && onScheduled(data.appointment);
      addError("Appointment scheduled successfully! You will receive reminders 24 hours and 1 hour before the consultation.", "success");
    } catch (err) {
      setError(err.message);
      addError(err.message, "error");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Schedule Appointment" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "Book a consultation and automatically create reminder notifications for both you and your doctor." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Doctor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: doctorId,
            onChange: (e) => setDoctorId(e.target.value),
            className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
            children: doctors.map((doctor) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: doctor.id, children: [
              doctor.name,
              " — ",
              doctor.specialty
            ] }, doctor.id))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Appointment date and time" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "datetime-local",
            value: scheduledDate,
            onChange: (e) => setScheduledDate(e.target.value),
            className: "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Consultation type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: consultationType,
            onChange: (e) => setConsultationType(e.target.value),
            className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "telehealth", children: "Telehealth" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "in_person", children: "In-person" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "follow_up", children: "Follow-up" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Notes for doctor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            rows: 4,
            value: notes,
            onChange: (e) => setNotes(e.target.value),
            className: "mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
            placeholder: "Describe symptoms or what you want to discuss..."
          }
        )
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          disabled: saving,
          className: "w-full rounded-3xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:opacity-50",
          children: saving ? "Scheduling..." : "Schedule Appointment"
        }
      )
    ] })
  ] });
}
function PatientFileManager({ patientId }) {
  const { addError } = useError();
  const [files, setFiles] = reactExports.useState([]);
  const [selectedFile, setSelectedFile] = reactExports.useState(null);
  const [uploading, setUploading] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (patientId) loadFiles();
  }, [patientId]);
  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/api/patients/files?patientId=${encodeURIComponent(patientId)}`);
      const data = await readApiJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to load patient files");
      setFiles(data.files || []);
    } catch (error) {
      console.error("Failed to load patient files", error);
    } finally {
      setLoading(false);
    }
  };
  const handleFileChange = (event) => {
    var _a;
    const file = (_a = event.target.files) == null ? void 0 : _a[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  const handleUpload = async () => {
    if (!selectedFile || !patientId) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(",")[1];
        const response = await apiFetch(`/api/patients/files/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId,
            name: selectedFile.name,
            mimeType: selectedFile.type,
            size: selectedFile.size,
            contentBase64: base64
          })
        });
        if (!response.ok) {
          throw new Error("File upload failed");
        }
        await loadFiles();
        setSelectedFile(null);
        addError("File uploaded successfully.", "success");
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      addError(error.message, "error");
    } finally {
      setUploading(false);
    }
  };
  const handleDownload = async (fileId) => {
    try {
      const response = await apiFetch(`/api/patients/files/${fileId}/download?patientId=${encodeURIComponent(patientId)}`);
      if (!response.ok) {
        throw new Error("Download failed");
      }
      const data = await readApiJson(response);
      const blob = new Blob([Uint8Array.from(atob(data.contentBase64), (c) => c.charCodeAt(0))], { type: data.mimeType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = data.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      addError(error.message, "error");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Health Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-500", children: "Upload documents, test results, or video notes for your doctor." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-4 sm:grid-cols-[1fr_auto]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex w-full cursor-pointer items-center justify-between rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 hover:border-brand-500 hover:bg-white", children: [
          selectedFile ? selectedFile.name : "Choose a file to upload",
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "application/pdf,video/*,image/*,.doc,.docx", className: "hidden", onChange: handleFileChange })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleUpload,
            disabled: !selectedFile || uploading,
            className: "rounded-3xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:opacity-50",
            children: uploading ? "Uploading..." : "Upload"
          }
        )
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40", children: "Loading files..." }) : files.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40 text-slate-600", children: "You have no uploaded records yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: files.map((file) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-5 shadow-lg shadow-slate-200/40 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-semibold text-slate-900", children: file.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-slate-500", children: [
          file.mimeType,
          " · ",
          (file.size / 1024 / 1024).toFixed(2),
          " MB"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs uppercase tracking-[0.2em] text-slate-400 mt-1", children: [
          "Uploaded ",
          new Date(file.createdAt).toLocaleString()
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => handleDownload(file.id),
          className: "rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600",
          children: "Download"
        }
      )
    ] }, file.id)) })
  ] });
}
function PatientAuth({ onAuth }) {
  const { t } = useTranslation();
  const { addError } = useError();
  const [mode, setMode] = reactExports.useState("email");
  const [isLogin, setIsLogin] = reactExports.useState(true);
  const [formData, setFormData] = reactExports.useState({
    email: "",
    password: "",
    name: "",
    dateOfBirth: "",
    phone: "",
    country: "",
    language: "English",
    gender: "",
    profilePhotoUrl: ""
  });
  const [facilityLogin, setFacilityLogin] = reactExports.useState({
    patientId: "",
    fullName: "",
    pin: ""
  });
  const [loading, setLoading] = reactExports.useState(false);
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [completingExistingUser, setCompletingExistingUser] = reactExports.useState(false);
  const [forgotActive, setForgotActive] = reactExports.useState(false);
  reactExports.useEffect(() => {
    try {
      const pending = JSON.parse(window.localStorage.getItem("gd_pending_patient_profile") || "null");
      if (!(pending == null ? void 0 : pending.email)) return;
      setMode("email");
      setCompletingExistingUser(true);
      setIsLogin(false);
      setFormData((prev) => ({
        ...prev,
        email: pending.email,
        name: pending.name || prev.name,
        gender: pending.gender || prev.gender,
        profilePhotoUrl: pending.profilePhotoUrl || prev.profilePhotoUrl
      }));
      window.localStorage.removeItem("gd_pending_patient_profile");
    } catch {
    }
  }, []);
  const isPatientProfileComplete = (user) => {
    const data = (user == null ? void 0 : user.user_metadata) || {};
    return Boolean(data.full_name && data.date_of_birth && data.phone && data.country);
  };
  const handleGoogleSignIn = async () => {
    const redirectTo = buildOAuthRedirectUrl({ role: "patient", next: "/patient" });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, queryParams: { prompt: "select_account" } }
    });
    if (error) addError(error.message || t("auth.authFailed"), "error");
  };
  const createBackendPatientSession = async (profile) => {
    var _a;
    let response;
    try {
      response = await apiFetch("/api/auth/oauth/bridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "patient", ...profile })
      });
    } catch {
      throw new Error("Your Google account is signed in, but the medical server could not be reached to load your records.");
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !((_a = result == null ? void 0 : result.patient) == null ? void 0 : _a.id)) {
      throw new Error(result.error || "Could not prepare your patient dashboard.");
    }
    return result.patient;
  };
  const handleSubmit = async (event) => {
    var _a, _b, _c, _d, _e, _f, _g;
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "facility") {
        const response2 = await apiFetch("/api/patients/facility/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: facilityLogin.patientId.trim() || void 0,
            fullName: facilityLogin.fullName.trim() || void 0,
            pin: facilityLogin.pin.trim()
          })
        });
        if (!response2.ok) {
          const error = await response2.json().catch(() => ({}));
          throw new Error(error.error || "Authentication failed");
        }
        const result2 = await response2.json();
        onAuth({ type: "login", patient: result2.patient });
        return;
      }
      if (false) ;
      if (!formData.email || isLogin && !formData.password) {
        throw new Error("Please enter your email and password.");
      }
      const loginPayload = {
        email: formData.email,
        password: formData.password
      };
      let supabaseUser = null;
      if (isLogin) {
        const response2 = await apiFetch("/api/patients/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginPayload)
        });
        if (response2.ok) {
          const result2 = await response2.json();
          onAuth({ type: "login", patient: result2.patient });
          return;
        }
        const backendError = await response2.json().catch(() => ({}));
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword(loginPayload);
        if (authError) {
          throw new Error(backendError.error || authError.message || "Invalid login credentials");
        }
        supabaseUser = (authData == null ? void 0 : authData.user) || null;
        if (isPatientProfileComplete(supabaseUser)) {
          const patient = await createBackendPatientSession({
            email: supabaseUser.email || formData.email,
            name: (_a = supabaseUser.user_metadata) == null ? void 0 : _a.full_name,
            dateOfBirth: (_b = supabaseUser.user_metadata) == null ? void 0 : _b.date_of_birth,
            phone: (_c = supabaseUser.user_metadata) == null ? void 0 : _c.phone,
            country: (_d = supabaseUser.user_metadata) == null ? void 0 : _d.country,
            language: (_e = supabaseUser.user_metadata) == null ? void 0 : _e.preferred_language,
            gender: (_f = supabaseUser.user_metadata) == null ? void 0 : _f.gender,
            profilePhotoUrl: (_g = supabaseUser.user_metadata) == null ? void 0 : _g.profile_photo_url
          });
          onAuth({ type: "login", patient });
          return;
        }
        setCompletingExistingUser(true);
        setIsLogin(false);
        setFormData((prev) => {
          var _a2, _b2, _c2, _d2, _e2, _f2, _g2;
          return {
            ...prev,
            name: ((_a2 = supabaseUser == null ? void 0 : supabaseUser.user_metadata) == null ? void 0 : _a2.full_name) || prev.name,
            dateOfBirth: ((_b2 = supabaseUser == null ? void 0 : supabaseUser.user_metadata) == null ? void 0 : _b2.date_of_birth) || prev.dateOfBirth,
            phone: ((_c2 = supabaseUser == null ? void 0 : supabaseUser.user_metadata) == null ? void 0 : _c2.phone) || prev.phone,
            country: ((_d2 = supabaseUser == null ? void 0 : supabaseUser.user_metadata) == null ? void 0 : _d2.country) || prev.country,
            language: ((_e2 = supabaseUser == null ? void 0 : supabaseUser.user_metadata) == null ? void 0 : _e2.preferred_language) || prev.language,
            gender: ((_f2 = supabaseUser == null ? void 0 : supabaseUser.user_metadata) == null ? void 0 : _f2.gender) || prev.gender,
            profilePhotoUrl: ((_g2 = supabaseUser == null ? void 0 : supabaseUser.user_metadata) == null ? void 0 : _g2.profile_photo_url) || prev.profilePhotoUrl
          };
        });
        addError("Complete your patient profile before entering the portal.", "warning", 8e3);
        return;
      } else {
        if (completingExistingUser) {
          const { data: updateData, error: updateError } = await supabase.auth.updateUser({
            data: {
              full_name: formData.name,
              date_of_birth: formData.dateOfBirth,
              phone: formData.phone,
              country: formData.country,
              preferred_language: formData.language,
              gender: formData.gender,
              profile_photo_url: formData.profilePhotoUrl
            }
          });
          if (updateError) throw updateError;
          supabaseUser = (updateData == null ? void 0 : updateData.user) || supabaseUser;
          const patient = await createBackendPatientSession({
            email: supabaseUser.email || formData.email,
            name: formData.name,
            dateOfBirth: formData.dateOfBirth,
            phone: formData.phone,
            country: formData.country,
            language: formData.language,
            gender: formData.gender,
            profilePhotoUrl: formData.profilePhotoUrl
          });
          onAuth({ type: "login", patient });
          return;
        } else {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                full_name: formData.name,
                date_of_birth: formData.dateOfBirth,
                phone: formData.phone,
                country: formData.country,
                preferred_language: formData.language,
                gender: formData.gender,
                profile_photo_url: formData.profilePhotoUrl
              }
            }
          });
          if (signUpError) {
            const alreadyRegistered = String(signUpError.message || "").toLowerCase().includes("already") || String(signUpError.message || "").toLowerCase().includes("registered");
            if (!alreadyRegistered) throw signUpError;
          } else if (!(signUpData == null ? void 0 : signUpData.user)) {
            throw new Error("Could not create patient account. Please try again.");
          } else {
            supabaseUser = signUpData.user;
          }
        }
      }
      let response;
      try {
        response = await apiFetch("/api/patients/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      } catch {
        throw new Error("Your account was accepted by Google/Supabase, but the medical profile server did not save your patient record. Please run the database repair SQL, then try again.");
      }
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Authentication failed");
      }
      const result = await response.json();
      onAuth({ type: completingExistingUser ? "login" : isLogin ? "login" : "register", patient: result.patient });
    } catch (error) {
      addError(error.message || t("auth.authFailed"), "error");
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };
  const handleProfilePhotoUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addError("Upload a profile image file.", "warning");
      return;
    }
    if (file.size > 500 * 1024) {
      addError("Profile image must be 500KB or less.", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => handleChange("profilePhotoUrl", String(reader.result || ""));
    reader.onerror = () => addError("Could not read profile image.", "error");
    reader.readAsDataURL(file);
  };
  return forgotActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(ForgotPassword, { userType: "patient", onBack: () => setForgotActive(false) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-slate-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TelehealthHeroArt, { theme: "patient", className: "mb-8" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "GlobalDoc Connect" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-600 mt-2", children: "Patient Portal" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl shadow-xl p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex mb-6 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setMode("email"),
            className: `flex-1 py-2 px-4 rounded-2xl font-semibold transition ${mode === "email" ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-600"}`,
            children: "Email"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setMode("facility"),
            className: `flex-1 py-2 px-4 rounded-2xl font-semibold transition ${mode === "facility" ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600"}`,
            children: "Clinic / PHC PIN"
          }
        )
      ] }),
      mode === "email" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setIsLogin(true),
            className: `flex-1 py-2 px-4 rounded-2xl font-semibold transition ${isLogin ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-600"}`,
            children: "Login"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setIsLogin(false),
            className: `flex-1 py-2 px-4 rounded-2xl font-semibold transition ml-2 ${!isLogin ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-600"}`,
            children: "Sign Up"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        mode === "email" && !isLogin && completingExistingUser && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800", children: "Complete your profile details. Your Supabase session is active, so password is optional here." }),
        mode === "email" && !isLogin && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Full Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: formData.name,
                onChange: (e) => handleChange("name", e.target.value),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Date of Birth" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                value: formData.dateOfBirth,
                onChange: (e) => handleChange("dateOfBirth", e.target.value),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Sex" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: formData.gender,
                onChange: (e) => handleChange("gender", e.target.value),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Prefer not to say" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "female", children: "Female" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "male", children: "Male" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "other", children: "Other" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-emerald-50 to-violet-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Profile Picture" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "file",
                accept: "image/png,image/jpeg,image/webp",
                onChange: (e) => {
                  var _a;
                  return handleProfilePhotoUpload((_a = e.target.files) == null ? void 0 : _a[0]);
                },
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "Optional. Upload a clear face photo. Max 500KB." }),
            formData.profilePhotoUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: formData.profilePhotoUrl, alt: "Profile preview", className: "mt-3 h-20 w-20 rounded-2xl object-cover ring-2 ring-white shadow" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Phone Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "tel",
                value: formData.phone,
                onChange: (e) => handleChange("phone", e.target.value),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                placeholder: "+1 (555) 123-4567",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Country" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: formData.country,
                onChange: (e) => handleChange("country", e.target.value),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                required: true,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select country" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "US", children: "United States" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "UK", children: "United Kingdom" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "CA", children: "Canada" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "AU", children: "Australia" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "DE", children: "Germany" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "FR", children: "France" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "KE", children: "Kenya" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "NG", children: "Nigeria" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ZA", children: "South Africa" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "IN", children: "India" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "BR", children: "Brazil" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "MX", children: "Mexico" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Preferred Language" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: formData.language,
                onChange: (e) => handleChange("language", e.target.value),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "English", children: "English" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Spanish", children: "Spanish" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "French", children: "French" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "German", children: "German" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Arabic", children: "Arabic" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Hindi", children: "Hindi" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Swahili", children: "Swahili" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Portuguese", children: "Portuguese" })
                ]
              }
            )
          ] })
        ] }),
        mode === "email" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "email",
                value: formData.email,
                onChange: (e) => handleChange("email", e.target.value),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Password" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: showPassword ? "text" : "password",
                  value: formData.password,
                  onChange: (e) => handleChange("password", e.target.value),
                  className: "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                  autoComplete: isLogin ? "current-password" : "new-password",
                  required: !completingExistingUser
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowPassword((value) => !value),
                  className: "absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700",
                  "aria-label": showPassword ? "Hide password" : "Show password",
                  title: showPassword ? "Hide password" : "Show password",
                  children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4", "aria-hidden": "true" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4", "aria-hidden": "true" })
                }
              )
            ] })
          ] }),
          isLogin && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setForgotActive(true),
              className: "text-sm text-brand-700 hover:text-brand-600 font-medium",
              children: "Forgot password?"
            }
          ) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Patient ID (recommended)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: facilityLogin.patientId,
                onChange: (e) => setFacilityLogin((prev) => ({ ...prev, patientId: e.target.value })),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500",
                placeholder: "patient-123 or patient-171..."
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-slate-500", children: "If you don't have your Patient ID, use Full Name + PIN." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Full Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: facilityLogin.fullName,
                onChange: (e) => setFacilityLogin((prev) => ({ ...prev, fullName: e.target.value })),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500",
                placeholder: "Your name"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "6-digit PIN" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                inputMode: "numeric",
                value: facilityLogin.pin,
                onChange: (e) => setFacilityLogin((prev) => ({ ...prev, pin: e.target.value })),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500",
                placeholder: "123456",
                required: true
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed",
            children: loading ? "Processing..." : mode === "facility" ? "Login" : isLogin ? "Login" : completingExistingUser ? "Complete Profile" : "Create Account"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-slate-200" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-slate-500", children: "OR" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-slate-200" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GoogleSignInButton, { onClick: handleGoogleSignIn }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => window.location.href = "/",
          className: "text-sm text-brand-700 hover:text-brand-600",
          children: "← Back to home"
        }
      ) })
    ] })
  ] }) });
}
const consultationTypes = [
  { id: "basic", label: "Basic", tokens: 50, description: "Focused visit for common concerns." },
  { id: "premium", label: "Premium", tokens: 100, description: "Extended visit with specialist review." }
];
const DEFAULT_SPECIALTIES = [
  "General Practitioner",
  "Cardiology",
  "Dermatology",
  "Psychiatry",
  "Pediatrics",
  "Oncology",
  "Orthopedics",
  "Neurology",
  "Urology",
  "Gynaecologist",
  "Obstetrics & Gynecology",
  "Ophthalmology"
];
const normalizeSpecialty = (value = "") => String(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
const specialtyAliases = {
  gynaecologist: "gynaecology",
  gynaecology: "gynaecology",
  gynecologist: "gynaecology",
  gynecology: "gynaecology",
  obstetricsandgynecology: "gynaecology",
  obstetricsgynecology: "gynaecology",
  obgyn: "gynaecology",
  generalpractice: "generalpractitioner",
  gp: "generalpractitioner"
};
const specialtyKey = (value) => {
  const normalized = normalizeSpecialty(value);
  return specialtyAliases[normalized] || normalized;
};
function DoctorSelection({ patient, onDoctorSelected, onInstantConsultation }) {
  const { addError } = useError();
  const [doctors, setDoctors] = reactExports.useState([]);
  const [selectedDoctor, setSelectedDoctor] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [subscriptionType, setSubscriptionType] = reactExports.useState("basic");
  const [tokens, setTokens] = reactExports.useState((patient == null ? void 0 : patient.tokens) || 0);
  const [query, setQuery] = reactExports.useState("");
  const [specialty, setSpecialty] = reactExports.useState("");
  const [showPurchase, setShowPurchase] = reactExports.useState(false);
  const [purchaseUSD, setPurchaseUSD] = reactExports.useState(10);
  const [purchaseLoading, setPurchaseLoading] = reactExports.useState(false);
  const [startingConsultation, setStartingConsultation] = reactExports.useState(false);
  reactExports.useEffect(() => {
    void fetchDoctors();
    void fetchPatientTokens();
    const timer = window.setInterval(() => {
      void fetchDoctors({ silent: true });
    }, 15 * 1e3);
    const handleVisibility = () => {
      if (!document.hidden) void fetchDoctors({ silent: true });
    };
    window.addEventListener("focus", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
  const normalizeDoctorStatus = (doctor) => ({
    ...doctor,
    isOnline: Boolean(doctor.isOnline ?? doctor.is_online),
    is_online: Boolean(doctor.isOnline ?? doctor.is_online)
  });
  const fetchDoctors = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const response = await apiFetch(`/api/doctors`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to load doctors");
      const sortedDoctors = (data.doctors || []).map(normalizeDoctorStatus).sort((a, b) => Number(Boolean(b.isOnline)) - Number(Boolean(a.isOnline)));
      setDoctors(sortedDoctors);
      setSelectedDoctor((current) => {
        if (!(current == null ? void 0 : current.id)) return current;
        return sortedDoctors.find((doctor) => String(doctor.id) === String(current.id)) || current;
      });
      try {
        const stored = JSON.parse(window.localStorage.getItem("gd_landing_selected_doctor") || "null");
        const selected = (stored == null ? void 0 : stored.doctorId) ? sortedDoctors.find((doctor) => String(doctor.id) === String(stored.doctorId)) : null;
        if (selected) setSelectedDoctor((current) => current || selected);
      } catch {
      }
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      if (!silent) setDoctors([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };
  const fetchPatientTokens = async () => {
    if (!(patient == null ? void 0 : patient.id)) return;
    try {
      const response = await apiFetch(`/api/patients/${encodeURIComponent(patient.id)}/tokens`);
      const data = await response.json().catch(() => ({}));
      if (response.ok) setTokens(data.tokens || 0);
    } catch (error) {
      console.error("Failed to fetch tokens:", error);
    }
  };
  const specialties2 = reactExports.useMemo(() => {
    return Array.from(/* @__PURE__ */ new Set([...DEFAULT_SPECIALTIES, ...doctors.map((doctor) => doctor.specialty).filter(Boolean)])).sort();
  }, [doctors]);
  const filteredDoctors = reactExports.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const matchesSpecialty = !specialty || specialtyKey(doctor.specialty) === specialtyKey(specialty);
      const fields = [doctor.name, doctor.specialty, doctor.location, ...doctor.languages || []].join(" ").toLowerCase();
      const matchesQuery = !normalizedQuery || fields.includes(normalizedQuery);
      return matchesSpecialty && matchesQuery;
    });
  }, [doctors, query, specialty]);
  const selectedType = consultationTypes.find((item) => item.id === subscriptionType) || consultationTypes[0];
  const getDoctorPrice = (doctor, type = subscriptionType) => {
    var _a;
    if (!doctor) return selectedType.tokens;
    return Number(((_a = doctor.price) == null ? void 0 : _a[type]) || selectedType.tokens);
  };
  const selectedPrice = getDoctorPrice(selectedDoctor);
  const canAffordSelected = Boolean(selectedDoctor) && tokens >= selectedPrice;
  const handleGeneralDoctor = () => {
    const generalDoctor = doctors.find((doctor) => ["General Practitioner", "General Practice"].includes(doctor.specialty)) || doctors[0] || {
      id: "general",
      name: "General Doctor",
      specialty: "General Practitioner",
      location: "GlobalDoc virtual desk",
      languages: ["English"],
      rating: 4.8,
      price: { basic: 50, premium: 100 },
      isOnline: true,
      isVirtual: true
    };
    setSelectedDoctor(generalDoctor);
  };
  const handleConfirmSelection = () => {
    if (!selectedDoctor) return;
    if (!canAffordSelected) {
      setShowPurchase(true);
      return;
    }
    onDoctorSelected(selectedDoctor, subscriptionType);
  };
  const handleStartNow = async () => {
    if (!selectedDoctor || startingConsultation) return;
    if (!selectedDoctor.isOnline && !selectedDoctor.isVirtual) {
      addError("This doctor is offline. Please schedule a future appointment instead.", "warning");
      return;
    }
    if (!canAffordSelected) {
      setShowPurchase(true);
      return;
    }
    setStartingConsultation(true);
    try {
      await (onInstantConsultation == null ? void 0 : onInstantConsultation(selectedDoctor, subscriptionType));
    } finally {
      setStartingConsultation(false);
    }
  };
  const handlePurchaseTokens = async () => {
    var _a, _b, _c;
    const amountUSD = Math.max(10, Math.round(Number(purchaseUSD) || 10));
    setPurchaseLoading(true);
    try {
      const response = await apiFetch(`/api/patients/${encodeURIComponent(patient.id)}/tokens/purchase/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountUSD,
          email: patient.email,
          name: patient.name
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const details = typeof data.details === "string" ? data.details : ((_a = data.details) == null ? void 0 : _a.message) || ((_b = data.provider) == null ? void 0 : _b.message) || ((_c = data.provider) == null ? void 0 : _c.error) || "";
        throw new Error([data.error || "Payment initialization failed", details].filter(Boolean).join(": "));
      }
      if (data.checkout_url) window.location.href = data.checkout_url;
    } catch (error) {
      addError(error.message, "error");
    } finally {
      setPurchaseLoading(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-slate-50 px-4 py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl rounded-2xl bg-white p-8 text-center shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-brand-700" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-slate-600", children: "Loading available doctors..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-teal-200", children: "Patient specialist matching" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-3xl font-bold sm:text-4xl", children: "Choose a specialist that fits the case" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-2xl text-sm leading-6 text-slate-300", children: "Filter by specialty, pick a consultation type, then continue to appointment scheduling." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white/10 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(WalletCards, { className: "h-6 w-6 text-teal-200", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase text-slate-300", children: "Token balance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold", children: [
              tokens,
              " tokens"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setShowPurchase((value) => !value),
            className: "mt-4 w-full rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-teal-50",
            children: showPurchase ? "Hide purchase" : "Buy tokens"
          }
        )
      ] })
    ] }) }),
    showPurchase && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-teal-100 bg-white p-5 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
        "Token purchase amount (minimum $10)",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            min: "10",
            step: "1",
            value: purchaseUSD,
            onChange: (event) => setPurchaseUSD(event.target.value),
            className: "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700", children: [
        "Expected: ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-slate-950", children: [
          Math.max(10, Number(purchaseUSD) || 10) * 10,
          " tokens"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: handlePurchaseTokens,
          disabled: purchaseLoading,
          className: "rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50",
          children: purchaseLoading ? "Starting..." : "Pay with Kora"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-[0.82fr_1.18fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white p-5 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-slate-900", children: "Consultation type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid gap-3", children: consultationTypes.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setSubscriptionType(item.id),
              className: `rounded-xl border p-4 text-left transition ${subscriptionType === item.id ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-brand-200"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-900", children: item.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-brand-700", children: [
                    item.tokens,
                    " tokens"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: item.description })
              ]
            },
            item.id
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white p-5 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-slate-900", children: "Specialty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setSpecialty(""),
                className: `rounded-full px-4 py-2 text-sm font-semibold ${!specialty ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-700"}`,
                children: "All"
              }
            ),
            specialties2.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setSpecialty(item),
                className: `rounded-full px-4 py-2 text-sm font-semibold ${specialty === item ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-700"}`,
                children: item
              },
              item
            ))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: handleGeneralDoctor,
              className: "mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Stethoscope, { className: "h-4 w-4", "aria-hidden": "true" }),
                "Start with general doctor"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Available doctors" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-slate-600", children: [
              filteredDoctors.length,
              " matching profile(s)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "relative block sm:w-72", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400", "aria-hidden": "true" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: query,
                onChange: (event) => setQuery(event.target.value),
                className: "w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500",
                placeholder: "Search name, city, language"
              }
            )
          ] })
        ] }),
        filteredDoctors.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-slate-900", children: "No specialist found for this filter." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Clear filters or start with a general doctor for referral guidance." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid gap-4 md:grid-cols-2", children: filteredDoctors.map((doctor) => {
          const price = getDoctorPrice(doctor);
          const affordable = tokens >= price;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setSelectedDoctor(doctor),
              className: `rounded-2xl border p-5 text-left transition ${(selectedDoctor == null ? void 0 : selectedDoctor.id) === doctor.id ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-brand-200"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileAvatar, { person: doctor, role: "doctor", size: "md" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-slate-900", children: doctor.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600", children: doctor.specialty }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-500", children: [
                        doctor.location || "Virtual care",
                        " | ",
                        getGenderLabel(doctor)
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-1 text-xs font-semibold ${doctor.isOnline ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`, children: doctor.isOnline ? "Online" : "Offline" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-slate-600", children: [
                    "Rating ",
                    doctor.rating || 4.8,
                    "/5"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-sm font-bold ${affordable ? "text-brand-700" : "text-red-600"}`, children: [
                    price,
                    " tokens"
                  ] })
                ] })
              ]
            },
            doctor.id
          );
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky bottom-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-slate-900", children: selectedDoctor ? `${selectedDoctor.name} - ${selectedDoctor.specialty}` : "Select a doctor to continue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-600", children: selectedDoctor ? `${selectedType.label} consultation: ${selectedPrice} tokens` : "Specialists appear above after filtering." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: handleStartNow,
            disabled: !selectedDoctor || startingConsultation,
            className: "rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50",
            children: startingConsultation ? "Opening consultation..." : !selectedDoctor ? "Choose a specialist" : canAffordSelected ? "Start consultation now" : "Buy tokens"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: handleConfirmSelection,
            disabled: !selectedDoctor,
            className: "rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50",
            children: !selectedDoctor ? "Choose a specialist" : canAffordSelected ? "Schedule for later" : "Buy tokens"
          }
        )
      ] })
    ] }) })
  ] }) });
}
function CalendarScheduler({ patient, doctor, subscriptionType, onAppointmentScheduled, onBack }) {
  var _a, _b;
  const { addError } = useError();
  const [currentDate, setCurrentDate] = reactExports.useState(/* @__PURE__ */ new Date());
  const [selectedDate, setSelectedDate] = reactExports.useState(null);
  const [selectedTime, setSelectedTime] = reactExports.useState(null);
  const [availableSlots, setAvailableSlots] = reactExports.useState({});
  const [loading, setLoading] = reactExports.useState(false);
  const [scheduling, setScheduling] = reactExports.useState(false);
  const [consultationType, setConsultationType] = reactExports.useState("general");
  reactExports.useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, doctor]);
  const fetchAvailableSlots = async (date) => {
    setLoading(true);
    try {
      const dateStr = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
      ].join("-");
      const response = await apiFetch(`/api/doctors/${doctor.id}/availability?date=${dateStr}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to load availability");
      setAvailableSlots(data.slots || {});
    } catch (error) {
      setAvailableSlots({});
      addError(error.message || "Failed to fetch available appointment slots.", "error");
    } finally {
      setLoading(false);
    }
  };
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };
  const isToday = (date) => {
    const today = /* @__PURE__ */ new Date();
    return date.toDateString() === today.toDateString();
  };
  const isPast = (date) => {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  const handleDateSelect = (date) => {
    if (!isPast(date) && !isWeekend(date)) {
      setSelectedDate(date);
      setSelectedTime(null);
    }
  };
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };
  const getLocalDateKey = (date) => [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
  const handleScheduleAppointment = async () => {
    var _a2, _b2;
    if (!selectedDate || !selectedTime || scheduling) return;
    setScheduling(true);
    try {
      const slotDate = getLocalDateKey(selectedDate);
      const appointmentData = {
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledDate: (/* @__PURE__ */ new Date(`${slotDate}T${selectedTime}:00`)).toISOString(),
        slotDate,
        slotTime: selectedTime,
        consultationType,
        subscriptionType,
        tokensRequired: subscriptionType === "basic" ? ((_a2 = doctor.price) == null ? void 0 : _a2.basic) || 50 : ((_b2 = doctor.price) == null ? void 0 : _b2.premium) || 100
      };
      const response = await apiFetch(`/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData)
      });
      const result = await response.clone().json().catch(async () => {
        const text = await response.text().catch(() => "");
        return { error: text || "Failed to schedule appointment" };
      });
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to schedule appointment");
      }
      onAppointmentScheduled(result.appointment);
      addError("Appointment scheduled successfully.", "success");
    } catch (error) {
      addError("Failed to schedule appointment: " + error.message, "error");
    } finally {
      setScheduling(false);
    }
  };
  const timeSlots = Object.keys(availableSlots).sort();
  const selectionGuidance = !selectedDate ? "Select an available weekday to continue." : !selectedTime ? "Select an available time to continue." : `${formatDate(selectedDate)} at ${selectedTime}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-slate-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Schedule Your Appointment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-slate-600", children: "Choose a date and time that works for you" })
      ] }),
      onBack && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: onBack,
          className: "inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4", "aria-hidden": "true" }),
            "Change doctor"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl shadow-xl p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)),
              className: "p-2 hover:bg-slate-100 rounded-2xl transition",
              children: "←"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-slate-900", children: currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)),
              className: "p-2 hover:bg-slate-100 rounded-2xl transition",
              children: "→"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-2 mb-4", children: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm font-medium text-slate-500 py-2", children: day }, day)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-2", children: getDaysInMonth(currentDate).map((date, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square", children: date ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleDateSelect(date),
            disabled: isPast(date) || isWeekend(date),
            className: `w-full h-full rounded-2xl text-sm font-medium transition ${isToday(date) ? "bg-brand-100 text-brand-700 border-2 border-brand-500" : selectedDate && date.toDateString() === selectedDate.toDateString() ? "bg-brand-700 text-white" : isPast(date) || isWeekend(date) ? "text-slate-300 cursor-not-allowed" : "hover:bg-slate-100 text-slate-900"}`,
            children: date.getDate()
          }
        ) : null }, index)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        selectedDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl shadow-xl p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-4", children: formatDate(selectedDate) }),
          loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700 mx-auto" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-slate-600", children: "Loading available times..." })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            timeSlots.map((time) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => handleTimeSelect(time),
                disabled: !availableSlots[time],
                className: `p-3 rounded-2xl text-sm font-medium transition ${selectedTime === time ? "bg-brand-700 text-white" : availableSlots[time] ? "bg-slate-100 text-slate-900 hover:bg-slate-200" : "bg-red-50 text-red-400 cursor-not-allowed"}`,
                children: time
              },
              time
            )),
            timeSlots.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800", children: "This doctor has no available time on this date. Please choose another weekday." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl shadow-xl p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Consultation Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [
            { value: "general", label: "General Consultation", desc: "Routine check-up or general health concerns" },
            { value: "followup", label: "Follow-up Visit", desc: "Continuing care from previous appointment" },
            { value: "urgent", label: "Urgent Care", desc: "Immediate medical attention needed" },
            { value: "specialist", label: "Specialist Referral", desc: "Referred by general doctor to specialist" }
          ].map((type) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start space-x-3 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "radio",
                name: "consultationType",
                value: type.value,
                checked: consultationType === type.value,
                onChange: (e) => setConsultationType(e.target.value),
                className: "mt-1 text-brand-600 focus:ring-brand-500"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-slate-900", children: type.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600", children: type.desc })
            ] })
          ] }, type.value)) })
        ] }),
        selectedDate && selectedTime && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl shadow-xl p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-4", children: "Appointment Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600", children: "Doctor:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-slate-900", children: doctor.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600", children: "Date:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-slate-900", children: formatDate(selectedDate) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600", children: "Time:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-slate-900", children: selectedTime })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600", children: "Type:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-slate-900", children: consultationType })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600", children: "Subscription:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-slate-900", children: subscriptionType })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-t pt-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600", children: "Cost:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-brand-700", children: [
                subscriptionType === "basic" ? ((_a = doctor.price) == null ? void 0 : _a.basic) || 50 : ((_b = doctor.price) == null ? void 0 : _b.premium) || 100,
                " tokens"
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky bottom-4 mt-8 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-slate-900", children: (doctor == null ? void 0 : doctor.name) ? `Book with ${doctor.name}` : "Complete your appointment selection" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: selectionGuidance })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: handleScheduleAppointment,
          disabled: !selectedDate || !selectedTime || scheduling,
          className: "inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarCheck, { className: "h-5 w-5", "aria-hidden": "true" }),
            scheduling ? "Scheduling..." : "Submit appointment"
          ]
        }
      )
    ] }) })
  ] }) });
}
function TokenManager({ patient, onTokensUpdated }) {
  const { addError } = useError();
  const [tokens, setTokens] = reactExports.useState(0);
  const [subscription, setSubscription] = reactExports.useState(null);
  const [showPurchase, setShowPurchase] = reactExports.useState(false);
  const [purchaseUSD, setPurchaseUSD] = reactExports.useState(10);
  const [minSubscriptionUSD, setMinSubscriptionUSD] = reactExports.useState(10);
  const [loading, setLoading] = reactExports.useState(false);
  const [hasPurchasedBefore, setHasPurchasedBefore] = reactExports.useState(false);
  const [pendingPurchase, setPendingPurchase] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (patient) {
      fetchTokenBalance();
      fetchSubscription();
      fetchSettings();
    }
  }, [patient]);
  const fetchSettings = async () => {
    try {
      const response = await apiFetch(`/api/settings`);
      if (response.ok) {
        const data = await readApiJson(response);
        setMinSubscriptionUSD(data.settings.minimumSubscriptionUSD || 10);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };
  const fetchTokenBalance = async () => {
    try {
      const response = await apiFetch(`/api/patients/${patient.id}/tokens`);
      if (response.ok) {
        const data = await readApiJson(response);
        setTokens(data.tokens || 0);
        const historyRes = await apiFetch(`/api/patients/${patient.id}/tokens/history`).catch(() => null);
        if (historyRes == null ? void 0 : historyRes.ok) {
          const historyData = await readApiJson(historyRes);
          setHasPurchasedBefore((historyData.transactions || []).some((t) => (t.transaction_type || t.type) === "purchase"));
        }
        onTokensUpdated == null ? void 0 : onTokensUpdated(data.tokens || 0);
      }
    } catch (error) {
      console.error("Failed to fetch tokens:", error);
    }
  };
  const fetchSubscription = async () => {
    try {
      const response = await apiFetch(`/api/patients/${patient.id}/subscription`);
      if (response.ok) {
        const data = await readApiJson(response);
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    }
  };
  const handlePurchaseTokens = async () => {
    var _a, _b, _c, _d;
    setLoading(true);
    try {
      const amountUSD = Math.max(10, Math.round(Number(purchaseUSD) || 10));
      const response = await apiFetch(`/api/patients/${patient.id}/tokens/purchase/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountUSD,
          email: patient.email,
          name: patient.name
        })
      });
      if (!response.ok) {
        const error = await readApiJson(response);
        const details = typeof error.details === "string" ? error.details : ((_a = error.details) == null ? void 0 : _a.message) || ((_b = error.details) == null ? void 0 : _b.error) || ((_d = (_c = error.details) == null ? void 0 : _c.data) == null ? void 0 : _d.message) || "";
        throw new Error([error.error || "Payment initialization failed", details].filter(Boolean).join(": "));
      }
      const result = await readApiJson(response);
      const checkoutUrl = String(result.checkout_url || "");
      const checkoutHost = checkoutUrl ? new URL(checkoutUrl, window.location.origin).host : "";
      const isApiUrl = checkoutUrl.includes("/api/");
      setPendingPurchase({
        reference: result.reference,
        tokensExpected: result.tokensExpected,
        checkoutUrl: isApiUrl ? "" : checkoutUrl
      });
      if (checkoutUrl && !isApiUrl && checkoutHost) window.location.assign(checkoutUrl);
    } catch (error) {
      addError("Payment failed: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };
  const confirmPurchase = async () => {
    if (!(pendingPurchase == null ? void 0 : pendingPurchase.reference)) return;
    try {
      setLoading(true);
      const response = await apiFetch(`/api/payments/kora/verify/${encodeURIComponent(pendingPurchase.reference)}`);
      const data = await readApiJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to verify payment");
      if (data.status !== "success") {
        addError(`Payment status: ${data.status || "pending"}. Please retry in a moment.`, "warning");
        return;
      }
      await fetchTokenBalance();
      setPendingPurchase(null);
      setShowPurchase(false);
      addError("Tokens credited successfully.", "success");
    } catch (error) {
      addError(error.message, "error");
    } finally {
      setLoading(false);
    }
  };
  const handleSubscribe = async (plan) => {
    var _a, _b, _c, _d;
    setLoading(true);
    try {
      const subscriptionData = {
        plan,
        patientId: patient.id,
        price: plan === "monthly" ? 50 : plan === "yearly" ? 500 : Math.max(10, Math.round(Number(purchaseUSD) || minSubscriptionUSD)),
        tokensIncluded: plan === "monthly" ? 500 : plan === "yearly" ? 6e3 : Math.max(10, Math.round(Number(purchaseUSD) || minSubscriptionUSD)) * 10,
        email: patient.email,
        name: patient.name
      };
      const response = await apiFetch(`/api/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionData)
      });
      if (!response.ok) {
        const error = await readApiJson(response);
        const details = typeof error.details === "string" ? error.details : ((_a = error.details) == null ? void 0 : _a.message) || ((_b = error.details) == null ? void 0 : _b.error) || ((_d = (_c = error.details) == null ? void 0 : _c.data) == null ? void 0 : _d.message) || "";
        throw new Error([error.error || "Subscription payment failed", details].filter(Boolean).join(": "));
      }
      const result = await readApiJson(response);
      const checkoutUrl = String(result.checkout_url || "");
      const checkoutHost = checkoutUrl ? new URL(checkoutUrl, window.location.origin).host : "";
      const isApiUrl = checkoutUrl.includes("/api/");
      setPendingPurchase({
        reference: result.reference,
        tokensExpected: result.tokensExpected || result.tokensIncluded || subscriptionData.tokensIncluded,
        checkoutUrl: isApiUrl ? "" : checkoutUrl
      });
      setShowPurchase(true);
      addError(`Kora checkout opened for ${plan}. Tokens will be credited after payment verification.`, "success");
      if (checkoutUrl && !isApiUrl && checkoutHost) window.location.assign(checkoutUrl);
    } catch (error) {
      addError("Subscription failed: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };
  const getTokenStatus = () => {
    if (tokens >= 500) return { status: "excellent", color: "text-green-600", bg: "bg-green-100" };
    if (tokens >= 200) return { status: "good", color: "text-blue-600", bg: "bg-blue-100" };
    if (tokens >= 50) return { status: "low", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { status: "critical", color: "text-red-600", bg: "bg-red-100" };
  };
  const tokenStatus = getTokenStatus();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl shadow-xl p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Token Balance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setShowPurchase(true),
          className: "bg-brand-700 text-white px-4 py-2 rounded-2xl text-sm font-semibold hover:bg-brand-600 transition",
          children: "Buy Tokens"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `inline-flex items-center px-4 py-2 rounded-2xl ${tokenStatus.bg}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-2xl font-bold ${tokenStatus.color}`, children: tokens }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `ml-2 text-sm font-medium ${tokenStatus.color}`, children: "tokens" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-slate-600 mt-2 capitalize", children: [
        tokenStatus.status,
        " balance"
      ] })
    ] }),
    subscription && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 rounded-2xl p-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-slate-900 mb-2", children: "Active Subscription" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-600 capitalize", children: [
          subscription.plan,
          " Plan"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-slate-500", children: [
          "Expires: ",
          new Date(subscription.expiresAt).toLocaleDateString()
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-slate-900", children: "Subscription Plans" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-slate-200 rounded-2xl p-4 hover:border-brand-300 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-slate-900", children: "Pay-per-Use" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600 mt-1", children: "Choose your amount, minimum $10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              min: "10",
              step: "1",
              value: purchaseUSD,
              onChange: (event) => setPurchaseUSD(event.target.value),
              className: "mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-brand-700 mt-2", children: [
            "$",
            Math.max(10, Number(purchaseUSD) || minSubscriptionUSD)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => handleSubscribe("payperuse"),
              disabled: loading,
              className: "w-full mt-3 bg-slate-100 text-slate-700 py-2 px-4 rounded-2xl text-sm font-semibold hover:bg-slate-200 transition disabled:opacity-50",
              children: "Subscribe"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-slate-200 rounded-2xl p-4 hover:border-brand-300 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-slate-900", children: "Monthly" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600 mt-1", children: "500 tokens/month" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-brand-700 mt-2", children: "$50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => handleSubscribe("monthly"),
              disabled: loading,
              className: "w-full mt-3 bg-brand-700 text-white py-2 px-4 rounded-2xl text-sm font-semibold hover:bg-brand-600 transition disabled:opacity-50",
              children: "Subscribe"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-slate-200 rounded-2xl p-4 hover:border-brand-300 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-slate-900", children: "Yearly" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600 mt-1", children: "6000 tokens/year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-brand-700 mt-2", children: "$500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => handleSubscribe("yearly"),
              disabled: loading,
              className: "w-full mt-3 bg-green-600 text-white py-2 px-4 rounded-2xl text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50",
              children: "Subscribe"
            }
          )
        ] })
      ] })
    ] }),
    showPurchase && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl p-6 w-full max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-slate-900 mb-4", children: "Buy Tokens" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: pendingPurchase ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 rounded-2xl p-4 border border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-700 font-semibold", children: "Payment started" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500 mt-1", children: [
          "Reference: ",
          pendingPurchase.reference
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500 mt-1", children: [
          "Expected tokens: ",
          pendingPurchase.tokensExpected
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => pendingPurchase.checkoutUrl && window.open(pendingPurchase.checkoutUrl, "_blank", "noopener,noreferrer"),
              className: "flex-1 bg-slate-100 text-slate-700 py-3 px-4 rounded-2xl font-semibold hover:bg-slate-200 transition",
              children: "Open Checkout"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: confirmPurchase,
              disabled: loading,
              className: "flex-1 bg-brand-700 text-white py-3 px-4 rounded-2xl font-semibold hover:bg-brand-600 transition disabled:opacity-50",
              children: loading ? "Checking..." : "I have paid"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-slate-500 mt-3", children: "Tokens are credited after payment verification." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700 mb-2", children: "Select Deposit Amount (USD)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: [10, 20, 50].map((usd) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setPurchaseUSD(usd),
              className: `p-3 rounded-2xl text-sm font-medium transition ${purchaseUSD === usd ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-900 hover:bg-slate-200"}`,
              children: [
                "$",
                usd
              ]
            },
            usd
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              min: "10",
              step: "1",
              value: purchaseUSD,
              onChange: (event) => setPurchaseUSD(event.target.value),
              className: "mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500",
              placeholder: "Enter custom amount"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 rounded-2xl p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600", children: "You will receive:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-slate-900", children: [
              hasPurchasedBefore ? Math.max(10, Number(purchaseUSD) || 10) * 7.5 : Math.max(10, Number(purchaseUSD) || 10) * 10,
              " tokens"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600", children: "Price:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-brand-700", children: [
              "$",
              Math.max(10, Number(purchaseUSD) || 10).toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-slate-400 mt-2 italic", children: hasPurchasedBefore ? "Repurchase rate: $10 = 75 tokens" : "First-time bonus: $10 = 100 tokens!" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setPendingPurchase(null);
                setShowPurchase(false);
              },
              className: "flex-1 bg-slate-100 text-slate-700 py-3 px-4 rounded-2xl font-semibold hover:bg-slate-200 transition",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: handlePurchaseTokens,
              disabled: loading,
              className: "flex-1 bg-brand-700 text-white py-3 px-4 rounded-2xl font-semibold hover:bg-brand-600 transition disabled:opacity-50",
              children: loading ? "Processing..." : "Pay with Kora"
            }
          )
        ] })
      ] }) })
    ] }) })
  ] });
}
const specialties = ["Cardiology", "Dermatology", "Psychiatry", "Pediatrics", "Oncology", "Orthopedics", "Neurology", "Urology", "Gynaecologist", "Obstetrics & Gynecology", "Ophthalmology", "General Practitioner"];
function PatientReferralPanel({ patient, currentDoctor, onReferralSubmitted }) {
  const [reason, setReason] = reactExports.useState("");
  const [targetSpecialty, setTargetSpecialty] = reactExports.useState("Cardiology");
  const [notes, setNotes] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [message, setMessage] = reactExports.useState("");
  const currentSpecialty = (currentDoctor == null ? void 0 : currentDoctor.specialty) || "General Practitioner";
  const currentInfo = getSpecialtyInfo(currentSpecialty);
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!patient || !reason || !targetSpecialty) {
      setMessage("Please fill in the referral reason and target specialty.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await apiFetch(`/api/patients/referrals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          fromSpecialty: currentSpecialty,
          toSpecialty: targetSpecialty,
          reason,
          notes
        })
      });
      if (!response.ok) {
        const error = await readApiJson(response);
        throw new Error(error.error || "Failed to submit referral");
      }
      setMessage("Referral request sent successfully. A specialist will be notified soon.");
      setReason("");
      setNotes("");
      setTargetSpecialty("Cardiology");
      if (onReferralSubmitted) onReferralSubmitted();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl bg-gradient-to-r from-slate-50 to-white p-6 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-2xl", children: currentInfo.icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm uppercase tracking-[0.2em] text-slate-500", children: "Current specialty" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-semibold text-slate-900", children: currentSpecialty })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700 mb-2", children: "Referral reason" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: reason,
            onChange: (e) => setReason(e.target.value),
            placeholder: "Why do you need a specialist?",
            className: "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700 mb-2", children: "Target specialty" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: targetSpecialty,
            onChange: (e) => setTargetSpecialty(e.target.value),
            className: "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
            children: specialties.map((specialty) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: specialty, children: specialty }, specialty))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700 mb-2", children: "Additional notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: notes,
            onChange: (e) => setNotes(e.target.value),
            placeholder: "Any important details for the referral...",
            rows: 4,
            className: "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
          }
        )
      ] }),
      message && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600", children: message }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleSubmit,
          disabled: loading,
          className: "w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50",
          children: loading ? "Sending referral..." : `Refer to ${targetSpecialty}`
        }
      )
    ] })
  ] });
}
const AccessibilityPanel = ({ isOpen, onClose, userType = "patient" }) => {
  const { t } = useTranslation();
  const [settings, setSettings] = reactExports.useState({
    voiceCommands: false,
    screenReader: false,
    highContrast: false,
    largeText: false,
    audioDescription: false,
    visualGuide: false,
    hearingImpaired: false,
    mobilitySupport: false,
    emergencyAccess: true
  });
  const [isListening, setIsListening] = reactExports.useState(false);
  const recognitionRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const saved = localStorage.getItem("accessibilitySettings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        handleVoiceCommand(command);
      };
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  reactExports.useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", settings.highContrast);
    document.documentElement.classList.toggle("large-text", settings.largeText);
    document.documentElement.classList.toggle("screen-reader", settings.screenReader);
    localStorage.setItem("accessibilitySettings", JSON.stringify(settings));
  }, [settings]);
  const handleVoiceCommand = (command) => {
    console.log("Voice command:", command);
    if (command.includes("book appointment") || command.includes("schedule")) {
      announce("Opening appointment scheduler");
    } else if (command.includes("call doctor") || command.includes("emergency")) {
      announce("Initiating emergency call");
    } else if (command.includes("messages") || command.includes("chat")) {
      announce("Opening messages");
    } else if (command.includes("help") || command.includes("support")) {
      announce("Opening help and support");
    }
  };
  const announce = (message) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.speak(utterance);
    }
  };
  const toggleVoiceCommands = () => {
    if (!settings.voiceCommands) {
      if (recognitionRef.current) {
        setIsListening(true);
        recognitionRef.current.start();
        announce('Voice commands activated. Say "book appointment", "call doctor", "messages", or "help"');
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      announce("Voice commands deactivated");
    }
    setSettings((prev) => ({ ...prev, voiceCommands: !prev.voiceCommands }));
  };
  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    announce(`${key.replace(/([A-Z])/g, " $1").toLowerCase()} ${settings[key] ? "disabled" : "enabled"}`);
  };
  const getAccessibilityOptions = () => {
    const commonOptions = [
      {
        key: "voiceCommands",
        icon: settings.voiceCommands ? Mic : MicOff,
        label: t("accessibility.voiceCommands"),
        description: "Control the app using voice commands",
        available: !!recognitionRef.current
      },
      {
        key: "screenReader",
        icon: Volume2,
        label: t("accessibility.screenReader"),
        description: "Enhanced support for screen readers"
      },
      {
        key: "highContrast",
        icon: Eye,
        label: t("accessibility.highContrast"),
        description: "High contrast mode for better visibility"
      },
      {
        key: "largeText",
        icon: Type,
        label: t("accessibility.largeText"),
        description: "Increase text size throughout the app"
      },
      {
        key: "audioDescription",
        icon: Volume2,
        label: t("accessibility.audioDescription"),
        description: "Audio descriptions for visual content"
      },
      {
        key: "visualGuide",
        icon: Eye,
        label: t("accessibility.visualGuide"),
        description: "Visual guides and demonstrations"
      }
    ];
    const patientOptions = [
      {
        key: "hearingImpaired",
        icon: VolumeX,
        label: t("accessibility.hearingImpaired"),
        description: "Support for hearing impaired users"
      },
      {
        key: "mobilitySupport",
        icon: MousePointer,
        label: t("accessibility.mobilitySupport"),
        description: "Enhanced mobility and navigation support"
      },
      {
        key: "emergencyAccess",
        icon: Zap,
        label: t("accessibility.emergencyAccess"),
        description: "Quick access to emergency services"
      }
    ];
    return userType === "patient" ? [...commonOptions, ...patientOptions] : commonOptions;
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Accessibility Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onClose,
          className: "text-gray-400 hover:text-gray-600",
          "aria-label": "Close accessibility panel",
          children: "✕"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: getAccessibilityOptions().map((option) => {
      const Icon = option.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `flex items-center justify-between p-4 border rounded-lg transition-colors ${settings[option.key] ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `w-5 h-5 ${settings[option.key] ? "text-blue-600" : "text-gray-600"}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-gray-900", children: option.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: option.description })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => option.key === "voiceCommands" ? toggleVoiceCommands() : toggleSetting(option.key),
                disabled: option.key === "voiceCommands" && !option.available,
                className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings[option.key] ? "bg-blue-600" : "bg-gray-200"} ${option.key === "voiceCommands" && !option.available ? "opacity-50 cursor-not-allowed" : ""}`,
                "aria-pressed": settings[option.key],
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings[option.key] ? "translate-x-6" : "translate-x-1"}`
                  }
                )
              }
            )
          ]
        },
        option.key
      );
    }) }),
    settings.voiceCommands && isListening && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 p-3 bg-red-50 border border-red-200 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 bg-red-500 rounded-full animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-red-700", children: "Listening for voice commands..." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 pt-4 border-t border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 text-center", children: "Accessibility settings are saved automatically and will persist across sessions." }) })
  ] }) }) });
};
function PatientClinicalSummaryDownload({ patient }) {
  const { addError } = useError();
  const [loading, setLoading] = reactExports.useState(false);
  const downloadPdf = async () => {
    var _a, _b;
    if (!(patient == null ? void 0 : patient.id)) return;
    setLoading(true);
    try {
      const response = await apiFetch(`/api/patients/${encodeURIComponent(patient.id)}/record`);
      const record = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(record.error || "Failed to load review");
      const html = `<!doctype html><html><head><title>Clinical Review - ${patient.name}</title><style>body{font-family:Arial,sans-serif;color:#0f172a;padding:30px}h1{color:#0f766e}.box{border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin:10px 0}table{width:100%;border-collapse:collapse;margin-top:12px}td,th{border:1px solid #e2e8f0;padding:8px;text-align:left}</style></head><body><h1>GlobalDoc Clinical Review</h1><div class="box"><b>${patient.name || patient.id}</b><br/>${patient.id}</div><h2>Vital Signs</h2><table><tr><th>Parameter</th><th>Value</th><th>Source</th><th>Date</th></tr>${(record.vitals || []).map((v) => `<tr><td>${v.parameter_name}</td><td>${v.parameter_value} ${v.unit || ""}</td><td>${v.source || ""}</td><td>${new Date(v.measured_at || v.created_at).toLocaleString()}</td></tr>`).join("")}</table><h2>Doctor Reviews</h2>${(record.reviews || []).map((r) => `<div class="box"><b>${r.rating}/5</b><p>${r.comment || ""}</p></div>`).join("")}<h2>Referrals</h2>${(((_a = record.referrals) == null ? void 0 : _a.facility) || []).map((r) => `<div class="box"><b>${r.code}</b> - ${r.status}<p>${r.reason || ""}</p><p>${r.notes || ""}</p></div>`).join("")}<h2>Lab Requests</h2>${(((_b = record.labs) == null ? void 0 : _b.orders) || []).map((o) => `<div class="box"><b>${o.id}</b><p>${(o.tests || []).join(", ")}</p></div>`).join("")}</body></html>`;
      const win = window.open("", "_blank");
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
    } catch (error) {
      addError(error.message, "error");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: downloadPdf, disabled: loading, className: "rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50", children: loading ? "Preparing..." : "Download clinical review PDF" });
}
function PatientDashboard({ logoutSignal = 0, onLoggedOut, onSessionChange }) {
  var _a, _b, _c, _d;
  const { addError } = useError();
  const [currentStep, setCurrentStep] = reactExports.useState("auth");
  const [patient, setPatient] = reactExports.useState(null);
  const [selectedDoctor, setSelectedDoctor] = reactExports.useState(null);
  const [subscriptionType, setSubscriptionType] = reactExports.useState("basic");
  const [tokens, setTokens] = reactExports.useState(0);
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const [appointments, setAppointments] = reactExports.useState([]);
  const [notifications, setNotifications] = reactExports.useState([]);
  const [files, setFiles] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = reactExports.useState("");
  const [showAccessibilityPanel, setShowAccessibilityPanel] = reactExports.useState(false);
  const { t } = useTranslation();
  const activeConsultation = reactExports.useMemo(() => {
    return appointments.find((appointment) => appointment.id === selectedConsultationId) || appointments[0] || null;
  }, [appointments, selectedConsultationId]);
  const activeConsultationId = selectedConsultationId || (activeConsultation == null ? void 0 : activeConsultation.id) || "";
  const activeConsultationStatus = String((activeConsultation == null ? void 0 : activeConsultation.status) || "").toLowerCase();
  const liveConsultationActive = !["completed", "cancelled", "canceled", "ended"].includes(activeConsultationStatus);
  const currentSpecialty = (selectedDoctor == null ? void 0 : selectedDoctor.specialty) || (activeConsultation == null ? void 0 : activeConsultation.doctorSpecialty) || (activeConsultation == null ? void 0 : activeConsultation.doctor_specialty) || (activeConsultation == null ? void 0 : activeConsultation.specialty) || "General Practitioner";
  const specialtyInfo = getSpecialtyInfo(currentSpecialty);
  const activeDoctorName = (selectedDoctor == null ? void 0 : selectedDoctor.name) || (activeConsultation == null ? void 0 : activeConsultation.doctorName) || (activeConsultation == null ? void 0 : activeConsultation.doctor_name) || (activeConsultation == null ? void 0 : activeConsultation.doctorId) || (activeConsultation == null ? void 0 : activeConsultation.doctor_id) || "Care team";
  const patientDashboardStyle = {
    "--specialty-color": specialtyInfo.color,
    "--specialty-bg": specialtyInfo.bgColor,
    backgroundImage: `linear-gradient(135deg, ${specialtyInfo.bgColor} 0%, #ffffff 42%, ${specialtyInfo.color}18 100%)`
  };
  const upcomingAppointments = reactExports.useMemo(
    () => appointments.filter((appointment) => new Date(appointment.scheduledDate || appointment.scheduled_date) > /* @__PURE__ */ new Date()),
    [appointments]
  );
  const unreadNotifications = notifications.filter((item) => !item.is_read).length;
  const cleanLogout = (reason = "logout") => {
    const patientId = patient == null ? void 0 : patient.id;
    if (patientId) {
      void apiFetch("/api/vital-requests/cancel-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          consultationId: selectedConsultationId || (activeConsultation == null ? void 0 : activeConsultation.id) || ""
        })
      }).catch(() => null);
      void apiFetch(`/api/patients/${encodeURIComponent(patientId)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: false })
      }).catch(() => null);
    }
    setPatient(null);
    setSelectedDoctor(null);
    setSubscriptionType("basic");
    setTokens(0);
    setActiveTab("overview");
    setAppointments([]);
    setNotifications([]);
    setFiles([]);
    setSelectedConsultationId("");
    setShowAccessibilityPanel(false);
    setCurrentStep("auth");
    try {
      window.localStorage.removeItem("gd_patient_session");
      window.localStorage.removeItem("gd_pending_patient_profile");
    } catch {
    }
    void supabase.auth.signOut().catch(() => null);
    if (reason === "idle") addError("You were logged out after 15 minutes of inactivity.", "info", 9e3);
    onSessionChange == null ? void 0 : onSessionChange("");
    onLoggedOut == null ? void 0 : onLoggedOut();
  };
  const refreshPatientTokens = reactExports.useCallback(async (patientId) => {
    if (!patientId) return null;
    const response = await apiFetch(`/api/patients/${encodeURIComponent(patientId)}/tokens`);
    const data = await readApiJson(response);
    if (!response.ok) throw new Error(data.error || "Unable to refresh token balance");
    const nextBalance = Number(data.tokens ?? data.balance ?? 0) || 0;
    setTokens(nextBalance);
    setPatient((currentPatient) => {
      if (!currentPatient || String(currentPatient.id) !== String(patientId)) return currentPatient;
      const nextPatient = { ...currentPatient, tokens: nextBalance };
      try {
        window.localStorage.setItem("gd_patient_session", JSON.stringify(nextPatient));
      } catch {
      }
      return nextPatient;
    });
    return nextBalance;
  }, []);
  reactExports.useEffect(() => {
    if (patient && currentStep === "dashboard") {
      loadOverview();
    }
  }, [patient, currentStep]);
  reactExports.useEffect(() => {
    if (!(patient == null ? void 0 : patient.id)) return;
    const refreshAfterPayment = () => {
      void refreshPatientTokens(patient.id).catch(() => null);
    };
    refreshAfterPayment();
    window.addEventListener("focus", refreshAfterPayment);
    document.addEventListener("visibilitychange", refreshAfterPayment);
    return () => {
      window.removeEventListener("focus", refreshAfterPayment);
      document.removeEventListener("visibilitychange", refreshAfterPayment);
    };
  }, [patient == null ? void 0 : patient.id, refreshPatientTokens]);
  reactExports.useEffect(() => {
    if (!(patient == null ? void 0 : patient.id) || currentStep === "auth") return void 0;
    const statusPath = `/api/patients/${encodeURIComponent(patient.id)}/status`;
    const markOnline = () => {
      void apiFetch(statusPath, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: true })
      }).catch(() => null);
    };
    markOnline();
    const interval = window.setInterval(markOnline, 60 * 1e3);
    return () => window.clearInterval(interval);
  }, [patient == null ? void 0 : patient.id, currentStep]);
  reactExports.useEffect(() => {
    if (logoutSignal > 0) cleanLogout("manual");
  }, [logoutSignal]);
  reactExports.useEffect(() => {
    if (!patient) return;
    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    let timer;
    const resetTimer = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => cleanLogout("idle"), 15 * 60 * 1e3);
    };
    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      window.clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [patient == null ? void 0 : patient.id]);
  reactExports.useEffect(() => {
    if (currentStep !== "auth") return;
    try {
      const stored = window.localStorage.getItem("gd_patient_session");
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (parsed == null ? void 0 : parsed.id) {
        const returnToDashboard = window.localStorage.getItem("gd_patient_return_dashboard") === "1";
        window.localStorage.removeItem("gd_patient_return_dashboard");
        setPatient(parsed);
        setTokens(parsed.tokens || 0);
        setCurrentStep(returnToDashboard ? "dashboard" : "doctor");
        if (returnToDashboard) setActiveTab("tokens");
        void refreshPatientTokens(parsed.id).then((nextBalance) => {
          if (returnToDashboard && Number.isFinite(Number(nextBalance))) setTokens(Number(nextBalance));
        }).catch(() => null);
        onSessionChange == null ? void 0 : onSessionChange("patient");
      } else {
        window.localStorage.removeItem("gd_patient_session");
      }
    } catch {
    }
  }, [currentStep, refreshPatientTokens]);
  const loadOverview = async () => {
    var _a2;
    setLoading(true);
    try {
      const [appointmentsRes, filesRes, notificationsRes] = await Promise.all([
        apiFetch(`/api/appointments?patientId=${encodeURIComponent(patient.id)}`),
        apiFetch(`/api/patients/files?patientId=${encodeURIComponent(patient.id)}`),
        apiFetch(`/api/notifications?userId=${encodeURIComponent(patient.id)}&userType=patient`),
        refreshPatientTokens(patient.id).catch(() => null)
      ]);
      const [appointmentsData, filesData, notificationsData] = await Promise.all([
        appointmentsRes.json(),
        filesRes.json(),
        notificationsRes.json()
      ]);
      setAppointments(appointmentsData.appointments || []);
      setFiles(filesData.files || []);
      setNotifications(notificationsData.notifications || []);
      if (!selectedConsultationId && ((_a2 = appointmentsData.appointments) == null ? void 0 : _a2.length) > 0) {
        setSelectedConsultationId(appointmentsData.appointments[0].id);
      }
    } catch (error) {
      console.error("Failed to load patient dashboard", error);
    } finally {
      setLoading(false);
    }
  };
  const handleAuth = (authResult) => {
    const nextPatient = authResult.type === "register" ? { ...authResult.patient, tokens: 0 } : authResult.patient;
    if (authResult.type === "register") {
      setTokens(0);
    } else {
      setTokens(authResult.patient.tokens || 0);
    }
    setPatient(nextPatient);
    void refreshPatientTokens(nextPatient.id).catch(() => null);
    try {
      window.localStorage.setItem("gd_patient_session", JSON.stringify(nextPatient));
    } catch {
    }
    onSessionChange == null ? void 0 : onSessionChange("patient");
    setCurrentStep("doctor");
  };
  const handleDoctorSelected = (doctor, subType) => {
    setSelectedDoctor(doctor);
    setSubscriptionType(subType);
    setCurrentStep("calendar");
  };
  const handleInstantConsultation = async (doctor, subType) => {
    var _a2;
    const price = Number(((_a2 = doctor == null ? void 0 : doctor.price) == null ? void 0 : _a2[subType]) || (subType === "premium" ? 100 : 50));
    try {
      const balanceResponse = await apiFetch(`/api/patients/${encodeURIComponent(patient.id)}/tokens`);
      const balanceData = await balanceResponse.json().catch(() => ({}));
      if (!balanceResponse.ok) throw new Error(balanceData.error || "Unable to confirm token balance");
      if (Number(balanceData.tokens || 0) < price) {
        throw new Error("Insufficient tokens. Buy tokens before starting this consultation.");
      }
      const response = await apiFetch("/api/consultations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          doctorId: doctor.id,
          channel: "direct_home",
          track: subType === "premium" ? "premium" : "economy",
          durationMin: subType === "premium" ? 30 : 15
        })
      });
      const data = await readApiJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to start consultation");
      const updatedBalanceResponse = await apiFetch(`/api/patients/${encodeURIComponent(patient.id)}/tokens`);
      const updatedBalanceData = await updatedBalanceResponse.json().catch(() => ({}));
      const consultation = data.consultation || {};
      const liveAppointment = {
        id: consultation.id,
        consultationId: consultation.id,
        consultation_id: consultation.id,
        patientId: patient.id,
        patient_id: patient.id,
        doctorId: doctor.id,
        doctor_id: doctor.id,
        doctorName: doctor.name,
        doctor_name: doctor.name,
        doctorSpecialty: doctor.specialty,
        doctor_specialty: doctor.specialty,
        consultationType: "live_consultation",
        consultation_type: "live_consultation",
        scheduledDate: (/* @__PURE__ */ new Date()).toISOString(),
        scheduled_date: (/* @__PURE__ */ new Date()).toISOString(),
        status: "in_progress",
        tokens_charged: data.tokensCharged ?? consultation.patient_tokens_charged ?? price
      };
      setSelectedDoctor(doctor);
      setSubscriptionType(subType);
      setTokens(updatedBalanceData.tokens ?? Math.max(0, tokens - Number(data.tokensCharged || price)));
      setAppointments((prev) => [liveAppointment, ...prev]);
      setSelectedConsultationId(liveAppointment.id);
      setActiveTab("video");
      setCurrentStep("dashboard");
      addError("Live consultation started. Video room is ready.", "success");
    } catch (error) {
      addError(error.message, "error");
    }
  };
  const handleAppointmentScheduled = (appointment) => {
    setCurrentStep("dashboard");
    loadOverview();
  };
  const handleTokensUpdated = (newTokenBalance) => {
    const nextBalance = Number(newTokenBalance || 0);
    setTokens(nextBalance);
    setPatient((currentPatient) => {
      if (!currentPatient) return currentPatient;
      const nextPatient = { ...currentPatient, tokens: nextBalance };
      try {
        window.localStorage.setItem("gd_patient_session", JSON.stringify(nextPatient));
      } catch {
      }
      return nextPatient;
    });
  };
  const handleEmergencyCall = async () => {
    if (!patient) return;
    try {
      const response = await apiFetch(`/api/emergency/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          patientName: patient.name,
          reason: "Emergency request"
        })
      });
      if (!response.ok) {
        const error = await readApiJson(response);
        throw new Error(error.error || "Emergency call failed");
      }
      addError("Emergency request sent to available doctors. Help is on the way.", "success");
    } catch (error) {
      addError(error.message, "error");
    }
  };
  if (currentStep === "auth") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(PatientAuth, { onAuth: handleAuth });
  }
  if (currentStep === "doctor") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DoctorSelection, { patient, onDoctorSelected: handleDoctorSelected, onInstantConsultation: handleInstantConsultation });
  }
  if (currentStep === "calendar") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CalendarScheduler,
      {
        patient,
        doctor: selectedDoctor,
        subscriptionType,
        onAppointmentScheduled: handleAppointmentScheduled,
        onBack: () => setCurrentStep("doctor")
      }
    );
  }
  const handleAppointmentCreated = async () => {
    await loadOverview();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative mx-auto mt-16 max-w-7xl overflow-hidden rounded-[2rem] px-6 pb-20 pt-1 sm:px-8", style: patientDashboardStyle, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-72 bg-white/70 blur-xl opacity-70" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnnouncementBanner, { audience: "patient" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PortalArtBanner,
      {
        theme: "patient",
        title: "A calmer patient journey",
        body: "Book a doctor, keep live video open, receive clinical prompts, and download prescriptions or lab requests without losing your place.",
        className: "mb-8"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-white/70 bg-white/95 px-8 py-10 shadow-xl shadow-slate-200/40 mb-8 relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 right-0 w-2/5 opacity-15", style: { background: specialtyInfo.color } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative grid gap-6 lg:grid-cols-[1.8fr_1fr] lg:items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex flex-wrap items-center gap-3 rounded-full border border-white bg-white px-4 py-2 text-sm font-bold shadow-sm", style: { color: specialtyInfo.color }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full px-2 py-1 text-xs text-white", style: { backgroundColor: specialtyInfo.color }, children: specialtyInfo.logo }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              specialtyInfo.name,
              " rhythm"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-400", children: [
              "with ",
              activeDoctorName
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-5 text-4xl font-bold text-slate-900", children: "Patient Portal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-2xl text-lg leading-8 text-slate-600", children: "Upload medical records, schedule appointments, chat with your doctor, and receive reminders 24 hours and 1 hour before your visit." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border p-4", style: { borderColor: `${specialtyInfo.color}35`, backgroundColor: `${specialtyInfo.bgColor}90` }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileAvatar, { person: patient, role: "patient", size: "md" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.24em]", style: { color: specialtyInfo.color }, children: "Patient guide" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm font-semibold text-slate-800", children: [
                    (patient == null ? void 0 : patient.name) || "Patient",
                    " | ",
                    getGenderLabel(patient)
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-slate-700", children: [
                "Your preferred language: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: (patient == null ? void 0 : patient.language) || "English" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-slate-600", children: [
                specialtyInfo.description,
                ". Your dashboard adapts to the specialist you selected, the referral path, or the doctor currently consulting."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageSelector, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setActiveTab("manuals"),
                  className: "rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg",
                  style: { backgroundColor: specialtyInfo.color },
                  children: t("manuals.downloadManual")
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl p-6 text-white shadow-lg shadow-slate-200/50", style: { background: `linear-gradient(135deg, ${specialtyInfo.color}, #0f172a)` }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white/15 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm uppercase tracking-[0.2em] text-white/70", children: "Upcoming appointments" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-3xl font-semibold", children: upcomingAppointments.length })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white/15 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm uppercase tracking-[0.2em] text-white/70", children: "Unread notifications" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-3xl font-semibold", children: unreadNotifications })
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mb-8", children: [
      { id: "overview", label: "Overview" },
      { id: "appointments", label: "Appointments" },
      { id: "files", label: "Files" },
      { id: "prescriptions", label: "Prescriptions" },
      { id: "labs", label: "Lab Requests" },
      { id: "review-pdf", label: "Review PDF" },
      { id: "chat", label: "Chat" },
      { id: "video", label: "Video Call" },
      { id: "notifications", label: "Notifications" },
      { id: "tokens", label: "Tokens & Subscription" },
      { id: "manuals", label: "Help & Manuals" },
      { id: "accessibility", label: "Accessibility" }
    ].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setActiveTab(tab.id),
        className: `rounded-full border px-6 py-3 text-sm font-semibold transition ${activeTab === tab.id ? "text-white shadow-lg" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`,
        style: activeTab === tab.id ? { backgroundColor: specialtyInfo.color, borderColor: specialtyInfo.color } : void 0,
        children: tab.label
      },
      tab.id
    )) }),
    activeTab !== "overview" && activeTab !== "video" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      VitalParametersMonitor,
      {
        consultationId: activeConsultationId,
        patientId: patient.id,
        doctorId: (activeConsultation == null ? void 0 : activeConsultation.doctorId) || (activeConsultation == null ? void 0 : activeConsultation.doctor_id) || (selectedDoctor == null ? void 0 : selectedDoctor.id) || "",
        userType: "patient",
        compact: true
      }
    ) }),
    activeTab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        VitalParametersMonitor,
        {
          consultationId: activeConsultationId,
          patientId: patient.id,
          doctorId: (activeConsultation == null ? void 0 : activeConsultation.doctorId) || (activeConsultation == null ? void 0 : activeConsultation.doctor_id) || (selectedDoctor == null ? void 0 : selectedDoctor.id) || "",
          userType: "patient"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-8 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-slate-900 mb-4", children: "Quick Actions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl p-5", style: { backgroundColor: specialtyInfo.bgColor }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold", style: { color: specialtyInfo.color }, children: [
                specialtyInfo.name,
                " care mode"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600", children: "Schedule a new appointment and receive email and in-app reminders before the consultation." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl bg-slate-50 p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600", children: "Upload test results, prescriptions, or scans and share them securely with your doctor." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl bg-slate-50 p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600", children: "Send quick messages to your doctor and get notified when they reply." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl bg-red-50 border border-red-100 p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-red-700", children: "Emergency assistance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600", children: "If you need urgent help, notify available doctors immediately." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handleEmergencyCall,
                  className: "w-full rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700",
                  children: "Call emergency support"
                }
              )
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PatientReferralPanel, { patient, currentDoctor: selectedDoctor, onReferralSubmitted: loadOverview }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-slate-900 mb-4", children: "Recent activity" }),
          loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "Loading activity..." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            upcomingAppointments.slice(0, 3).map((appointment) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border bg-slate-50 p-5", style: { borderColor: `${specialtyInfo.color}35` }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-slate-900", children: [
                String(appointment.consultationType || appointment.consultation_type || "consultation").replace("_", " "),
                " with ",
                appointment.doctorName || appointment.doctor_name || appointment.doctorId || appointment.doctor_id
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600 mt-1", children: new Date(appointment.scheduledDate || appointment.scheduled_date).toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold mt-2", style: { color: specialtyInfo.color }, children: appointment.status })
            ] }, appointment.id)),
            upcomingAppointments.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "No upcoming appointments yet." })
          ] })
        ] })
      ] })
    ] }),
    activeTab === "appointments" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-8 lg:grid-cols-[1fr_0.9fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AppointmentScheduler, { patientId: patient.id, onScheduled: handleAppointmentCreated }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-slate-900 mb-4", children: "Your Appointments" }),
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "Loading appointments..." }) : appointments.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "No appointments scheduled yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: appointments.map((appointment) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border bg-slate-50 p-5", style: { borderColor: selectedConsultationId === appointment.id ? specialtyInfo.color : void 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-slate-900", children: appointment.doctorName || appointment.doctor_name || appointment.doctorId || appointment.doctor_id }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600", children: String(appointment.consultationType || appointment.consultation_type || "consultation").replace("_", " ") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full px-3 py-1 text-xs font-semibold uppercase", style: { backgroundColor: specialtyInfo.bgColor, color: specialtyInfo.color }, children: appointment.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-slate-600", children: new Date(appointment.scheduledDate || appointment.scheduled_date).toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setSelectedConsultationId(appointment.id),
              className: "mt-4 rounded-full px-4 py-2 text-sm font-semibold text-white",
              style: { backgroundColor: specialtyInfo.color },
              children: "Open chat for this appointment"
            }
          )
        ] }, appointment.id)) })
      ] }) })
    ] }),
    activeTab === "files" && /* @__PURE__ */ jsxRuntimeExports.jsx(PatientFileManager, { patientId: patient.id }),
    activeTab === "prescriptions" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      PrescriptionManager,
      {
        patientId: patient.id,
        patientName: patient.name
      }
    ),
    activeTab === "labs" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      LabRequestManager,
      {
        patientId: patient.id,
        patientName: patient.name
      }
    ),
    activeTab === "review-pdf" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Clinical Review Download" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Download your uploaded files summary, reviews, referrals, vitals, and lab requests as a printable PDF." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PatientClinicalSummaryDownload, { patient }) })
    ] }),
    activeTab === "chat" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ChatPanel,
      {
        consultationId: activeConsultationId,
        userId: patient.id,
        userType: "patient",
        recipientId: ((_a = appointments.find((appt) => appt.id === selectedConsultationId)) == null ? void 0 : _a.doctorId) || ((_b = appointments.find((appt) => appt.id === selectedConsultationId)) == null ? void 0 : _b.doctor_id) || (selectedDoctor == null ? void 0 : selectedDoctor.id) || "",
        recipientType: "doctor",
        patientId: patient.id,
        doctorId: ((_c = appointments.find((appt) => appt.id === selectedConsultationId)) == null ? void 0 : _c.doctorId) || ((_d = appointments.find((appt) => appt.id === selectedConsultationId)) == null ? void 0 : _d.doctor_id) || (selectedDoctor == null ? void 0 : selectedDoctor.id) || ""
      }
    ),
    activeTab === "video" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        VideoChatPanel,
        {
          consultationId: activeConsultationId,
          userId: patient.id,
          userType: "patient",
          patientId: patient.id,
          doctorId: (activeConsultation == null ? void 0 : activeConsultation.doctorId) || (activeConsultation == null ? void 0 : activeConsultation.doctor_id) || (selectedDoctor == null ? void 0 : selectedDoctor.id) || ""
        }
      ),
      liveConsultationActive ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          LiveDocumentAlerts,
          {
            consultationId: activeConsultationId,
            patientId: patient.id,
            patientName: patient.name,
            doctor: selectedDoctor
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          VitalParametersMonitor,
          {
            consultationId: activeConsultationId,
            patientId: patient.id,
            doctorId: (activeConsultation == null ? void 0 : activeConsultation.doctorId) || (activeConsultation == null ? void 0 : activeConsultation.doctor_id) || (selectedDoctor == null ? void 0 : selectedDoctor.id) || "",
            userType: "patient",
            compact: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-5 shadow-lg shadow-slate-200/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-slate-900", children: "Live chat" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: "Chat stays below the video so the consultation is not interrupted." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            ChatPanel,
            {
              consultationId: activeConsultationId,
              userId: patient.id,
              userType: "patient",
              recipientId: (activeConsultation == null ? void 0 : activeConsultation.doctorId) || (activeConsultation == null ? void 0 : activeConsultation.doctor_id) || (selectedDoctor == null ? void 0 : selectedDoctor.id) || "",
              recipientType: "doctor",
              patientId: patient.id,
              doctorId: (activeConsultation == null ? void 0 : activeConsultation.doctorId) || (activeConsultation == null ? void 0 : activeConsultation.doctor_id) || (selectedDoctor == null ? void 0 : selectedDoctor.id) || ""
            }
          ) })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-lg shadow-slate-200/40", children: "This consultation has ended. Live prompts and quick downloads are hidden here, but prescriptions and lab requests remain saved in their normal tabs." })
    ] }),
    activeTab === "tokens" && /* @__PURE__ */ jsxRuntimeExports.jsx(TokenManager, { patient, onTokensUpdated: handleTokensUpdated }),
    activeTab === "manuals" && /* @__PURE__ */ jsxRuntimeExports.jsx(ManualDownload, { userType: "patient" }),
    activeTab === "accessibility" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Accessibility Settings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Customize your experience for better accessibility" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowAccessibilityPanel(true),
            className: "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors",
            children: "Open Settings"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-gray-900", children: "Available Features" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Voice commands for navigation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Screen reader support" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• High contrast mode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Large text options" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Audio descriptions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Visual guides" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-gray-900", children: "Emergency Access" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-800 mb-3", children: "Quick access to emergency services and visual communication aids." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: handleEmergencyCall,
                className: "w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors",
                children: "Emergency Support"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AccessibilityPanel,
      {
        isOpen: showAccessibilityPanel,
        onClose: () => setShowAccessibilityPanel(false),
        userType: "patient"
      }
    )
  ] });
}
export {
  PatientDashboard as default
};
