import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { NAMESPACES, resources } from "./resources";

export const LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "bn", label: "বাংলা", short: "বাং" },
] as const;
export type Lang = (typeof LANGUAGES)[number]["code"];

const STORAGE_KEY = "aura-lang";
const BANGLA_FONT = "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap";

export const isLang = (v: unknown): v is Lang => LANGUAGES.some((l) => l.code === v);

/** The shopper's own pick, if they ever switched */
function storedLang(): Lang | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isLang(v) ? v : null;
  } catch {
    return null;
  }
}

function syncDocument(lng: string) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lng;
  if (lng === "bn" && !document.querySelector("link[data-bangla-font]")) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = BANGLA_FONT;
    link.dataset.banglaFont = "";
    document.head.appendChild(link);
  }
}

void i18n.use(initReactI18next).init({
  resources,
  ns: NAMESPACES,
  defaultNS: "common",
  lng: storedLang() ?? "en",
  fallbackLng: "en",
  supportedLngs: LANGUAGES.map((l) => l.code),
  interpolation: { escapeValue: false }, // React escapes
  returnNull: false,
  react: { useSuspense: false },
});

i18n.on("languageChanged", syncDocument);
syncDocument(i18n.language);

/** Shopper picked a language: remember it over the store default */
export function chooseLanguage(lng: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* private mode: still switch for this visit */
  }
  void i18n.changeLanguage(lng);
}

/** Owner's default from Online store settings; ignored once the shopper has picked one */
export function applyStoreDefault(lng: unknown) {
  if (storedLang() || !isLang(lng) || lng === i18n.language) return;
  void i18n.changeLanguage(lng);
}

/** BCP 47 tag for Intl / toLocaleDateString in the current language */
export function localeTag(): string {
  return i18n.language === "bn" ? "bn-BD" : "en-US";
}

export default i18n;
