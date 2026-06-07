const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/LandingPageEnhanced-C7SSrMNt.js","assets/react-Bu4vr6vE.js","assets/vendor-Qe2gXTEC.js","assets/AnnouncementBanner-typdvJzp.js","assets/LanguageSelector-DIosTXAB.js","assets/i18n-D-V3U9NC.js","assets/icons-Ci-JEzBE.js","assets/ProfileAvatar-6oVVdv9U.js","assets/TelehealthArt-DC0HZ32N.js","assets/AdminDashboard-MbKi07EX.js","assets/VitalParametersMonitor-D7Sg6amh.js","assets/DoctorCommunityChat-DiURVkop.js","assets/LabRequestManager-Bp8fFV9d.js","assets/specialtyRegistry-mMIpmDWJ.js","assets/PatientDashboard-mMixdN4E.js","assets/GoogleSignInButton-Um7n1y8i.js","assets/supabaseClient-iq1FVAJ-.js","assets/supabase-CHf_0O8y.js","assets/LiveDocumentAlerts-BpJJtKIZ.js","assets/PlatformAdminDashboard-T0Iz4tUG.js","assets/DoctorAuth-WJe3NkVQ.js","assets/SupportDashboard-BAeKdv2d.js","assets/RequestTracker-COjhboh0.js","assets/FacilityPortal-Ma9OBfye.js","assets/AuthCallback-ezmxtCvj.js","assets/PaymentSuccess-BRxiDwfh.js","assets/ResetPassword-Bbf1-Oga.js","assets/TermsOfService-B2cWqv4D.js","assets/PrivacyPolicy-DtScRexi.js","assets/Contact--yKCk2cU.js"])))=>i.map(i=>d[i]);
import { j as jsxRuntimeExports, r as reactExports, R as React, c as client } from "./react-Bu4vr6vE.js";
import { C as CheckCircle2, a as Copy, U as UserRound, M as Mail, F as FileUp, T as Trash2, L as Loader2, S as Send, B as Bot, b as Sparkles, X, c as Minus, d as MessageCircle, e as CalendarDays, V as Video, f as ShieldCheck, A as ArrowRight, g as Languages, h as MicOff, i as Mic, j as FileText, k as AlertCircle, I as Info, l as AlertTriangle, m as CheckCircle } from "./icons-Ci-JEzBE.js";
import { i as instance, B as Browser, a as initReactI18next } from "./i18n-D-V3U9NC.js";
import "./vendor-Qe2gXTEC.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = Promise.allSettled(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
function Footer({ onNavigate }) {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const socialLinks = [
    {
      name: "X (Twitter)",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" }) }),
      url: "https://x.com/globaldocconect?s=21",
      color: "hover:text-blue-400"
    },
    {
      name: "Facebook",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" }) }),
      url: "https://www.facebook.com/share/17zMNXnaXV/?mibextid=wwXIfr",
      color: "hover:text-blue-600"
    },
    {
      name: "Instagram",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12.017 0C8.396 0 7.966.017 6.69.07 5.415.123 4.616.265 3.967.52c-.706.277-1.307.638-1.907 1.237C1.553 2.357 1.192 2.958.915 3.664.66 4.313.518 5.112.465 6.387c-.053 1.276-.07 1.706-.07 5.327s.017 4.051.07 5.327c.053 1.275.195 2.074.45 2.723.277.706.638 1.307 1.237 1.907.6.6 1.201.96 1.907 1.237.651.255 1.45.397 2.725.45 1.275.053 1.705.07 5.326.07s4.051-.017 5.327-.07c1.275-.053 2.074-.195 2.723-.45.706-.277 1.307-.638 1.907-1.237.6-.6.96-1.201 1.237-1.907.255-.651.397-1.45.45-2.725.053-1.275.07-1.705.07-5.326s-.017-4.051-.07-5.327c-.053-1.275-.195-2.074-.45-2.723-.277-.706-.638-1.307-1.237-1.907C21.643 1.553 21.042.915 20.336.638c-.651-.255-1.45-.397-2.725-.45C16.336.07 15.906 0 12.285 0c-3.621 0-4.051.017-5.268.07zm5.268 2.147c3.59 0 4.021.014 5.446.08 1.374.063 2.242.29 2.766.49.652.25 1.122.56 1.622 1.06.5.5.81.97 1.06 1.622.2.524.427 1.392.49 2.766.066 1.425.08 1.856.08 5.446s-.014 4.021-.08 5.446c-.063 1.374-.29 2.242-.49 2.766-.25.652-.56 1.122-1.06 1.622-.5.5-.97.81-1.622 1.06-.524.2-1.392.427-2.766.49-1.425.066-1.856.08-5.446.08s-4.021-.014-5.446-.08c-1.374-.063-2.242-.29-2.766-.49-.652-.25-1.122-.56-1.622-1.06-.5-.5-.81-.97-1.06-1.622-.2-.524-.427-1.392-.49-2.766C2.147 15.906 2.133 15.475 2.133 12s.014-4.021.08-5.446c.063-1.374.29-2.242.49-2.766.25-.652.56-1.122 1.06-1.622.5-.5.97-.81 1.622-1.06.524-.2 1.392-.427 2.766-.49 1.425-.066 1.856-.08 5.446-.08zM12.017 5.837c-3.957 0-7.18 3.223-7.18 7.18s3.223 7.18 7.18 7.18 7.18-3.223 7.18-7.18-3.223-7.18-7.18-7.18zm0 11.847c-2.554 0-4.667-2.113-4.667-4.667s2.113-4.667 4.667-4.667 4.667 2.113 4.667 4.667-2.113 4.667-4.667 4.667zm8.473-11.847c0 .928-.753 1.68-1.68 1.68s-1.68-.752-1.68-1.68.752-1.68 1.68-1.68 1.68.752 1.68 1.68z" }) }),
      url: "https://www.instagram.com/globaldoctorconnect?igsh=cjQ0cWo4Z3Zwencx&utm_source=qr",
      color: "hover:text-pink-500"
    },
    {
      name: "Telegram",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" }) }),
      url: "https://t.me/globaldoctorconnect",
      color: "hover:text-blue-500"
    },
    {
      name: "Snapchat",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 2.22.184 3.558-.598 3.766-2.558 8.99-4.493 11.595-.384.516-.783.94-1.23 1.23-.469.304-.973.456-1.516.456-.542 0-1.047-.152-1.516-.456-.447-.29-.846-.714-1.23-1.23C6.058 17.16 4.098 11.936 3.5 8.17 3.281 6.832 3.155 5.805 3.684 4.612 5.267 1.067 8.624.793 9.614.793c.06 0 .118.014.178.014.06-.014.118-.014.178-.014zm-.542 1.363c-.06 0-.118.014-.178.014-.06-.014-.118-.014-.178-.014-.792 0-3.614.215-4.956 3.221-.465 1.052-.37 2.007-.184 3.211.552 3.506 2.31 8.342 4.116 10.884.18.254.39.49.628.706.238-.216.448-.452.628-.706 1.806-2.542 3.564-7.378 4.116-10.884.186-1.204.281-2.159-.184-3.211C15.358 2.371 12.536 2.156 11.744 2.156zm-.178 3.628c.99 0 1.794.804 1.794 1.794 0 .99-.804 1.794-1.794 1.794-.99 0-1.794-.804-1.794-1.794 0-.99.804-1.794 1.794-1.794zm0 1.363c-.24 0-.431.191-.431.431s.191.431.431.431.431-.191.431-.431-.191-.431-.431-.431z" }) }),
      url: "https://snapchat.com/t/Aja0vDJ3",
      color: "hover:text-yellow-500"
    },
    {
      name: "YouTube",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M23.498 6.186a2.99 2.99 0 0 0-2.105-2.115C19.64 3.6 12 3.6 12 3.6s-7.64 0-9.393.471A2.99 2.99 0 0 0 .502 6.186C0 7.95 0 11.632 0 11.632s0 3.683.502 5.446a2.99 2.99 0 0 0 2.105 2.115c1.753.471 9.393.471 9.393.471s7.64 0 9.393-.471a2.99 2.99 0 0 0 2.105-2.115c.502-1.763.502-5.446.502-5.446s0-3.683-.502-5.446zM9.75 15.02V8.244l6.25 3.388-6.25 3.388z" }) }),
      url: "https://youtube.com/@globaldoctorconnect?si=iUt3W3UnAZgzks6U",
      color: "hover:text-red-500"
    },
    {
      name: "TikTok",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" }) }),
      url: "https://www.tiktok.com/@globaldoctorconnect?_r=1&_t=ZS-960Uu9wBAma",
      color: "hover:text-pink-600"
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "bg-slate-900 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-6 py-12 sm:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/logo.png", alt: "GlobalDoc Connect logo", className: "h-8 w-8 rounded-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold text-brand-400", children: "GlobalDoc Connect" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-300 mb-4 max-w-md", children: "Connecting patients worldwide with verified healthcare professionals through secure telehealth consultations, emergency support, and comprehensive medical services." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex space-x-4", children: socialLinks.map((social) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: social.url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: `text-slate-400 transition-colors duration-200 ${social.color}`,
            "aria-label": social.name,
            children: social.icon
          },
          social.name
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold mb-4 text-white", children: "Quick Links" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#search", className: "text-slate-300 hover:text-brand-400 transition-colors duration-200", children: "Find Doctors" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#for-doctors", className: "text-slate-300 hover:text-brand-400 transition-colors duration-200", children: "For Doctors" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#emergency", className: "text-slate-300 hover:text-brand-400 transition-colors duration-200", children: "Emergency Support" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#pricing", className: "text-slate-300 hover:text-brand-400 transition-colors duration-200", children: "Pricing" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold mb-4 text-white", children: "Legal & Support" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => onNavigate("terms"),
              className: "text-slate-300 hover:text-brand-400 transition-colors duration-200 text-left",
              children: "Terms of Service"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => onNavigate("privacy"),
              className: "text-slate-300 hover:text-brand-400 transition-colors duration-200 text-left",
              children: "Privacy Policy"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => onNavigate("contact"),
              className: "text-slate-300 hover:text-brand-400 transition-colors duration-200 text-left",
              children: "Contact Us"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "mailto:globaldoctorconnect@gmail.com", className: "text-slate-300 hover:text-brand-400 transition-colors duration-200", children: "Support Email" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-slate-700 pt-8 mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold mb-2 text-white", children: "Contact Information" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-slate-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Email:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "mailto:globaldoctorconnect@gmail.com", className: "text-brand-400 hover:text-brand-300", children: "globaldoctorconnect@gmail.com" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Emergency:" }),
            " Available 24/7 for urgent medical consultations"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Languages:" }),
            " English, Arabic, Swahili, Hindi, French, Spanish"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold mb-2 text-white", children: "Service Areas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2", children: "Available worldwide with specialized care in:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: ["Cardiology", "Dermatology", "Psychiatry", "Pediatrics", "Oncology", "Emergency Care"].map((specialty) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-slate-700 px-2 py-1 rounded-full text-xs", children: specialty }, specialty)) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-slate-700 pt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row justify-between items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-400 text-sm", children: [
        "© ",
        currentYear,
        " GlobalDoc Connect. All rights reserved."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-6 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => onNavigate("terms"),
            className: "text-slate-400 hover:text-brand-400 transition-colors duration-200",
            children: "Terms of Service"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => onNavigate("privacy"),
            className: "text-slate-400 hover:text-brand-400 transition-colors duration-200",
            children: "Privacy Policy"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => onNavigate("contact"),
            className: "text-slate-400 hover:text-brand-400 transition-colors duration-200",
            children: "Contact"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "mailto:globaldoctorconnect@gmail.com", className: "text-slate-400 hover:text-brand-400 transition-colors duration-200", children: "Support" })
      ] })
    ] }) })
  ] }) });
}
const PRODUCTION_ORIGIN = "https://globaldoctorplatform.vercel.app";
function normalizeApiBase(rawValue) {
  const value = String(rawValue).trim();
  if (!value) return "";
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.origin;
  } catch {
    return "";
  }
}
let apiBase = "";
if (typeof window !== "undefined" && true && window.location.origin) {
  apiBase = window.location.origin;
} else {
  apiBase = normalizeApiBase("http://localhost:4000") || PRODUCTION_ORIGIN;
}
const API_BASE = (apiBase || PRODUCTION_ORIGIN).replace(/\/+$/, "");
function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).replace(/\/+$/, "")))];
}
function getApiBaseCandidates() {
  const sameOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const isLocalPage = /localhost|127\.0\.0\.1/i.test(sameOrigin);
  return unique([API_BASE, PRODUCTION_ORIGIN, isLocalPage ? "" : sameOrigin]);
}
async function apiFetch(path, options = {}) {
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
  let lastError;
  for (const base of getApiBaseCandidates()) {
    try {
      return await fetch(`${base}${normalizedPath}`, options);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Network request failed");
}
async function readApiJson(response, fallback = {}) {
  if (!response) return fallback;
  const copy = response.clone();
  try {
    return await response.json();
  } catch {
    const text = await copy.text().catch(() => "");
    return text ? { ...fallback, error: text } : fallback;
  }
}
const TYPES = ["application/pdf", "image/png", "image/jpeg", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_FILES = 5;
const MAX_BYTES = 2 * 1024 * 1024;
function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}
function readDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("File could not be read"));
    reader.readAsDataURL(file);
  });
}
function sizeLabel(bytes) {
  if (!bytes) return "0KB";
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
function goToTracker() {
  if (typeof window === "undefined") return;
  window.location.href = "/request-tracker";
}
function RequestIntakeForm({ onSubmitted }) {
  const [form, setForm] = reactExports.useState({
    fullName: "",
    email: "",
    country: "",
    language: "English",
    preferredContact: "Email",
    subject: "Support request",
    complaint: ""
  });
  const [files, setFiles] = reactExports.useState([]);
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [done, setDone] = reactExports.useState(null);
  const [copied, setCopied] = reactExports.useState(false);
  const canSubmit = reactExports.useMemo(() => form.fullName.trim() && validEmail(form.email) && form.complaint.trim() && !loading, [form, loading]);
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const addFiles = (list) => {
    setError("");
    const next = [...files];
    for (const file of Array.from(list || [])) {
      if (next.length >= MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed.`);
        break;
      }
      if (!TYPES.includes(file.type)) {
        setError("Only PDF, PNG, JPG, JPEG, and DOCX files are allowed.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`${file.name} is larger than 2MB.`);
        continue;
      }
      next.push(file);
    }
    setFiles(next);
  };
  const copyId = async () => {
    if (!(done == null ? void 0 : done.caseId)) return;
    try {
      await navigator.clipboard.writeText(done.caseId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setDone(null);
    if (!form.fullName.trim()) return setError("Full name is required.");
    if (!validEmail(form.email)) return setError("A valid email address is required.");
    if (!form.complaint.trim()) return setError("Request details are required.");
    setLoading(true);
    try {
      const encoded = await Promise.all(files.map(async (file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        base64: await readDataUrl(file)
      })));
      const response = await apiFetch("/api/support/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, files: encoded })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Request could not be submitted.");
      const submitted = {
        caseId: payload.caseId,
        emailSent: Boolean(payload.emailSent),
        stored: Boolean(payload.stored),
        fullName: form.fullName,
        email: form.email
      };
      setDone(submitted);
      onSubmitted == null ? void 0 : onSubmitted(submitted);
    } catch (err) {
      setError(err.message || "Request could not be submitted.");
    } finally {
      setLoading(false);
    }
  };
  if (done) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-5 text-emerald-900", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "mt-0.5 h-6 w-6 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold", children: "Request submitted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl border border-emerald-200 bg-white p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-[0.18em] text-emerald-700", children: "Save this Request ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded-xl bg-emerald-900 px-4 py-2 text-lg font-black tracking-wide text-white", children: done.caseId }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: copyId, className: "inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5" }),
              " ",
              copied ? "Copied" : "Copy ID"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-sm leading-6", children: [
          "Use this ID whenever you contact support or track your request. Your email ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: done.email }),
          " is linked to it."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: goToTracker, className: "mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-brand-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600", children: "Track request" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs font-semibold text-emerald-700", children: "Chat is now unlocked." })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[1.5rem] border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-slate-50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900", children: "Submit a request before chat" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm leading-6 text-slate-600", children: "No account is required. Enter a valid email, describe what you need, and attach files if useful. Your Request ID will be shown clearly after submission." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-1 text-sm font-semibold text-slate-700", children: [
        "Full name *",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-4 w-4 text-slate-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.fullName, onChange: (event) => setField("fullName", event.target.value), className: "min-w-0 flex-1 bg-transparent outline-none", placeholder: "Your name" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-1 text-sm font-semibold text-slate-700", children: [
        "Email address *",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4 text-slate-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: form.email, onChange: (event) => setField("email", event.target.value), className: "min-w-0 flex-1 bg-transparent outline-none", placeholder: "you@email.com" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-1 text-sm font-semibold text-slate-700", children: [
        "Country",
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.country, onChange: (event) => setField("country", event.target.value), className: "w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-brand-400", placeholder: "Nigeria" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-1 text-sm font-semibold text-slate-700", children: [
        "Preferred language",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: form.language, onChange: (event) => setField("language", event.target.value), className: "w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-brand-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "English" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Hausa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Arabic" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "French" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Yoruba" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Igbo" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-1 text-sm font-semibold text-slate-700", children: [
      "Subject",
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.subject, onChange: (event) => setField("subject", event.target.value), className: "w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-brand-400" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-1 text-sm font-semibold text-slate-700", children: [
      "Request details *",
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: form.complaint, onChange: (event) => setField("complaint", event.target.value), rows: 4, className: "w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-brand-400", placeholder: "Explain what you need help with..." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[1.5rem] border border-dashed border-brand-200 bg-white p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer flex-col items-center justify-center gap-2 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileUp, { className: "h-7 w-7 text-brand-700" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-slate-900", children: "Upload documents" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-slate-500", children: "PDF, PNG, JPG, JPEG, DOCX. Max 5 files, 2MB each." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", multiple: true, accept: ".pdf,.png,.jpg,.jpeg,.docx", onChange: (event) => addFiles(event.target.files), className: "hidden" })
      ] }),
      files.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-2", children: files.map((file, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 truncate text-slate-700", children: [
          file.name,
          " · ",
          sizeLabel(file.size)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setFiles((current) => current.filter((_, i) => i !== index)), className: "rounded-full p-2 text-red-500 hover:bg-red-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] }, `${file.name}-${index}`)) })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", disabled: !canSubmit, className: "flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-700/20 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300", children: [
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
      loading ? "Submitting request..." : "Submit request and start chat"
    ] })
  ] });
}
const portalProfiles = {
  landing: {
    title: "GlobalDoc AI Guide",
    badge: "Platform guide",
    greeting: "Hello 👋 I am your GlobalDoc AI guide. Submit a quick request first, then I can help with directions, booking flow, uploads, video, and support.",
    quickActions: ["How does it work?", "Find a provider", "Patient portal", "Provider portal"]
  },
  patient: {
    title: "Patient AI Guide",
    badge: "Patient support",
    greeting: "Hi 👋 Submit your contact details and request first. After that, I can guide you around booking, files, chat, video, notifications, and support.",
    quickActions: ["Book a visit", "Upload files", "Start video", "Contact support"]
  },
  doctor: {
    title: "Provider AI Guide",
    badge: "Workspace guide",
    greeting: "Hello 👋 Submit a support request first, then I can help you move around the provider workspace and organize your daily flow.",
    quickActions: ["Provider dashboard", "Follow-up flow", "Messages", "Support issue"]
  },
  facility: {
    title: "Facility AI Guide",
    badge: "Facility support",
    greeting: "Hello 👋 Submit a support request first, then I can help with facility navigation, team coordination, and support links.",
    quickActions: ["Facility portal", "Team flow", "Provider matching", "Contact support"]
  },
  "platform-admin": {
    title: "Admin AI Guide",
    badge: "Operations",
    greeting: "Hello admin 👋 I can help explain operations, user flows, checks, and support workflows.",
    quickActions: ["Admin portal", "Support issue", "User checks", "Booking problem"]
  }
};
const routeActions = [
  { label: "Patient Portal", href: "/patient", keywords: ["patient", "patient portal", "book", "appointment", "visit", "files", "video"] },
  { label: "Provider Portal", href: "/doctor", keywords: ["doctor", "provider", "provider portal", "doctor portal"] },
  { label: "Facility Portal", href: "/facility", keywords: ["facility", "hospital", "clinic"] },
  { label: "Platform Admin", href: "/platform-admin", keywords: ["admin", "platform admin"] },
  { label: "Support Dashboard", href: "/platform-admin/support", keywords: ["support dashboard", "tickets", "cases"] },
  { label: "Track Request", href: "/request-tracker", keywords: ["track", "tracking", "request id", "case id", "status"] },
  { label: "Search Providers", href: "/#search", keywords: ["find", "search", "provider", "specialist"] },
  { label: "Directory", href: "/#directory", keywords: ["directory", "available", "list", "browse"] },
  { label: "How It Works", href: "/#how-it-works", keywords: ["how", "work", "explain", "walkthrough", "guide"] },
  { label: "Contact Support", href: "/contact", keywords: ["contact", "support", "help", "email", "complaint"] }
];
const languageLabels = {
  en: "English",
  ha: "Hausa",
  yo: "Yoruba",
  ig: "Igbo",
  ar: "Arabic",
  fr: "French"
};
function getPortalProfile(portal) {
  return portalProfiles[portal] || portalProfiles.landing;
}
function findRoutes(text) {
  const lower = String(text || "").toLowerCase();
  return routeActions.filter((route) => route.keywords.some((keyword) => lower.includes(keyword))).slice(0, 3);
}
function humanReply(text) {
  const lower = String(text || "").trim().toLowerCase();
  if (!lower) return null;
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|salam|assalamu alaikum)\b/.test(lower)) return "Hello 👋 I am doing great and ready to help. Tell me what you want to do, and I will guide you there.";
  if (lower.includes("how are you") || lower.includes("how far") || lower.includes("are you okay")) return "I am doing well, thank you 😊 What would you like to do today?";
  if (lower.includes("thank")) return "You are welcome. I am here whenever you need help.";
  if (lower.includes("who are you") || lower.includes("your name")) return "I am the GlobalDoc AI Guide — your assistant for navigation, communication, and platform direction.";
  if (lower.includes("what can you do") || lower.includes("help me")) return "I can answer simple questions, show useful links, and direct users to patient, provider, facility, admin, directory, walkthrough, tracker, or support pages.";
  return null;
}
function buildResponse(input, portal, supportCase) {
  const text = String(input || "").trim().toLowerCase();
  const routes = findRoutes(text);
  const caseNote = (supportCase == null ? void 0 : supportCase.caseId) ? ` Your Request ID is ${supportCase.caseId}. Keep it safe and use it whenever you contact support.` : "";
  const friendly = humanReply(text);
  if (friendly) return { text: `${friendly}${caseNote}`, routes: routes.length ? routes : [{ label: "Patient Portal", href: "/patient" }, { label: "Track Request", href: "/request-tracker" }] };
  if (!text) return { text: "Please type what you need help with.", routes: [] };
  if (text.includes("track") || text.includes("status") || text.includes("request id") || text.includes("case id")) return { text: `Use the tracker page and enter your Request ID.${caseNote}`, routes: [{ label: "Track Request", href: "/request-tracker" }] };
  if (text.includes("how") && (text.includes("work") || text.includes("platform"))) return { text: `GlobalDoc Connect brings patients, providers, facilities, and admins into one connected platform. Open the walkthrough for the full summary.${caseNote}`, routes: [{ label: "How It Works", href: "/#how-it-works" }] };
  if (text.includes("book") || text.includes("appointment") || text.includes("visit")) return { text: `To book, go to the patient portal or use the search area to choose a provider.${caseNote}`, routes: [{ label: "Search Providers", href: "/#search" }, { label: "Patient Portal", href: "/patient" }] };
  if (text.includes("video") || text.includes("call")) return { text: `For video, open the patient portal and go to the video area after your booking is ready.${caseNote}`, routes: [{ label: "Patient Portal", href: "/patient" }] };
  if (text.includes("upload") || text.includes("file") || text.includes("record") || text.includes("document")) return { text: `Your uploaded files are attached to your support request. To upload more platform files, open the patient portal and use the files section.${caseNote}`, routes: [{ label: "Patient Portal", href: "/patient" }] };
  if (text.includes("language") || text.includes("translate")) return { text: "Use the language selector inside this assistant to choose your preferred language. Full automatic translation depends on the app translation setup.", routes: [] };
  if (text.includes("agent") || text.includes("human")) return { text: `Your request is available to the support team inside the Patient Support dashboard.${caseNote}`, routes: [{ label: "Track Request", href: "/request-tracker" }, { label: "Contact Support", href: "/contact" }] };
  if (routes.length > 0) return { text: "I found the direction you may need. Use one of these buttons.", routes };
  if (portal === "doctor") return { text: `I can guide you around the provider workspace.${caseNote}`, routes: [{ label: "Provider Dashboard", href: "/doctor/dashboard" }] };
  if (portal === "facility") return { text: `I can guide you around the facility portal.${caseNote}`, routes: [{ label: "Facility Portal", href: "/facility" }] };
  if (portal === "platform-admin") return { text: "I can guide you around admin operations.", routes: [{ label: "Platform Admin", href: "/platform-admin" }, { label: "Support Dashboard", href: "/platform-admin/support" }] };
  return { text: `Tell me where you want to go, or choose a direction below.${caseNote}`, routes: [{ label: "Patient Portal", href: "/patient" }, { label: "Track Request", href: "/request-tracker" }, { label: "Contact Support", href: "/contact" }] };
}
function speak(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}
function getDismissedKey(portal) {
  return `gd_ai_assistant_dismissed_${portal || "landing"}`;
}
function navigateTo(href) {
  if (typeof window === "undefined" || !href) return;
  window.location.href = href;
}
function HumanoidAssistant({ portal = "landing", docked = true }) {
  const profile = getPortalProfile(portal);
  const dismissedKey = getDismissedKey(portal);
  const [panelState, setPanelState] = reactExports.useState(() => {
    if (!docked) return "expanded";
    try {
      return window.sessionStorage.getItem(dismissedKey) === "1" ? "closed" : "minimized";
    } catch {
      return "minimized";
    }
  });
  const [supportCase, setSupportCase] = reactExports.useState(null);
  const [input, setInput] = reactExports.useState("");
  const [mode, setMode] = reactExports.useState("idle");
  const [voiceEnabled, setVoiceEnabled] = reactExports.useState(false);
  const [assistantLanguage, setAssistantLanguage] = reactExports.useState("en");
  const [caseCopied, setCaseCopied] = reactExports.useState(false);
  const [messages, setMessages] = reactExports.useState([{ role: "assistant", text: profile.greeting, routes: [] }]);
  const recognitionRef = reactExports.useRef(null);
  const visibleMessages = reactExports.useMemo(() => messages.slice(-6), [messages]);
  const chatUnlocked = Boolean(supportCase == null ? void 0 : supportCase.caseId) || portal === "platform-admin";
  const copyRequestId = async () => {
    if (!(supportCase == null ? void 0 : supportCase.caseId)) return;
    try {
      await navigator.clipboard.writeText(supportCase.caseId);
      setCaseCopied(true);
      window.setTimeout(() => setCaseCopied(false), 1800);
    } catch {
      setCaseCopied(false);
    }
  };
  const handleCaseSubmitted = (submittedCase) => {
    setSupportCase(submittedCase);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: `Thank you ${submittedCase.fullName || ""}. Your request has been submitted. IMPORTANT: copy and keep your Request ID: ${submittedCase.caseId}. Use it to track your request or when talking with support.`,
        routes: [{ label: "Track Request", href: "/request-tracker" }, { label: "Patient Portal", href: "/patient" }, { label: "Contact Support", href: "/contact" }]
      }
    ]);
  };
  const sendMessage = (value = input) => {
    const cleanValue = String(value || "").trim();
    if (!cleanValue) return;
    if (!chatUnlocked) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Please submit the support request form first. You only need a valid email, your name, request details, and optional documents.", routes: [{ label: "Track Request", href: "/request-tracker" }] }]);
      return;
    }
    setMode("thinking");
    const answer = buildResponse(cleanValue, portal, supportCase);
    setMessages((prev) => [...prev, { role: "user", text: cleanValue }, { role: "assistant", text: answer.text, routes: answer.routes || [] }]);
    setInput("");
    window.setTimeout(() => setMode("idle"), 450);
    if (voiceEnabled) speak(answer.text);
  };
  const startVoiceInput = () => {
    if (!chatUnlocked) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Submit the request form first, then voice chat will be available.", routes: [] }]);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Voice input is not supported in this browser. You can still type your request here.", routes: [] }]);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = assistantLanguage === "en" ? "en-US" : assistantLanguage;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setMode("listening");
    recognition.onerror = () => setMode("idle");
    recognition.onend = () => setMode("idle");
    recognition.onresult = (event) => {
      var _a, _b, _c;
      return sendMessage(((_c = (_b = (_a = event.results) == null ? void 0 : _a[0]) == null ? void 0 : _b[0]) == null ? void 0 : _c.transcript) || "");
    };
    recognitionRef.current = recognition;
    recognition.start();
  };
  const minimizeAssistant = () => {
    var _a, _b;
    (_b = (_a = recognitionRef.current) == null ? void 0 : _a.stop) == null ? void 0 : _b.call(_a);
    setMode("idle");
    setPanelState("minimized");
  };
  const cancelAssistant = () => {
    var _a, _b;
    (_b = (_a = recognitionRef.current) == null ? void 0 : _a.stop) == null ? void 0 : _b.call(_a);
    setMode("idle");
    try {
      window.sessionStorage.setItem(dismissedKey, "1");
    } catch {
    }
    setPanelState("closed");
  };
  const cards = [
    { icon: MessageCircle, label: "Request first", body: "Collects email, request details, and documents before chat." },
    { icon: CalendarDays, label: "Route guide", body: "Takes users to the right page." },
    { icon: Video, label: "Video help", body: "Guides users to video areas." },
    { icon: ShieldCheck, label: "Track request", body: "You can track an existing request anytime." }
  ];
  if (panelState === "closed") return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: docked ? "fixed bottom-5 right-5 z-40 w-[calc(100vw-2.5rem)] max-w-lg" : "w-full", children: [
    panelState === "minimized" && docked && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex w-fit items-center gap-2 rounded-full bg-white p-1 shadow-2xl shadow-slate-900/25 ring-1 ring-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setPanelState("expanded"), className: "flex items-center gap-3 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-700", "aria-label": "Open GlobalDoc AI guide", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-white/15", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-4 w-4" }) }),
        "Need help?",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: cancelAssistant, className: "flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600", "aria-label": "Cancel AI assistant", title: "Cancel assistant", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) })
    ] }),
    panelState === "expanded" && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-slate-900/20 transition-all duration-200 ease-out", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-slate-950 via-brand-800 to-brand-600 p-5 text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-brand-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5" }),
              " ",
              profile.badge
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 text-xl font-bold", children: profile.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-6 text-brand-50/90", children: chatUnlocked ? "Chat is active. Your Request ID stays visible below." : "Submit a new request, or track an existing request anytime." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: minimizeAssistant, className: "flex h-9 items-center gap-1 rounded-full bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/20", "aria-label": "Minimize AI assistant", title: "Minimize", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-4 w-4" }),
              " Minimize"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: cancelAssistant, className: "flex h-9 items-center gap-1 rounded-full bg-white px-3 text-sm font-semibold text-red-600 hover:bg-red-50", "aria-label": "Cancel AI assistant", title: "Cancel assistant", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
              " Cancel"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto mt-3 flex h-24 w-24 items-center justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute inset-0 rounded-full bg-brand-300/30 ${mode !== "idle" ? "animate-ping" : ""}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-2 rounded-full bg-gradient-to-br from-brand-100 via-white to-slate-100 shadow-inner" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-white bg-gradient-to-br from-brand-700 to-slate-900 text-white shadow-xl shadow-brand-700/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-8 w-8" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-white ${mode === "listening" ? "bg-emerald-500" : mode === "thinking" ? "bg-amber-400" : chatUnlocked ? "bg-emerald-500" : "bg-brand-500"}` })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[68vh] overflow-y-auto p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: cards.map((card) => {
          const Icon = card.icon;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 text-brand-700" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs font-bold text-slate-900", children: card.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-600", children: card.body })
          ] }, card.label);
        }) }),
        !(supportCase == null ? void 0 : supportCase.caseId) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-[1.5rem] border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-slate-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-slate-900", children: "Already submitted a request?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs leading-5 text-slate-600", children: "You do not need to submit another request. Open the tracker anytime and enter your Request ID or email address." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => navigateTo("/request-tracker"), className: "mt-3 w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600", children: "Track existing request" })
        ] }),
        !chatUnlocked && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequestIntakeForm, { onSubmitted: handleCaseSubmitted }) }),
        chatUnlocked && (supportCase == null ? void 0 : supportCase.caseId) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-emerald-900", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.18em] text-emerald-700", children: "Important: copy and keep safe" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-semibold", children: "Your Request ID is:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded-xl bg-emerald-900 px-4 py-2 text-lg font-black tracking-wide text-white", children: supportCase.caseId }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: copyRequestId, className: "rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600", children: caseCopied ? "Copied" : "Copy ID" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs leading-5 text-emerald-800", children: "You need this ID to track the request or when speaking with support." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => navigateTo("/request-tracker"), className: "mt-3 w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600", children: "Track request" })
        ] }),
        chatUnlocked && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-3", children: visibleMessages.map((message, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "assistant" ? "bg-slate-100 text-slate-700" : "ml-8 bg-brand-700 text-white"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: message.text }),
            message.role === "assistant" && Array.isArray(message.routes) && message.routes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: message.routes.map((route) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => navigateTo(route.href), className: "inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-bold text-brand-700 shadow-sm ring-1 ring-brand-100 hover:bg-brand-50", children: [
              route.label,
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5" })
            ] }, `${route.href}-${route.label}`)) })
          ] }, `${message.role}-${index}`)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: profile.quickActions.map((action) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => sendMessage(action), className: "rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-brand-300 hover:text-brand-700", children: action }, action)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (event) => {
        event.preventDefault();
        sendMessage();
      }, className: "border-t border-slate-200 bg-slate-50 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Languages, { className: "h-4 w-4 text-slate-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: assistantLanguage, onChange: (event) => setAssistantLanguage(event.target.value), className: "bg-transparent text-xs font-semibold text-slate-700 outline-none", title: "Assistant language", children: Object.entries(languageLabels).map(([value, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value, children: label }, value)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setVoiceEnabled((value) => !value), disabled: !chatUnlocked, className: `rounded-full px-3 py-2 text-xs font-bold ${voiceEnabled ? "bg-brand-700 text-white" : "bg-white text-slate-600"} shadow-sm disabled:opacity-40`, title: "Toggle spoken replies", children: voiceEnabled ? "Voice on" : "Voice off" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: mode === "listening" ? () => {
            var _a, _b;
            return (_b = (_a = recognitionRef.current) == null ? void 0 : _a.stop) == null ? void 0 : _b.call(_a);
          } : startVoiceInput, disabled: !chatUnlocked, className: `rounded-full p-3 ${mode === "listening" ? "bg-red-600 text-white" : "bg-white text-slate-600"} shadow-sm disabled:opacity-40`, title: "Voice input", children: mode === "listening" ? /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4 shrink-0 text-slate-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { disabled: !chatUnlocked, value: input, onChange: (event) => setInput(event.target.value), placeholder: chatUnlocked ? "Say hi, ask where to go, or request help..." : "Submit request first to unlock chat", className: "min-w-0 flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: !chatUnlocked, className: "rounded-full bg-brand-700 p-3 text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:bg-slate-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-start gap-2 text-xs leading-5 text-slate-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mt-0.5 h-3.5 w-3.5 shrink-0" }),
            " ",
            (supportCase == null ? void 0 : supportCase.caseId) ? `Active Request ID: ${supportCase.caseId}` : "Support request is required before chat."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: cancelAssistant, className: "text-xs font-bold text-red-600 hover:text-red-700", children: "Cancel assistant" })
        ] })
      ] })
    ] })
  ] });
}
const ErrorContext = reactExports.createContext();
const useError = () => {
  const context = reactExports.useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};
const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = reactExports.useState([]);
  const addError = reactExports.useCallback((message, type = "error", duration = 5e3) => {
    const id = Date.now() + Math.random();
    const error = { id, message, type, duration };
    setErrors((prev) => [...prev, error]);
    if (duration > 0) {
      setTimeout(() => {
        removeError(id);
      }, duration);
    }
    return id;
  }, []);
  const removeError = reactExports.useCallback((id) => {
    setErrors((prev) => prev.filter((error) => error.id !== id));
  }, []);
  const clearAllErrors = reactExports.useCallback(() => {
    setErrors([]);
  }, []);
  const value = {
    errors,
    addError,
    removeError,
    clearAllErrors
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(ErrorContext.Provider, { value, children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorToastContainer, {})
  ] });
};
const ErrorToastContainer = () => {
  const { errors, removeError } = useError();
  if (errors.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-3 px-4 sm:bottom-7", children: errors.map((error) => /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorToast, { error, onClose: () => removeError(error.id) }, error.id)) });
};
const ErrorToast = ({ error, onClose }) => {
  const getIcon = () => {
    switch (error.type) {
      case "success":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-5 w-5 text-emerald-500" });
      case "warning":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-5 w-5 text-amber-500" });
      case "info":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-5 w-5 text-blue-500" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "h-5 w-5 text-rose-500" });
    }
  };
  const getTone = () => {
    switch (error.type) {
      case "success":
        return {
          shell: "border-emerald-200 bg-gradient-to-br from-white via-emerald-50 to-white shadow-emerald-900/15",
          icon: "bg-emerald-600 text-white shadow-emerald-700/25",
          bar: "from-emerald-500 via-teal-400 to-cyan-400",
          title: "Command completed"
        };
      case "warning":
        return {
          shell: "border-amber-200 bg-gradient-to-br from-white via-amber-50 to-white shadow-amber-900/15",
          icon: "bg-amber-500 text-white shadow-amber-700/25",
          bar: "from-amber-500 via-orange-400 to-rose-400",
          title: "Review required"
        };
      case "info":
        return {
          shell: "border-blue-200 bg-gradient-to-br from-white via-blue-50 to-white shadow-blue-900/15",
          icon: "bg-blue-600 text-white shadow-blue-700/25",
          bar: "from-blue-600 via-cyan-500 to-teal-400",
          title: "System update"
        };
      default:
        return {
          shell: "border-rose-200 bg-gradient-to-br from-white via-rose-50 to-white shadow-rose-900/15",
          icon: "bg-rose-600 text-white shadow-rose-700/25",
          bar: "from-rose-600 via-red-500 to-amber-400",
          title: "Action needed"
        };
    }
  };
  const tone = getTone();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `w-[min(620px,100%)] overflow-hidden rounded-[1.35rem] border shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-3 ${tone.shell}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-1.5 bg-gradient-to-r ${tone.bar}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4 p-4 sm:p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl shadow-lg ${tone.icon}`, children: React.cloneElement(getIcon(), { className: "h-5 w-5 text-white" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-500", children: tone.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm font-semibold leading-6 text-slate-900 sm:text-[15px]", children: error.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onClose,
          className: "ml-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/75 text-slate-400 ring-1 ring-slate-200 hover:bg-white hover:text-slate-700",
          "aria-label": "Close notification",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
        }
      )
    ] })
  ] });
};
const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ha", name: "Hausa", nativeName: "Hausa" },
  { code: "yo", name: "Yoruba", nativeName: "Yorùbá" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili" },
  { code: "ar", name: "Arabic", nativeName: "العربية", rtl: true },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "ig", name: "Igbo", nativeName: "Igbo" }
];
const resources = {
  en: {
    translation: {
      // Common
      "welcome": "Welcome to GlobalDoc",
      "loading": "Loading...",
      "error": "An error occurred",
      "success": "Success",
      "cancel": "Cancel",
      "confirm": "Confirm",
      "save": "Save",
      "delete": "Delete",
      "edit": "Edit",
      "back": "Back",
      "next": "Next",
      "previous": "Previous",
      "close": "Close",
      "search": "Search",
      "filter": "Filter",
      // Authentication
      "auth": {
        "login": "Login",
        "register": "Register",
        "logout": "Logout",
        "email": "Email",
        "password": "Password",
        "confirmPassword": "Confirm Password",
        "forgotPassword": "Forgot Password?",
        "resetPassword": "Reset Password",
        "loginWithGoogle": "Continue with Google",
        "loginWithSupabase": "Continue with Email",
        "createAccount": "Create Account",
        "alreadyHaveAccount": "Already have an account?",
        "dontHaveAccount": "Don't have an account?",
        "signIn": "Sign In",
        "signUp": "Sign Up",
        "authFailed": "Authentication failed. Please check your credentials and try again.",
        "networkError": "Network connection failed. Please check your internet connection.",
        "invalidCredentials": "Invalid email or password. Please try again.",
        "accountCreated": "Account created successfully! Welcome to GlobalDoc.",
        "loginSuccess": "Login successful. Redirecting...",
        "logoutSuccess": "Logged out successfully."
      },
      // Landing Page
      "landing": {
        "heroTitle": "Connect with Healthcare Professionals Worldwide",
        "heroSubtitle": "Get expert medical consultations from licensed doctors in your preferred language",
        "getStarted": "Get Started",
        "findDoctor": "Find a Doctor",
        "selectLanguage": "Select Your Language",
        "chooseLanguage": "Choose your preferred language for the best experience"
      },
      // Dashboard
      "dashboard": {
        "welcome": "Welcome back",
        "overview": "Overview",
        "appointments": "Appointments",
        "messages": "Messages",
        "notifications": "Notifications",
        "settings": "Settings",
        "profile": "Profile",
        "help": "Help & Support"
      },
      // Accessibility
      "accessibility": {
        "voiceCommands": "Voice Commands",
        "screenReader": "Screen Reader Support",
        "highContrast": "High Contrast Mode",
        "largeText": "Large Text",
        "audioDescription": "Audio Description",
        "visualGuide": "Visual Guide",
        "hearingImpaired": "Hearing Impaired Support",
        "mobilitySupport": "Mobility Support",
        "emergencyAccess": "Emergency Access"
      },
      // Manuals
      "manuals": {
        "downloadManual": "Download User Manual",
        "patientGuide": "Patient Guide",
        "doctorGuide": "Doctor Guide",
        "quickStart": "Quick Start Guide",
        "videoTutorials": "Video Tutorials",
        "faq": "Frequently Asked Questions"
      },
      // Errors
      "errors": {
        "generic": "Something went wrong. Please try again.",
        "network": "Network error. Please check your connection.",
        "permission": "You don't have permission to perform this action.",
        "notFound": "The requested resource was not found.",
        "validation": "Please check your input and try again.",
        "server": "Server error. Please try again later.",
        "auth": "Authentication error. Please log in again.",
        "fileUpload": "File upload failed. Please try again.",
        "appointment": "Unable to schedule appointment. Please try again."
      }
    }
  },
  ha: {
    translation: {
      "welcome": "Barka da zuwa GlobalDoc",
      "loading": "Ana loading...",
      "error": "Kuskure ya faru",
      "success": "Nasara",
      "cancel": "Soke",
      "confirm": "Tabbatar",
      "save": "Ajiye",
      "delete": "Share",
      "edit": "Gyara",
      "back": "Koma baya",
      "next": "Na gaba",
      "previous": "Na baya",
      "close": "Rufe",
      "search": "Bincike",
      "filter": "Tace",
      "auth": {
        "login": "Shiga",
        "register": "Yi rijista",
        "logout": "Fita",
        "email": "Imel",
        "password": "Kalmar sirri",
        "confirmPassword": "Tabbatar da kalmar sirri",
        "forgotPassword": "Ka manta kalmar sirri?",
        "resetPassword": "Sake saita kalmar sirri",
        "loginWithGoogle": "Ci gaba da Google",
        "loginWithSupabase": "Ci gaba da Imel",
        "createAccount": "Ƙirƙiri asusu",
        "alreadyHaveAccount": "Kuna da asusu?",
        "dontHaveAccount": "Ba ku da asusu?",
        "signIn": "Shiga",
        "signUp": "Yi rijista",
        "authFailed": "Shiga ya kasa. Da fatan za a duba bayanan ku kuma a sake gwadawa.",
        "networkError": "Haɗin yanar gizo ya kasa. Da fatan za a duba haɗin intanet ɗin ku.",
        "invalidCredentials": "Imel ko kalmar sirri ba daidai ba. Da fatan za a sake gwadawa.",
        "accountCreated": "An ƙirƙiri asusu cikin nasara! Barka da zuwa GlobalDoc.",
        "loginSuccess": "Shiga ya yi nasara. Ana tura...",
        "logoutSuccess": "An fita cikin nasara."
      },
      "landing": {
        "heroTitle": "Haɗu da Kwararrun Likitoci a Duniya",
        "heroSubtitle": "Samu shawarar likitanci daga kwararrun likitoci a harshen da kuka zaɓa",
        "getStarted": "Fara",
        "findDoctor": "Nemi Likita",
        "selectLanguage": "Zaɓi Harshen ku",
        "chooseLanguage": "Zaɓi harshen da kuka fi so don mafi kyawun ƙwarewa"
      }
    }
  },
  yo: {
    translation: {
      "welcome": "Ẹ ku àbọ̀ sí GlobalDoc",
      "loading": "Ó ń gbaradì...",
      "error": "Àṣìṣe kan ṣẹlẹ̀",
      "success": "Àṣeyọrí",
      "cancel": "Fagilee",
      "confirm": "Ìmúdájú",
      "save": "Fi pamọ́",
      "delete": "Pa rẹ́",
      "edit": "Ṣàtúnṣe",
      "back": "Padà sẹ́yìn",
      "next": "Tókàn",
      "previous": "Ti tẹ́lẹ̀",
      "close": "Ti",
      "search": "Ṣàwárí",
      "filter": "Àlẹ̀mọ̀",
      "auth": {
        "login": "Wọlé",
        "register": "Forúkọ sílẹ̀",
        "logout": "Jáde",
        "email": "Ìméèlì",
        "password": "Ọ̀rọ̀ìpamọ́",
        "confirmPassword": "Ìmúdájú ọ̀rọ̀ìpamọ́",
        "forgotPassword": "O gbàgbé ọ̀rọ̀ìpamọ́?",
        "resetPassword": "Tún ọ̀rọ̀ìpamọ́ ṣe",
        "loginWithGoogle": "Tẹ̀síwájú pẹ̀lú Google",
        "loginWithSupabase": "Tẹ̀síwájú pẹ̀lú Ìméèlì",
        "createAccount": "Ṣẹ̀dá àkọọ́lẹ̀",
        "alreadyHaveAccount": "O ní àkọọ́lẹ̀ tẹ́lẹ̀?",
        "dontHaveAccount": "O kò ní àkọọ́lẹ̀?",
        "signIn": "Wọlé",
        "signUp": "Forúkọ sílẹ̀",
        "authFailed": "Ìwọlé kùnà. Jọ̀wọ́ ṣàyẹ̀wò àwọn ìwọlé rẹ kí o sì tún gbìyànjú.",
        "networkError": "Ìsopọ̀ nẹ́tiwọ́kì kùnà. Jọ̀wọ́ ṣàyẹ̀wò ìsopọ̀ Íńtánẹ́ẹ̀tì rẹ.",
        "invalidCredentials": "Ìméèlì tàbí ọ̀rọ̀ìpamọ́ tí kò tọ̀. Jọ̀wọ́ tún gbìyànjú.",
        "accountCreated": "Àkọọ́lẹ̀ tí a ṣẹ̀dá ní àṣeyọrí! Ẹ ku àbọ̀ sí GlobalDoc.",
        "loginSuccess": "Ìwọlé ṣeéyọrísí. Ó ń darí...",
        "logoutSuccess": "Ó ti jáde ní àṣeyọrí."
      },
      "landing": {
        "heroTitle": "Sopọ̀ pẹ̀lú àwọn Ọ̀jọ̀gbọ́n Ìlera kárí Ayé",
        "heroSubtitle": "Gba ìmọ̀ràn ìlera látọ̀dọ̀ àwọn dókítà tí ó ní ìwé àṣẹ ní èdè tí o fẹ́",
        "getStarted": "Bẹ̀rẹ̀",
        "findDoctor": "Wá Dókítà",
        "selectLanguage": "Yan Èdè Rẹ",
        "chooseLanguage": "Yan èdè tí o fẹ́ fún ìrírí tí ó dára jùlọ"
      }
    }
  },
  sw: {
    translation: {
      "welcome": "Karibu GlobalDoc",
      "loading": "Inapakia...",
      "error": "Kosa limetokea",
      "success": "Mafanikio",
      "cancel": "Ghairi",
      "confirm": "Thibitisha",
      "save": "Hifadhi",
      "delete": "Futa",
      "edit": "Hariri",
      "back": "Rudi",
      "next": "Ifuatayo",
      "previous": "Iliyopita",
      "close": "Funga",
      "search": "Tafuta",
      "filter": "Chuja",
      "auth": {
        "login": "Ingia",
        "register": "Jisajili",
        "logout": "Toka",
        "email": "Barua pepe",
        "password": "Nenosiri",
        "confirmPassword": "Thibitisha nenosiri",
        "forgotPassword": "Umesahau nenosiri?",
        "resetPassword": "Weka upya nenosiri",
        "loginWithGoogle": "Endelea na Google",
        "loginWithSupabase": "Endelea na Barua pepe",
        "createAccount": "Tengeneza akaunti",
        "alreadyHaveAccount": "Tayari una akaunti?",
        "dontHaveAccount": "Huna akaunti?",
        "signIn": "Ingia",
        "signUp": "Jisajili",
        "authFailed": "Uthibitishaji umeshindikana. Tafadhali angalia taarifa zako na ujaribu tena.",
        "networkError": "Muunganisho wa mtandao umeshindikana. Tafadhali angalia muunganisho wako wa intaneti.",
        "invalidCredentials": "Barua pepe au nenosiri batili. Tafadhali jaribu tena.",
        "accountCreated": "Akaunti imeundwa kwa mafanikio! Karibu GlobalDoc.",
        "loginSuccess": "Kuingia kumefanikiwa. Inaongoza...",
        "logoutSuccess": "Umetoka kwa mafanikio."
      },
      "landing": {
        "heroTitle": "Unganisha na Wataalamu wa Afya Ulimwenguni",
        "heroSubtitle": "Pata ushauri wa matibabu kutoka kwa madaktari walio na leseni katika lugha unayopendelea",
        "getStarted": "Anza",
        "findDoctor": "Tafuta Daktari",
        "selectLanguage": "Chagua Lugha Yako",
        "chooseLanguage": "Chagua lugha unayopendelea kwa uzoefu bora zaidi"
      }
    }
  },
  ar: {
    translation: {
      "welcome": "مرحباً بك في GlobalDoc",
      "loading": "جارٍ التحميل...",
      "error": "حدث خطأ",
      "success": "نجح",
      "cancel": "إلغاء",
      "confirm": "تأكيد",
      "save": "حفظ",
      "delete": "حذف",
      "edit": "تعديل",
      "back": "العودة",
      "next": "التالي",
      "previous": "السابق",
      "close": "إغلاق",
      "search": "بحث",
      "filter": "تصفية",
      "auth": {
        "login": "تسجيل الدخول",
        "register": "التسجيل",
        "logout": "تسجيل الخروج",
        "email": "البريد الإلكتروني",
        "password": "كلمة المرور",
        "confirmPassword": "تأكيد كلمة المرور",
        "forgotPassword": "نسيت كلمة المرور؟",
        "resetPassword": "إعادة تعيين كلمة المرور",
        "loginWithGoogle": "المتابعة مع Google",
        "loginWithSupabase": "المتابعة مع البريد الإلكتروني",
        "createAccount": "إنشاء حساب",
        "alreadyHaveAccount": "لديك حساب بالفعل؟",
        "dontHaveAccount": "ليس لديك حساب؟",
        "signIn": "تسجيل الدخول",
        "signUp": "التسجيل",
        "authFailed": "فشل المصادقة. يرجى التحقق من بياناتك والمحاولة مرة أخرى.",
        "networkError": "فشل الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت الخاص بك.",
        "invalidCredentials": "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.",
        "accountCreated": "تم إنشاء الحساب بنجاح! مرحباً بك في GlobalDoc.",
        "loginSuccess": "تم تسجيل الدخول بنجاح. جارٍ التوجيه...",
        "logoutSuccess": "تم تسجيل الخروج بنجاح."
      },
      "landing": {
        "heroTitle": "تواصل مع متخصصي الرعاية الصحية في جميع أنحاء العالم",
        "heroSubtitle": "احصل على استشارات طبية من أطباء مرخصين بلغتك المفضلة",
        "getStarted": "ابدأ",
        "findDoctor": "ابحث عن طبيب",
        "selectLanguage": "اختر لغتك",
        "chooseLanguage": "اختر لغتك المفضلة للحصول على أفضل تجربة"
      }
    }
  },
  fr: {
    translation: {
      "welcome": "Bienvenue sur GlobalDoc",
      "loading": "Chargement...",
      "error": "Une erreur s'est produite",
      "success": "Succès",
      "cancel": "Annuler",
      "confirm": "Confirmer",
      "save": "Enregistrer",
      "delete": "Supprimer",
      "edit": "Modifier",
      "back": "Retour",
      "next": "Suivant",
      "previous": "Précédent",
      "close": "Fermer",
      "search": "Rechercher",
      "filter": "Filtrer",
      "auth": {
        "login": "Connexion",
        "register": "S'inscrire",
        "logout": "Déconnexion",
        "email": "E-mail",
        "password": "Mot de passe",
        "confirmPassword": "Confirmer le mot de passe",
        "forgotPassword": "Mot de passe oublié ?",
        "resetPassword": "Réinitialiser le mot de passe",
        "loginWithGoogle": "Continuer avec Google",
        "loginWithSupabase": "Continuer avec l'e-mail",
        "createAccount": "Créer un compte",
        "alreadyHaveAccount": "Vous avez déjà un compte ?",
        "dontHaveAccount": "Vous n'avez pas de compte ?",
        "signIn": "Se connecter",
        "signUp": "S'inscrire",
        "authFailed": "L'authentification a échoué. Veuillez vérifier vos informations et réessayer.",
        "networkError": "La connexion réseau a échoué. Veuillez vérifier votre connexion internet.",
        "invalidCredentials": "E-mail ou mot de passe invalide. Veuillez réessayer.",
        "accountCreated": "Compte créé avec succès ! Bienvenue sur GlobalDoc.",
        "loginSuccess": "Connexion réussie. Redirection...",
        "logoutSuccess": "Déconnexion réussie."
      },
      "landing": {
        "heroTitle": "Connectez-vous avec des professionnels de santé du monde entier",
        "heroSubtitle": "Obtenez des consultations médicales d'experts de médecins agréés dans votre langue préférée",
        "getStarted": "Commencer",
        "findDoctor": "Trouver un médecin",
        "selectLanguage": "Sélectionnez votre langue",
        "chooseLanguage": "Choisissez votre langue préférée pour la meilleure expérience"
      }
    }
  }
};
instance.use(Browser).use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  debug: false,
  interpolation: {
    escapeValue: false
  },
  detection: {
    order: ["localStorage", "navigator", "htmlTag"],
    lookupLocalStorage: "i18nextLng",
    caches: ["localStorage"]
  },
  react: {
    useSuspense: false
  }
});
const LandingPageEnhanced = reactExports.lazy(() => __vitePreload(() => import("./LandingPageEnhanced-C7SSrMNt.js"), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8]) : void 0));
const AdminDashboard = reactExports.lazy(() => __vitePreload(() => import("./AdminDashboard-MbKi07EX.js"), true ? __vite__mapDeps([9,1,2,3,10,5,6,11,12,13,8]) : void 0));
const PatientDashboard = reactExports.lazy(() => __vitePreload(() => import("./PatientDashboard-mMixdN4E.js"), true ? __vite__mapDeps([14,1,2,10,5,6,12,15,16,17,8,7,13,3,4,18]) : void 0));
const PlatformAdminDashboard = reactExports.lazy(() => __vitePreload(() => import("./PlatformAdminDashboard-T0Iz4tUG.js"), true ? __vite__mapDeps([19,1,2,11,6,13,20,15,16,17,8,5]) : void 0));
const SupportDashboard = reactExports.lazy(() => __vitePreload(() => import("./SupportDashboard-BAeKdv2d.js"), true ? __vite__mapDeps([21,1,2,6,5]) : void 0));
const RequestTracker = reactExports.lazy(() => __vitePreload(() => import("./RequestTracker-COjhboh0.js"), true ? __vite__mapDeps([22,1,2,6,5]) : void 0));
const FacilityPortal = reactExports.lazy(() => __vitePreload(() => import("./FacilityPortal-Ma9OBfye.js"), true ? __vite__mapDeps([23,1,2,12,18,6,7,8,5]) : void 0));
const AuthCallback = reactExports.lazy(() => __vitePreload(() => import("./AuthCallback-ezmxtCvj.js"), true ? __vite__mapDeps([24,1,2,16,17,6,5]) : void 0));
const PaymentSuccess = reactExports.lazy(() => __vitePreload(() => import("./PaymentSuccess-BRxiDwfh.js"), true ? __vite__mapDeps([25,1,2,6,5]) : void 0));
const ResetPassword = reactExports.lazy(() => __vitePreload(() => import("./ResetPassword-Bbf1-Oga.js"), true ? __vite__mapDeps([26,1,2,6,5]) : void 0));
const DoctorAuth = reactExports.lazy(() => __vitePreload(() => import("./DoctorAuth-WJe3NkVQ.js"), true ? __vite__mapDeps([20,1,2,15,16,17,8,6,5]) : void 0));
const TermsOfService = reactExports.lazy(() => __vitePreload(() => import("./TermsOfService-B2cWqv4D.js"), true ? __vite__mapDeps([27,1,2,6,5]) : void 0));
const PrivacyPolicy = reactExports.lazy(() => __vitePreload(() => import("./PrivacyPolicy-DtScRexi.js"), true ? __vite__mapDeps([28,1,2,6,5]) : void 0));
const Contact = reactExports.lazy(() => __vitePreload(() => import("./Contact--yKCk2cU.js"), true ? __vite__mapDeps([29,1,2,6,5]) : void 0));
function viewFromPath(pathname) {
  const path = String(pathname || "/");
  if (path === "/" || path === "") return "landing";
  if (path.startsWith("/request-tracker")) return "request-tracker";
  if (path.startsWith("/patient")) return "patient";
  if (path.startsWith("/doctor/dashboard")) return "admin";
  if (path.startsWith("/doctor")) return "doctor-auth";
  if (path.startsWith("/facility")) return "facility";
  if (path.startsWith("/platform-admin/support")) return "platform-admin-support";
  if (path.startsWith("/platform-admin")) return "platform-admin";
  if (path.startsWith("/auth/callback")) return "auth-callback";
  if (path.startsWith("/payment-success")) return "payment-success";
  if (path.startsWith("/reset-password")) return "reset-password";
  if (path.startsWith("/terms")) return "terms";
  if (path.startsWith("/privacy")) return "privacy";
  if (path.startsWith("/contact")) return "contact";
  return "landing";
}
function pathFromView(view) {
  switch (view) {
    case "patient":
      return "/patient";
    case "doctor-auth":
      return "/doctor";
    case "facility":
      return "/facility";
    case "platform-admin-support":
      return "/platform-admin/support";
    case "platform-admin":
      return "/platform-admin";
    case "admin":
      return "/doctor/dashboard";
    case "request-tracker":
      return "/request-tracker";
    case "auth-callback":
      return "/auth/callback";
    case "payment-success":
      return "/payment-success";
    case "reset-password":
      return "/reset-password";
    case "terms":
      return "/terms";
    case "privacy":
      return "/privacy";
    case "contact":
      return "/contact";
    case "landing":
    default:
      return "/";
  }
}
function portalFromView(view) {
  if (view === "platform-admin" || view === "platform-admin-support") return "";
  if (view === "patient" || view === "payment-success") return "patient";
  if (view === "doctor-auth" || view === "admin") return "doctor";
  if (view === "facility") return "facility";
  return "";
}
function assistantPortalFromView(view) {
  if (view === "patient") return "patient";
  if (view === "admin") return "doctor";
  if (view === "facility") return "facility";
  if (view === "platform-admin" || view === "platform-admin-support") return "platform-admin";
  return "";
}
function normalizeDoctorSession(authData) {
  const doctor = (authData == null ? void 0 : authData.doctor) && typeof authData.doctor === "object" ? authData.doctor : authData;
  if (!(doctor == null ? void 0 : doctor.id)) return null;
  return { type: (authData == null ? void 0 : authData.type) || "login", ...doctor };
}
function App() {
  const [currentView, setCurrentView] = reactExports.useState(() => viewFromPath(window.location.pathname));
  const [authDoctor, setAuthDoctor] = reactExports.useState(null);
  const [authAdmin, setAuthAdmin] = reactExports.useState(null);
  const [activePortal, setActivePortal] = reactExports.useState(() => {
    try {
      const pathPortal = portalFromView(viewFromPath(window.location.pathname));
      if (pathPortal) return pathPortal;
      return window.localStorage.getItem("gd_active_portal") || "";
    } catch {
      return "";
    }
  });
  const [patientLogoutSignal, setPatientLogoutSignal] = reactExports.useState(0);
  const [facilityLogoutSignal, setFacilityLogoutSignal] = reactExports.useState(0);
  const setPortalSession = (portal) => {
    const nextPortal = portal || "";
    setActivePortal(nextPortal);
    try {
      if (nextPortal) window.localStorage.setItem("gd_active_portal", nextPortal);
      else window.localStorage.removeItem("gd_active_portal");
    } catch {
    }
  };
  const navigate = (view) => {
    const nextView = viewFromPath(pathFromView(view));
    const nextPortal = portalFromView(nextView);
    if (nextView === "platform-admin" || nextView === "platform-admin-support") {
      setCurrentView(nextView);
      try {
        const nextPath = pathFromView(nextView);
        if (window.location.pathname !== nextPath) {
          window.history.pushState({ view: nextView }, "", nextPath);
        }
      } catch {
      }
      return;
    }
    if (activePortal && nextPortal !== activePortal) return;
    setCurrentView(nextView);
    try {
      const nextPath = pathFromView(nextView);
      if (window.location.pathname !== nextPath) {
        window.history.pushState({ view: nextView }, "", nextPath);
      }
    } catch {
    }
  };
  reactExports.useEffect(() => {
    const handler = () => {
      const nextView = viewFromPath(window.location.pathname);
      const nextPortal = portalFromView(nextView);
      if (nextView === "platform-admin" || nextView === "platform-admin-support") {
        setCurrentView(nextView);
        return;
      }
      if (activePortal && nextPortal !== activePortal) {
        const fallbackView = activePortal === "doctor" ? authDoctor ? "admin" : "doctor-auth" : activePortal;
        const fallbackPath = pathFromView(fallbackView);
        window.history.replaceState({ view: fallbackView }, "", fallbackPath);
        setCurrentView(fallbackView);
        return;
      }
      setCurrentView(nextView);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [activePortal, authDoctor]);
  reactExports.useEffect(() => {
    if (!activePortal) return;
    if (currentView === "platform-admin" || currentView === "platform-admin-support") return;
    if (portalFromView(currentView) === activePortal) return;
    const fallbackView = activePortal === "doctor" ? authDoctor ? "admin" : "doctor-auth" : activePortal;
    setCurrentView(fallbackView);
    try {
      window.history.replaceState({ view: fallbackView }, "", pathFromView(fallbackView));
    } catch {
    }
  }, [activePortal, authDoctor, currentView]);
  reactExports.useEffect(() => {
    try {
      const stored = window.localStorage.getItem("gd_doctor_session");
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (parsed == null ? void 0 : parsed.id) {
        setAuthDoctor({ type: "login", ...parsed });
        setPortalSession("doctor");
        window.localStorage.removeItem("gd_patient_session");
        window.localStorage.removeItem("gd_facility_session_active");
        window.localStorage.removeItem("gd_pending_patient_profile");
      }
    } catch {
    }
  }, []);
  reactExports.useEffect(() => {
    if (!(authDoctor == null ? void 0 : authDoctor.id)) return;
    if (activePortal !== "doctor") setPortalSession("doctor");
    if (currentView !== "admin" && currentView !== "doctor-auth") {
      setCurrentView("admin");
      try {
        window.history.replaceState({ view: "admin" }, "", "/doctor/dashboard");
      } catch {
      }
    }
    try {
      window.localStorage.removeItem("gd_patient_session");
      window.localStorage.removeItem("gd_facility_session_active");
      window.localStorage.removeItem("gd_pending_patient_profile");
    } catch {
    }
  }, [authDoctor == null ? void 0 : authDoctor.id, activePortal, currentView]);
  reactExports.useEffect(() => {
    var _a;
    try {
      const stored = window.localStorage.getItem("gd_platform_admin_session");
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if ((parsed == null ? void 0 : parsed.type) === "admin-login" && (((_a = parsed == null ? void 0 : parsed.admin) == null ? void 0 : _a.email) || (parsed == null ? void 0 : parsed.email))) {
        setAuthAdmin(parsed);
      }
    } catch {
    }
  }, []);
  reactExports.useEffect(() => {
    if (!(authDoctor == null ? void 0 : authDoctor.id) || currentView !== "admin") return void 0;
    const statusPath = `/api/doctors/${encodeURIComponent(authDoctor.id)}/status`;
    const markOnline = () => {
      void apiFetch(statusPath, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: true })
      }).then((response) => response.json().catch(() => ({}))).then((data) => {
        var _a;
        if ((_a = data == null ? void 0 : data.doctor) == null ? void 0 : _a.id) {
          setAuthDoctor((current) => (current == null ? void 0 : current.id) ? { ...current, ...data.doctor } : current);
          try {
            window.localStorage.setItem("gd_doctor_session", JSON.stringify({ type: "login", ...data.doctor }));
          } catch {
          }
        }
      }).catch(() => null);
    };
    const markOfflineOnExit = () => {
      const body = JSON.stringify({ isOnline: false });
      const [base = ""] = getApiBaseCandidates();
      void fetch(`${base}${statusPath}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true
      }).catch(() => null);
    };
    markOnline();
    const timer = window.setInterval(markOnline, 60 * 1e3);
    window.addEventListener("pagehide", markOfflineOnExit);
    window.addEventListener("beforeunload", markOfflineOnExit);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pagehide", markOfflineOnExit);
      window.removeEventListener("beforeunload", markOfflineOnExit);
    };
  }, [authDoctor == null ? void 0 : authDoctor.id, currentView]);
  const handleAuth = (authData) => {
    if (authData.type === "admin-login") {
      setAuthAdmin(authData);
      setAuthDoctor(null);
      setPortalSession("");
      setCurrentView("platform-admin");
      try {
        window.localStorage.setItem("gd_platform_admin_session", JSON.stringify(authData));
      } catch {
      }
      try {
        window.history.pushState({ view: "platform-admin" }, "", "/platform-admin");
      } catch {
      }
      return;
    }
    if (authData.type === "login" || authData.type === "register") {
      const doctorSession = normalizeDoctorSession(authData);
      if (!doctorSession) return;
      setAuthDoctor(doctorSession);
      setAuthAdmin(null);
      setPortalSession("doctor");
      setCurrentView("admin");
      try {
        window.localStorage.setItem("gd_doctor_session", JSON.stringify(doctorSession));
        window.localStorage.removeItem("gd_patient_session");
        window.localStorage.removeItem("gd_facility_session_active");
        window.localStorage.removeItem("gd_pending_patient_profile");
      } catch {
      }
      try {
        window.history.pushState({ view: "admin" }, "", "/doctor/dashboard");
      } catch {
      }
    }
  };
  const handleLogout = () => {
    if (authDoctor == null ? void 0 : authDoctor.id) {
      void apiFetch(`/api/doctors/${encodeURIComponent(authDoctor.id)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: false })
      }).catch(() => null);
    }
    setAuthDoctor(null);
    setAuthAdmin(null);
    setPatientLogoutSignal((value) => value + 1);
    setFacilityLogoutSignal((value) => value + 1);
    setPortalSession("");
    setCurrentView("landing");
    try {
      window.localStorage.removeItem("gd_doctor_session");
      window.localStorage.removeItem("gd_platform_admin_session");
      window.localStorage.removeItem("gd_patient_session");
      window.localStorage.removeItem("gd_facility_session_active");
      window.localStorage.removeItem("gd_pending_patient_profile");
      window.localStorage.removeItem("gd_pending_doctor_profile");
    } catch {
    }
    try {
      window.history.pushState({ view: "landing" }, "", "/");
    } catch {
    }
  };
  const assistantPortal = assistantPortalFromView(currentView);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen text-slate-900", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "mx-auto mt-4 flex max-w-7xl flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/80 bg-white/90 px-6 py-4 shadow-sm backdrop-blur sm:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/logo.png", alt: "GlobalDoc Connect logo", className: "h-10 w-10 rounded-full shadow-sm object-cover" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold text-brand-700", children: "GlobalDoc Connect" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4 text-sm text-slate-600", children: [
        authAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("platform-admin"), className: `font-semibold ${currentView === "platform-admin" ? "text-brand-700" : "text-slate-600 hover:text-brand-700"}`, children: "Platform Admin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("platform-admin-support"), className: `font-semibold ${currentView === "platform-admin-support" ? "text-brand-700" : "text-slate-600 hover:text-brand-700"}`, children: "Patient Support" })
        ] }),
        !activePortal && !authAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("landing"), className: `hover:text-brand-700 ${currentView === "landing" ? "text-brand-700" : ""}`, children: "Home" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("patient"), className: `hover:text-brand-700 ${currentView === "patient" ? "text-brand-700" : ""}`, children: "Patient Portal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("doctor-auth"), className: `hover:text-brand-700 ${currentView === "doctor-auth" ? "text-brand-700" : ""}`, children: "Doctor Portal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("facility"), className: `hover:text-brand-700 ${currentView === "facility" ? "text-brand-700" : ""}`, children: "Facility Portal" })
        ] }),
        activePortal === "patient" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("patient"), className: "font-semibold text-brand-700", children: "Patient Portal" }),
        activePortal === "doctor" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate(authDoctor ? "admin" : "doctor-auth"), className: "font-semibold text-brand-700", children: "Doctor Portal" }),
        activePortal === "facility" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("facility"), className: "font-semibold text-brand-700", children: "Facility Portal" }),
        activePortal === "platform-admin" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("platform-admin"), className: `font-semibold ${currentView === "platform-admin" ? "text-brand-700" : "text-slate-600 hover:text-brand-700"}`, children: "Platform Admin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("platform-admin-support"), className: `font-semibold ${currentView === "platform-admin-support" ? "text-brand-700" : "text-slate-600 hover:text-brand-700"}`, children: "Patient Support" })
        ] }),
        (authDoctor || authAdmin || activePortal) && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleLogout, className: "text-red-600 hover:text-red-700", children: "Logout" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mt-16 max-w-3xl rounded-3xl bg-white p-8 text-center text-sm font-semibold text-slate-600 shadow-lg", children: "Loading workspace..." }), children: [
      currentView === "landing" && /* @__PURE__ */ jsxRuntimeExports.jsx(LandingPageEnhanced, {}),
      currentView === "request-tracker" && /* @__PURE__ */ jsxRuntimeExports.jsx(RequestTracker, {}),
      currentView === "patient" && /* @__PURE__ */ jsxRuntimeExports.jsx(PatientDashboard, { logoutSignal: patientLogoutSignal, onSessionChange: setPortalSession }),
      currentView === "doctor-auth" && /* @__PURE__ */ jsxRuntimeExports.jsx(DoctorAuth, { onAuth: handleAuth }),
      currentView === "admin" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminDashboard, { doctor: authDoctor, onLogout: handleLogout }),
      currentView === "platform-admin" && /* @__PURE__ */ jsxRuntimeExports.jsx(PlatformAdminDashboard, { adminSession: authAdmin, onLogout: handleLogout }),
      currentView === "platform-admin-support" && /* @__PURE__ */ jsxRuntimeExports.jsx(SupportDashboard, { adminSession: authAdmin }),
      currentView === "facility" && /* @__PURE__ */ jsxRuntimeExports.jsx(FacilityPortal, { logoutSignal: facilityLogoutSignal, onSessionChange: setPortalSession }),
      currentView === "auth-callback" && /* @__PURE__ */ jsxRuntimeExports.jsx(AuthCallback, { onNavigate: navigate, onDoctorAuth: handleAuth, onPatientNavigate: () => navigate("patient") }),
      currentView === "payment-success" && /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentSuccess, { onNavigate: navigate }),
      currentView === "reset-password" && /* @__PURE__ */ jsxRuntimeExports.jsx(ResetPassword, {}),
      currentView === "terms" && /* @__PURE__ */ jsxRuntimeExports.jsx(TermsOfService, { onNavigate: navigate }),
      currentView === "privacy" && /* @__PURE__ */ jsxRuntimeExports.jsx(PrivacyPolicy, { onNavigate: navigate }),
      currentView === "contact" && /* @__PURE__ */ jsxRuntimeExports.jsx(Contact, { onNavigate: navigate })
    ] }),
    assistantPortal && /* @__PURE__ */ jsxRuntimeExports.jsx(HumanoidAssistant, { portal: assistantPortal }),
    currentView === "landing" && /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, { onNavigate: setCurrentView })
  ] }) });
}
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
export {
  Footer as F,
  HumanoidAssistant as H,
  SUPPORTED_LANGUAGES as S,
  apiFetch as a,
  readApiJson as r,
  useError as u
};
