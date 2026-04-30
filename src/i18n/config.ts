import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { ar } from "./translations/ar";
import { en } from "./translations/en";

export type AppLocale = "ar" | "en";

const resources = {
  ar: { translation: ar },
  en: { translation: en },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "ar",
    fallbackLng: "ar",
    compatibilityJSON: "v4",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;
