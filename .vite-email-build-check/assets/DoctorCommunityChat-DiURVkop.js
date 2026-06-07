import { r as reactExports, j as jsxRuntimeExports } from "./react-Bu4vr6vE.js";
import { u as useError, a as apiFetch, r as readApiJson } from "./index-DCY3-JaP.js";
import { d as MessageCircle, S as Send } from "./icons-Ci-JEzBE.js";
function mergeCommunityMessages(current, incoming) {
  const byId = new Map(current.map((message) => [String(message.id), message]));
  incoming.forEach((message) => {
    if ((message == null ? void 0 : message.id) != null) byId.set(String(message.id), message);
  });
  return Array.from(byId.values()).sort((a, b) => {
    const left = a.createdAt || a.created_at;
    const right = b.createdAt || b.created_at;
    return new Date(left) - new Date(right);
  });
}
function DoctorCommunityChat({ sender }) {
  const { addError } = useError();
  const [messages, setMessages] = reactExports.useState([]);
  const [draft, setDraft] = reactExports.useState("");
  const [initialLoading, setInitialLoading] = reactExports.useState(true);
  const [sending, setSending] = reactExports.useState(false);
  const messageViewportRef = reactExports.useRef(null);
  const requestInFlightRef = reactExports.useRef(false);
  const stickToBottomRef = reactExports.useRef(true);
  const forceScrollRef = reactExports.useRef(true);
  const loadMessages = reactExports.useCallback(async ({ initial = false } = {}) => {
    if (requestInFlightRef.current) return;
    requestInFlightRef.current = true;
    if (initial) setInitialLoading(true);
    try {
      const response = await apiFetch(`/api/doctors/community/messages`);
      const data = await readApiJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to load community messages");
      const rows = Array.isArray(data.messages) ? data.messages.slice().reverse() : [];
      setMessages((current) => {
        const merged = mergeCommunityMessages(current, rows);
        if (merged.length === current.length && merged.every((item, index) => {
          var _a;
          return String(item.id) === String((_a = current[index]) == null ? void 0 : _a.id);
        })) {
          return current;
        }
        return merged;
      });
    } catch (error) {
      console.error("Failed to load community messages", error);
    } finally {
      requestInFlightRef.current = false;
      if (initial) setInitialLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    void loadMessages({ initial: true });
    const id = window.setInterval(() => void loadMessages(), 1e4);
    return () => window.clearInterval(id);
  }, [loadMessages]);
  reactExports.useEffect(() => {
    const viewport = messageViewportRef.current;
    if (!viewport || !forceScrollRef.current && !stickToBottomRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      viewport.scrollTop = viewport.scrollHeight;
      forceScrollRef.current = false;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [messages.length]);
  const handleScroll = () => {
    const viewport = messageViewportRef.current;
    if (!viewport) return;
    stickToBottomRef.current = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 72;
  };
  const sendMessage = async (event) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message || !(sender == null ? void 0 : sender.id) || sending) return;
    setSending(true);
    try {
      const response = await apiFetch(`/api/doctors/community/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: sender.id,
          senderName: sender.name,
          senderType: sender.type,
          phone: sender.phone,
          message
        })
      });
      const data = await readApiJson(response);
      if (!response.ok) throw new Error(data.error || "Message failed");
      setDraft("");
      forceScrollRef.current = true;
      if (data.communityMessage) {
        setMessages((current) => mergeCommunityMessages(current, [data.communityMessage]));
      } else {
        void loadMessages();
      }
    } catch (error) {
      addError(error.message, "error");
    } finally {
      setSending(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-5 w-5", "aria-hidden": "true" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-slate-900", children: "Doctor Community Chat" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600", children: "Registered doctors and platform admin share updates here." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: messageViewportRef,
        onScroll: handleScroll,
        className: "mt-6 h-[420px] space-y-3 overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-slate-100 p-4",
        children: initialLoading && messages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-slate-500", children: "Loading community chat..." }) : messages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-slate-500", children: "No community messages yet." }) : messages.map((item) => {
          const senderId = item.senderId || item.sender_id;
          const senderName = item.senderName || item.sender_name;
          const senderType = item.senderType || item.sender_type;
          const createdAt = item.createdAt || item.created_at;
          const mine = String(senderId) === String(sender == null ? void 0 : sender.id);
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex ${mine ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `max-w-[88%] rounded-2xl px-4 py-3 shadow-sm ${mine ? "bg-brand-700 text-white" : "bg-white text-slate-800"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs opacity-80", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: senderName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: senderType === "admin" ? "Admin" : "Doctor" }),
              item.phone && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.phone })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 whitespace-pre-wrap break-words text-sm leading-6", children: item.message }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[10px] opacity-70", children: new Date(createdAt).toLocaleString() })
          ] }) }, item.id);
        })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: sendMessage, className: "mt-4 flex flex-col gap-3 sm:flex-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: draft,
          onChange: (event) => setDraft(event.target.value),
          className: "min-h-[52px] flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500",
          placeholder: "Share a clinical update, referral note, or admin announcement..."
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "submit",
          disabled: sending || !draft.trim(),
          className: "inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4", "aria-hidden": "true" }),
            "Send"
          ]
        }
      )
    ] })
  ] });
}
export {
  DoctorCommunityChat as D
};
