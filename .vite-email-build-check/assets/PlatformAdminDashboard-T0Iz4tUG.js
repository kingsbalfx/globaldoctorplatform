import { r as reactExports, j as jsxRuntimeExports } from "./react-Bu4vr6vE.js";
import { u as useError, a as apiFetch } from "./index-DCY3-JaP.js";
import { D as DoctorCommunityChat } from "./DoctorCommunityChat-DiURVkop.js";
import { g as getSpecialtyInfo, a as getSpecialtyLogo } from "./specialtyRegistry-mMIpmDWJ.js";
import { COUNTRIES } from "./DoctorAuth-WJe3NkVQ.js";
import { P as PortalArtBanner } from "./TelehealthArt-DC0HZ32N.js";
import "./vendor-Qe2gXTEC.js";
import "./icons-Ci-JEzBE.js";
import "./i18n-D-V3U9NC.js";
import "./GoogleSignInButton-Um7n1y8i.js";
import "./supabaseClient-iq1FVAJ-.js";
import "./supabase-CHf_0O8y.js";
const specialties = ["General Practitioner", "Neurology", "Urology", "Gynaecologist", "Cardiology", "Dermatology", "Psychiatry", "Pediatrics", "Oncology", "Orthopedics", "Obstetrics & GYN", "Ophthalmology"];
const emptyForm = {
  id: "",
  email: "",
  password: "",
  name: "",
  gender: "",
  specialty: "General Practitioner",
  location: "",
  languages: "English",
  fee: "50",
  licenseNumber: "",
  licenseIssuer: "",
  licenseExpiry: "",
  bankCode: "",
  bankAccount: "",
  currency: "",
  signatureDataUrl: "",
  passportDataUrl: ""
};
function doctorToForm(doctor) {
  return {
    id: doctor.id || "",
    email: doctor.email || "",
    password: "",
    name: doctor.name || "",
    gender: doctor.gender || doctor.sex || "",
    specialty: doctor.specialty || "General Practitioner",
    location: doctor.location || "",
    languages: Array.isArray(doctor.languages) ? doctor.languages.join(", ") : "English",
    fee: String(doctor.fee || doctor.consultation_fee || 50),
    licenseNumber: doctor.license_number || doctor.licenseNumber || "",
    licenseIssuer: doctor.license_issuer || "",
    licenseExpiry: doctor.license_expiry ? String(doctor.license_expiry).slice(0, 10) : "",
    bankCode: doctor.bank_code || "",
    bankAccount: doctor.bank_account || "",
    currency: doctor.currency || "",
    signatureDataUrl: doctor.signature_data_url || "",
    passportDataUrl: doctor.passport_data_url || ""
  };
}
function DoctorManagement({ adminHeaders }) {
  const { addError } = useError();
  const [showForm, setShowForm] = reactExports.useState(false);
  const [doctors, setDoctors] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState(emptyForm);
  const [statusDraft, setStatusDraft] = reactExports.useState(null);
  const [deleteDoctorId, setDeleteDoctorId] = reactExports.useState("");
  const formRef = reactExports.useRef(null);
  const canManage = Boolean(adminHeaders);
  const pendingDoctors = reactExports.useMemo(() => doctors.filter((doctor) => !doctor.verified), [doctors]);
  const approvedDoctors = reactExports.useMemo(() => doctors.filter((doctor) => doctor.verified), [doctors]);
  reactExports.useEffect(() => {
    if (canManage) void fetchDoctorList();
  }, [canManage]);
  const fetchDoctorList = async () => {
    setLoading(true);
    try {
      const response = await apiFetch("/api/admin/doctors", { headers: adminHeaders });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to load doctors");
      setDoctors(Array.isArray(data.doctors) ? data.doctors : []);
    } catch (error) {
      addError(error.message, "error");
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handleImageUpload = (field, file, maxKb) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addError("Upload an image file.", "warning");
      return;
    }
    if (file.size > maxKb * 1024) {
      addError(`Image must be ${maxKb}KB or less.`, "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => handleChange(field, String(reader.result || ""));
    reader.onerror = () => addError("Could not read image file.", "error");
    reader.readAsDataURL(file);
  };
  const resetForm = () => {
    setFormData(emptyForm);
    setShowForm(false);
  };
  const handleEdit = (doctor) => {
    setFormData(doctorToForm(doctor));
    setShowForm(true);
    window.setTimeout(() => {
      var _a;
      return (_a = formRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };
  const handleSubmitDoctor = async (event) => {
    event.preventDefault();
    setLoading(true);
    const editing = Boolean(formData.id);
    try {
      const response = await apiFetch(editing ? `/api/admin/doctors/${encodeURIComponent(formData.id)}` : "/api/admin/doctors", {
        method: editing ? "PATCH" : "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          ...formData,
          languages: formData.languages.split(",").map((item) => item.trim()).filter(Boolean),
          consultation_fee: Number(formData.fee) || 50
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Failed to save doctor");
      await fetchDoctorList();
      resetForm();
      addError(editing ? "Doctor updated." : "Doctor added, approved, and notified by email when SMTP is configured.", "success");
    } catch (error) {
      addError(error.message, "error");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteDoctor = async (doctorId) => {
    setLoading(true);
    try {
      const response = await apiFetch(`/api/admin/doctors/${encodeURIComponent(doctorId)}`, {
        method: "DELETE",
        headers: adminHeaders
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to delete doctor");
      setDoctors((current) => current.filter((doctor) => doctor.id !== doctorId));
      setDeleteDoctorId("");
      addError("Doctor deleted.", "success");
    } catch (error) {
      addError(error.message, "error");
    } finally {
      setLoading(false);
    }
  };
  const handleApproveDoctor = async (doctorId) => {
    var _a, _b;
    setLoading(true);
    try {
      const response = await apiFetch(`/api/admin/doctors/${encodeURIComponent(doctorId)}/verify`, {
        method: "PATCH",
        headers: adminHeaders
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Failed to approve doctor");
      setDoctors((current) => current.map((doctor) => doctor.id === doctorId ? result.doctor : doctor));
      addError(((_a = result.email) == null ? void 0 : _a.sent) ? "Doctor approved and email sent." : `Doctor approved. Email notice was not sent: ${((_b = result.email) == null ? void 0 : _b.reason) || "SMTP not configured"}`, "success");
    } catch (error) {
      addError(error.message, "error");
    } finally {
      setLoading(false);
    }
  };
  const openDoctorStatusPanel = (doctor, status) => {
    if (status === "active") {
      void submitDoctorStatus(doctor, status, "");
      return;
    }
    setStatusDraft({
      doctorId: doctor.id,
      status,
      reason: doctor.suspension_reason || doctor.suspensionReason || "Account paused pending platform admin review."
    });
  };
  const submitDoctorStatus = async (doctor, status, reason) => {
    setLoading(true);
    try {
      const response = await apiFetch(`/api/admin/doctors/${encodeURIComponent(doctor.id)}/account-status`, {
        method: "PATCH",
        headers: adminHeaders,
        body: JSON.stringify({ status, reason })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Failed to update doctor account status");
      setDoctors((current) => current.map((item) => item.id === doctor.id ? result.doctor : item));
      setStatusDraft(null);
      addError(status === "active" ? "Doctor resumed." : status === "stopped" ? "Doctor stopped and query message saved." : "Doctor paused and query message saved.", "success");
    } catch (error) {
      addError(error.message, "error");
    } finally {
      setLoading(false);
    }
  };
  if (!canManage) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Doctor Management" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-red-700", children: "Only the platform admin can create, edit, approve, or delete doctors." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Doctor Management" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: "Review registrations, approve access, and manage doctor profiles." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: fetchDoctorList, className: "rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200", children: "Refresh" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowForm((value) => !value), className: "rounded-full bg-brand-700 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600", children: showForm ? "Close form" : "Add doctor" })
      ] })
    ] }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { ref: formRef, onSubmit: handleSubmitDoctor, className: "mt-6 rounded-3xl bg-slate-50 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", placeholder: "Login email", value: formData.email, onChange: (e) => handleChange("email", e.target.value), className: "rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500", required: !formData.id }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: formData.id ? "New password (optional)" : "Login password", value: formData.password, onChange: (e) => handleChange("password", e.target.value), className: "rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500", required: !formData.id }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "Full name", value: formData.name, onChange: (e) => handleChange("name", e.target.value), className: "rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500", required: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: formData.gender, onChange: (e) => handleChange("gender", e.target.value), className: "rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500", required: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select sex" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "female", children: "Female" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "male", children: "Male" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "other", children: "Other / prefer not to say" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: formData.specialty, onChange: (e) => handleChange("specialty", e.target.value), className: "rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500", children: specialties.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: item, children: item }, item)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: formData.location, onChange: (e) => handleChange("location", e.target.value), className: "rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500", required: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select country" }),
          COUNTRIES.map((country) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: country, children: country }, country))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "Languages, comma separated", value: formData.languages, onChange: (e) => handleChange("languages", e.target.value), className: "rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "License number", value: formData.licenseNumber, onChange: (e) => handleChange("licenseNumber", e.target.value), className: "rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500", required: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "License issuer / council", value: formData.licenseIssuer, onChange: (e) => handleChange("licenseIssuer", e.target.value), className: "rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: formData.licenseExpiry, onChange: (e) => handleChange("licenseExpiry", e.target.value), className: "rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", placeholder: "Consultation fee", value: formData.fee, onChange: (e) => handleChange("fee", e.target.value), className: "rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500", required: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "Bank code", value: formData.bankCode, onChange: (e) => handleChange("bankCode", e.target.value), className: "rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "Bank account", value: formData.bankAccount, onChange: (e) => handleChange("bankAccount", e.target.value), className: "rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700", children: [
          "Signature image",
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/png,image/jpeg,image/webp", onChange: (e) => {
            var _a;
            return handleImageUpload("signatureDataUrl", (_a = e.target.files) == null ? void 0 : _a[0], 300);
          }, className: "mt-2 w-full text-xs", required: !formData.id && !formData.signatureDataUrl }),
          formData.signatureDataUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: formData.signatureDataUrl, alt: "Signature preview", className: "mt-2 max-h-16 object-contain" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700", children: [
          "Passport photo",
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/png,image/jpeg,image/webp", onChange: (e) => {
            var _a;
            return handleImageUpload("passportDataUrl", (_a = e.target.files) == null ? void 0 : _a[0], 500);
          }, className: "mt-2 w-full text-xs", required: !formData.id && !formData.passportDataUrl }),
          formData.passportDataUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: formData.passportDataUrl, alt: "Passport preview", className: "mt-2 h-20 w-20 rounded-2xl object-cover" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: loading, className: "rounded-2xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50", children: loading ? "Saving..." : formData.id ? "Save doctor" : "Create approved doctor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: resetForm, className: "rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100", children: "Cancel" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DoctorGrid,
      {
        title: `Pending review (${pendingDoctors.length})`,
        doctors: pendingDoctors,
        statusDraft,
        deleteDoctorId,
        onStatusDraftChange: setStatusDraft,
        onDeleteDraftChange: setDeleteDoctorId,
        onApprove: handleApproveDoctor,
        onEdit: handleEdit,
        onDelete: handleDeleteDoctor,
        onStatus: openDoctorStatusPanel,
        onSubmitStatus: submitDoctorStatus,
        loading
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DoctorGrid,
      {
        title: `Approved doctors (${approvedDoctors.length})`,
        doctors: approvedDoctors,
        statusDraft,
        deleteDoctorId,
        onStatusDraftChange: setStatusDraft,
        onDeleteDraftChange: setDeleteDoctorId,
        onApprove: handleApproveDoctor,
        onEdit: handleEdit,
        onDelete: handleDeleteDoctor,
        onStatus: openDoctorStatusPanel,
        onSubmitStatus: submitDoctorStatus,
        loading
      }
    )
  ] });
}
function DoctorGrid({ title, doctors, statusDraft, deleteDoctorId, onStatusDraftChange, onDeleteDraftChange, onApprove, onEdit, onDelete, onStatus, onSubmitStatus, loading }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-slate-900", children: title }),
    doctors.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500", children: "No doctors in this group." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: doctors.map((doctor) => {
      const specialtyInfo = getSpecialtyInfo(doctor.specialty);
      const accountStatus = doctor.account_status || doctor.accountStatus || "active";
      const isPaused = accountStatus === "paused" || accountStatus === "stopped";
      const activeDraft = (statusDraft == null ? void 0 : statusDraft.doctorId) === doctor.id ? statusDraft : null;
      const deleteDraftActive = deleteDoctorId === doctor.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 p-4 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl", children: getSpecialtyLogo(doctor.specialty) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-1 text-xs font-semibold ${doctor.verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`, children: doctor.verified ? "Approved" : "Pending" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-1 text-xs font-semibold ${isPaused ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`, children: isPaused ? accountStatus : "Active" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-slate-900", children: doctor.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", style: { color: specialtyInfo.color }, children: specialtyInfo.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-slate-500", children: doctor.email }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: doctor.location }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-slate-600", children: [
          "License: ",
          doctor.license_number || "Not supplied"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-600", children: [
          "Fee: ",
          doctor.fee || doctor.consultation_fee || 50
        ] }),
        isPaused && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700", children: doctor.suspension_reason || doctor.suspensionReason || "Paused pending admin review." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
          !doctor.verified && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onApprove(doctor.id), className: "rounded-full bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700", children: "Approve" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onEdit(doctor), className: "rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800", children: "Edit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onStatus(doctor, isPaused ? "active" : "paused"), className: `rounded-full px-3 py-2 text-xs font-semibold text-white ${isPaused ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"}`, children: isPaused ? "Resume" : "Pause" }),
          !isPaused && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onStatus(doctor, "stopped"), className: "rounded-full bg-orange-700 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-800", children: "Stop" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onDeleteDraftChange(doctor.id), className: "rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700", children: "Delete" })
        ] }),
        deleteDraftActive && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-red-800", children: [
            "Delete Dr. ",
            doctor.name,
            "?"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-red-700", children: "This removes the doctor account and profile from the platform." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                disabled: loading,
                onClick: () => onDelete(doctor.id),
                className: "rounded-full bg-red-700 px-4 py-2 text-xs font-bold text-white hover:bg-red-800 disabled:opacity-50",
                children: loading ? "Deleting..." : "Confirm delete"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => onDeleteDraftChange(""),
                className: "rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100",
                children: "Cancel"
              }
            )
          ] })
        ] }),
        activeDraft && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "mt-4 overflow-hidden rounded-3xl border bg-white shadow-lg",
            style: { borderColor: `${specialtyInfo.color}55`, boxShadow: `0 18px 40px ${specialtyInfo.color}18` },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 text-white", style: { background: `linear-gradient(135deg, ${specialtyInfo.color}, #0f172a)` }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.18em]", children: activeDraft.status === "stopped" ? "Stop doctor access" : "Pause doctor access" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm font-semibold", children: [
                  specialtyInfo.name,
                  " account control"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-slate-600", children: [
                  "This message will appear on Dr. ",
                  doctor.name,
                  "'s dashboard as the query or review reason."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "textarea",
                  {
                    value: activeDraft.reason,
                    onChange: (event) => onStatusDraftChange({ ...activeDraft, reason: event.target.value }),
                    className: "min-h-[104px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:bg-white",
                    style: { "--tw-ring-color": specialtyInfo.color },
                    placeholder: "Explain why this account is being paused or stopped..."
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      disabled: loading || !activeDraft.reason.trim(),
                      onClick: () => onSubmitStatus(doctor, activeDraft.status, activeDraft.reason),
                      className: "rounded-full px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50",
                      style: { backgroundColor: specialtyInfo.color },
                      children: loading ? "Saving..." : activeDraft.status === "stopped" ? "Confirm stop" : "Confirm pause"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => onStatusDraftChange(null),
                      className: "rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200",
                      children: "Cancel"
                    }
                  )
                ] })
              ] })
            ]
          }
        )
      ] }, doctor.id);
    }) })
  ] });
}
function FileManager({ headers = null }) {
  const { addError } = useError();
  const [files, setFiles] = reactExports.useState([]);
  const [uploading, setUploading] = reactExports.useState(false);
  const [filter, setFilter] = reactExports.useState("all");
  const [deleteFileId, setDeleteFileId] = reactExports.useState("");
  const loadFiles = async () => {
    try {
      const response = await apiFetch("/api/admin/files", { headers: headers || void 0 });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to load files");
      setFiles(Array.isArray(data.files) ? data.files : []);
    } catch (error) {
      addError(error.message, "error");
    }
  };
  reactExports.useEffect(() => {
    if (headers) void loadFiles();
  }, [headers]);
  const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",").pop() : result);
    };
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
  const handleFileUpload = async (event) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles.length) return;
    if (!headers) {
      addError("Missing admin credentials. Please log in again.", "error");
      return;
    }
    setUploading(true);
    try {
      const filesToUpload = await Promise.all(Array.from(uploadedFiles).map(async (file) => ({
        name: file.name,
        mimeType: file.type,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        contentBase64: await readFileAsBase64(file)
      })));
      const response = await apiFetch("/api/admin/files/upload", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ files: filesToUpload })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Upload failed");
      setFiles((current) => [...result.files || [], ...current]);
      addError("Files uploaded successfully.", "success");
    } catch (error) {
      addError(`Upload error: ${error.message}`, "error");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };
  const handleDeleteFile = async (fileId) => {
    try {
      const response = await apiFetch(`/api/admin/files/${fileId}`, {
        method: "DELETE",
        headers: headers || void 0
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Delete failed");
      setFiles((current) => current.filter((file) => file.id !== fileId));
      setDeleteFileId("");
      addError("File deleted.", "success");
    } catch (error) {
      addError(error.message, "error");
    }
  };
  const getFileBadge = (type) => {
    const normalizedType = String(type || "").toLowerCase();
    if (normalizedType.includes("pdf")) return "PDF";
    if (normalizedType.includes("image")) return "IMG";
    if (normalizedType.includes("video")) return "VID";
    if (normalizedType.includes("word")) return "DOC";
    return "FILE";
  };
  const filteredFiles = files.filter((file) => {
    const normalizedType = String(file.type || "").toLowerCase();
    if (filter === "documents") return normalizedType.includes("pdf") || normalizedType.includes("word");
    if (filter === "images") return normalizedType.includes("image");
    if (filter === "videos") return normalizedType.includes("video");
    return true;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Admin File Library" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: "Upload platform manuals, guides, and approved media into durable storage." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: loadFiles,
            className: "rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200",
            children: "Refresh"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "cursor-pointer rounded-full bg-brand-700 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-600", children: [
          uploading ? "Uploading..." : "Upload Files",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "file",
              multiple: true,
              onChange: handleFileUpload,
              disabled: uploading,
              className: "hidden",
              accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex flex-wrap gap-2", children: ["all", "documents", "images", "videos"].map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => setFilter(option),
        className: `rounded-full px-4 py-2 text-sm font-semibold transition ${filter === option ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`,
        children: option.charAt(0).toUpperCase() + option.slice(1)
      },
      option
    )) }),
    filteredFiles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-slate-50 p-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-600", children: "No files yet. Upload to get started." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: filteredFiles.map((file) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 p-4 transition hover:shadow-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700", children: getFileBadge(file.type) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setDeleteFileId(file.id),
            className: "rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-100",
            children: "Delete"
          }
        )
      ] }),
      deleteFileId === file.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 rounded-2xl border border-red-200 bg-red-50 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-red-800", children: "Delete this file?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => handleDeleteFile(file.id), className: "rounded-full bg-red-700 px-3 py-1.5 text-xs font-bold text-white", children: "Delete" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setDeleteFileId(""), className: "rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200", children: "Cancel" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-semibold text-slate-900", children: file.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-600", children: file.size || "Stored file" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-slate-500", children: [
        "Uploaded: ",
        file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : "Recently"
      ] })
    ] }, file.id)) })
  ] });
}
const AUDIENCES = [
  { id: "landing", label: "Landing Page" },
  { id: "patient", label: "Patient Dashboard" },
  { id: "doctor", label: "Doctor Dashboard" }
];
const SEVERITIES = [
  { id: "info", label: "Info" },
  { id: "warning", label: "Warning" },
  { id: "urgent", label: "Urgent" }
];
const formatNumber = (value) => new Intl.NumberFormat().format(Number(value || 0));
const formatMoney = (amount, currency = "NGN") => {
  const normalizedCurrency = String(currency || "NGN").toUpperCase();
  try {
    return new Intl.NumberFormat(void 0, {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: normalizedCurrency === "NGN" ? 0 : 2
    }).format(Number(amount || 0));
  } catch {
    return `${normalizedCurrency} ${formatNumber(amount)}`;
  }
};
function PlatformAdminDashboard({ adminSession, onLogout }) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R, _S, _T, _U, _V, _W, _X, _Y, _Z, __, _$, _aa, _ba, _ca, _da, _ea, _fa, _ga, _ha, _ia, _ja, _ka, _la, _ma;
  const { addError } = useError();
  const [localAdminSession, setLocalAdminSession] = reactExports.useState(() => {
    try {
      const stored = window.localStorage.getItem("gd_platform_admin_session");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const effectiveAdminSession = adminSession || localAdminSession;
  const credentials = (effectiveAdminSession == null ? void 0 : effectiveAdminSession.credentials) || null;
  const admin = (effectiveAdminSession == null ? void 0 : effectiveAdminSession.admin) || null;
  const [loginForm, setLoginForm] = reactExports.useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = reactExports.useState(false);
  const [activeSection, setActiveSection] = reactExports.useState("overview");
  const [selectedAudience, setSelectedAudience] = reactExports.useState("landing");
  const [severity, setSeverity] = reactExports.useState("info");
  const [title, setTitle] = reactExports.useState("");
  const [message, setMessage] = reactExports.useState("");
  const [expiresHours, setExpiresHours] = reactExports.useState(24);
  const [announcements, setAnnouncements] = reactExports.useState([]);
  const [deleteAnnouncementId, setDeleteAnnouncementId] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [overview, setOverview] = reactExports.useState(null);
  const [overviewLoading, setOverviewLoading] = reactExports.useState(false);
  const [config, setConfig] = reactExports.useState(null);
  const [platformPaused, setPlatformPaused] = reactExports.useState(false);
  const [platformPauseMessage, setPlatformPauseMessage] = reactExports.useState("We are sorry, GlobalDoc is currently under review or update. Please try again shortly.");
  const [smtpTestResult, setSmtpTestResult] = reactExports.useState(null);
  const [payouts, setPayouts] = reactExports.useState([]);
  const [payoutFilter, setPayoutFilter] = reactExports.useState("pending");
  const [facilities, setFacilities] = reactExports.useState([]);
  const [facilityFilter, setFacilityFilter] = reactExports.useState("");
  const [facilityStatusDraft, setFacilityStatusDraft] = reactExports.useState(null);
  const [facilityForm, setFacilityForm] = reactExports.useState({
    id: "",
    type: "phc",
    name: "",
    state: "",
    lga: "",
    address: "",
    phone: "",
    email: "",
    referral_payout_ngn: 0,
    pin: ""
  });
  const [funding, setFunding] = reactExports.useState({ facilityId: "", amount_ngn: "" });
  const [auditLogs, setAuditLogs] = reactExports.useState([]);
  const [payoutStatusDraft, setPayoutStatusDraft] = reactExports.useState(null);
  const headers = reactExports.useMemo(() => {
    if (!(credentials == null ? void 0 : credentials.email) || !(credentials == null ? void 0 : credentials.password)) return null;
    return {
      "Content-Type": "application/json",
      "x-admin-email": credentials.email,
      "x-admin-password": credentials.password
    };
  }, [credentials == null ? void 0 : credentials.email, credentials == null ? void 0 : credentials.password]);
  const handleAdminLogin = async (event) => {
    event.preventDefault();
    if (!loginForm.email.trim() || !loginForm.password) {
      addError("Enter the platform admin email and password.", "warning");
      return;
    }
    setLoginLoading(true);
    try {
      const response = await apiFetch("/api/doctors/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginForm.email.trim(),
          password: loginForm.password
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.admin) {
        throw new Error(data.error || "Admin login failed");
      }
      const session = {
        type: "admin-login",
        admin: data.admin,
        credentials: {
          email: loginForm.email.trim(),
          password: loginForm.password
        }
      };
      setLocalAdminSession(session);
      try {
        window.localStorage.setItem("gd_platform_admin_session", JSON.stringify(session));
        window.localStorage.removeItem("gd_active_portal");
      } catch {
      }
      setLoginForm({ email: "", password: "" });
      addError("Platform admin access restored.", "success");
    } catch (error) {
      addError(error.message, "error");
    } finally {
      setLoginLoading(false);
    }
  };
  const loadConfig = async () => {
    var _a2, _b2;
    try {
      const response = await apiFetch(`/api/config`);
      const data = await response.json().catch(() => null);
      if (response.ok) {
        setConfig(data);
        setPlatformPaused(Boolean((_a2 = data == null ? void 0 : data.platform) == null ? void 0 : _a2.paused));
        if ((_b2 = data == null ? void 0 : data.platform) == null ? void 0 : _b2.message) setPlatformPauseMessage(data.platform.message);
      }
    } catch {
    }
  };
  const loadOverview = async () => {
    if (!headers) return;
    setOverviewLoading(true);
    try {
      const response = await apiFetch("/api/admin/overview", { headers });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to load overview");
      setOverview(data.overview || null);
    } catch (error) {
      setOverview(null);
      if (activeSection === "overview") addError(error.message, "error");
    } finally {
      setOverviewLoading(false);
    }
  };
  const loadAnnouncements = async (audience) => {
    setLoading(true);
    try {
      const response = await apiFetch(`/api/announcements?audience=${encodeURIComponent(audience)}`);
      const data = await response.json().catch(() => ({}));
      setAnnouncements(Array.isArray(data.announcements) ? data.announcements : []);
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };
  const publishAnnouncement = async (event) => {
    event.preventDefault();
    if (!headers) {
      addError("Missing admin credentials. Please log in again.", "error");
      return;
    }
    if (!title.trim() || !message.trim()) {
      addError("Title and message are required.", "warning");
      return;
    }
    const expiresAt = expiresHours && Number(expiresHours) > 0 ? new Date(Date.now() + Number(expiresHours) * 60 * 60 * 1e3).toISOString() : null;
    setLoading(true);
    try {
      const response = await apiFetch(`/api/admin/announcements`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          audience: selectedAudience,
          severity,
          title: title.trim(),
          message: message.trim(),
          expires_at: expiresAt
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to publish announcement");
      setTitle("");
      setMessage("");
      await loadAnnouncements(selectedAudience);
      addError("Announcement published to the selected audience.", "success");
    } catch (err) {
      addError(err.message, "error");
    } finally {
      setLoading(false);
    }
  };
  const savePlatformPause = async () => {
    if (!headers) return;
    setLoading(true);
    try {
      const response = await apiFetch("/api/admin/settings", {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          platformPaused,
          platformPauseMessage
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to save platform pause setting");
      await loadConfig();
      addError(platformPaused ? "Platform activity paused. Landing page and AI assistance remain available." : "Platform activity resumed.", "success");
    } catch (err) {
      addError(err.message, "error");
    } finally {
      setLoading(false);
    }
  };
  const testSmtp = async () => {
    var _a2, _b2, _c2;
    if (!headers) return;
    setLoading(true);
    setSmtpTestResult(null);
    try {
      const response = await apiFetch("/api/admin/smtp/test", {
        method: "POST",
        headers,
        body: JSON.stringify({ to: (admin == null ? void 0 : admin.email) || (credentials == null ? void 0 : credentials.email) })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "SMTP test failed");
      setSmtpTestResult(data);
      addError(((_a2 = data.email) == null ? void 0 : _a2.sent) ? "SMTP test email sent." : ((_b2 = data.email) == null ? void 0 : _b2.reason) || "SMTP test completed without sending.", ((_c2 = data.email) == null ? void 0 : _c2.sent) ? "success" : "warning");
    } catch (err) {
      setSmtpTestResult({ error: err.message });
      addError(err.message, "error");
    } finally {
      setLoading(false);
    }
  };
  const deleteAnnouncement = async (id) => {
    if (!headers) return;
    setLoading(true);
    try {
      const response = await apiFetch(`/api/admin/announcements/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to delete announcement");
      setDeleteAnnouncementId("");
      await loadAnnouncements(selectedAudience);
    } catch (err) {
      addError(err.message, "error");
    } finally {
      setLoading(false);
    }
  };
  const loadFacilities = async () => {
    if (!headers) return;
    setLoading(true);
    try {
      const url = facilityFilter ? `/api/facilities?type=${encodeURIComponent(facilityFilter)}` : "/api/facilities";
      const response = await apiFetch(url, { headers });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to load facilities");
      setFacilities(Array.isArray(data.facilities) ? data.facilities : []);
    } catch {
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };
  const resetFacilityForm = () => {
    setFacilityForm({
      id: "",
      type: "phc",
      name: "",
      state: "",
      lga: "",
      address: "",
      phone: "",
      email: "",
      referral_payout_ngn: 0,
      pin: ""
    });
  };
  const editFacility = (facility) => {
    setFacilityForm({
      id: facility.id || "",
      type: facility.type || "phc",
      name: facility.name || "",
      state: facility.state || "",
      lga: facility.lga || "",
      address: facility.address || "",
      phone: facility.phone || "",
      email: facility.email || "",
      referral_payout_ngn: facility.referral_payout_ngn || 0,
      pin: facility.pin || ""
    });
  };
  const saveFacility = async (event) => {
    var _a2;
    event.preventDefault();
    if (!headers) return;
    if (!facilityForm.name.trim()) {
      addError("Facility name is required.", "warning");
      return;
    }
    setLoading(true);
    try {
      const editing = Boolean(facilityForm.id);
      const response = await apiFetch(editing ? `/api/admin/facilities/${encodeURIComponent(facilityForm.id)}` : `/api/facilities`, {
        method: editing ? "PATCH" : "POST",
        headers,
        body: JSON.stringify({
          ...facilityForm,
          id: void 0,
          name: facilityForm.name.trim(),
          referral_payout_ngn: Number(facilityForm.referral_payout_ngn) || 0
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to create facility");
      resetFacilityForm();
      await loadFacilities();
      addError(editing ? "Facility updated." : `Facility created. PIN: ${((_a2 = data.facility) == null ? void 0 : _a2.pin) || "(hidden)"}`, "success");
    } catch (err) {
      addError(err.message, "error");
    } finally {
      setLoading(false);
    }
  };
  const fundFacility = async (event) => {
    event.preventDefault();
    if (!headers) return;
    if (!funding.facilityId) {
      addError("Select a facility to fund.", "warning");
      return;
    }
    const amount = Math.round(Number(funding.amount_ngn) || 0);
    if (amount <= 0) {
      addError("Enter a valid NGN amount.", "warning");
      return;
    }
    setLoading(true);
    try {
      const response = await apiFetch(`/api/admin/facilities/${encodeURIComponent(funding.facilityId)}/fund`, {
        method: "POST",
        headers,
        body: JSON.stringify({ amount_ngn: amount })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Funding failed");
      setFunding({ facilityId: "", amount_ngn: "" });
      await loadFacilities();
      addError("Wallet funded.", "success");
    } catch (err) {
      addError(err.message, "error");
    } finally {
      setLoading(false);
    }
  };
  const openFacilityStatusPanel = (facility, active) => {
    if (active) {
      void updateFacilityStatus(facility, active, "");
      return;
    }
    setFacilityStatusDraft({
      facilityId: facility.id,
      active,
      reason: facility.suspension_reason || "Facility paused pending platform admin review."
    });
  };
  const updateFacilityStatus = async (facility, active, reason = "") => {
    if (!headers) return;
    setLoading(true);
    try {
      const response = await apiFetch(`/api/admin/facilities/${encodeURIComponent(facility.id)}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          is_active: active,
          suspension_reason: active ? "" : reason
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to update facility status");
      setFacilities((current) => current.map((item) => item.id === facility.id ? { ...item, ...data.facility } : item));
      setFacilityStatusDraft(null);
      addError(active ? "Facility resumed." : "Facility paused.", "success");
    } catch (err) {
      addError(err.message, "error");
    } finally {
      setLoading(false);
    }
  };
  const loadPayouts = async () => {
    if (!headers) return;
    setLoading(true);
    try {
      const response = await apiFetch(`/api/admin/payouts?status=${encodeURIComponent(payoutFilter)}`, { headers });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to load payout requests");
      setPayouts(Array.isArray(data.payouts) ? data.payouts : []);
    } catch (err) {
      setPayouts([]);
      addError(err.message, "error");
    } finally {
      setLoading(false);
    }
  };
  const openPayoutStatusPanel = (payout, status) => {
    const needsFailureReason = ["rejected", "failed"].includes(status);
    setPayoutStatusDraft({
      payoutId: payout.id,
      status,
      note: needsFailureReason ? payout.admin_note || "Payout could not be completed." : payout.provider_reference || payout.admin_note || ""
    });
  };
  const updatePayoutStatus = async (payout, status, note = "") => {
    if (!headers) return;
    setLoading(true);
    try {
      const response = await apiFetch(`/api/admin/payouts/${encodeURIComponent(payout.id)}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          status,
          note,
          providerReference: ["paid", "completed", "processing"].includes(status) ? note : payout.provider_reference || ""
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to update payout");
      setPayoutStatusDraft(null);
      await loadPayouts();
      addError(data.message || "Payout updated.", "success");
    } catch (err) {
      addError(err.message, "error");
    } finally {
      setLoading(false);
    }
  };
  const loadAuditLogs = async () => {
    if (!headers) return;
    setLoading(true);
    try {
      const response = await apiFetch(`/api/admin/audit-logs`, { headers });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to load audit logs");
      setAuditLogs(Array.isArray(data.auditLogs) ? data.auditLogs : []);
    } catch {
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    if (!effectiveAdminSession) return;
    void loadConfig();
    void loadOverview();
    void loadAnnouncements(selectedAudience);
  }, [effectiveAdminSession, selectedAudience, headers]);
  reactExports.useEffect(() => {
    if (!effectiveAdminSession) return;
    if (activeSection === "overview") void loadOverview();
    if (activeSection === "facilities") void loadFacilities();
    if (activeSection === "payouts") void loadPayouts();
    if (activeSection === "audit") void loadAuditLogs();
  }, [effectiveAdminSession, activeSection, facilityFilter, payoutFilter]);
  if (!effectiveAdminSession || !admin || admin.role !== "admin") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto mt-16 max-w-4xl px-6 pb-20 sm:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-950 px-8 py-8 text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.24em] text-cyan-200", children: "Admin recovery access" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 text-3xl font-bold", children: "Platform Admin Login" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-300", children: "Admin login remains available even when the platform is paused, so you can resume service safely." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleAdminLogin, className: "space-y-4 p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-left text-sm font-semibold text-slate-700", children: [
          "Admin email",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "email",
              value: loginForm.email,
              onChange: (event) => setLoginForm((value) => ({ ...value, email: event.target.value })),
              className: "mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500",
              autoComplete: "username",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-left text-sm font-semibold text-slate-700", children: [
          "Password",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "password",
              value: loginForm.password,
              onChange: (event) => setLoginForm((value) => ({ ...value, password: event.target.value })),
              className: "mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500",
              autoComplete: "current-password",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: loginLoading,
            className: "w-full rounded-2xl bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60",
            children: loginLoading ? "Checking access..." : "Open admin dashboard"
          }
        )
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto mt-16 max-w-7xl px-6 pb-20 sm:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PortalArtBanner,
      {
        theme: "admin",
        title: "Platform governance with clinical trust",
        body: "Review doctors, publish announcements, manage facilities, inspect audit trails, and keep operations readable for a growing telehealth network.",
        className: "mb-8"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-xl shadow-slate-900/20 mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Platform Admin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-slate-200", children: [
          "Signed in as ",
          admin.name,
          " (",
          admin.email,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onLogout,
          className: "rounded-full bg-white/10 hover:bg-white/15 px-6 py-3 text-sm font-semibold text-white transition",
          children: "Logout"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 flex flex-wrap gap-2", children: [
      { id: "overview", label: "Overview" },
      { id: "doctors", label: "Doctors" },
      { id: "broadcasts", label: "Broadcasts" },
      { id: "facilities", label: "Facilities" },
      { id: "payouts", label: "Payouts" },
      { id: "files", label: "Files" },
      { id: "community", label: "Doctor Community" },
      { id: "audit", label: "Audit Logs" }
    ].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => setActiveSection(tab.id),
        className: `rounded-full px-5 py-2 text-sm font-semibold transition ${activeSection === tab.id ? "bg-brand-700 text-white" : "bg-white text-slate-700 border border-slate-200 hover:border-brand-300"}`,
        children: tab.label
      },
      tab.id
    )) }),
    activeSection === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
        { label: "Total registered users", value: (_a = overview == null ? void 0 : overview.users) == null ? void 0 : _a.total, hint: "Patients + doctors + facilities", tone: "from-brand-700 to-cyan-600" },
        { label: "Patients registered", value: (_b = overview == null ? void 0 : overview.users) == null ? void 0 : _b.patients, hint: `${formatNumber((_c = overview == null ? void 0 : overview.patients) == null ? void 0 : _c.today)} today, ${formatNumber((_d = overview == null ? void 0 : overview.patients) == null ? void 0 : _d.thisWeek)} this week`, tone: "from-emerald-600 to-teal-500" },
        { label: "Doctors registered", value: (_e = overview == null ? void 0 : overview.users) == null ? void 0 : _e.doctors, hint: `${formatNumber((_f = overview == null ? void 0 : overview.doctors) == null ? void 0 : _f.verified)} verified, ${formatNumber((_g = overview == null ? void 0 : overview.doctors) == null ? void 0 : _g.pending)} pending`, tone: "from-blue-700 to-indigo-500" },
        { label: "Facilities registered", value: (_h = overview == null ? void 0 : overview.users) == null ? void 0 : _h.facilities, hint: `${formatNumber((_i = overview == null ? void 0 : overview.facilities) == null ? void 0 : _i.active)} active, ${formatNumber((_j = overview == null ? void 0 : overview.facilities) == null ? void 0 : _j.paused)} paused`, tone: "from-amber-600 to-orange-500" }
      ].map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-1.5 bg-gradient-to-r ${card.tone}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-500", children: card.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-4xl font-black text-slate-950", children: overviewLoading ? "..." : formatNumber(card.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: card.hint })
        ] })
      ] }, card.label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-3 xl:grid-cols-6", children: [
        ["Online doctors", (_k = overview == null ? void 0 : overview.users) == null ? void 0 : _k.onlineDoctors],
        ["Online patients", (_l = overview == null ? void 0 : overview.users) == null ? void 0 : _l.onlinePatients],
        ["Consultations", (_m = overview == null ? void 0 : overview.activity) == null ? void 0 : _m.consultations],
        ["Completed consults", (_n = overview == null ? void 0 : overview.activity) == null ? void 0 : _n.consultationsCompleted],
        ["Live consults", (_o = overview == null ? void 0 : overview.activity) == null ? void 0 : _o.consultationsInProgress],
        ["Appointments", (_p = overview == null ? void 0 : overview.activity) == null ? void 0 : _p.appointments],
        ["Scheduled appointments", (_q = overview == null ? void 0 : overview.activity) == null ? void 0 : _q.appointmentsScheduled],
        ["Payments", (_r = overview == null ? void 0 : overview.activity) == null ? void 0 : _r.payments],
        ["Pending payments", (_s = overview == null ? void 0 : overview.activity) == null ? void 0 : _s.pendingPayments],
        ["Failed payments", (_t = overview == null ? void 0 : overview.activity) == null ? void 0 : _t.failedPayments],
        ["Referrals", (_u = overview == null ? void 0 : overview.activity) == null ? void 0 : _u.referrals],
        ["Pending payouts", (_v = overview == null ? void 0 : overview.activity) == null ? void 0 : _v.pendingPayouts],
        ["Paid payouts", (_w = overview == null ? void 0 : overview.activity) == null ? void 0 : _w.paidPayouts],
        ["Rejected payouts", (_x = overview == null ? void 0 : overview.activity) == null ? void 0 : _x.rejectedPayouts],
        ["Prescriptions", (_y = overview == null ? void 0 : overview.activity) == null ? void 0 : _y.prescriptions],
        ["Lab orders", (_z = overview == null ? void 0 : overview.activity) == null ? void 0 : _z.labOrders],
        ["Vital requests", (_A = overview == null ? void 0 : overview.activity) == null ? void 0 : _A.vitalRequests],
        ["Platform admins", (_B = overview == null ? void 0 : overview.users) == null ? void 0 : _B.admins],
        ["Audit logs", (_C = overview == null ? void 0 : overview.activity) == null ? void 0 : _C.auditLogs]
      ].map(([label, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-[0.16em] text-slate-500", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-2xl font-black text-slate-950", children: overviewLoading ? "..." : formatNumber(value) })
      ] }, label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-8 lg:grid-cols-[1fr_1fr]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-slate-900", children: "Financial snapshot" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: "Payment volume and consultation revenue split totals." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid gap-3 sm:grid-cols-2", children: [
            Object.entries(((_D = overview == null ? void 0 : overview.finance) == null ? void 0 : _D.paymentsByCurrency) || { NGN: 0 }).map(([currency, amount]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-slate-50 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-[0.16em] text-slate-500", children: "All payments" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-2xl font-black text-slate-950", children: formatMoney(amount, currency) })
            ] }, currency)),
            Object.entries(((_E = overview == null ? void 0 : overview.finance) == null ? void 0 : _E.successfulPaymentsByCurrency) || { NGN: 0 }).map(([currency, amount]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-emerald-50 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-[0.16em] text-emerald-700", children: "Successful payments" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-2xl font-black text-slate-950", children: formatMoney(amount, currency) })
            ] }, `success-${currency}`))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5", children: [
            ["Total NGN", (_G = (_F = overview == null ? void 0 : overview.finance) == null ? void 0 : _F.revenueNgn) == null ? void 0 : _G.totalNgn],
            ["Doctor NGN", (_I = (_H = overview == null ? void 0 : overview.finance) == null ? void 0 : _H.revenueNgn) == null ? void 0 : _I.doctorNgn],
            ["Platform NGN", (_K = (_J = overview == null ? void 0 : overview.finance) == null ? void 0 : _J.revenueNgn) == null ? void 0 : _K.platformNgn],
            ["Facility NGN", (_M = (_L = overview == null ? void 0 : overview.finance) == null ? void 0 : _L.revenueNgn) == null ? void 0 : _M.facilityNgn],
            ["Data fee NGN", (_O = (_N = overview == null ? void 0 : overview.finance) == null ? void 0 : _N.revenueNgn) == null ? void 0 : _O.dataFeeNgn]
          ].map(([label, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-black uppercase tracking-[0.14em] text-slate-500", children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-lg font-black text-slate-950", children: formatMoney(value, "NGN") })
          ] }, label)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-slate-900", children: "Recent payments" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: "Latest token, subscription, and consultation payment events." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 space-y-3", children: [
            (((_P = overview == null ? void 0 : overview.recent) == null ? void 0 : _P.payments) || []).slice(0, 8).map((payment) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-slate-900", children: payment.payment_type || payment.type || "Payment" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-500", children: [
                  payment.patient_id || payment.doctor_id || "account",
                  " - ",
                  new Date(payment.created_at).toLocaleString()
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-black text-slate-950", children: formatMoney(payment.amount, payment.currency) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs font-bold uppercase text-slate-500", children: payment.status || "pending" })
              ] })
            ] }) }, payment.id)),
            !overviewLoading && (((_Q = overview == null ? void 0 : overview.recent) == null ? void 0 : _Q.payments) || []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-2xl bg-slate-50 p-4 text-sm text-slate-500", children: "No payment activity yet." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-8 lg:grid-cols-[1fr_1fr]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-slate-900", children: "Activity pulse" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: "Consultations and core transactions across the platform." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: loadOverview,
                className: "rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200",
                children: "Refresh"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid gap-3 sm:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-slate-50 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Today" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-2xl font-black text-slate-950", children: formatNumber((_R = overview == null ? void 0 : overview.activity) == null ? void 0 : _R.consultationsToday) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "consultations" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-slate-50 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "7 days" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-2xl font-black text-slate-950", children: formatNumber((_S = overview == null ? void 0 : overview.activity) == null ? void 0 : _S.consultationsThisWeek) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "consultations" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-slate-50 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Successful" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-2xl font-black text-slate-950", children: formatNumber((_T = overview == null ? void 0 : overview.activity) == null ? void 0 : _T.successfulPayments) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "payments" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-3", children: [
            (((_U = overview == null ? void 0 : overview.recent) == null ? void 0 : _U.consultations) || []).slice(0, 5).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-slate-900", children: [
                item.channel || item.track || "Consultation",
                " - ",
                item.status || "unknown"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-500", children: [
                item.patient_id || "patient",
                " with ",
                item.doctor_id || "doctor",
                " - ",
                new Date(item.created_at).toLocaleString()
              ] })
            ] }, item.id)),
            !overviewLoading && (((_V = overview == null ? void 0 : overview.recent) == null ? void 0 : _V.consultations) || []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-2xl bg-slate-50 p-4 text-sm text-slate-500", children: "No recent consultations yet." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-slate-900", children: "Recent admin activity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: "Latest audit records from platform operations." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 space-y-3", children: [
            (((_W = overview == null ? void 0 : overview.recent) == null ? void 0 : _W.auditLogs) || []).slice(0, 8).map((log) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-slate-900", children: log.action || "Activity" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-500", children: [
                log.user_type || "system",
                " ",
                log.user_id ? `- ${log.user_id}` : "",
                " - ",
                new Date(log.created_at).toLocaleString()
              ] })
            ] }, log.id)),
            !overviewLoading && (((_X = overview == null ? void 0 : overview.recent) == null ? void 0 : _X.auditLogs) || []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-2xl bg-slate-50 p-4 text-sm text-slate-500", children: "No audit activity yet." })
          ] })
        ] })
      ] }),
      (overview == null ? void 0 : overview.generatedAt) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-slate-500", children: [
        "Last generated ",
        new Date(overview.generatedAt).toLocaleString()
      ] })
    ] }),
    activeSection === "doctors" && /* @__PURE__ */ jsxRuntimeExports.jsx(DoctorManagement, { adminHeaders: headers }),
    activeSection === "files" && /* @__PURE__ */ jsxRuntimeExports.jsx(FileManager, { headers }),
    activeSection === "broadcasts" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-8 lg:grid-cols-[1fr_0.9fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Broadcast Message" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Publish an announcement to the Landing Page, Patient Dashboard, or Doctor Dashboard." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: publishAnnouncement, className: "mt-6 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
              "Audience",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  value: selectedAudience,
                  onChange: (e) => setSelectedAudience(e.target.value),
                  className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
                  children: AUDIENCES.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: item.id, children: item.label }, item.id))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
              "Severity",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  value: severity,
                  onChange: (e) => setSeverity(e.target.value),
                  className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
                  children: SEVERITIES.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: item.id, children: item.label }, item.id))
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
            "Title",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: title,
                onChange: (e) => setTitle(e.target.value),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
                placeholder: "Short headline (e.g., New clinic partnership in Kano)"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
            "Message",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                value: message,
                onChange: (e) => setMessage(e.target.value),
                className: "mt-2 min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
                placeholder: "Write the announcement..."
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
            "Auto-expire (hours)",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                min: "0",
                step: "1",
                value: expiresHours,
                onChange: (e) => setExpiresHours(e.target.value),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-slate-500", children: "Set to 0 to publish without auto-expiry." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              disabled: loading,
              className: "w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:opacity-50",
              children: loading ? "Publishing..." : "Publish announcement"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Environment status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-3 text-sm text-slate-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Origin" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: (config == null ? void 0 : config.origin) || "unknown" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Kora configured" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: ((_Y = config == null ? void 0 : config.configured) == null ? void 0 : _Y.kora) ? "Yes" : "No" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Agora configured" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: ((_Z = config == null ? void 0 : config.configured) == null ? void 0 : _Z.agora) ? "Yes" : "No" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Platform activity" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-semibold ${platformPaused ? "text-red-700" : "text-emerald-700"}`, children: platformPaused ? "Paused" : "Live" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 text-sm font-bold text-slate-900", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: platformPaused,
                  onChange: (event) => setPlatformPaused(event.target.checked),
                  className: "h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
                }
              ),
              "Pause app activity for upgrade/review"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                value: platformPauseMessage,
                onChange: (event) => setPlatformPauseMessage(event.target.value),
                className: "mt-3 min-h-[88px] w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-500",
                placeholder: "Message shown when users try to login or register"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: savePlatformPause,
                disabled: loading,
                className: "mt-3 w-full rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50",
                children: "Save platform status"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-slate-900", children: "SMTP email test" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "Sends a test email to the platform admin address and returns the provider response." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: testSmtp,
                  disabled: loading,
                  className: "rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50",
                  children: "Test"
                }
              )
            ] }),
            smtpTestResult && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 rounded-2xl bg-white p-3 text-xs text-slate-700 ring-1 ring-slate-200", children: smtpTestResult.error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-red-700", children: smtpTestResult.error }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-slate-900", children: ((__ = smtpTestResult.email) == null ? void 0 : __.sent) ? "Sent" : "Not sent" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 break-words", children: ((_$ = smtpTestResult.email) == null ? void 0 : _$.response) || ((_aa = smtpTestResult.email) == null ? void 0 : _aa.reason) || "No provider response" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-slate-500", children: [
                "Host: ",
                (_ba = smtpTestResult.smtp) == null ? void 0 : _ba.host,
                ":",
                (_ca = smtpTestResult.smtp) == null ? void 0 : _ca.port
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-slate-500", children: [
                "Credential: ",
                ((_da = smtpTestResult.smtp) == null ? void 0 : _da.credentialSource) || ((_ea = smtpTestResult.email) == null ? void 0 : _ea.credentialSource) || "Not detected",
                " · ",
                "Length: ",
                ((_fa = smtpTestResult.smtp) == null ? void 0 : _fa.passwordLength) ?? ((_ga = smtpTestResult.email) == null ? void 0 : _ga.passwordLength) ?? 0,
                " · ",
                "Gmail App Password: ",
                ((_ha = smtpTestResult.smtp) == null ? void 0 : _ha.gmailAppPasswordFormat) ?? ((_ia = smtpTestResult.email) == null ? void 0 : _ia.gmailAppPasswordFormat) ? "Valid format" : "Invalid format",
                " · ",
                "Authentication: ",
                ((_ja = smtpTestResult.smtp) == null ? void 0 : _ja.authMode) || ((_ka = smtpTestResult.email) == null ? void 0 : _ka.authMode) || "password"
              ] }),
              Array.isArray((_la = smtpTestResult.email) == null ? void 0 : _la.warnings) && smtpTestResult.email.warnings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 rounded-xl bg-amber-50 p-2 text-amber-800", children: smtpTestResult.email.warnings.map((warning) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: warning }, warning)) }),
              Array.isArray((_ma = smtpTestResult.smtp) == null ? void 0 : _ma.warnings) && smtpTestResult.smtp.warnings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 rounded-xl bg-amber-50 p-2 text-amber-800", children: smtpTestResult.smtp.warnings.map((warning) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: warning }, warning)) })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Active announcements" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => loadAnnouncements(selectedAudience),
                className: "rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200",
                children: "Refresh"
              }
            )
          ] }),
          loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-slate-500", children: "Loading..." }) : announcements.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-slate-500", children: "No active announcements for this audience." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-3", children: announcements.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-slate-900", children: item.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-600 whitespace-pre-line", children: item.message }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-[11px] text-slate-500", children: [
                  item.severity.toUpperCase(),
                  " • ",
                  new Date(item.created_at).toLocaleString()
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setDeleteAnnouncementId(item.id),
                  className: "rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700",
                  children: "Delete"
                }
              )
            ] }),
            deleteAnnouncementId === item.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl border border-red-200 bg-red-50 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-red-800", children: "Delete this announcement?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-red-700", children: "It will disappear from the selected audience immediately." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    disabled: loading,
                    onClick: () => deleteAnnouncement(item.id),
                    className: "rounded-full bg-red-700 px-4 py-2 text-xs font-bold text-white hover:bg-red-800 disabled:opacity-50",
                    children: loading ? "Deleting..." : "Confirm delete"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setDeleteAnnouncementId(""),
                    className: "rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100",
                    children: "Cancel"
                  }
                )
              ] })
            ] })
          ] }, item.id)) })
        ] })
      ] })
    ] }),
    activeSection === "facilities" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-8 lg:grid-cols-[1fr_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-slate-900", children: facilityForm.id ? "Edit facility" : "Create facility" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Add or update PHCs, private clinics, and labs." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: saveFacility, className: "mt-6 grid gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
            "Type",
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: facilityForm.type,
                onChange: (e) => setFacilityForm((p) => ({ ...p, type: e.target.value })),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "phc", children: "PHC" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "private_clinic", children: "Private clinic" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "lab", children: "Lab" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
            "Name",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: facilityForm.name,
                onChange: (e) => setFacilityForm((p) => ({ ...p, name: e.target.value })),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
                placeholder: "Facility name"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
              "State",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: facilityForm.state,
                  onChange: (e) => setFacilityForm((p) => ({ ...p, state: e.target.value })),
                  className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
                  placeholder: "e.g., Kano"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
              "LGA",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: facilityForm.lga,
                  onChange: (e) => setFacilityForm((p) => ({ ...p, lga: e.target.value })),
                  className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
                  placeholder: "e.g., Tarauni"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
            "Address",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: facilityForm.address,
                onChange: (e) => setFacilityForm((p) => ({ ...p, address: e.target.value })),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
                placeholder: "Facility address"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
              "Phone",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: facilityForm.phone,
                  onChange: (e) => setFacilityForm((p) => ({ ...p, phone: e.target.value })),
                  className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
                  placeholder: "Facility phone"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
              "Email",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "email",
                  value: facilityForm.email,
                  onChange: (e) => setFacilityForm((p) => ({ ...p, email: e.target.value })),
                  className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
                  placeholder: "facility@example.com"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
            "Referral payout (NGN)",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                min: "0",
                step: "50",
                value: facilityForm.referral_payout_ngn,
                onChange: (e) => setFacilityForm((p) => ({ ...p, referral_payout_ngn: e.target.value })),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
            "Custom PIN (optional)",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                inputMode: "numeric",
                value: facilityForm.pin,
                onChange: (e) => setFacilityForm((p) => ({ ...p, pin: e.target.value })),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
                placeholder: "6-digit PIN"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              disabled: loading,
              className: "w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50",
              children: loading ? "Saving..." : facilityForm.id ? "Save facility" : "Create facility"
            }
          ),
          facilityForm.id && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: resetFacilityForm,
              className: "w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100",
              children: "Cancel edit"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Facilities" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: facilityFilter,
                  onChange: (e) => setFacilityFilter(e.target.value),
                  className: "rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 outline-none",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "phc", children: "PHC" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "private_clinic", children: "Private clinic" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "lab", children: "Lab" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: loadFacilities,
                  className: "rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200",
                  children: "Refresh"
                }
              )
            ] })
          ] }),
          facilities.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 rounded-2xl bg-slate-50 p-6 text-slate-600", children: "No facilities yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 overflow-hidden rounded-2xl border border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-slate-50 text-slate-600", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Wallet" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "PIN" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Action" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-200", children: facilities.slice(0, 100).map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-white", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-semibold text-slate-900", children: f.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-slate-700", children: String(f.type || "").replace(/_/g, " ") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-semibold text-slate-900", children: [
                  "₦",
                  f.wallet_balance_ngn ?? 0
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs text-slate-700", children: f.pin || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-1 text-xs font-semibold ${f.is_active === false ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`, children: f.is_active === false ? "Paused" : "Active" }),
                  f.is_active === false && f.suspension_reason && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-[220px] text-xs font-semibold text-red-700", children: f.suspension_reason })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => editFacility(f),
                      className: "rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800",
                      children: "Edit"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => openFacilityStatusPanel(f, f.is_active === false),
                      className: `rounded-full px-3 py-2 text-xs font-semibold text-white ${f.is_active === false ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"}`,
                      children: f.is_active === false ? "Resume" : "Pause"
                    }
                  )
                ] }) })
              ] }),
              (facilityStatusDraft == null ? void 0 : facilityStatusDraft.facilityId) === f.id && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-amber-50/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-4 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-lg shadow-amber-900/10", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-amber-600 to-orange-500 px-5 py-3 text-white", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.18em]", children: "Pause facility access" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm font-semibold", children: [
                    f.name,
                    " review message"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 p-5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600", children: "This message will appear when the facility tries to sign in or work inside the portal." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "textarea",
                    {
                      value: facilityStatusDraft.reason,
                      onChange: (event) => setFacilityStatusDraft({ ...facilityStatusDraft, reason: event.target.value }),
                      className: "min-h-[104px] w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-900 outline-none focus:bg-white focus:border-amber-500",
                      placeholder: "Explain why this facility is paused..."
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        disabled: loading || !facilityStatusDraft.reason.trim(),
                        onClick: () => updateFacilityStatus(f, false, facilityStatusDraft.reason),
                        className: "rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50",
                        children: loading ? "Saving..." : "Confirm pause"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setFacilityStatusDraft(null),
                        className: "rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200",
                        children: "Cancel"
                      }
                    )
                  ] })
                ] })
              ] }) }) })
            ] }, f.id)) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Fund PHC/Facility wallet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: fundFacility, className: "mt-4 grid gap-3 sm:grid-cols-[1fr_0.7fr_auto] sm:items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
              "Facility",
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: funding.facilityId,
                  onChange: (e) => setFunding((p) => ({ ...p, facilityId: e.target.value })),
                  className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select facility" }),
                    facilities.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: f.id, children: [
                      f.name,
                      " (",
                      String(f.type || "").replace(/_/g, " "),
                      ")"
                    ] }, f.id))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
              "Amount (NGN)",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  step: "50",
                  value: funding.amount_ngn,
                  onChange: (e) => setFunding((p) => ({ ...p, amount_ngn: e.target.value })),
                  className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
                  placeholder: "50000"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "submit",
                disabled: loading,
                className: "rounded-2xl bg-emerald-700 px-6 py-4 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50",
                children: "Fund"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    activeSection === "payouts" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Doctor payout queue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Review withdrawal requests, mark payouts as processing or paid, and reject failed requests with automatic token refund." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: payoutFilter,
              onChange: (event) => setPayoutFilter(event.target.value),
              className: "rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 outline-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pending", children: "Pending" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "processing", children: "Processing" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "paid", children: "Paid" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "completed", children: "Completed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "rejected", children: "Rejected" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "failed", children: "Failed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: loadPayouts,
              className: "rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200",
              children: "Refresh"
            }
          )
        ] })
      ] }),
      payouts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 rounded-2xl bg-slate-50 p-6 text-sm text-slate-600", children: "No payout requests in this view." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 overflow-hidden rounded-2xl border border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-slate-50 text-slate-600", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Doctor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Destination" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Action" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-200", children: payouts.map((payout) => {
          const doctor = payout.doctor || {};
          const destination = payout.destination || {};
          const method = payout.payout_method || doctor.payout_method || "bank_account";
          const activeDraft = (payoutStatusDraft == null ? void 0 : payoutStatusDraft.payoutId) === payout.id ? payoutStatusDraft : null;
          const draftIsFailure = ["rejected", "failed"].includes(String((activeDraft == null ? void 0 : activeDraft.status) || "").toLowerCase());
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-white align-top", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-slate-900", children: doctor.name || payout.doctor_id || "Unknown doctor" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-500", children: [
                  doctor.email || "No email",
                  " ",
                  doctor.specialty ? `- ${doctor.specialty}` : ""
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 break-all font-mono text-[11px] text-slate-500", children: payout.reference || payout.id })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold text-slate-900", children: [
                  Number(payout.amount_tokens || 0).toLocaleString(),
                  " tokens"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-500", children: [
                  "$",
                  Number(payout.amount_usd || 0).toFixed(2)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-xs text-slate-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-slate-900", children: String(method).replace(/_/g, " ") }),
                method === "mobile_money" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: destination.mobile_money_operator || doctor.mobile_money_operator || "No operator" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: destination.mobile_money_number || doctor.mobile_money_number || "No number" })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                    "Bank: ",
                    destination.bank_code || doctor.bank_code || "Missing"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                    "Account: ",
                    destination.bank_account || doctor.bank_account || "Missing"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1", children: [
                  "Currency: ",
                  payout.currency || doctor.currency || "USD"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-xs font-semibold ${["paid", "completed"].includes(String(payout.status || "").toLowerCase()) ? "bg-emerald-100 text-emerald-700" : ["rejected", "failed"].includes(String(payout.status || "").toLowerCase()) ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`, children: payout.status || "pending" }),
                payout.admin_note && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-[220px] text-xs text-slate-600", children: payout.admin_note }),
                payout.provider_reference && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 break-all text-[11px] font-semibold text-slate-500", children: payout.provider_reference })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => openPayoutStatusPanel(payout, "processing"),
                    disabled: loading || ["paid", "completed", "rejected", "failed"].includes(String(payout.status || "").toLowerCase()),
                    className: "rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40",
                    children: "Processing"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => openPayoutStatusPanel(payout, "paid"),
                    disabled: loading || ["paid", "completed", "rejected", "failed"].includes(String(payout.status || "").toLowerCase()),
                    className: "rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-40",
                    children: "Mark paid"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => openPayoutStatusPanel(payout, "rejected"),
                    disabled: loading || ["paid", "completed", "rejected", "failed"].includes(String(payout.status || "").toLowerCase()),
                    className: "rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40",
                    children: "Reject/refund"
                  }
                )
              ] }) })
            ] }),
            activeDraft && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: draftIsFailure ? "bg-red-50/50" : "bg-emerald-50/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "px-4 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `overflow-hidden rounded-3xl border bg-white shadow-lg ${draftIsFailure ? "border-red-200 shadow-red-900/10" : "border-emerald-200 shadow-emerald-900/10"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `px-5 py-3 text-white ${draftIsFailure ? "bg-gradient-to-r from-red-600 to-rose-500" : "bg-gradient-to-r from-emerald-600 to-teal-500"}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.18em]", children: draftIsFailure ? "Reject and refund payout" : activeDraft.status === "paid" ? "Mark payout paid" : "Move payout to processing" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm font-semibold", children: [
                  doctor.name || payout.doctor_id || "Doctor payout",
                  " - ",
                  Number(payout.amount_tokens || 0).toLocaleString(),
                  " tokens"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 p-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600", children: draftIsFailure ? "Record the reason for rejecting this payout. Pending tokens will be returned automatically." : "Record the provider reference or admin note for this payout update." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "textarea",
                  {
                    value: activeDraft.note,
                    onChange: (event) => setPayoutStatusDraft({ ...activeDraft, note: event.target.value }),
                    className: `min-h-[104px] w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none focus:bg-white ${draftIsFailure ? "border-red-200 bg-red-50 focus:border-red-500" : "border-emerald-200 bg-emerald-50 focus:border-emerald-500"}`,
                    placeholder: draftIsFailure ? "Why is this payout rejected?" : "Provider reference or admin note"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      disabled: loading || !activeDraft.note.trim(),
                      onClick: () => updatePayoutStatus(payout, activeDraft.status, activeDraft.note),
                      className: `rounded-full px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${draftIsFailure ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`,
                      children: loading ? "Saving..." : draftIsFailure ? "Confirm reject/refund" : "Confirm update"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setPayoutStatusDraft(null),
                      className: "rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200",
                      children: "Cancel"
                    }
                  )
                ] })
              ] })
            ] }) }) })
          ] }, payout.id);
        }) })
      ] }) })
    ] }),
    activeSection === "audit" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Audit logs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: loadAuditLogs,
            className: "rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200",
            children: "Refresh"
          }
        )
      ] }),
      auditLogs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 rounded-2xl bg-slate-50 p-6 text-slate-600", children: "No audit logs yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 overflow-hidden rounded-2xl border border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-slate-50 text-slate-600", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Event" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Actor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Entity" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-200", children: auditLogs.slice(0, 200).map((log) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-slate-600", children: new Date(log.created_at).toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-semibold text-slate-900", children: log.event }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-slate-700", children: [
            log.actor_type || "-",
            " ",
            log.actor_id ? `• ${log.actor_id}` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-slate-700", children: [
            log.entity_type || "-",
            " ",
            log.entity_id ? `• ${log.entity_id}` : ""
          ] })
        ] }, log.id)) })
      ] }) })
    ] }),
    activeSection === "community" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      DoctorCommunityChat,
      {
        sender: {
          id: admin.email,
          name: admin.name || "Platform Admin",
          type: "admin",
          phone: ""
        }
      }
    )
  ] });
}
export {
  PlatformAdminDashboard as default
};
