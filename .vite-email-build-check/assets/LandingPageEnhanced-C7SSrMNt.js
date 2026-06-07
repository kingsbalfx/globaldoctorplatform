import { r as reactExports, j as jsxRuntimeExports } from "./react-Bu4vr6vE.js";
import { a as apiFetch, u as useError, H as HumanoidAssistant } from "./index-DCY3-JaP.js";
import { A as AnnouncementBanner } from "./AnnouncementBanner-typdvJzp.js";
import { L as LanguageSelector } from "./LanguageSelector-DIosTXAB.js";
import { P as ProfileAvatar, g as getGenderLabel } from "./ProfileAvatar-6oVVdv9U.js";
import { T as TelehealthHeroArt, L as LandingAdArt } from "./TelehealthArt-DC0HZ32N.js";
import { u as useTranslation } from "./i18n-D-V3U9NC.js";
import { g as Languages, G as Globe2 } from "./icons-Ci-JEzBE.js";
import "./vendor-Qe2gXTEC.js";
async function fetchDoctors({ specialty, minRating, availability, query, language }) {
  const params = new URLSearchParams();
  if (specialty) params.set("specialty", specialty);
  if (minRating) params.set("minRating", minRating);
  if (availability) params.set("availability", availability);
  if (query) params.set("query", query);
  if (language) params.set("language", language);
  const response = await apiFetch(`/api/doctors?${params.toString()}`);
  if (!response.ok) {
    console.error("Failed to fetch doctors", await response.text());
    return [];
  }
  const payload = await response.json();
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload == null ? void 0 : payload.doctors)) return payload.doctors;
  return [];
}
const specialties = [
  "Cardiology",
  "Dermatology",
  "Psychiatry",
  "Pediatrics",
  "Oncology",
  "Orthopedics",
  "Neurology",
  "General Practitioner",
  "Urology",
  "Gynaecologist",
  "Obstetrics & Gynecology",
  "Ophthalmology"
];
const languages = ["English", "Spanish", "Arabic", "Hindi", "French", "Hausa", "Yoruba", "Swahili", "Igbo"];
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
function LandingPage() {
  const { t } = useTranslation();
  const { addError } = useError();
  const [query, setQuery] = reactExports.useState("");
  const [specialty, setSpecialty] = reactExports.useState("");
  const [language, setLanguage] = reactExports.useState("");
  const [minRating, setMinRating] = reactExports.useState(4);
  const [availability, setAvailability] = reactExports.useState("");
  const [results, setResults] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [loadError, setLoadError] = reactExports.useState("");
  const [selectedDoctor, setSelectedDoctor] = reactExports.useState(null);
  const [showReviewForm, setShowReviewForm] = reactExports.useState(false);
  const [showPaymentForm, setShowPaymentForm] = reactExports.useState(false);
  const [reviewData, setReviewData] = reactExports.useState({ rating: 5, comment: "" });
  const [paymentData, setPaymentData] = reactExports.useState({ type: "priority_access" });
  const [processingPayment, setProcessingPayment] = reactExports.useState(false);
  reactExports.useEffect(() => {
    void loadDoctors();
    const addGoogleTranslateScript = () => {
      if (!document.querySelector("#google-translate-script")) {
        const script = document.createElement("script");
        script.id = "google-translate-script";
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.head.appendChild(script);
        window.googleTranslateElementInit = () => {
          new window.google.translate.TranslateElement({
            pageLanguage: "en",
            includedLanguages: "en,ha,yo,sw,ar,fr,ig",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          }, "google_translate_element");
        };
      }
    };
    addGoogleTranslateScript();
  }, []);
  const loadDoctors = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const doctors = await fetchDoctors({});
      setResults(doctors);
    } catch (error) {
      console.error("Failed to load doctors:", error);
      setLoadError("We could not load the directory right now. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  const filteredDoctors = reactExports.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedAvailability = availability.trim().toLowerCase();
    return results.filter((doctor) => {
      const name = String((doctor == null ? void 0 : doctor.name) || "").toLowerCase();
      const location = String((doctor == null ? void 0 : doctor.location) || "").toLowerCase();
      const doctorAvailability = String((doctor == null ? void 0 : doctor.availability) || "").toLowerCase();
      const doctorSpecialty = String((doctor == null ? void 0 : doctor.specialty) || "");
      const doctorLanguages = Array.isArray(doctor == null ? void 0 : doctor.languages) ? doctor.languages : [];
      const doctorRating = Number((doctor == null ? void 0 : doctor.rating) || 0);
      const matchesQuery = normalizedQuery.length === 0 || name.includes(normalizedQuery) || location.includes(normalizedQuery) || doctorSpecialty.toLowerCase().includes(normalizedQuery);
      const matchesSpecialty = specialty === "" || specialtyKey(doctorSpecialty) === specialtyKey(specialty);
      const matchesLanguage = language === "" || doctorLanguages.some((item) => String(item).toLowerCase() === language.toLowerCase());
      const matchesRating = doctorRating >= minRating;
      const matchesAvailability = normalizedAvailability === "" || doctorAvailability.includes(normalizedAvailability);
      return matchesQuery && matchesSpecialty && matchesLanguage && matchesRating && matchesAvailability;
    });
  }, [availability, language, minRating, query, results, specialty]);
  const handleSearch = async (event) => {
    event.preventDefault();
    setLoading(true);
    setLoadError("");
    try {
      const doctors = await fetchDoctors({ specialty, language, minRating, availability, query });
      setResults(doctors);
    } catch (error) {
      console.error("Search failed:", error);
      setLoadError("Search failed. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  const heroBackgroundStyle = {
    backgroundImage: "url('/background.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  };
  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!selectedDoctor) return;
    try {
      window.localStorage.setItem("gd_landing_review_doctor", JSON.stringify({
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        rating: reviewData.rating,
        comment: reviewData.comment,
        savedAt: Date.now()
      }));
      window.location.href = "/patient";
    } catch (error) {
      addError("Could not prepare review handoff: " + error.message, "error");
    }
  };
  const handlePayment = async (event) => {
    event.preventDefault();
    if (!selectedDoctor) return;
    setProcessingPayment(true);
    try {
      window.localStorage.setItem("gd_landing_selected_doctor", JSON.stringify({
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        consultationType: paymentData.type,
        savedAt: Date.now()
      }));
      window.location.href = "/patient";
    } catch (error) {
      addError("Could not prepare booking handoff: " + error.message, "error");
    } finally {
      setProcessingPayment(false);
    }
  };
  const openBooking = (doctor) => {
    setSelectedDoctor(doctor);
    setShowPaymentForm(true);
    setShowReviewForm(false);
    try {
      window.localStorage.setItem("gd_landing_selected_doctor", JSON.stringify({
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        savedAt: Date.now()
      }));
    } catch {
    }
  };
  const openReview = (doctor) => {
    setSelectedDoctor(doctor);
    setShowReviewForm(true);
    setShowPaymentForm(false);
  };
  const resetFilters = () => {
    setQuery("");
    setSpecialty("");
    setLanguage("");
    setMinRating(4);
    setAvailability("");
    void loadDoctors();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative mx-auto max-w-7xl px-6 pb-16 sm:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnnouncementBanner, { audience: "landing" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "section",
      {
        className: "relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-xl shadow-slate-200/60 sm:px-10",
        style: heroBackgroundStyle,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-br from-white/96 via-white/90 to-emerald-50/84" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageSelector, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/60 backdrop-blur", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-500" }),
                "Verified profiles • Secure consultations • Fast booking"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-md shadow-brand-700/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold", children: "G" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.28em] text-slate-500", children: "GlobalDoc Connect" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-3xl font-bold text-slate-900 sm:text-5xl", children: t("landing.heroTitle") })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-xl text-lg leading-8 text-slate-700", children: t("landing.heroSubtitle") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "a",
                  {
                    href: "#search",
                    className: "rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/30 hover:bg-brand-600",
                    children: t("landing.getStarted")
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "a",
                  {
                    href: "#how-it-works",
                    className: "rounded-full border border-slate-200 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white",
                    children: "See how it works"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-0 sm:grid-cols-[0.95fr_1.05fr]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative min-h-[128px] bg-slate-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: "/translation-art.svg",
                    alt: "",
                    className: "absolute inset-0 h-full w-full object-cover",
                    "aria-hidden": "true"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2 text-teal-800", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Languages, { className: "h-5 w-5", "aria-hidden": "true" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-slate-900", children: "Translate this page" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Choose a language for easier care access." })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Globe2, { className: "h-3.5 w-3.5", "aria-hidden": "true" }),
                      "Google Translate"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: "google_translate_element", className: "min-h-[44px]" })
                  ] })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-3", children: [
                { title: "Trusted directory", body: "Profiles reviewed to reduce impersonation risk." },
                { title: "Privacy minded", body: "Designed for patient confidentiality and safety." },
                { title: "Global access", body: "Search by specialty, location, and language." }
              ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-sm backdrop-blur", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-900", children: item.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-600", children: item.body })
              ] }, item.title)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TelehealthHeroArt, { theme: "landing", className: "mt-6" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl bg-white/70 p-4 shadow-inner shadow-slate-200/80 ring-1 ring-slate-200/60 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-white p-6 shadow-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Search doctors" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Filter by specialty, rating, availability, and language." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#directory", className: "text-sm font-semibold text-brand-700 hover:text-brand-600", children: "View directory" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { id: "search", onSubmit: handleSearch, className: "mt-6 space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Search by name or city" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      value: query,
                      onChange: (e) => setQuery(e.target.value),
                      className: "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                      placeholder: "e.g. Dr. Amina or Nairobi"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-slate-700", children: [
                    "Specialty",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "select",
                      {
                        value: specialty,
                        onChange: (e) => setSpecialty(e.target.value),
                        className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All specialties" }),
                          specialties.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: item, children: item }, item))
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-slate-700", children: [
                    "Language",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "select",
                      {
                        value: language,
                        onChange: (e) => setLanguage(e.target.value),
                        className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Any language" }),
                          languages.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: item, children: item }, item))
                        ]
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-slate-700", children: [
                    "Minimum rating",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "select",
                      {
                        value: minRating,
                        onChange: (e) => setMinRating(Number(e.target.value)),
                        className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                        children: [4, 4.2, 4.5, 4.8, 5].map((rating) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: rating, children: [
                          rating,
                          "+"
                        ] }, rating))
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-slate-700", children: [
                    "Availability",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        value: availability,
                        onChange: (e) => setAvailability(e.target.value),
                        className: "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                        placeholder: "Available now, Book for tomorrow"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "submit",
                      className: "flex-1 rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600",
                      children: "Filter doctors"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: resetFilters,
                      className: "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50",
                      children: "Reset"
                    }
                  )
                ] }),
                loadError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900", children: loadError })
              ] })
            ] }) })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LandingAdArt, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-12 grid gap-8 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-slate-900", children: "Verified global directory" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-slate-600", children: "Search by location, specialty, and language so patients can choose with confidence." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-slate-900", children: "Secure consultations" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-slate-600", children: "Chat and video options help patients connect with clinicians without complicated steps." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-slate-900", children: "Patient reviews" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-slate-600", children: "Verified reviews encourage authenticity and reduce bot or fake feedback." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "how-it-works", className: "mt-16 rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-10 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.3em] text-brand-700", children: "How it works" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-3xl font-bold text-slate-900", children: "Patient-first experience" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-slate-600", children: "Compare specialists, book quickly, and keep care organised—without juggling multiple apps." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6 lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6 sm:grid-cols-3", children: [
        { step: "01", title: "Search globally", body: "Filter by specialty, rating, language, and location." },
        { step: "02", title: "Book confidently", body: "Choose consultation type and confirm in one flow." },
        { step: "03", title: "Review safely", body: "Verified patients keep ratings more authentic." }
      ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-slate-200 bg-slate-50 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-brand-700", children: item.step }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 text-lg font-semibold text-slate-900", children: item.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: item.body })
      ] }, item.step)) }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "for-doctors", className: "mt-16 grid gap-8 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-brand-700 px-8 py-10 text-white shadow-xl shadow-brand-700/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold", children: "For clinicians" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 max-w-xl text-lg leading-8 text-brand-100", children: "A clean workspace for verified profiles, consultations, referrals, and follow-ups—built to keep care organised." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-8 space-y-4 text-sm text-brand-100/90", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Professional profile and license verification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Availability, bookings, and reminders" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Secure chat and video sessions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Referrals and patient documentation tools" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-slate-50 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-slate-900", children: "For patients" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-slate-600", children: "Find the right doctor faster with clear specialties, verified badges, and quick booking." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid gap-4 sm:grid-cols-2", children: [
          { title: "Search by specialty", body: "Filter by location, language, availability, and rating." },
          { title: "Book in minutes", body: "Choose a time that works and confirm in one flow." },
          { title: "Talk securely", body: "Use in-app chat and video for consultations." },
          { title: "Stay on track", body: "Reminders and follow-ups help keep care consistent." }
        ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white px-4 py-4 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-slate-900", children: item.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: item.body })
        ] }, item.title)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-16 rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/60", id: "contact", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Need help choosing a doctor?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-2xl text-slate-600", children: "Reach the support team and get guidance on specialties, bookings, and next steps." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-slate-200 bg-slate-50 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-slate-900", children: "Contact" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-slate-600", children: [
          "Email:",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "font-semibold text-brand-700 hover:text-brand-600", href: "mailto:globaldoctorconnect@gmail.com", children: "globaldoctorconnect@gmail.com" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-slate-500", children: "Support replies within 24 hours." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-12 rounded-3xl bg-slate-900 px-8 py-10 text-white", id: "directory", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Available doctors" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-300", children: "Browse, review, and book securely." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#search", className: "text-sm font-semibold text-brand-300 hover:text-brand-200", children: "Update filters" })
      ] }),
      loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 grid gap-6 xl:grid-cols-3", children: [0, 1, 2].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-slate-950/70 p-6 animate-pulse", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-24 rounded bg-slate-800" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-7 w-48 rounded bg-slate-800" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-40 rounded bg-slate-800" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-56 rounded bg-slate-800" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 flex-1 rounded-full bg-slate-800" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 flex-1 rounded-full bg-slate-800" })
        ] })
      ] }, item)) }),
      !loading && filteredDoctors.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-3xl border border-slate-700 bg-slate-950/40 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-200", children: "No doctors match your filters yet." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-400", children: "Try widening the specialty, language, or rating filters." })
      ] }),
      !loading && filteredDoctors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 grid gap-6 xl:grid-cols-3", children: filteredDoctors.map((doctor) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-slate-950/80 p-6 ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-slate-900/90", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileAvatar, { person: doctor, role: "doctor", size: "lg" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.2em] text-brand-300", children: doctor.specialty }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 text-xl font-bold", children: doctor.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs font-semibold text-slate-400", children: getGenderLabel(doctor) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-900", children: doctor.verified ? "Verified" : "Pending" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-slate-300", children: doctor.location }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-sm text-slate-300", children: [
          "Languages: ",
          Array.isArray(doctor.languages) ? doctor.languages.join(", ") : "—"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-2 text-sm text-slate-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-slate-800 px-3 py-1", children: doctor.availability }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-slate-800 px-3 py-1", children: [
            "Rating ",
            doctor.rating
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-slate-800 px-3 py-1", children: [
            "$",
            doctor.fee,
            "/consult"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                openReview(doctor);
              },
              className: "flex-1 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600",
              children: "Leave Review"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                openBooking(doctor);
              },
              className: "flex-1 rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600",
              children: "Book Now"
            }
          )
        ] })
      ] }, doctor.id)) })
    ] }),
    showReviewForm && selectedDoctor && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md rounded-3xl bg-white p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xl font-bold text-slate-900", children: [
        "Review ",
        selectedDoctor.name
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Reviews are completed from the patient portal so they attach to a real patient record." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmitReview, className: "mt-6 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Rating" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: reviewData.rating,
              onChange: (e) => setReviewData({ ...reviewData, rating: Number(e.target.value) }),
              className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900",
              children: [5, 4, 3, 2, 1].map((rating) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: rating, children: [
                rating,
                " stars"
              ] }, rating))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Comment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: reviewData.comment,
              onChange: (e) => setReviewData({ ...reviewData, comment: e.target.value }),
              className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900",
              rows: 4,
              placeholder: "Share your experience..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              className: "flex-1 rounded-full bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600",
              children: "Continue to Patient Portal"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowReviewForm(false),
              className: "flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50",
              children: "Cancel"
            }
          )
        ] })
      ] })
    ] }) }),
    showPaymentForm && selectedDoctor && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md rounded-3xl bg-white p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileAvatar, { person: selectedDoctor, role: "doctor", size: "lg" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-slate-900", children: "Book Consultation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-slate-600", children: selectedDoctor.name })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-brand-50 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-slate-600", children: [
          "Specialty: ",
          selectedDoctor.specialty
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-slate-600", children: [
          "Sex: ",
          getGenderLabel(selectedDoctor)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-slate-600", children: [
          "Location: ",
          selectedDoctor.location
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-lg font-semibold text-slate-900", children: [
          "$",
          selectedDoctor.fee
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-slate-500", children: "Continue to the patient portal to sign in, confirm tokens, and complete the booking safely." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handlePayment, className: "mt-6 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Consultation Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: paymentData.type,
              onChange: (e) => setPaymentData({ ...paymentData, type: e.target.value }),
              className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "priority_access", children: "Priority Access" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "telehealth_consultation", children: "Telehealth Consultation" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              disabled: processingPayment,
              className: "flex-1 rounded-full bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60",
              children: processingPayment ? "Opening portal..." : "Continue to Patient Portal"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowPaymentForm(false),
              className: "flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50",
              children: "Cancel"
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
function PlatformExplainer() {
  const steps = [
    { id: "01", title: "Patients search globally", body: "Find doctors by specialty, language, rating, location, and availability from anywhere." },
    { id: "02", title: "Book and confirm", body: "Choose consultation type, schedule fast, and move into chat or video when ready." },
    { id: "03", title: "Doctors deliver care", body: "Doctors manage consultations, notes, prescriptions, follow-ups, and patient communication." },
    { id: "04", title: "Facilities coordinate", body: "Facilities support referrals, lab requests, documentation, and care routing from one workflow." }
  ];
  const timeline = [
    "Search doctor",
    "Book consultation",
    "Upload records",
    "Chat or video",
    "Follow up"
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-16 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "inline-flex items-center rounded-full bg-brand-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-brand-700", children: "1–2 minute walkthrough" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-5 text-3xl font-bold text-slate-900 sm:text-4xl", children: "See the whole platform in one flow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-2xl text-lg leading-8 text-slate-600", children: "A landing-page video-style summary showing how GlobalDoc Connect moves a patient from doctor search to secure consultation, records, facility support, and follow-up." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 rounded-[2rem] border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-slate-50 p-4 shadow-inner shadow-slate-200/70", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-video overflow-hidden rounded-[1.5rem] border border-white bg-white shadow-lg shadow-slate-200/70", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col justify-between bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.20),_transparent_35%),linear-gradient(135deg,_#ffffff,_#f8fafc)] p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/logo.png", alt: "", className: "h-10 w-10 rounded-full object-cover shadow-sm" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-[0.22em] text-slate-500", children: "GlobalDoc Connect" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-slate-900", children: "Telehealth journey preview" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700", children: "Secure flow" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: ["Patient portal", "Doctor workspace", "Facility support", "AI guide"].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-slate-900", children: item }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "Connected care step" })
          ] }, item)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-5", children: timeline.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-full bg-slate-900 px-3 py-2 text-center text-[11px] font-semibold text-white shadow-sm", children: [
            index + 1,
            ". ",
            item
          ] }, item)) })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: steps.map((step) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:shadow-slate-200/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-brand-700", children: step.id }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 text-lg font-semibold text-slate-900", children: step.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-7 text-slate-600", children: step.body })
      ] }, step.id)) })
    ] })
  ] });
}
function LandingPageEnhanced() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LandingPage, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-7xl px-6 pb-16 sm:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlatformExplainer, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(HumanoidAssistant, { portal: "landing" })
  ] });
}
export {
  LandingPageEnhanced as default
};
