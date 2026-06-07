import { r as reactExports, j as jsxRuntimeExports } from "./react-Bu4vr6vE.js";
import { a as apiFetch } from "./index-DCY3-JaP.js";
import { R as RefreshCw, J as Inbox, K as Clock, N as UserCheck, C as CheckCircle2, q as Search, L as Loader2, j as FileText, O as ExternalLink } from "./icons-Ci-JEzBE.js";
import "./vendor-Qe2gXTEC.js";
import "./i18n-D-V3U9NC.js";
const statusOptions = ["all", "new", "open", "assigned", "closed"];
function badgeClass(status) {
  const value = String(status || "new").toLowerCase();
  if (value === "closed") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (value === "open" || value === "assigned") return "bg-blue-50 text-blue-700 ring-blue-100";
  return "bg-amber-50 text-amber-700 ring-amber-100";
}
function formatSize(bytes) {
  const value = Number(bytes || 0);
  if (!value) return "0KB";
  if (value < 1024 * 1024) return `${Math.ceil(value / 1024)}KB`;
  return `${(value / (1024 * 1024)).toFixed(1)}MB`;
}
function fileStatusClass(status) {
  const value = String(status || "").toLowerCase();
  if (value.includes("stored")) return "text-emerald-700 bg-emerald-50 ring-emerald-100";
  if (value.includes("failed")) return "text-red-700 bg-red-50 ring-red-100";
  return "text-amber-700 bg-amber-50 ring-amber-100";
}
function SupportDashboard() {
  const [tickets, setTickets] = reactExports.useState([]);
  const [selected, setSelected] = reactExports.useState(null);
  const [status, setStatus] = reactExports.useState("all");
  const [query, setQuery] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [assignedTo, setAssignedTo] = reactExports.useState("");
  const selectedFiles = (selected == null ? void 0 : selected.support_files) || [];
  const filteredTickets = reactExports.useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return tickets;
    return tickets.filter((ticket) => [ticket.id, ticket.full_name, ticket.email, ticket.subject, ticket.status].some((value) => String(value || "").toLowerCase().includes(term)));
  }, [tickets, query]);
  const stats = reactExports.useMemo(() => {
    return {
      total: tickets.length,
      new: tickets.filter((ticket) => String(ticket.status || "new") === "new").length,
      open: tickets.filter((ticket) => ["open", "assigned"].includes(String(ticket.status || ""))).length,
      closed: tickets.filter((ticket) => String(ticket.status || "") === "closed").length
    };
  }, [tickets]);
  const loadTickets = async (nextStatus = status) => {
    setLoading(true);
    setError("");
    try {
      const suffix = nextStatus && nextStatus !== "all" ? `?status=${encodeURIComponent(nextStatus)}` : "";
      const response = await apiFetch(`/api/support/tickets${suffix}`);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Could not load requests.");
      const nextTickets = payload.tickets || [];
      setTickets(nextTickets);
      setSelected((current) => {
        if (current == null ? void 0 : current.id) return nextTickets.find((ticket) => ticket.id === current.id) || nextTickets[0] || null;
        return nextTickets[0] || null;
      });
    } catch (loadError) {
      setError(loadError.message || "Could not load requests.");
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    loadTickets("all");
  }, []);
  reactExports.useEffect(() => {
    if (selected) {
      setNotes(selected.notes || "");
      setAssignedTo(selected.assigned_to || "");
    }
  }, [selected]);
  const selectTicket = (ticket) => setSelected(ticket);
  const updateTicket = async (nextStatus = (selected == null ? void 0 : selected.status) || "open") => {
    if (!(selected == null ? void 0 : selected.id)) return;
    setSaving(true);
    setError("");
    try {
      const response = await apiFetch("/api/support/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: selected.id, status: nextStatus, notes, assignedTo })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Could not update request.");
      setSelected(payload.ticket);
      setTickets((current) => current.map((ticket) => ticket.id === payload.ticket.id ? payload.ticket : ticket));
    } catch (saveError) {
      setError(saveError.message || "Could not update request.");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-7xl px-6 py-10 sm:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "inline-flex items-center rounded-full bg-brand-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-brand-700", children: "Agent workspace" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 text-3xl font-bold text-slate-900", children: "Support requests" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-2xl text-sm leading-7 text-slate-600", children: "Review submitted requests, uploaded documents, status, and internal notes." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => loadTickets(status), className: "inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }),
        " Refresh"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 grid gap-4 sm:grid-cols-4", children: [["Total", stats.total, Inbox], ["New", stats.new, Clock], ["Open", stats.open, UserCheck], ["Closed", stats.closed, CheckCircle2]].map(([label, value, Icon]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-slate-200 bg-slate-50 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5 text-brand-700" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm font-semibold text-slate-500", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-3xl font-bold text-slate-900", children: value })
    ] }, label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-col gap-3 sm:flex-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 text-slate-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Search by ID, name, email, subject...", className: "min-w-0 flex-1 outline-none" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: status, onChange: (event) => {
        setStatus(event.target.value);
        loadTickets(event.target.value);
      }, className: "rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 outline-none", children: statusOptions.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: option, children: option }, option)) })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[620px] space-y-3 overflow-y-auto pr-1", children: [
        loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-slate-50 p-6 text-center text-slate-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "mx-auto mb-2 h-6 w-6 animate-spin" }),
          "Loading requests..."
        ] }),
        !loading && filteredTickets.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl bg-slate-50 p-6 text-center text-slate-600", children: "No requests found." }),
        filteredTickets.map((ticket) => {
          const count = (ticket.support_files || []).length;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => selectTicket(ticket), className: `block w-full rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 ${(selected == null ? void 0 : selected.id) === ticket.id ? "border-brand-300 bg-brand-50" : "border-slate-200 bg-slate-50 hover:bg-white"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-[0.16em] text-slate-500", children: ticket.id }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 font-bold text-slate-900", children: ticket.subject || "Request" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-slate-600", children: [
                ticket.full_name || "Unknown",
                " · ",
                ticket.email
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-700 ring-1 ring-brand-100", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
                " ",
                count,
                " file",
                count === 1 ? "" : "s"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-xs font-bold ring-1 ${badgeClass(ticket.status)}`, children: ticket.status || "new" })
          ] }) }, ticket.id);
        })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl border border-slate-200 bg-slate-50 p-5", children: !selected ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-600", children: "Select a request to view details." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-[0.16em] text-slate-500", children: selected.id }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 text-2xl font-bold text-slate-900", children: selected.subject || "Request details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-slate-600", children: [
              selected.full_name,
              " · ",
              selected.email
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-xs font-bold ring-1 ${badgeClass(selected.status)}`, children: selected.status || "new" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 rounded-2xl bg-white p-4 text-sm leading-7 text-slate-700 whitespace-pre-wrap", children: selected.complaint || "No details provided." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-1 text-sm font-semibold text-slate-700", children: [
            "Assigned to",
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: assignedTo, onChange: (event) => setAssignedTo(event.target.value), className: "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400", placeholder: "Agent name or email" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-1 text-sm font-semibold text-slate-700", children: [
            "Status",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: selected.status || "new", onChange: (event) => setSelected((current) => ({ ...current, status: event.target.value })), className: "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "new" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "open" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "assigned" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "closed" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mt-4 block space-y-1 text-sm font-semibold text-slate-700", children: [
          "Internal notes",
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: notes, onChange: (event) => setNotes(event.target.value), rows: 5, className: "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-400" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl bg-white p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-slate-900", children: "Uploaded documents" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 ring-1 ring-brand-100", children: selectedFiles.length })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2", children: [
            selectedFiles.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "No uploaded documents found for this request." }),
            selectedFiles.map((file) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-slate-50 p-3 text-sm text-slate-700 ring-1 ring-slate-100", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-bold text-slate-900", children: file.file_name || "Uploaded file" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-500", children: [
                  file.file_type || "file",
                  " · ",
                  formatSize(file.file_size),
                  " · ",
                  file.created_at ? new Date(file.created_at).toLocaleString() : "No date"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${fileStatusClass(file.storage_status)}`, children: file.storage_status || "recorded" })
              ] }),
              file.file_url ? /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: file.file_url, target: "_blank", rel: "noopener noreferrer", className: "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600", children: [
                "Open document ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 rounded-xl bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 ring-1 ring-amber-100", children: "No link available" })
            ] }) }, file.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => updateTicket(selected.status || "open"), disabled: saving, className: "mt-5 inline-flex items-center gap-2 rounded-2xl bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:bg-slate-300", children: [
          saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4" }),
          " Save request"
        ] })
      ] }) })
    ] })
  ] }) });
}
export {
  SupportDashboard as default
};
