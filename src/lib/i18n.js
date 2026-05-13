import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'fr', name: 'French', nativeName: 'Français' }
];

// Translation resources
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

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;