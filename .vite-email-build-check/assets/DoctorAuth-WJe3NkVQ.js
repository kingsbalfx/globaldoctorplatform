import { r as reactExports, j as jsxRuntimeExports } from "./react-Bu4vr6vE.js";
import { u as useError, a as apiFetch } from "./index-DCY3-JaP.js";
import { F as ForgotPassword, G as GoogleSignInButton, b as buildOAuthRedirectUrl } from "./GoogleSignInButton-Um7n1y8i.js";
import { s as supabase } from "./supabaseClient-iq1FVAJ-.js";
import { T as TelehealthHeroArt } from "./TelehealthArt-DC0HZ32N.js";
import { u as useTranslation } from "./i18n-D-V3U9NC.js";
import { E as EyeOff, o as Eye } from "./icons-Ci-JEzBE.js";
import "./vendor-Qe2gXTEC.js";
import "./supabase-CHf_0O8y.js";
const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Korea, North",
  "Korea, South",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe"
];
function getLicensePattern(country) {
  const lower = country.toLowerCase();
  if (lower.includes("united states")) return /^[A-Z]{2}\d{6,8}$/;
  if (lower.includes("united kingdom")) return /^\d{7}$/;
  if (lower.includes("nigeria")) return /^MDCN\/\d{4,6}$/;
  if (lower.includes("india")) return /^[A-Z]{2}\/\d{4,6}$/;
  if (lower.includes("kenya")) return /^[A-Z]\d{5}$/;
  if (lower.includes("canada")) return /^\d{5,6}$/;
  return null;
}
function validateLicense(license, country) {
  if (!license || !license.trim()) return "License number is required.";
  const pattern = getLicensePattern(country);
  if (pattern && !pattern.test(license.trim())) {
    return `Invalid format for ${country}. Example: ${pattern}`;
  }
  return null;
}
function DoctorAuth({ onAuth }) {
  var _a;
  const { t } = useTranslation();
  const { addError } = useError();
  const [isLogin, setIsLogin] = reactExports.useState(true);
  const [formData, setFormData] = reactExports.useState({
    email: "",
    password: "",
    name: "",
    specialty: "",
    location: "",
    licenseNumber: "",
    licenseIssuer: "",
    licenseExpiry: "",
    bankCode: "",
    bankAccount: "",
    currency: "NGN",
    payoutMethod: "bank_account",
    mobileMoneyOperator: "",
    mobileMoneyNumber: "",
    gender: "",
    profilePhotoUrl: "",
    signatureDataUrl: "",
    passportDataUrl: ""
  });
  const [loading, setLoading] = reactExports.useState(false);
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [completingExistingUser, setCompletingExistingUser] = reactExports.useState(false);
  const [registrationStep, setRegistrationStep] = reactExports.useState("profile");
  const [forgotActive, setForgotActive] = reactExports.useState(false);
  reactExports.useEffect(() => {
    try {
      const pending = JSON.parse(window.localStorage.getItem("gd_pending_doctor_profile") || "null");
      if (!(pending == null ? void 0 : pending.email)) return;
      setCompletingExistingUser(true);
      setIsLogin(false);
      setFormData((prev) => ({
        ...prev,
        email: pending.email,
        name: pending.name || prev.name,
        gender: pending.gender || prev.gender,
        profilePhotoUrl: pending.profilePhotoUrl || prev.profilePhotoUrl
      }));
      window.localStorage.removeItem("gd_pending_doctor_profile");
    } catch {
    }
  }, []);
  const handleGoogleSignIn = async () => {
    const redirectTo = buildOAuthRedirectUrl({ role: "doctor", next: "/doctor/dashboard" });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, queryParams: { prompt: "select_account" } }
    });
    if (error) addError(error.message || t("auth.authFailed"), "error");
  };
  const createBackendDoctorSession = async (profile) => {
    var _a2;
    let response;
    try {
      response = await apiFetch("/api/auth/oauth/bridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "doctor", ...profile })
      });
    } catch {
      throw new Error("Your Google account is signed in, but the medical server could not be reached to prepare the doctor dashboard.");
    }
    const result = await response.json().catch(() => ({}));
    if (response.status === 403 && (result == null ? void 0 : result.pendingApproval)) {
      return { pendingApproval: true, message: result.message || "Your doctor account is pending platform admin approval." };
    }
    if (!response.ok || !((_a2 = result == null ? void 0 : result.doctor) == null ? void 0 : _a2.id)) {
      throw new Error(result.error || "Could not prepare your doctor dashboard.");
    }
    return result.doctor;
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isLogin) {
      if (registrationStep === "profile") {
        if (!formData.name.trim() || !formData.email.trim() || !completingExistingUser && !formData.password.trim() || !formData.specialty || !formData.location) {
          addError("Complete your profile details before continuing.", "warning");
          return;
        }
        setRegistrationStep("license");
        return;
      }
      if (registrationStep === "license") {
        const licenseError = validateLicense(formData.licenseNumber, formData.location);
        if (licenseError) {
          addError(licenseError, "error");
          return;
        }
        setRegistrationStep("uploads");
        return;
      }
    }
    setLoading(true);
    try {
      if (!isLogin) {
        const licenseError = validateLicense(formData.licenseNumber, formData.location);
        if (licenseError) {
          addError(licenseError, "error");
          setLoading(false);
          return;
        }
      }
      if (!isLogin && (!formData.signatureDataUrl || !formData.passportDataUrl)) {
        throw new Error("Upload both your signature and passport photo before submitting.");
      }
      if (!formData.email || isLogin && !formData.password) {
        throw new Error("Please enter your email and password.");
      }
      if (!isLogin && completingExistingUser) {
        const { data: updateData, error: updateError } = await supabase.auth.updateUser({
          data: {
            full_name: formData.name,
            specialty: formData.specialty,
            location: formData.location,
            license_number: formData.licenseNumber,
            license_issuer: formData.licenseIssuer,
            license_expiry: formData.licenseExpiry,
            gender: formData.gender,
            profile_photo_url: formData.profilePhotoUrl,
            signature_data_url: formData.signatureDataUrl,
            passport_data_url: formData.passportDataUrl
          }
        });
        if (updateError) throw updateError;
        const user = updateData == null ? void 0 : updateData.user;
        const doctor = await createBackendDoctorSession({
          email: (user == null ? void 0 : user.email) || formData.email,
          name: formData.name,
          specialty: formData.specialty,
          location: formData.location,
          licenseNumber: formData.licenseNumber,
          licenseIssuer: formData.licenseIssuer,
          licenseExpiry: formData.licenseExpiry,
          bankCode: formData.bankCode,
          bankAccount: formData.bankAccount,
          currency: formData.currency,
          payoutMethod: formData.payoutMethod,
          mobileMoneyOperator: formData.mobileMoneyOperator,
          mobileMoneyNumber: formData.mobileMoneyNumber,
          gender: formData.gender,
          profilePhotoUrl: formData.profilePhotoUrl,
          signatureDataUrl: formData.signatureDataUrl,
          passportDataUrl: formData.passportDataUrl
        });
        if (doctor == null ? void 0 : doctor.pendingApproval) {
          addError(doctor.message || "Profile submitted. A platform admin must approve your account before you can sign in.", "success", 1e4);
          setCompletingExistingUser(false);
          setIsLogin(true);
          return;
        }
        onAuth({ type: "login", ...doctor });
        return;
      }
      const endpoint = isLogin ? "/api/doctors/login" : "/api/doctors/register";
      const payload = isLogin ? { email: formData.email, password: formData.password } : {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        specialty: formData.specialty,
        location: formData.location,
        licenseNumber: formData.licenseNumber,
        licenseIssuer: formData.licenseIssuer,
        licenseExpiry: formData.licenseExpiry,
        bankCode: formData.bankCode,
        bankAccount: formData.bankAccount,
        currency: formData.currency,
        payoutMethod: formData.payoutMethod,
        mobileMoneyOperator: formData.mobileMoneyOperator,
        mobileMoneyNumber: formData.mobileMoneyNumber,
        gender: formData.gender,
        profilePhotoUrl: formData.profilePhotoUrl,
        signatureDataUrl: formData.signatureDataUrl,
        passportDataUrl: formData.passportDataUrl
      };
      let response;
      try {
        response = await apiFetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (networkError) {
        throw new Error(
          "Could not reach the medical server. Please check your connection or try again later."
        );
      }
      const result = await response.json().catch(() => ({}));
      if (result == null ? void 0 : result.admin) {
        onAuth({
          type: "admin-login",
          admin: result.admin,
          credentials: { email: formData.email, password: formData.password }
        });
        return;
      }
      if (response.status === 403 && (result == null ? void 0 : result.pendingApproval)) {
        throw new Error(result.error || result.message || "Your doctor account is pending platform admin approval.");
      }
      if (!response.ok) {
        throw new Error(result.error || "Authentication failed");
      }
      if (result == null ? void 0 : result.pendingApproval) {
        addError(result.message || "Registration submitted. A platform admin must approve your account before you can sign in.", "success", 1e4);
        setIsLogin(true);
        return;
      }
      if (result == null ? void 0 : result.doctor) {
        onAuth({ type: isLogin ? "login" : "register", ...result.doctor });
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      addError(error.message || t("auth.authFailed"), "error");
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };
  const registrationSteps = [
    { id: "profile", label: "Profile details" },
    { id: "license", label: "License details" },
    { id: "uploads", label: "Uploads" }
  ];
  const handleSignatureUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addError("Upload a signature image file.", "warning");
      return;
    }
    if (file.size > 300 * 1024) {
      addError("Signature image must be 300KB or less.", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => handleChange("signatureDataUrl", String(reader.result || ""));
    reader.onerror = () => addError("Could not read signature image.", "error");
    reader.readAsDataURL(file);
  };
  const handlePassportUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addError("Upload a passport photo image file.", "warning");
      return;
    }
    if (file.size > 500 * 1024) {
      addError("Passport photo must be 500KB or less.", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => handleChange("passportDataUrl", String(reader.result || ""));
    reader.onerror = () => addError("Could not read passport photo.", "error");
    reader.readAsDataURL(file);
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
  return forgotActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(ForgotPassword, { userType: "doctor", onBack: () => setForgotActive(false) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-slate-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `w-full ${isLogin ? "max-w-md" : "max-w-2xl"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TelehealthHeroArt, { theme: "doctor", className: "mb-8" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "GlobalDoc Connect" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-600 mt-2", children: "Doctor Portal" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl shadow-xl p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setIsLogin(true);
              setRegistrationStep("profile");
            },
            className: `flex-1 py-2 px-4 rounded-2xl font-semibold transition ${isLogin ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-600"}`,
            children: "Login"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setIsLogin(false);
              setRegistrationStep("profile");
            },
            className: `flex-1 py-2 px-4 rounded-2xl font-semibold transition ml-2 ${!isLogin ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-600"}`,
            children: "Register"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        !isLogin && completingExistingUser && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800", children: "Complete your profile details. Your Supabase session is active, so password is optional here." }),
        !isLogin && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl border border-slate-200 bg-slate-50 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: registrationSteps.map((step, index) => {
          const active = registrationStep === step.id;
          const completed = registrationSteps.findIndex((item) => item.id === registrationStep) > index;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => {
                if (active || completed) setRegistrationStep(step.id);
              },
              className: `rounded-2xl px-2 py-3 text-center text-xs font-black transition ${active ? "bg-brand-700 text-white shadow-lg shadow-brand-700/20" : completed ? "bg-emerald-100 text-emerald-800" : "bg-white text-slate-500 ring-1 ring-slate-200"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block text-[10px] uppercase tracking-[0.14em]", children: [
                  "Step ",
                  index + 1
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block", children: step.label })
              ]
            },
            step.id
          );
        }) }) }),
        !isLogin && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: registrationStep === "profile" ? "" : "hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Full Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: formData.name,
                onChange: (e) => handleChange("name", e.target.value),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                required: registrationStep === "profile"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: registrationStep === "profile" ? "" : "hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Specialty" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: formData.specialty,
                onChange: (e) => handleChange("specialty", e.target.value),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                required: registrationStep === "profile",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select specialty" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "General Practitioner", children: "General Practitioner" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Cardiology", children: "Cardiology" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Dermatology", children: "Dermatology" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Psychiatry", children: "Psychiatry" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Pediatrics", children: "Pediatrics" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Oncology", children: "Oncology" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Orthopedics", children: "Orthopedics" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Neurology", children: "Neurology" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Urology", children: "Urology" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Gynaecologist", children: "Gynaecologist" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Obstetrics & Gynecology", children: "Obstetrics & Gynecology" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Ophthalmology", children: "Ophthalmology" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: registrationStep === "profile" ? "" : "hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Country" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: formData.location,
                onChange: (e) => handleChange("location", e.target.value),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                required: registrationStep === "profile",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select your country" }),
                  COUNTRIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c, children: c }, c))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: registrationStep === "profile" ? "" : "hidden", children: [
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
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-sky-50 to-rose-50 p-4 ${registrationStep === "profile" ? "" : "hidden"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Public Profile Picture" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "file",
                accept: "image/png,image/jpeg,image/webp",
                onChange: (e) => {
                  var _a2;
                  return handleProfilePhotoUpload((_a2 = e.target.files) == null ? void 0 : _a2[0]);
                },
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "Optional. This appears on booking cards. Max 500KB." }),
            formData.profilePhotoUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: formData.profilePhotoUrl, alt: "Profile preview", className: "mt-3 h-20 w-20 rounded-2xl object-cover ring-2 ring-white shadow" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: registrationStep === "license" ? "" : "hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-slate-700", children: [
              "Medical License Number",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs text-slate-400", children: "(must match your country's format)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: formData.licenseNumber,
                onChange: (e) => handleChange("licenseNumber", e.target.value),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                placeholder: "e.g., MDCN/12345",
                required: registrationStep === "license"
              }
            ),
            formData.location && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-500", children: [
              "Expected format: ",
              ((_a = getLicensePattern(formData.location)) == null ? void 0 : _a.toString()) || "Any non-empty value"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: registrationStep === "license" ? "" : "hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "License Issuer / Medical Council" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: formData.licenseIssuer,
                onChange: (e) => handleChange("licenseIssuer", e.target.value),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                placeholder: "e.g., Medical and Dental Council of Nigeria"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: registrationStep === "license" ? "" : "hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "License Expiry Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                value: formData.licenseExpiry,
                onChange: (e) => handleChange("licenseExpiry", e.target.value),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl border border-slate-200 bg-slate-50 p-4 ${registrationStep === "license" ? "" : "hidden"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Payout Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: formData.payoutMethod,
                onChange: (e) => handleChange("payoutMethod", e.target.value),
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "bank_account", children: "Bank account" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "mobile_money", children: "Mobile money" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: formData.currency,
                onChange: (e) => handleChange("currency", e.target.value.toUpperCase()),
                className: "mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                placeholder: "Currency, e.g. NGN"
              }
            ),
            formData.payoutMethod === "bank_account" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid gap-3 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: formData.bankCode,
                  onChange: (e) => handleChange("bankCode", e.target.value),
                  className: "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                  placeholder: "Bank code"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: formData.bankAccount,
                  onChange: (e) => handleChange("bankAccount", e.target.value),
                  className: "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                  placeholder: "Bank account number"
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid gap-3 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: formData.mobileMoneyOperator,
                  onChange: (e) => handleChange("mobileMoneyOperator", e.target.value),
                  className: "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                  placeholder: "Mobile money operator"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: formData.mobileMoneyNumber,
                  onChange: (e) => handleChange("mobileMoneyNumber", e.target.value),
                  className: "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                  placeholder: "Mobile money number"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: registrationStep === "uploads" ? "" : "hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Signature Image" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "file",
                accept: "image/png,image/jpeg,image/webp",
                onChange: (e) => {
                  var _a2;
                  return handleSignatureUpload((_a2 = e.target.files) == null ? void 0 : _a2[0]);
                },
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                required: registrationStep === "uploads" && !formData.signatureDataUrl
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "Upload a clear PNG/JPG/WebP signature. Max 300KB." }),
            formData.signatureDataUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: formData.signatureDataUrl, alt: "Signature preview", className: "max-h-20 object-contain" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: registrationStep === "uploads" ? "" : "hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Passport Photo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "file",
                accept: "image/png,image/jpeg,image/webp",
                onChange: (e) => {
                  var _a2;
                  return handlePassportUpload((_a2 = e.target.files) == null ? void 0 : _a2[0]);
                },
                className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
                required: registrationStep === "uploads" && !formData.passportDataUrl
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "Upload a clear doctor passport/headshot. Max 500KB." }),
            formData.passportDataUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: formData.passportDataUrl, alt: "Passport preview", className: "h-24 w-24 rounded-2xl object-cover" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: isLogin || registrationStep === "profile" ? "" : "hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "email",
              value: formData.email,
              onChange: (e) => handleChange("email", e.target.value),
              className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500",
              required: isLogin || registrationStep === "profile"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: isLogin || registrationStep === "profile" ? "" : "hidden", children: [
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
                required: (isLogin || registrationStep === "profile") && !completingExistingUser
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowPassword((v) => !v),
                className: "absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700",
                "aria-label": showPassword ? "Hide password" : "Show password",
                children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
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
        ) }),
        !isLogin ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              disabled: registrationStep === "profile",
              onClick: () => setRegistrationStep(registrationStep === "uploads" ? "license" : "profile"),
              className: "rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50",
              children: "Back"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              disabled: loading,
              className: "rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed",
              children: loading ? "Processing..." : registrationStep === "uploads" ? completingExistingUser ? "Complete Profile" : "Submit Registration" : "Continue"
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed",
            children: loading ? "Processing..." : "Login"
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
          children: "Back to patient portal"
        }
      ) })
    ] })
  ] }) });
}
export {
  COUNTRIES,
  DoctorAuth as default
};
