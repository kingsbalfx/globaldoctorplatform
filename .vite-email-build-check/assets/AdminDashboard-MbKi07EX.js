import { r as reactExports, j as jsxRuntimeExports } from "./react-Bu4vr6vE.js";
import { a as apiFetch, r as readApiJson, u as useError } from "./index-DCY3-JaP.js";
import { A as AnnouncementBanner } from "./AnnouncementBanner-typdvJzp.js";
import { M as ManualDownload, V as VitalParametersMonitor, C as ChatPanel } from "./VitalParametersMonitor-D7Sg6amh.js";
import { D as DoctorCommunityChat } from "./DoctorCommunityChat-DiURVkop.js";
import { V as VideoChatPanel, P as PrescriptionManager, L as LabRequestManager } from "./LabRequestManager-Bp8fFV9d.js";
import { g as getSpecialtyInfo } from "./specialtyRegistry-mMIpmDWJ.js";
import { P as PortalArtBanner } from "./TelehealthArt-DC0HZ32N.js";
import { n as BellRing } from "./icons-Ci-JEzBE.js";
import "./vendor-Qe2gXTEC.js";
import "./i18n-D-V3U9NC.js";
const FACILITY_TYPES = [
  { id: "private_clinic", label: "Private Clinic" },
  { id: "phc", label: "PHC (Primary Health Care)" },
  { id: "lab", label: "Laboratory" }
];
function FacilityReferralManager({ doctor }) {
  const doctorId = (doctor == null ? void 0 : doctor.id) || "";
  const [facilityType, setFacilityType] = reactExports.useState("private_clinic");
  const [facilitiesForType, setFacilitiesForType] = reactExports.useState([]);
  const [facilityIndex, setFacilityIndex] = reactExports.useState([]);
  const [facilityId, setFacilityId] = reactExports.useState("");
  const [patientId, setPatientId] = reactExports.useState("");
  const [reason, setReason] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [message, setMessage] = reactExports.useState("");
  const [created, setCreated] = reactExports.useState(null);
  const [history, setHistory] = reactExports.useState([]);
  const facilityMap = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const f of facilityIndex) map.set(f.id, f);
    return map;
  }, [facilityIndex]);
  const loadFacilities = async (type) => {
    try {
      const response = await apiFetch(`/api/facilities?type=${encodeURIComponent(type)}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to load facilities");
      setFacilitiesForType(Array.isArray(data.facilities) ? data.facilities : []);
      setFacilityId("");
    } catch (err) {
      setFacilitiesForType([]);
      setFacilityId("");
      setMessage(err.message);
    }
  };
  const loadFacilityIndex = async () => {
    try {
      const response = await apiFetch(`/api/facilities`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to load facilities");
      setFacilityIndex(Array.isArray(data.facilities) ? data.facilities : []);
    } catch {
      setFacilityIndex([]);
    }
  };
  const loadHistory = async () => {
    if (!doctorId) return;
    try {
      const response = await apiFetch(`/api/referrals/facility?doctorId=${encodeURIComponent(doctorId)}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to load history");
      setHistory(Array.isArray(data.referrals) ? data.referrals : []);
    } catch (err) {
      setHistory([]);
    }
  };
  reactExports.useEffect(() => {
    void loadFacilities(facilityType);
  }, [facilityType]);
  reactExports.useEffect(() => {
    void loadHistory();
    void loadFacilityIndex();
  }, [doctorId]);
  const createReferral = async (event) => {
    event.preventDefault();
    if (!doctorId) return;
    if (!patientId.trim() || !facilityId || !reason.trim()) {
      setMessage("Patient ID, facility, and reason are required.");
      return;
    }
    setLoading(true);
    setMessage("");
    setCreated(null);
    try {
      const response = await apiFetch(`/api/referrals/facility/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          patientId: patientId.trim(),
          facilityId,
          reason: reason.trim(),
          notes: notes.trim()
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to create referral");
      setCreated(data.referral || null);
      setPatientId("");
      setReason("");
      setNotes("");
      await loadHistory();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };
  const copyCode = async () => {
    const code = created == null ? void 0 : created.code;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setMessage("Referral code copied.");
      setTimeout(() => setMessage(""), 1500);
    } catch {
      setMessage("Could not copy. Please select and copy manually.");
    }
  };
  const selectedFacility = facilityMap.get(facilityId) || null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Facility Referrals" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Create a referral code for a PHC/clinic/lab. The facility redeems the code in their portal." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: createReferral, className: "mt-6 grid gap-4 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
          "Patient ID",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: patientId,
              onChange: (e) => setPatientId(e.target.value),
              className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
              placeholder: "patient-123"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
          "Facility type",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: facilityType,
              onChange: (e) => setFacilityType(e.target.value),
              className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
              children: FACILITY_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.id, children: t.label }, t.id))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700 lg:col-span-2", children: [
          "Select facility",
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: facilityId,
              onChange: (e) => setFacilityId(e.target.value),
              className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Choose facility" }),
                facilitiesForType.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: f.id, children: [
                  f.name,
                  " ",
                  f.state ? `- ${f.state}` : "",
                  " ",
                  f.lga ? `(${f.lga})` : ""
                ] }, f.id))
              ]
            }
          ),
          selectedFacility && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-slate-500", children: [
            "Referral payout on redeem: ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-slate-700", children: [
              "₦",
              selectedFacility.referral_payout_ngn || 0
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700 lg:col-span-2", children: [
          "Reason",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: reason,
              onChange: (e) => setReason(e.target.value),
              className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
              placeholder: "e.g., needs physical exam / malaria test / blood pressure check"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700 lg:col-span-2", children: [
          "Notes (optional)",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: notes,
              onChange: (e) => setNotes(e.target.value),
              rows: 3,
              className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
              placeholder: "Add short clinical notes for the facility..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "lg:col-span-2 rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50",
            children: loading ? "Creating..." : "Create referral code"
          }
        ),
        message && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "lg:col-span-2 text-sm text-slate-600", children: message })
      ] }),
      (created == null ? void 0 : created.code) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-emerald-900", children: "Referral code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-2xl bg-white px-4 py-4 text-xl font-bold tracking-wider text-slate-900 shadow-sm", children: created.code }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: copyCode,
              className: "rounded-2xl bg-emerald-700 px-6 py-4 text-sm font-semibold text-white hover:bg-emerald-800",
              children: "Copy"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-emerald-900/80", children: "Ask the patient to show this code to the facility staff. Facility redeems it in the Facility Portal." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-slate-900", children: "Your recent facility referrals" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: loadHistory,
            className: "rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200",
            children: "Refresh"
          }
        )
      ] }),
      history.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 rounded-2xl bg-slate-50 p-6 text-slate-600", children: "No facility referrals yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 overflow-hidden rounded-2xl border border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-slate-50 text-slate-600", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Facility" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Payout" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Created" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-200", children: history.slice(0, 50).map((r) => {
          var _a;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-white", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-semibold text-slate-900", children: r.code }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-slate-700", children: ((_a = facilityMap.get(r.facility_id)) == null ? void 0 : _a.name) || r.facility_id }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-xs font-semibold uppercase ${r.status === "redeemed" ? "bg-emerald-100 text-emerald-700" : r.status === "expired" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`, children: r.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-semibold text-slate-900", children: [
              "₦",
              r.payout_ngn || 0
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-slate-600", children: new Date(r.created_at).toLocaleString() })
          ] }, r.id);
        }) })
      ] }) })
    ] })
  ] });
}
function NotificationCenter({ userId, userType }) {
  const [notifications, setNotifications] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (userId && userType) {
      loadNotifications();
    }
  }, [userId, userType]);
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/api/notifications?userId=${encodeURIComponent(userId)}&userType=${encodeURIComponent(userType)}`);
      const data = await readApiJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to load notifications");
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };
  const handleMarkRead = async (notificationId) => {
    try {
      const response = await apiFetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Unable to mark notification read");
      await loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Notifications" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "See all alerts for appointments, messages, and prescription updates." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700", children: [
        notifications.filter((item) => !item.is_read).length,
        " unread"
      ] })
    ] }) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40", children: "Loading notifications..." }) : notifications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40 text-slate-600", children: "No notifications yet. All clear!" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: notifications.map((notification) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-3xl border p-5 shadow-sm transition ${notification.is_read ? "border-slate-200 bg-slate-50" : "border-brand-200 bg-white"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-slate-900", children: notification.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600 whitespace-pre-line", children: notification.message })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-slate-400", children: String(notification.notification_type || notification.type || "notice").replace(/_/g, " ") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-slate-500", children: new Date(notification.created_at).toLocaleString() })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
        notification.related_resource_type && notification.related_resource_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600", children: [
          String(notification.related_resource_type).replace(/_/g, " "),
          ": ",
          notification.related_resource_id
        ] }),
        !notification.is_read && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleMarkRead(notification.id),
            className: "rounded-full bg-brand-700 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600",
            children: "Mark as read"
          }
        )
      ] })
    ] }, notification.id)) })
  ] });
}
function StatCard({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-slate-500", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-2xl font-bold text-slate-900", children: value })
  ] });
}
function PatientRecordReview({ initialPatientId = "", autoLoad = false }) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t;
  const [patientId, setPatientId] = reactExports.useState(initialPatientId);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [record, setRecord] = reactExports.useState(null);
  const load = async (nextPatientId = patientId) => {
    if (!nextPatientId.trim()) {
      setError("Enter a patient ID.");
      return;
    }
    setLoading(true);
    setError("");
    setRecord(null);
    try {
      const response = await apiFetch(`/api/patients/${encodeURIComponent(nextPatientId.trim())}/record`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to load patient record");
      setRecord(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const patient = (record == null ? void 0 : record.patient) || null;
  reactExports.useEffect(() => {
    setPatientId(initialPatientId);
    if (autoLoad && initialPatientId) void load(initialPatientId);
  }, [initialPatientId, autoLoad]);
  const downloadFile = async (file) => {
    const response = await apiFetch(`/api/patients/files/${encodeURIComponent(file.id)}/download?patientId=${encodeURIComponent(patient.id)}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Download failed");
    const blob = new Blob([Uint8Array.from(atob(data.contentBase64), (c) => c.charCodeAt(0))], { type: data.mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = data.name || file.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };
  const printPatientReviewPdf = () => {
    var _a2, _b2;
    const html = `<!doctype html><html><head><title>Patient Review - ${(patient == null ? void 0 : patient.name) || (patient == null ? void 0 : patient.id)}</title><style>body{font-family:Arial,sans-serif;color:#0f172a;padding:30px}h1{color:#0f766e}.box{border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin:10px 0}.label{font-size:11px;color:#64748b;text-transform:uppercase}.value{font-weight:700;margin-top:5px}table{width:100%;border-collapse:collapse;margin-top:12px}td,th{border:1px solid #e2e8f0;padding:8px;text-align:left}</style></head><body><h1>GlobalDoc Patient Review</h1><div class="box"><p class="label">Patient</p><p class="value">${(patient == null ? void 0 : patient.name) || ""} (${(patient == null ? void 0 : patient.id) || ""})</p></div><h2>Clinical Continuation Notes</h2>${((record == null ? void 0 : record.clinical_notes) || []).map((n) => `<div class="box"><p class="label">${new Date(n.created_at).toLocaleString()}</p><p class="value">Diagnosis</p><p>${n.diagnosis || ""}</p><p class="value">Plan</p><p>${n.plan || ""}</p><p>${n.follow_up || ""}</p></div>`).join("")}<h2>Vitals</h2><table><tr><th>Vital</th><th>Value</th><th>Source</th><th>Date</th></tr>${((record == null ? void 0 : record.vitals) || []).map((v) => `<tr><td>${v.parameter_name}</td><td>${v.parameter_value} ${v.unit || ""}</td><td>${v.source || ""}</td><td>${new Date(v.measured_at || v.created_at).toLocaleString()}</td></tr>`).join("")}</table><h2>Specialty Referrals</h2>${(((_a2 = record == null ? void 0 : record.referrals) == null ? void 0 : _a2.specialty) || []).map((r) => `<div class="box"><p class="value">${r.from_specialty || ""} to ${r.to_specialty || ""} - ${r.status}</p><p>${r.reason || ""}</p><p>${r.notes || ""}</p></div>`).join("")}<h2>Facility Referrals</h2>${(((_b2 = record == null ? void 0 : record.referrals) == null ? void 0 : _b2.facility) || []).map((r) => `<div class="box"><p class="value">${r.code} - ${r.status}</p><p>${r.reason || ""}</p><p>${r.notes || ""}</p></div>`).join("")}<h2>Reviews</h2>${((record == null ? void 0 : record.reviews) || []).map((r) => `<div class="box"><p class="value">${r.rating}/5</p><p>${r.comment || ""}</p></div>`).join("")}<h2>Files</h2>${((record == null ? void 0 : record.files) || []).map((f) => `<div class="box">${f.name}</div>`).join("")}</body></html>`;
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Patient Record Review" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Load a patient profile, files, referrals, consultations, and lab history." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col gap-3 sm:flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: patientId,
            onChange: (e) => setPatientId(e.target.value),
            className: "flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none focus:border-brand-500",
            placeholder: "patient-..."
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: load,
            disabled: loading,
            className: "rounded-2xl bg-brand-700 px-6 py-4 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50",
            children: loading ? "Loading…" : "Load record"
          }
        )
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-red-600", children: error }),
      patient && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: printPatientReviewPdf, className: "mt-4 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800", children: "Download patient review as PDF" })
    ] }),
    patient && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Patient profile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-slate-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-semibold text-slate-900", children: patient.name || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-slate-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Patient ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-semibold text-slate-900", children: patient.id })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-slate-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-semibold text-slate-900", children: patient.phone || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-slate-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Registered via" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-semibold text-slate-900", children: patient.registered_via || "—" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Tokens", value: ((_a = record == null ? void 0 : record.tokens) == null ? void 0 : _a.balance) ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Files", value: ((_b = record == null ? void 0 : record.files) == null ? void 0 : _b.length) ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Specialty Referrals", value: ((_d = (_c = record == null ? void 0 : record.referrals) == null ? void 0 : _c.specialty) == null ? void 0 : _d.length) ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Facility Referrals", value: ((_f = (_e = record == null ? void 0 : record.referrals) == null ? void 0 : _e.facility) == null ? void 0 : _f.length) ?? 0 })
      ] })
    ] }),
    patient && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Files & documents" }),
        ((_g = record.files) == null ? void 0 : _g.length) ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-3", children: record.files.slice(0, 20).map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-slate-900", children: f.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: new Date(f.createdAt || f.created_at).toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => downloadFile(f).catch((err) => setError(err.message)), className: "mt-3 rounded-full bg-brand-700 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600", children: "Download file" })
        ] }, f.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 rounded-2xl bg-slate-50 p-6 text-slate-600", children: "No files uploaded yet." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Referrals" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
          (((_h = record.referrals) == null ? void 0 : _h.specialty) || []).slice(0, 10).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-slate-900", children: [
              r.from_specialty || "Specialty",
              " to ",
              r.to_specialty
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-600", children: r.reason }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-500", children: [
              "Status: ",
              r.status
            ] })
          ] }, r.id)),
          (((_i = record.referrals) == null ? void 0 : _i.facility) || []).slice(0, 10).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-slate-900", children: r.code }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-600", children: r.reason }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-500", children: [
              "Status: ",
              r.status,
              " • Payout: ₦",
              r.payout_ngn || 0
            ] })
          ] }, r.id)),
          (((_j = record.referrals) == null ? void 0 : _j.facility) || []).length === 0 && (((_k = record.referrals) == null ? void 0 : _k.specialty) || []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-slate-50 p-6 text-slate-600", children: "No referrals." })
        ] })
      ] })
    ] }),
    patient && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Consultations & labs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-4 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Consultations (NG)", value: ((_l = record.consultations_ng) == null ? void 0 : _l.length) ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Lab orders", value: ((_n = (_m = record.labs) == null ? void 0 : _m.orders) == null ? void 0 : _n.length) ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Lab payments", value: ((_p = (_o = record.labs) == null ? void 0 : _o.payments) == null ? void 0 : _p.length) ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Vitals", value: ((_q = record.vitals) == null ? void 0 : _q.length) ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Reviews", value: ((_r = record.reviews) == null ? void 0 : _r.length) ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Prescriptions", value: ((_s = record.prescriptions) == null ? void 0 : _s.length) ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Clinical Notes", value: ((_t = record.clinical_notes) == null ? void 0 : _t.length) ?? 0 })
      ] })
    ] }),
    patient && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Clinical continuation notes" }),
      (record.clinical_notes || []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 rounded-2xl bg-slate-50 p-6 text-slate-600", children: "No clinical notes saved yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-3", children: (record.clinical_notes || []).slice(0, 10).map((note) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase text-slate-500", children: new Date(note.created_at).toLocaleString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-bold text-slate-900", children: "Diagnosis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 whitespace-pre-wrap text-sm text-slate-700", children: note.diagnosis }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm font-bold text-slate-900", children: "Plan" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 whitespace-pre-wrap text-sm text-slate-700", children: note.plan }),
        note.follow_up && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 whitespace-pre-wrap text-sm text-slate-700", children: note.follow_up })
      ] }, note.id)) })
    ] })
  ] });
}
const specialties = [
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
function DoctorSpecialtyReferralPanel({ doctor, patient, consultationId, onCreated }) {
  const currentSpecialty = (doctor == null ? void 0 : doctor.specialty) || "General Practitioner";
  const [targetSpecialty, setTargetSpecialty] = reactExports.useState(() => specialties.find((item) => item !== currentSpecialty) || "Urology");
  const [reason, setReason] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [targetDoctors, setTargetDoctors] = reactExports.useState([]);
  const [targetDoctorId, setTargetDoctorId] = reactExports.useState("");
  const [appointmentAt, setAppointmentAt] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [loadingDoctors, setLoadingDoctors] = reactExports.useState(false);
  const [message, setMessage] = reactExports.useState("");
  const [created, setCreated] = reactExports.useState(null);
  const currentInfo = getSpecialtyInfo(currentSpecialty);
  const targetInfo = getSpecialtyInfo(targetSpecialty);
  const loadTargetDoctors = async () => {
    if (!targetSpecialty) return;
    setLoadingDoctors(true);
    try {
      const params = new URLSearchParams({
        specialty: targetSpecialty,
        excludeDoctorId: (doctor == null ? void 0 : doctor.id) || ""
      });
      const response = await apiFetch(`/api/referrals/specialty/doctors?${params.toString()}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to load specialists");
      const rows = Array.isArray(data.doctors) ? data.doctors : [];
      setTargetDoctors(rows);
      setTargetDoctorId((current) => {
        var _a;
        return rows.some((item) => item.id === current) ? current : ((_a = rows[0]) == null ? void 0 : _a.id) || "";
      });
    } catch (error) {
      setTargetDoctors([]);
      setTargetDoctorId("");
      setMessage(error.message);
    } finally {
      setLoadingDoctors(false);
    }
  };
  reactExports.useEffect(() => {
    void loadTargetDoctors();
  }, [targetSpecialty, doctor == null ? void 0 : doctor.id]);
  const submit = async (event) => {
    event.preventDefault();
    if (!(doctor == null ? void 0 : doctor.id) || !(patient == null ? void 0 : patient.id) || !targetSpecialty || !reason.trim()) {
      setMessage("Select a specialty and enter the clinical reason.");
      return;
    }
    setLoading(true);
    setMessage("");
    setCreated(null);
    try {
      const response = await apiFetch("/api/referrals/specialty/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor.id,
          patientId: patient.id,
          consultationId,
          fromSpecialty: currentSpecialty,
          toSpecialty: targetSpecialty,
          targetDoctorId: targetDoctorId || void 0,
          appointmentAt: appointmentAt || void 0,
          reason: reason.trim(),
          notes: notes.trim()
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to create specialty referral");
      setCreated(data.referral || null);
      setReason("");
      setNotes("");
      setAppointmentAt("");
      setMessage(data.appointment ? "Referral created and appointment sent to patient." : "Referral created. The selected specialist and patient were notified.");
      onCreated == null ? void 0 : onCreated(data.referral);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.16em] text-slate-500", children: "From" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-lg font-bold text-slate-900", children: [
          currentInfo.logo,
          " ",
          currentSpecialty
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-brand-100 p-4", style: { backgroundColor: targetInfo.bgColor }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.16em]", style: { color: targetInfo.color }, children: "To" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-lg font-bold text-slate-900", children: [
          targetInfo.logo,
          " ",
          targetSpecialty
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-100", children: "The referral attaches the patient profile, consultation history, reviews, vitals, clinical notes, files, prescriptions, and lab history." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "grid gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
        "Target specialty",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: targetSpecialty,
            onChange: (event) => setTargetSpecialty(event.target.value),
            className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
            children: specialties.map((specialty) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: specialty, children: specialty }, specialty))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-slate-200 bg-slate-50 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-slate-900", children: "Select specialist" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "Online specialists are shown first. Offline specialists can still receive notifications and appointments." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: loadTargetDoctors,
              disabled: loadingDoctors,
              className: "rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 disabled:opacity-50",
              children: loadingDoctors ? "Loading..." : "Refresh"
            }
          )
        ] }),
        targetDoctors.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 rounded-2xl bg-white p-4 text-sm text-slate-600", children: [
          "No verified ",
          targetSpecialty,
          " doctors found yet."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid gap-3", children: targetDoctors.map((item) => {
          const online = Boolean(item.isOnline || item.is_online);
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setTargetDoctorId(item.id),
              className: `rounded-2xl border p-4 text-left transition ${targetDoctorId === item.id ? "border-brand-400 bg-white shadow-sm" : "border-slate-200 bg-white/70 hover:border-brand-200"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-slate-900", children: [
                    "Dr. ",
                    item.name || item.id
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-500", children: [
                    item.location || "Location not set",
                    " | Rating ",
                    Number(item.rating || 0).toFixed(1)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-xs font-black ${online ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`, children: online ? "Online" : "Offline" })
              ] })
            },
            item.id
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
        "Optional appointment time for patient",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "datetime-local",
            value: appointmentAt,
            onChange: (event) => setAppointmentAt(event.target.value),
            className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-2 block text-xs text-slate-500", children: "If set, the patient will see the specialist appointment in their portal." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
        "Clinical reason",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: reason,
            onChange: (event) => setReason(event.target.value),
            className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
            placeholder: "e.g. recurrent urinary symptoms, specialist urology review needed"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
        "Handover notes",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: notes,
            onChange: (event) => setNotes(event.target.value),
            rows: 4,
            className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
            placeholder: "Summarize findings, red flags, tests already done, and what the specialist should review."
          }
        )
      ] }),
      message && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `rounded-2xl px-4 py-3 text-sm ${created ? "bg-emerald-50 text-emerald-800" : "bg-slate-50 text-slate-700"}`, children: message }),
      (created == null ? void 0 : created.id) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.16em] text-slate-500", children: "Referral ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 break-all text-sm font-bold text-slate-900", children: created.id })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50",
          children: loading ? "Creating referral..." : `Refer to ${targetSpecialty}`
        }
      )
    ] })
  ] });
}
function SpecialtyReferralInbox({ doctor, onAcceptReferral }) {
  var _a, _b, _c, _d, _e, _f, _g;
  const [referrals, setReferrals] = reactExports.useState([]);
  const [selected, setSelected] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [accepting, setAccepting] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const loadReferrals = async () => {
    if (!(doctor == null ? void 0 : doctor.specialty)) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        specialty: doctor.specialty,
        targetDoctorId: doctor.id
      });
      const response = await apiFetch(`/api/referrals/specialty?${params.toString()}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to load specialty referrals");
      const rows = Array.isArray(data.referrals) ? data.referrals : [];
      setReferrals(rows);
      setSelected((current) => current || rows[0] || null);
    } catch (err) {
      setReferrals([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    void loadReferrals();
    const interval = window.setInterval(loadReferrals, 1e4);
    return () => window.clearInterval(interval);
  }, [doctor == null ? void 0 : doctor.id, doctor == null ? void 0 : doctor.specialty]);
  const record = (selected == null ? void 0 : selected.record_snapshot) || {};
  const patient = (selected == null ? void 0 : selected.patient_snapshot) || record.patient || {};
  const specialtyInfo = getSpecialtyInfo((doctor == null ? void 0 : doctor.specialty) || (selected == null ? void 0 : selected.to_specialty) || "General Practitioner");
  const acceptReferral = async () => {
    if (!(selected == null ? void 0 : selected.id) || !(doctor == null ? void 0 : doctor.id)) return;
    setAccepting(true);
    setError("");
    try {
      const response = await apiFetch(`/api/referrals/specialty/${encodeURIComponent(selected.id)}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: doctor.id })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || data.details || "Failed to accept referral");
      setSelected(data.referral || selected);
      setReferrals((rows) => rows.map((row) => row.id === selected.id ? data.referral || row : row));
      onAcceptReferral == null ? void 0 : onAcceptReferral({
        patient: data.patient || patient,
        consultation: data.consultation,
        referral: data.referral || selected
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setAccepting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-black uppercase tracking-[0.18em]", style: { color: specialtyInfo.color }, children: [
          (doctor == null ? void 0 : doctor.specialty) || "Specialty",
          " referrals"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-2xl font-bold text-slate-900", children: "Specialty Referral Inbox" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-slate-600", children: [
          "Referrals sent to ",
          (doctor == null ? void 0 : doctor.specialty) || "your specialty",
          " arrive here with the patient record attached."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: loadReferrals,
          disabled: loading,
          className: "rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50",
          children: loading ? "Loading..." : "Refresh referrals"
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.4fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: referrals.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-slate-50 p-5 text-sm text-slate-600", children: "No specialty referrals yet." }) : referrals.map((referral) => {
        var _a2;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setSelected(referral),
            className: `w-full rounded-2xl border p-4 text-left transition ${(selected == null ? void 0 : selected.id) === referral.id ? "border-brand-300 bg-brand-50" : "border-slate-200 bg-slate-50 hover:border-brand-200"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.16em] text-brand-700", children: referral.status || "pending" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm font-bold text-slate-900", children: ((_a2 = referral.patient_snapshot) == null ? void 0 : _a2.name) || referral.patient_id }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-500", children: [
                referral.from_specialty || "Unknown specialty",
                " to ",
                referral.to_specialty
              ] }),
              referral.target_doctor_id && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs font-semibold text-brand-700", children: "Assigned to you" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 line-clamp-2 text-xs text-slate-600", children: referral.reason })
            ]
          },
          referral.id
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl border border-slate-200 bg-white p-6", children: !selected ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600", children: "Select a referral to review the patient handover." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.16em] text-slate-500", children: "Patient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1 text-2xl font-bold text-slate-900", children: patient.name || selected.patient_id }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: selected.patient_id })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: acceptReferral,
            disabled: accepting || selected.status === "accepted",
            className: "w-full rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60",
            style: { backgroundColor: specialtyInfo.color },
            children: selected.status === "accepted" ? "Referral accepted" : accepting ? "Opening consultation..." : "Accept referral and open consultation"
          }
        ),
        selected.status === "accepted" && selected.consultation_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800", children: [
          "Room opened: ",
          selected.consultation_id
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-brand-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-slate-900", children: "Referral reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 whitespace-pre-wrap text-sm text-slate-700", children: selected.reason }),
          selected.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 whitespace-pre-wrap text-sm text-slate-700", children: selected.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Vitals", value: ((_a = record.vitals) == null ? void 0 : _a.length) || 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Reviews", value: ((_b = record.reviews) == null ? void 0 : _b.length) || 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Notes", value: ((_c = record.clinical_notes) == null ? void 0 : _c.length) || 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Files", value: ((_d = record.files) == null ? void 0 : _d.length) || 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Prescriptions", value: ((_e = record.prescriptions) == null ? void 0 : _e.length) || 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Labs", value: ((_g = (_f = record.labs) == null ? void 0 : _f.orders) == null ? void 0 : _g.length) || 0 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-slate-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-slate-900", children: "Recent clinical notes" }),
          (record.clinical_notes || []).slice(0, 3).map((note) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-xl bg-white p-3 ring-1 ring-slate-100", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-500", children: new Date(note.created_at).toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-700", children: note.diagnosis }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: note.plan })
          ] }, note.id)),
          (record.clinical_notes || []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-500", children: "No clinical notes attached." })
        ] })
      ] }) })
    ] })
  ] });
}
function Stat({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase text-slate-500", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xl font-black text-slate-900", children: value })
  ] });
}
function DoctorPatientNotes({ patientId, doctorId, consultationId }) {
  const { addError } = useError();
  const [notes, setNotes] = reactExports.useState([]);
  const [diagnosis, setDiagnosis] = reactExports.useState("");
  const [plan, setPlan] = reactExports.useState("");
  const [followUp, setFollowUp] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const loadNotes = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const response = await apiFetch(`/api/patients/${encodeURIComponent(patientId)}/clinical-notes`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to load clinical notes");
      setNotes(Array.isArray(data.notes) ? data.notes : []);
    } catch (error) {
      addError(error.message, "error");
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    void loadNotes();
  }, [patientId]);
  const saveNote = async (event) => {
    event.preventDefault();
    if (!patientId || !doctorId || !diagnosis.trim() || !plan.trim()) {
      addError("Diagnosis and care plan are required before saving.", "warning");
      return;
    }
    setSaving(true);
    try {
      const response = await apiFetch(`/api/patients/${encodeURIComponent(patientId)}/clinical-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          consultationId,
          diagnosis: diagnosis.trim(),
          plan: plan.trim(),
          followUp: followUp.trim()
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to save clinical note");
      setDiagnosis("");
      setPlan("");
      setFollowUp("");
      addError("Clinical note saved for care continuation.", "success");
      await loadNotes();
    } catch (error) {
      addError(error.message, "error");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Clinical Continuation Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "Save diagnosis, care plan, and follow-up notes for future doctors." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600", children: [
        notes.length,
        " saved"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: saveNote, className: "mt-5 grid gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: diagnosis,
          onChange: (event) => setDiagnosis(event.target.value),
          rows: 3,
          className: "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500",
          placeholder: "Diagnosis / clinical impression"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: plan,
          onChange: (event) => setPlan(event.target.value),
          rows: 4,
          className: "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500",
          placeholder: "Treatment plan, medication advice, lifestyle advice, next steps"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: followUp,
          onChange: (event) => setFollowUp(event.target.value),
          rows: 2,
          className: "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500",
          placeholder: "Follow-up timing or escalation instructions"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          disabled: saving,
          className: "rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50",
          children: saving ? "Saving..." : "Save clinical note"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 space-y-3", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-2xl bg-slate-50 p-4 text-sm text-slate-600", children: "Loading notes..." }) : notes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-2xl bg-slate-50 p-4 text-sm text-slate-600", children: "No clinical notes saved yet." }) : notes.slice(0, 6).map((note) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase text-slate-500", children: new Date(note.created_at).toLocaleString() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-bold text-slate-900", children: "Diagnosis" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 whitespace-pre-wrap text-sm text-slate-700", children: note.diagnosis }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm font-bold text-slate-900", children: "Plan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 whitespace-pre-wrap text-sm text-slate-700", children: note.plan }),
      note.follow_up && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm font-bold text-slate-900", children: "Follow-up" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 whitespace-pre-wrap text-sm text-slate-700", children: note.follow_up })
      ] })
    ] }, note.id)) })
  ] });
}
const toDateInput = (date) => {
  const value = new Date(date);
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
  return value.toISOString().slice(0, 10);
};
function DoctorAvailabilityManager({ doctor }) {
  const { addError } = useError();
  const [selectedDate, setSelectedDate] = reactExports.useState(() => toDateInput(/* @__PURE__ */ new Date()));
  const [slots, setSlots] = reactExports.useState({});
  const [loading, setLoading] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const doctorId = doctor == null ? void 0 : doctor.id;
  const slotEntries = reactExports.useMemo(() => Object.entries(slots).sort(([left], [right]) => left.localeCompare(right)), [slots]);
  const availableCount = slotEntries.filter(([, available]) => available).length;
  const loadAvailability = async () => {
    if (!doctorId || !selectedDate) return;
    setLoading(true);
    try {
      const response = await apiFetch(`/api/doctors/${doctorId}/availability?date=${encodeURIComponent(selectedDate)}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to load availability");
      setSlots(data.slots || {});
    } catch (error) {
      setSlots({});
      addError(error.message, "error");
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    void loadAvailability();
  }, [doctorId, selectedDate]);
  const setAllSlots = (available) => {
    setSlots((current) => Object.fromEntries(Object.keys(current).map((time) => [time, available])));
  };
  const saveAvailability = async () => {
    if (!doctorId || !selectedDate) return;
    setSaving(true);
    try {
      const response = await apiFetch(`/api/doctors/${doctorId}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, slots })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to save availability");
      setSlots(data.slots || slots);
      addError("Availability saved.", "success");
    } catch (error) {
      addError(error.message, "error");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-slate-900", children: "Appointment Availability" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Control the appointment times patients can book. Existing booked appointments remain protected." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: selectedDate,
            onChange: (event) => setSelectedDate(event.target.value),
            className: "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-brand-500"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: loadAvailability,
            disabled: loading,
            className: "rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50",
            children: loading ? "Loading..." : "Refresh"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-3 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-brand-50 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.16em] text-brand-700", children: "Open slots" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-3xl font-black text-brand-950", children: availableCount })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setAllSlots(true),
          disabled: slotEntries.length === 0,
          className: "rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50",
          children: "Open all visible slots"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setAllSlots(false),
          disabled: slotEntries.length === 0,
          className: "rounded-2xl bg-red-50 px-5 py-4 text-sm font-bold text-red-800 hover:bg-red-100 disabled:opacity-50",
          children: "Close all visible slots"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-600", children: "Loading slots..." }) : slotEntries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-600", children: "No slots are configured for this date." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5", children: slotEntries.map(([time, available]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => setSlots((current) => ({ ...current, [time]: !current[time] })),
        className: `rounded-2xl border px-4 py-3 text-sm font-bold transition ${available ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100" : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block", children: time }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block text-xs font-semibold", children: available ? "Open" : "Closed" })
        ]
      },
      time
    )) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: saveAvailability,
        disabled: saving || slotEntries.length === 0,
        className: "mt-6 rounded-full bg-brand-700 px-7 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50",
        children: saving ? "Saving..." : "Save Availability"
      }
    )
  ] }) });
}
function WorkspaceModal({ title, subtitle, onClose, children, size = "max-w-4xl" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `max-h-[90vh] w-full ${size} overflow-hidden rounded-3xl bg-white shadow-2xl`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-slate-900", children: title }),
        subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: subtitle })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onClose,
          className: "rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200",
          children: "Close"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[calc(90vh-88px)] overflow-y-auto p-6", children })
  ] }) });
}
function AdminDashboard({ doctor, onLogout }) {
  var _a, _b;
  const { addError } = useError();
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const [doctorOnline, setDoctorOnline] = reactExports.useState(Boolean((doctor == null ? void 0 : doctor.isOnline) || (doctor == null ? void 0 : doctor.is_online)));
  const [updatingDoctorStatus, setUpdatingDoctorStatus] = reactExports.useState(false);
  const adminSpecialty = (doctor == null ? void 0 : doctor.specialty) || "General Practitioner";
  const adminSpecialtyInfo = getSpecialtyInfo(adminSpecialty);
  const adminHeaderStyle = {
    backgroundImage: `linear-gradient(135deg, ${adminSpecialtyInfo.color}, ${adminSpecialtyInfo.bgColor})`
  };
  const [withdrawing, setWithdrawing] = reactExports.useState(false);
  const [savingPayoutDetails, setSavingPayoutDetails] = reactExports.useState(false);
  const [withdrawalResult, setWithdrawalResult] = reactExports.useState(null);
  const [withdrawTokenAmount, setWithdrawTokenAmount] = reactExports.useState(() => {
    const value = Number((doctor == null ? void 0 : doctor.earningsTokens) ?? (doctor == null ? void 0 : doctor.earnings_tokens) ?? 0);
    return value > 0 ? String(Math.floor(value)) : "";
  });
  const [payoutDetails, setPayoutDetails] = reactExports.useState(() => ({
    payoutMethod: (doctor == null ? void 0 : doctor.payoutMethod) || "bank_account",
    bankCode: (doctor == null ? void 0 : doctor.bankCode) || "",
    bankAccount: (doctor == null ? void 0 : doctor.bankAccount) || "",
    currency: (doctor == null ? void 0 : doctor.currency) || "",
    mobileMoneyOperator: (doctor == null ? void 0 : doctor.mobileMoneyOperator) || "",
    mobileMoneyNumber: (doctor == null ? void 0 : doctor.mobileMoneyNumber) || ""
  }));
  const [consultationPatients, setConsultationPatients] = reactExports.useState([]);
  const [consultationPatientTotal, setConsultationPatientTotal] = reactExports.useState(0);
  const [consultationPatientSearch, setConsultationPatientSearch] = reactExports.useState("");
  const [consultationPatientLimit, setConsultationPatientLimit] = reactExports.useState(10);
  const [loadingConsultationPatients, setLoadingConsultationPatients] = reactExports.useState(false);
  const [selectedConsultationPatient, setSelectedConsultationPatient] = reactExports.useState(null);
  const [workspacePanel, setWorkspacePanel] = reactExports.useState("");
  const [activeConsultTool, setActiveConsultTool] = reactExports.useState("chat");
  const [financials, setFinancials] = reactExports.useState(null);
  const earningsTokens = Number((financials == null ? void 0 : financials.earningsTokens) ?? (doctor == null ? void 0 : doctor.earningsTokens) ?? (doctor == null ? void 0 : doctor.earnings_tokens) ?? 0) || 0;
  const estimatedUsd = (financials == null ? void 0 : financials.estimatedUsd) ?? earningsTokens / 10;
  const tokenToUsd = Number(((_a = financials == null ? void 0 : financials.settings) == null ? void 0 : _a.tokenToUSD) || 10);
  const minimumWithdrawalUsd = Number(((_b = financials == null ? void 0 : financials.settings) == null ? void 0 : _b.doctorMinimumWithdrawalUSD) || 5);
  const minimumWithdrawTokens = Math.max(1, Math.round(minimumWithdrawalUsd * tokenToUsd));
  const loadConsultationPatients = async (limit = consultationPatientLimit, search = consultationPatientSearch) => {
    if (!(doctor == null ? void 0 : doctor.id)) return;
    setLoadingConsultationPatients(true);
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: "0" });
      params.set("onlineOnly", "true");
      if (search.trim()) params.set("search", search.trim());
      const response = await apiFetch(`/api/doctors/${encodeURIComponent(doctor.id)}/consultation-patients?${params.toString()}`);
      const data = await readApiJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to load consultation patients");
      const patients = Array.isArray(data.patients) ? data.patients : [];
      setConsultationPatients(patients);
      setConsultationPatientTotal(Number(data.total || 0));
      setSelectedConsultationPatient((current) => {
        var _a2;
        if (!patients.length) return null;
        const currentConsultationId = (_a2 = current == null ? void 0 : current.latest_consultation) == null ? void 0 : _a2.id;
        const stillVisible = patients.find((patient) => {
          var _a3;
          return ((_a3 = patient.latest_consultation) == null ? void 0 : _a3.id) === currentConsultationId;
        });
        if (stillVisible) return stillVisible;
        return patients.find((patient) => {
          var _a3;
          return ((_a3 = patient.latest_consultation) == null ? void 0 : _a3.status) === "in_progress";
        }) || patients[0];
      });
    } catch (err) {
      setConsultationPatients([]);
      setConsultationPatientTotal(0);
      setSelectedConsultationPatient(null);
      addError(err.message, "error");
    } finally {
      setLoadingConsultationPatients(false);
    }
  };
  const loadFinancials = async () => {
    if (!(doctor == null ? void 0 : doctor.id)) return;
    try {
      const response = await apiFetch(`/api/doctors/${encodeURIComponent(doctor.id)}/financials`);
      const data = await readApiJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to load financials");
      setFinancials(data);
      if (data.doctor && activeTab !== "wallet") {
        setPayoutDetails((prev) => ({
          payoutMethod: data.doctor.payoutMethod || data.doctor.payout_method || prev.payoutMethod || "bank_account",
          bankCode: data.doctor.bankCode || data.doctor.bank_code || prev.bankCode || "",
          bankAccount: data.doctor.bankAccount || data.doctor.bank_account || prev.bankAccount || "",
          currency: data.doctor.currency || prev.currency || "",
          mobileMoneyOperator: data.doctor.mobileMoneyOperator || data.doctor.mobile_money_operator || prev.mobileMoneyOperator || "",
          mobileMoneyNumber: data.doctor.mobileMoneyNumber || data.doctor.mobile_money_number || prev.mobileMoneyNumber || ""
        }));
      }
    } catch (err) {
      addError(err.message, "error");
    }
  };
  reactExports.useEffect(() => {
    if (!(doctor == null ? void 0 : doctor.id)) return;
    const timer = window.setTimeout(() => {
      void loadConsultationPatients(consultationPatientLimit, consultationPatientSearch);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [doctor == null ? void 0 : doctor.id, consultationPatientSearch, consultationPatientLimit]);
  reactExports.useEffect(() => {
    if (!(doctor == null ? void 0 : doctor.id)) return void 0;
    const interval = window.setInterval(() => {
      void loadConsultationPatients(consultationPatientLimit, consultationPatientSearch);
    }, 1e4);
    return () => window.clearInterval(interval);
  }, [doctor == null ? void 0 : doctor.id, consultationPatientLimit, consultationPatientSearch]);
  reactExports.useEffect(() => {
    if (!(doctor == null ? void 0 : doctor.id)) return;
    void loadFinancials();
    const interval = window.setInterval(() => {
      void loadFinancials();
    }, 15e3);
    return () => window.clearInterval(interval);
  }, [doctor == null ? void 0 : doctor.id, activeTab]);
  const selectedConsultation = (selectedConsultationPatient == null ? void 0 : selectedConsultationPatient.latest_consultation) || null;
  const openPatientWorkspace = (patient, panel = "video") => {
    setSelectedConsultationPatient(patient);
    setWorkspacePanel("");
    setActiveConsultTool(panel === "video" || panel === "patients" ? "chat" : panel);
  };
  const openAcceptedReferralWorkspace = ({ patient, consultation }) => {
    if (!(patient == null ? void 0 : patient.id) || !(consultation == null ? void 0 : consultation.id)) return;
    if (!patient.is_online) {
      addError("Referral accepted. The patient is offline, so the consultation room will appear when the patient comes online and joins.", "info", 9e3);
      void loadConsultationPatients(consultationPatientLimit, consultationPatientSearch);
      setActiveTab("referrals");
      return;
    }
    setSelectedConsultationPatient({
      ...patient,
      latest_consultation: consultation,
      source: "specialty_referral",
      video_waiting: false
    });
    setWorkspacePanel("");
    setActiveConsultTool("chat");
    setActiveTab("patients");
  };
  const handleSavePayoutDetails = async () => {
    setSavingPayoutDetails(true);
    try {
      const response = await apiFetch(`/api/doctors/${doctor.id}/payout-details`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payoutDetails)
      });
      const data = await readApiJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to save payout details");
      if (data.doctor) {
        setPayoutDetails((prev) => ({
          payoutMethod: data.doctor.payoutMethod || data.doctor.payout_method || prev.payoutMethod,
          bankCode: data.doctor.bankCode || data.doctor.bank_code || prev.bankCode,
          bankAccount: data.doctor.bankAccount || data.doctor.bank_account || prev.bankAccount,
          currency: data.doctor.currency || prev.currency,
          mobileMoneyOperator: data.doctor.mobileMoneyOperator || data.doctor.mobile_money_operator || prev.mobileMoneyOperator,
          mobileMoneyNumber: data.doctor.mobileMoneyNumber || data.doctor.mobile_money_number || prev.mobileMoneyNumber
        }));
      }
      addError("Payout details saved.", "success");
    } catch (err) {
      addError(err.message, "error");
    } finally {
      setSavingPayoutDetails(false);
    }
  };
  const handleWithdraw = async () => {
    const tokens = Number(withdrawTokenAmount);
    if (!Number.isFinite(tokens) || tokens <= 0) {
      addError("Enter a valid token amount to withdraw.", "error");
      return;
    }
    if (tokens < minimumWithdrawTokens) {
      addError(`Minimum withdrawal is ${minimumWithdrawTokens} tokens ($${minimumWithdrawalUsd}).`, "error");
      return;
    }
    if (tokens > earningsTokens) {
      addError("Requested amount exceeds your available tokens.", "error");
      return;
    }
    setWithdrawing(true);
    setWithdrawalResult(null);
    try {
      const response = await apiFetch(`/api/doctors/${doctor.id}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens, payoutDetails })
      });
      const data = await readApiJson(response);
      if (!response.ok) throw new Error(data.error || "Withdrawal request failed");
      setWithdrawalResult({
        message: data.message || "Withdrawal request queued for payout review.",
        reference: data.reference,
        tokensDebited: data.tokensDebited ?? tokens,
        remainingTokens: data.remainingTokens,
        amountUsd: Number(data.amountUSD ?? (data.tokensDebited ?? tokens) / 10)
      });
      setWithdrawTokenAmount("");
      await loadFinancials();
    } catch (err) {
      addError(err.message, "error");
    } finally {
      setWithdrawing(false);
    }
  };
  const toggleDoctorOnline = async () => {
    if (!(doctor == null ? void 0 : doctor.id)) return;
    const next = !doctorOnline;
    setUpdatingDoctorStatus(true);
    try {
      const response = await apiFetch(`/api/doctors/${encodeURIComponent(doctor.id)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: next })
      });
      const data = await readApiJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to update doctor status");
      setDoctorOnline(next);
      addError(next ? "You are now visible as online." : "You are now offline.", "success");
    } catch (err) {
      addError(err.message, "error");
    } finally {
      setUpdatingDoctorStatus(false);
    }
  };
  const waitingConsultationPatients = consultationPatients.filter((patient) => patient.video_waiting);
  const facilityConsultationPatients = consultationPatients.filter((patient) => patient.source === "facility" && !patient.video_waiting);
  const referredConsultationPatients = consultationPatients.filter((patient) => patient.source === "specialty_referral" && !patient.video_waiting);
  const directConsultationPatients = consultationPatients.filter((patient) => patient.source === "direct_patient" && !patient.video_waiting);
  const consultationPatientSections = [
    { title: "Waiting now", subtitle: "Patients already trying to enter the video room.", patients: waitingConsultationPatients },
    { title: "Facility patients", subtitle: "Patients sent from PHC or private clinic workflows.", patients: facilityConsultationPatients },
    { title: "Specialty referrals", subtitle: "Patients transferred from another doctor.", patients: referredConsultationPatients },
    { title: "Direct patients", subtitle: "Patients who started from their own portal.", patients: directConsultationPatients }
  ].filter((section) => section.patients.length > 0);
  const getPatientSourceLabel = (patient, index) => {
    if (patient.video_waiting) return "Waiting for video";
    if (patient.source === "facility") return patient.facility_name || patient.facility_type || `Facility queue #${index + 1}`;
    if (patient.source === "specialty_referral") return "Specialty referral";
    return "Direct patient";
  };
  const getPatientChannelLabel = (patient) => {
    var _a2;
    const channel = ((_a2 = patient.latest_consultation) == null ? void 0 : _a2.channel) || "Consultation";
    if (patient.source === "facility" && patient.facility_name) return `${patient.facility_name} | ${channel.replace(/_/g, " ")}`;
    return channel.replace(/_/g, " ");
  };
  if (!doctor) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto mt-16 max-w-7xl px-6 pb-20 sm:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/50 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Access Denied" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-600 mt-2", children: "Please log in as a doctor to access this dashboard." })
    ] }) });
  }
  const doctorAccountStatus = doctor.account_status || doctor.accountStatus || "active";
  const doctorPaused = doctorAccountStatus === "paused" || doctorAccountStatus === "stopped";
  if (doctorPaused) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto mt-16 max-w-5xl px-6 pb-20 sm:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        PortalArtBanner,
        {
          theme: "doctor",
          title: "Doctor account review",
          body: "Your dashboard is temporarily paused while the platform admin reviews your account.",
          className: "mb-8"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-amber-200 bg-white p-8 shadow-xl shadow-slate-200/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.18em] text-amber-700", children: "Action required" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 text-3xl font-bold text-slate-900", children: "Your doctor account is paused" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800", children: doctor.suspension_reason || doctor.suspensionReason || "Please answer the platform admin query or update your profile before your account is restored." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-slate-600", children: "You can contact platform support or update the requested information. Live consultations, withdrawals, and patient access are unavailable until the admin resumes your account." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onLogout,
            className: "mt-6 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800",
            children: "Logout"
          }
        )
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto mt-16 max-w-7xl px-6 pb-20 sm:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PortalArtBanner,
      {
        theme: "doctor",
        title: "Doctor clinical workspace",
        body: "Keep the consultation video alive while you review patient records, request vitals, chat, prescribe, order labs, and refer to another specialty.",
        className: "mb-8"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnnouncementBanner, { audience: "doctor" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl px-8 py-10 text-white shadow-xl shadow-brand-700/20 mb-8", style: adminHeaderStyle, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-4xl font-bold", children: "Doctor Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-brand-100 mt-2", children: [
          "Welcome back, Dr. ",
          doctor.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white", children: [
            adminSpecialtyInfo.logo,
            " ",
            adminSpecialty
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${doctorOnline ? "bg-emerald-400/25 text-white" : "bg-slate-900/20 text-white/85"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-2.5 w-2.5 rounded-full ${doctorOnline ? "bg-emerald-200" : "bg-slate-300"}` }),
            doctorOnline ? "Online" : "Offline"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: toggleDoctorOnline,
            disabled: updatingDoctorStatus,
            className: `rounded-full px-6 py-3 text-sm font-semibold text-white transition disabled:opacity-50 ${doctorOnline ? "bg-amber-500/90 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"}`,
            children: updatingDoctorStatus ? "Updating..." : doctorOnline ? "Go offline" : "Go online"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onLogout,
            className: "rounded-full bg-white/20 hover:bg-white/30 px-6 py-3 text-sm font-semibold text-white transition",
            children: "Logout"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-8 overflow-x-auto pb-2", children: [
      { id: "overview", label: "Overview", icon: "Stats" },
      { id: "community", label: "Community", icon: "Chat" },
      { id: "referrals", label: "Referrals", icon: "Flow" },
      { id: "patients", label: "Patients", icon: "Records" },
      { id: "availability", label: "Availability", icon: "Calendar" },
      { id: "wallet", label: "Financials", icon: "Wallet" },
      { id: "manuals", label: "Manuals & Guides", icon: "Guides" },
      { id: "notifications", label: "Notifications", icon: "Alerts" }
    ].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setActiveTab(tab.id),
        className: `whitespace-nowrap rounded-full px-6 py-3 text-sm font-semibold transition ${activeTab === tab.id ? "bg-brand-700 text-white shadow-lg" : "bg-white text-slate-700 border border-slate-200 hover:border-brand-300"}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
          tab.label,
          tab.id === "patients" && waitingConsultationPatients.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-6 min-w-6 animate-pulse items-center justify-center rounded-full bg-amber-400 px-1.5 text-xs font-black text-slate-950", children: waitingConsultationPatients.length })
        ] })
      },
      tab.id
    )) }),
    waitingConsultationPatients.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => {
          setActiveTab("patients");
          setWorkspacePanel("patients");
        },
        className: "mb-8 flex w-full items-center gap-4 rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-50 via-white to-emerald-50 p-5 text-left shadow-xl shadow-amber-200/40 transition hover:-translate-y-0.5 hover:shadow-2xl",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-lg shadow-amber-300/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 animate-ping rounded-full bg-amber-300 opacity-60" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BellRing, { className: "relative h-7 w-7 animate-pulse", "aria-hidden": "true" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs font-black uppercase tracking-[0.18em] text-amber-700", children: "Patient waiting now" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-1 block text-lg font-black text-slate-950", children: [
              waitingConsultationPatients.length,
              " patient",
              waitingConsultationPatients.length === 1 ? " is" : "s are",
              " waiting in a video room"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block text-sm font-semibold text-slate-600", children: "Open the waiting list and accept the consultation when ready." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white sm:inline-flex", children: "Open rooms" })
        ]
      }
    ),
    activeTab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-8 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-slate-900 mb-4", children: "Profile Information" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-slate-50 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-slate-900", children: doctor.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-slate-50 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "Specialty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-slate-900", children: doctor.specialty })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-slate-50 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "Location" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-slate-900", children: doctor.location })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-slate-50 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "License Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-slate-900", children: doctor.licenseNumber })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-slate-50 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "Verification Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-lg font-semibold ${doctor.verified ? "text-green-600" : "text-yellow-600"}`, children: doctor.verified ? "Verified" : "Pending Verification" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-slate-900 mb-4", children: "Practice Analytics" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 rounded-3xl bg-slate-50 p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total consultations" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-2xl", children: "47" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Average rating" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-2xl", children: "4.8/5" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Monthly revenue" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-2xl", children: [
                "$",
                estimatedUsd.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Profile views" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-2xl", children: "156" })
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl bg-blue-50 border border-blue-100 p-8 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.3em] text-blue-700", children: "Doctor Support" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 text-2xl font-semibold text-slate-900", children: "Download the Doctor Guide" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Access onboarding manuals, quick-start guides, and best practices for patient support." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setActiveTab("manuals"),
            className: "rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800",
            children: "Open manuals"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-slate-900 mb-4", children: "Recent Activity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-slate-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600", children: "New consultation booked" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-900", children: "Patient consultation scheduled for tomorrow at 2:00 PM" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-1", children: "2 hours ago" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-slate-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600", children: "New review received" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-900", children: '5-star review: "Excellent doctor, very professional"' }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-1", children: "1 day ago" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-slate-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600", children: "Payment received" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-900", children: "$50 consultation fee received" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-1", children: "2 days ago" })
          ] })
        ] })
      ] })
    ] }),
    activeTab === "wallet" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-slate-900 mb-6", children: "Earnings & Withdrawals" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-brand-50 rounded-3xl p-8 border border-brand-100", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-700 font-medium", children: "Accumulated Tokens" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-5xl font-bold text-brand-900 mt-2", children: earningsTokens }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-brand-600 mt-4 text-sm", children: [
            "Estimated Payout: ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
              "$",
              estimatedUsd.toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: loadFinancials,
              className: "mt-4 rounded-full bg-white px-4 py-2 text-xs font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100",
              children: "Refresh earnings"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-900", children: "Withdraw token amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                min: minimumWithdrawTokens,
                step: "1",
                value: withdrawTokenAmount,
                onChange: (e) => setWithdrawTokenAmount(e.target.value),
                className: "mt-2 w-full rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-300",
                placeholder: `Minimum ${minimumWithdrawTokens}`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-brand-700/90", children: [
              "Minimum withdrawal: ",
              minimumWithdrawTokens,
              " tokens ($",
              minimumWithdrawalUsd,
              "). Conversion: ",
              tokenToUsd,
              " tokens = $1."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 rounded-3xl p-8 border border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-600 font-medium", children: "Payout Details (Kora)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
              "Payout method",
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: payoutDetails.payoutMethod,
                  onChange: (e) => setPayoutDetails((prev) => ({ ...prev, payoutMethod: e.target.value })),
                  className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "bank_account", children: "Bank account" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "mobile_money", children: "Mobile money" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [
              "Payout currency",
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: payoutDetails.currency,
                  onChange: (e) => setPayoutDetails((prev) => ({ ...prev, currency: e.target.value })),
                  className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Auto (by location)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "NGN", children: "NGN" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "KES", children: "KES" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ZAR", children: "ZAR" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "GHS", children: "GHS" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "XOF", children: "XOF" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "XAF", children: "XAF" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "EGP", children: "EGP" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "USD", children: "USD" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "GBP", children: "GBP" })
                  ]
                }
              )
            ] }),
            payoutDetails.payoutMethod === "bank_account" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  placeholder: "Bank code (e.g. 058)",
                  value: payoutDetails.bankCode,
                  onChange: (e) => setPayoutDetails((prev) => ({ ...prev, bankCode: e.target.value })),
                  className: "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  placeholder: "Account number",
                  value: payoutDetails.bankAccount,
                  onChange: (e) => setPayoutDetails((prev) => ({ ...prev, bankAccount: e.target.value })),
                  className: "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  placeholder: "Mobile money operator (e.g. safaricom-ke)",
                  value: payoutDetails.mobileMoneyOperator,
                  onChange: (e) => setPayoutDetails((prev) => ({ ...prev, mobileMoneyOperator: e.target.value })),
                  className: "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  placeholder: "Mobile number (e.g. +2547xxxxxxxx)",
                  value: payoutDetails.mobileMoneyNumber,
                  onChange: (e) => setPayoutDetails((prev) => ({ ...prev, mobileMoneyNumber: e.target.value })),
                  className: "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handleSavePayoutDetails,
                  disabled: savingPayoutDetails,
                  className: "flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50",
                  children: savingPayoutDetails ? "Saving..." : "Save details"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  disabled: withdrawing || earningsTokens < minimumWithdrawTokens,
                  onClick: handleWithdraw,
                  className: "flex-1 rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50",
                  children: withdrawing ? "Processing..." : "Withdraw"
                }
              )
            ] }),
            withdrawalResult && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-xs font-black text-white", children: "OK" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.16em] text-emerald-700", children: "Withdrawal submitted" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm font-semibold leading-6 text-slate-900", children: withdrawalResult.message }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-3 sm:grid-cols-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white p-3 ring-1 ring-emerald-100", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold uppercase text-slate-500", children: "Reference" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 break-all text-xs font-bold text-slate-900", children: withdrawalResult.reference })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white p-3 ring-1 ring-emerald-100", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold uppercase text-slate-500", children: "Tokens debited" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm font-bold text-slate-900", children: withdrawalResult.tokensDebited })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white p-3 ring-1 ring-emerald-100", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold uppercase text-slate-500", children: "Estimated USD" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm font-bold text-slate-900", children: [
                      "$",
                      withdrawalResult.amountUsd.toFixed(2)
                    ] })
                  ] })
                ] })
              ] })
            ] }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-blue-900 font-semibold mb-2", children: "Withdrawal Policy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-5 text-blue-800 text-sm space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Conversion rate: ",
            tokenToUsd,
            " Tokens = $1 USD."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Minimum withdrawal amount is ",
            minimumWithdrawTokens,
            " Tokens ($",
            minimumWithdrawalUsd,
            ")."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Payouts are processed via Kora when configured." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Ensure payout details match your registered identity." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 rounded-3xl border border-slate-200 bg-white p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-bold text-slate-900", children: "Withdrawal history" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: loadFinancials,
              className: "rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200",
              children: "Refresh"
            }
          )
        ] }),
        !Array.isArray(financials == null ? void 0 : financials.payouts) || financials.payouts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600", children: "No withdrawal requests yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid gap-3", children: financials.payouts.slice(0, 8).map((payout) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-slate-900", children: [
              Number(payout.amount_tokens || 0).toLocaleString(),
              " tokens",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-xs font-semibold text-slate-500", children: [
                "$",
                Number(payout.amount_usd || 0).toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 break-all font-mono text-[11px] text-slate-500", children: payout.reference || payout.id }),
            payout.admin_note && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs font-semibold text-slate-600", children: payout.admin_note })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left sm:text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-xs font-semibold ${["paid", "completed"].includes(String(payout.status || "").toLowerCase()) ? "bg-emerald-100 text-emerald-700" : ["rejected", "failed"].includes(String(payout.status || "").toLowerCase()) ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`, children: payout.status || "pending" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-slate-500", children: payout.created_at ? new Date(payout.created_at).toLocaleString() : "" })
          ] })
        ] }) }, payout.id)) })
      ] })
    ] }) }),
    activeTab === "manuals" && /* @__PURE__ */ jsxRuntimeExports.jsx(ManualDownload, { userType: "doctor" }),
    activeTab === "availability" && /* @__PURE__ */ jsxRuntimeExports.jsx(DoctorAvailabilityManager, { doctor }),
    activeTab === "community" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      DoctorCommunityChat,
      {
        sender: {
          id: doctor.id,
          name: doctor.name,
          type: "doctor",
          phone: doctor.phone
        }
      }
    ),
    activeTab === "referrals" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SpecialtyReferralInbox, { doctor, onAcceptReferral: openAcceptedReferralWorkspace }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FacilityReferralManager, { doctor })
    ] }),
    activeTab === "patients" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-slate-900", children: "Consultation Control Center" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Patients appear here automatically when they start a live consultation or when a facility selects you." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs font-semibold text-slate-500", children: [
              "Showing ",
              consultationPatients.length,
              " of ",
              consultationPatientTotal,
              "."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: consultationPatientSearch,
                onChange: (e) => {
                  setConsultationPatientLimit(10);
                  setConsultationPatientSearch(e.target.value);
                },
                className: "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 sm:w-80",
                placeholder: "Search patient ID, name, phone"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => loadConsultationPatients(consultationPatientLimit, consultationPatientSearch),
                disabled: loadingConsultationPatients,
                className: "rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50",
                children: loadingConsultationPatients ? "Loading..." : "Refresh"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setWorkspacePanel("patients"),
                className: "rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600",
                children: selectedConsultationPatient ? "Change patient" : "Show patients"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 rounded-3xl border border-brand-100 bg-brand-50 p-6", children: selectedConsultationPatient && selectedConsultation ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.18em]", style: { color: adminSpecialtyInfo.color }, children: "Active patient workspace" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mt-1 text-2xl font-bold text-slate-900", children: selectedConsultationPatient.name || "Unnamed patient" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-slate-600", children: [
                "Patient ID: ",
                selectedConsultationPatient.id,
                " | Consultation ID: ",
                selectedConsultation.id
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-white px-4 py-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100", children: selectedConsultation.status || "in_progress" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex flex-wrap gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-2xl bg-white/70 px-5 py-3 text-sm font-semibold text-slate-600 ring-1 ring-brand-100", children: "Video stays open below. Use the consultation tools under the video." }) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-slate-900", children: "No patient selected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: "Press Show patients, select one patient, then open video, chat, vitals, prescription, labs, record review, or specialty referral." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setWorkspacePanel("patients"),
              className: "rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600",
              children: "Show patients"
            }
          )
        ] }) })
      ] }),
      workspacePanel === "patients" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        WorkspaceModal,
        {
          title: "Select Patient",
          subtitle: "Choose the patient to open for consultation.",
          onClose: () => setWorkspacePanel(""),
          size: "max-w-5xl",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: consultationPatientSearch,
                  onChange: (e) => {
                    setConsultationPatientLimit(10);
                    setConsultationPatientSearch(e.target.value);
                  },
                  className: "flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500",
                  placeholder: "Search patient ID, name, phone"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => loadConsultationPatients(consultationPatientLimit, consultationPatientSearch),
                  disabled: loadingConsultationPatients,
                  className: "rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50",
                  children: loadingConsultationPatients ? "Loading..." : "Refresh"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 space-y-5", children: consultationPatients.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl bg-slate-50 p-6 text-sm text-slate-600", children: "No active consultation patients yet." }) : consultationPatientSections.map((section) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-black uppercase tracking-[0.18em] text-slate-900", children: section.title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-500", children: section.subtitle })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-slate-500", children: [
                  section.patients.length,
                  " patient",
                  section.patients.length === 1 ? "" : "s"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", children: section.patients.map((patient, index) => {
                var _a2, _b2;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => openPatientWorkspace(patient, "video"),
                    className: `rounded-3xl border p-5 text-left transition hover:border-brand-200 ${patient.video_waiting ? "border-emerald-200 bg-emerald-50" : patient.source === "facility" ? "border-sky-200 bg-sky-50" : "border-slate-200 bg-slate-50"}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-black uppercase tracking-[0.18em]", style: { color: adminSpecialtyInfo.color }, children: getPatientSourceLabel(patient, index) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mt-1 text-lg font-bold text-slate-900", children: patient.name || "Unnamed patient" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs font-semibold text-slate-500", children: [
                          "ID: ",
                          patient.id
                        ] }),
                        patient.facility_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs font-semibold text-slate-500", children: [
                          "Facility: ",
                          patient.facility_name || patient.facility_id,
                          patient.facility_type ? ` (${patient.facility_type.replace(/_/g, " ")})` : ""
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-slate-600 lg:text-right", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-slate-900", children: getPatientChannelLabel(patient) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap justify-start gap-2 lg:justify-end", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700", children: ((_a2 = patient.latest_consultation) == null ? void 0 : _a2.status) || "in_progress" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-xs font-black ${patient.is_online ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"}`, children: patient.is_online ? "Patient online" : "Patient offline" }),
                          patient.video_waiting && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700", children: "Waiting in room" })
                        ] })
                      ] })
                    ] })
                  },
                  ((_b2 = patient.latest_consultation) == null ? void 0 : _b2.id) || patient.id
                );
              }) })
            ] }, section.title)) })
          ]
        }
      ),
      selectedConsultationPatient && selectedConsultation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-slate-900", children: "Live Video Consultation" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-slate-500", children: [
                selectedConsultationPatient.name || selectedConsultationPatient.id,
                " | ",
                selectedConsultation.id
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setWorkspacePanel("patients"),
                className: "rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800",
                children: "Change patient"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            VideoChatPanel,
            {
              consultationId: selectedConsultation.id,
              userId: doctor.id,
              userType: "doctor",
              patientId: selectedConsultationPatient.id,
              doctorId: doctor.id
            },
            selectedConsultation.id
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            VitalParametersMonitor,
            {
              consultationId: selectedConsultation.id,
              patientId: selectedConsultationPatient.id,
              doctorId: doctor.id,
              userType: "doctor",
              compact: true
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-slate-900", children: "Consultation Tools" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Use these while the video remains open above." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: [
              ["chat", "Chat"],
              ["vitals", "Vitals"],
              ["notes", "Notes"],
              ["prescription", "Prescription"],
              ["labs", "Lab request"],
              ["record", "Full record"],
              ["referral", "Refer specialty"]
            ].map(([panel, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setActiveConsultTool(panel),
                className: `rounded-2xl px-4 py-2 text-sm font-semibold ring-1 ${activeConsultTool === panel ? "bg-brand-700 text-white ring-brand-700" : "bg-slate-50 text-slate-700 ring-slate-200 hover:bg-slate-100"}`,
                children: label
              },
              panel
            )) })
          ] }),
          activeConsultTool === "chat" && /* @__PURE__ */ jsxRuntimeExports.jsx(ChatPanel, { consultationId: selectedConsultation.id, userId: doctor.id, userType: "doctor", recipientId: selectedConsultationPatient.id, recipientType: "patient", patientId: selectedConsultationPatient.id, doctorId: doctor.id }),
          activeConsultTool === "vitals" && /* @__PURE__ */ jsxRuntimeExports.jsx(VitalParametersMonitor, { consultationId: selectedConsultation.id, patientId: selectedConsultationPatient.id, doctorId: doctor.id, userType: "doctor" }),
          activeConsultTool === "notes" && /* @__PURE__ */ jsxRuntimeExports.jsx(DoctorPatientNotes, { patientId: selectedConsultationPatient.id, doctorId: doctor.id, consultationId: selectedConsultation.id }),
          activeConsultTool === "prescription" && /* @__PURE__ */ jsxRuntimeExports.jsx(PrescriptionManager, { mode: "doctor", consultationId: selectedConsultation.id, patientId: selectedConsultationPatient.id, patientName: selectedConsultationPatient.name, doctor, facilityId: selectedConsultation.facility_id }),
          activeConsultTool === "labs" && /* @__PURE__ */ jsxRuntimeExports.jsx(LabRequestManager, { mode: "doctor", consultationId: selectedConsultation.id, patientId: selectedConsultationPatient.id, patientName: selectedConsultationPatient.name, doctor }),
          activeConsultTool === "referral" && /* @__PURE__ */ jsxRuntimeExports.jsx(DoctorSpecialtyReferralPanel, { doctor, patient: selectedConsultationPatient, consultationId: selectedConsultation.id }),
          activeConsultTool === "record" && /* @__PURE__ */ jsxRuntimeExports.jsx(PatientRecordReview, { initialPatientId: selectedConsultationPatient.id, autoLoad: true })
        ] })
      ] })
    ] }),
    activeTab === "notifications" && /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationCenter, { userId: doctor.id, userType: "doctor" })
  ] });
}
export {
  AdminDashboard as default
};
