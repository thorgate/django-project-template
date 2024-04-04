/* Translation configuration for tests */
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

i18next.use(initReactI18next).init({
    lng: "cimode",
    load: "languageOnly",
    fallbackLng: "cimode",
    returnEmptyString: false,
    saveMissing: true,
    saveMissingTo: "all",
    interpolation: {
        escapeValue: false,
    },
    react: {
        useSuspense: false,
        nsMode: "fallback",
    },
});

export default i18next;
