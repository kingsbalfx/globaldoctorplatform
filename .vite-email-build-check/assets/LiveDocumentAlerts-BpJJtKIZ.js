import { r as reactExports, j as jsxRuntimeExports } from "./react-Bu4vr6vE.js";
import { a as apiFetch } from "./index-DCY3-JaP.js";
import { d as downloadPrescription, a as downloadLabRequest } from "./LabRequestManager-Bp8fFV9d.js";
import { j as FileText, P as FlaskConical, X } from "./icons-Ci-JEzBE.js";
function LiveDocumentAlerts({ consultationId, patientId, patientName, doctor, facilityId }) {
  const [latestItem, setLatestItem] = reactExports.useState(null);
  const [recentItems, setRecentItems] = reactExports.useState([]);
  const seenRef = reactExports.useRef(/* @__PURE__ */ new Set());
  const initializedRef = reactExports.useRef(false);
  const contextKey = `${consultationId || ""}:${patientId || ""}:${facilityId || ""}`;
  reactExports.useEffect(() => {
    seenRef.current = /* @__PURE__ */ new Set();
    initializedRef.current = false;
    setLatestItem(null);
    setRecentItems([]);
  }, [contextKey]);
  reactExports.useEffect(() => {
    if (!patientId && !consultationId) return void 0;
    let cancelled = false;
    const loadDocuments = async () => {
      const prescriptionParams = new URLSearchParams();
      const labParams = new URLSearchParams();
      if (patientId) {
        prescriptionParams.set("patientId", patientId);
        labParams.set("patientId", patientId);
      }
      if (consultationId) {
        prescriptionParams.set("consultationId", consultationId);
        labParams.set("consultationId", consultationId);
      }
      if (facilityId) {
        prescriptionParams.set("facilityId", facilityId);
        labParams.set("facilityId", facilityId);
      }
      const [prescriptionResponse, labResponse] = await Promise.all([
        apiFetch(`/api/prescriptions?${prescriptionParams.toString()}`),
        apiFetch(`/api/labs/orders?${labParams.toString()}`)
      ]);
      const [prescriptionData, labData] = await Promise.all([
        prescriptionResponse.json().catch(() => ({})),
        labResponse.json().catch(() => ({}))
      ]);
      if (!prescriptionResponse.ok || !labResponse.ok || cancelled) return;
      const prescriptions = Array.isArray(prescriptionData.prescriptions) ? prescriptionData.prescriptions : [];
      const labs = Array.isArray(labData.orders) ? labData.orders : [];
      const items = [
        ...prescriptions.map((item) => ({
          id: `prescription:${item.id}`,
          type: "prescription",
          title: "New prescription received",
          subtitle: item.medications || item.prescription_text || "Prescription from your doctor",
          createdAt: item.issued_at || item.created_at,
          data: item
        })),
        ...labs.map((item) => ({
          id: `lab:${item.id}`,
          type: "lab",
          title: "New lab request received",
          subtitle: (item.tests || []).map((test) => typeof test === "string" ? test : test.name).filter(Boolean).join(", ") || "Lab / USS request form",
          createdAt: item.created_at,
          data: item
        }))
      ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setRecentItems(items.slice(0, 4));
      if (!initializedRef.current) {
        items.forEach((item) => seenRef.current.add(item.id));
        initializedRef.current = true;
        return;
      }
      const nextItem = items.find((item) => !seenRef.current.has(item.id));
      if (!nextItem) return;
      seenRef.current.add(nextItem.id);
      setLatestItem(nextItem);
      window.setTimeout(() => {
        if (nextItem.type === "prescription") downloadPrescription(nextItem.data);
        if (nextItem.type === "lab") {
          downloadLabRequest(nextItem.data, {
            patientName,
            doctorName: doctor == null ? void 0 : doctor.name,
            doctorLicenseNumber: (doctor == null ? void 0 : doctor.licenseNumber) || (doctor == null ? void 0 : doctor.license_number) || (doctor == null ? void 0 : doctor.rnNumber),
            doctorSignatureDataUrl: (doctor == null ? void 0 : doctor.signatureDataUrl) || (doctor == null ? void 0 : doctor.signature_data_url)
          });
        }
      }, 350);
    };
    void loadDocuments().catch(() => null);
    const interval = window.setInterval(() => {
      void loadDocuments().catch(() => null);
    }, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [consultationId, patientId, patientName, doctor, facilityId]);
  if (!latestItem && recentItems.length === 0) return null;
  const downloadItem = (item) => {
    if (item.type === "prescription") downloadPrescription(item.data);
    if (item.type === "lab") {
      downloadLabRequest(item.data, {
        patientName,
        doctorName: doctor == null ? void 0 : doctor.name,
        doctorLicenseNumber: (doctor == null ? void 0 : doctor.licenseNumber) || (doctor == null ? void 0 : doctor.license_number) || (doctor == null ? void 0 : doctor.rnNumber),
        doctorSignatureDataUrl: (doctor == null ? void 0 : doctor.signatureDataUrl) || (doctor == null ? void 0 : doctor.signature_data_url)
      });
    }
  };
  const Icon = (latestItem == null ? void 0 : latestItem.type) === "prescription" ? FileText : FlaskConical;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    latestItem && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-lg shadow-emerald-100/70", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-7 w-7" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.18em] text-emerald-700", children: "Live document" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1 text-lg font-black text-slate-900", children: latestItem.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 line-clamp-2 text-sm text-slate-600", children: latestItem.subtitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs font-semibold text-emerald-800", children: "Download started. You can download again here or review it later in the normal section." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => downloadItem(latestItem), className: "rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800", children: "Download" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setLatestItem(null), className: "grid h-9 w-9 place-items-center rounded-full bg-white text-slate-500 ring-1 ring-emerald-100 hover:text-slate-900", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] })
    ] }) }),
    recentItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-500", children: "Current consultation documents" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black text-slate-900", children: "Quick downloads" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-500", children: "Saved in Prescriptions or Lab Requests for later review." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid gap-3", children: recentItems.map((item) => {
        const ItemIcon = item.type === "prescription" ? FileText : FlaskConical;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => downloadItem(item),
            className: "flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:border-emerald-200 hover:bg-emerald-50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-10 w-10 place-items-center rounded-xl bg-white text-emerald-700 ring-1 ring-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIcon, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-sm font-bold text-slate-900", children: item.title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1 text-xs text-slate-500", children: item.subtitle })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white", children: "Download" })
            ]
          },
          item.id
        );
      }) })
    ] })
  ] });
}
export {
  LiveDocumentAlerts as L
};
