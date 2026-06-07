import { r as reactExports, j as jsxRuntimeExports } from "./react-Bu4vr6vE.js";
import { S as SUPPORTED_LANGUAGES } from "./index-DCY3-JaP.js";
import { u as useTranslation } from "./i18n-D-V3U9NC.js";
import { x as Globe, y as ChevronDown } from "./icons-Ci-JEzBE.js";
const LanguageSelector = ({ className = "" }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const [currentLanguage, setCurrentLanguage] = reactExports.useState(
    SUPPORTED_LANGUAGES.find((lang) => lang.code === i18n.language) || SUPPORTED_LANGUAGES[0]
  );
  reactExports.useEffect(() => {
    const lang = SUPPORTED_LANGUAGES.find((lang2) => lang2.code === i18n.language) || SUPPORTED_LANGUAGES[0];
    setCurrentLanguage(lang);
    document.documentElement.dir = lang.rtl ? "rtl" : "ltr";
    document.documentElement.lang = lang.code;
  }, [i18n.language]);
  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language.code);
    setCurrentLanguage(language);
    setIsOpen(false);
    localStorage.setItem("userLanguagePreference", language.code);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setIsOpen(!isOpen),
        className: "flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
        "aria-haspopup": "listbox",
        "aria-expanded": isOpen,
        "aria-label": t("landing.selectLanguage"),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "w-5 h-5 text-gray-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: currentLanguage.nativeName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}` })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "fixed inset-0 z-10",
          onClick: () => setIsOpen(false),
          "aria-hidden": "true"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute z-20 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto",
          role: "listbox",
          "aria-label": t("landing.chooseLanguage"),
          children: SUPPORTED_LANGUAGES.map((language) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleLanguageChange(language),
              className: `w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors ${currentLanguage.code === language.code ? "bg-blue-50 text-blue-700" : "text-gray-700"}`,
              role: "option",
              "aria-selected": currentLanguage.code === language.code,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: language.nativeName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-500", children: language.name })
              ] })
            },
            language.code
          ))
        }
      )
    ] })
  ] });
};
export {
  LanguageSelector as L
};
