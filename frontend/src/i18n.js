import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ru from "./locales/ru.json";

const LANGUAGE_STORAGE_KEY = "weather-report-language";
const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
const initialLanguage = ["ru", "en"].includes(savedLanguage) ? savedLanguage : "ru";

i18n.use(initReactI18next).init({
    resources: {
        ru: { translation: ru },
        en: { translation: en },
    },
    lng: initialLanguage,
    fallbackLng: "ru",
    supportedLngs: ["ru", "en"],
    interpolation: { escapeValue: false },
});

document.documentElement.lang = initialLanguage;

export function changeLanguage(language) {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
    return i18n.changeLanguage(language);
}

export default i18n;
