// - {% raw %}
/* Client-side translation configuration */
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import i18nFetchBackend from 'i18next-fetch-backend';
import BackendAdapter from 'i18next-multiload-backend-adapter';

import { SETTINGS } from 'settings';

import '../server/rebuildOnLanguagesChanged';

const defaultOptions = {
    load: 'languageOnly', // No region-specific locales (en-US, de-DE, etc.)
    fallbackLng: SETTINGS.DEFAULT_LANGUAGE,
    ns: SETTINGS.TRANSLATION_NAMESPACES,
    defaultNS: SETTINGS.DEFAULT_NAMESPACE,
    returnEmptyString: false,
    saveMissing: true,
    saveMissingTo: 'all',
    debug: SETTINGS.DEBUG,
    interpolation: {
        escapeValue: false, // Not needed for React
    },
    react: {
        useSuspense: true,

        // Re-bind I18n when the following events occur
        bindI18n: 'languageChanged',
    },
    backend: {
        backend: i18nFetchBackend,
        backendOption: {
            multiSeparator: '+',
            allowMultiLoading: true,
            loadPath: '/locales/resources.json?lng={{lng}}&ns={{ns}}',

            requestOptions: {
                mode: 'cors',
                credentials: 'same-origin',
                cache: 'default',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        },

        debounceInterval: 50,
    },
};

i18next.use(BackendAdapter).use(initReactI18next);

export const setupI18Next = async (language) => {
    if (!i18next.isInitialized) {
        // Initialize with default options while setting language as well
        await i18next.init({
            lng: language,
            ...defaultOptions,
        });
    }

    return i18next;
};

export default i18next;
// - {% endraw %}
