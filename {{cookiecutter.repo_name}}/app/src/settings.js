import config from "@lib/config";

/* eslint-disable global-require */
const i18nSettings = require("../i18n.json");

let currentSettings;

export const loadSettings = () => {
    const cfg = {
        __VERSION__: process.env.NEXT_PUBLIC_COMMIT_HASH || "-",

        DEFAULT_NAMESPACE: "",
        TRANSLATION_NAMESPACES: [],
        DEFAULT_LANGUAGE: "",
        FALLBACK_LANGUAGE: "",
        LANGUAGE_ORDER: [],
        LANGUAGES: {},

        API_BASE: "/api/",
        AUTH_TOKEN_NAME: "{{ cookiecutter.repo_name }}_token",
        // KEEP `AUTH_TOKEN_LIFETIME` IN SYNC WITH backend ACCESS_TOKEN_LIFETIME
        AUTH_TOKEN_LIFETIME: 30, // This value is in minutes
        AUTH_REFRESH_TOKEN_NAME: "{{ cookiecutter.repo_name }}_refresh_token",
        LANGUAGE_COOKIE_NAME: "{{ cookiecutter.repo_name }}_language",
        CSRF_COOKIE_NAME: "csrftoken",

        DJANGO_URL_PREFIX: "/d/",
        DJANGO_MEDIA_URL: "/media/",
        DJANGO_STATIC_URL: "/assets/",
        DJANGO_HEALTH_CHECK_URL: "/{{ cookiecutter.django_health_check_path }}/",
        DJANGO_ADMIN_PANEL: "/{{ cookiecutter.django_admin_path }}/",

        SITE_URL: config("SITE_URL") || "",
        BACKEND_SITE_URL: config("BACKEND_SITE_URL") || "",
        RAW_BACKEND_SITE_URL: config("BACKEND_SITE_URL") || "",

        // Define settings and load from base JSON
        ...i18nSettings,
    };

    currentSettings = cfg;

    return cfg;
};

export const getRuntimeConfig = () => {
    const {
        __VERSION__,
        SITE_URL,
        RAW_BACKEND_SITE_URL,
        SENTRY_ENVIRONMENT,
        SENTRY_DSN,
    } = currentSettings;
    return {
        __VERSION__,
        BACKEND_SITE_URL: RAW_BACKEND_SITE_URL,
        RAW_BACKEND_SITE_URL,
        SITE_URL,
        SENTRY_ENVIRONMENT,
        SENTRY_DSN,
    };
};

// Load default settings so the variable is not null initially. loadSettings is called twice on the client
//  which ensures that all settings from `__settings__` variable are applied correctly.
currentSettings = loadSettings();

// We export the settings through a Proxy to allow runtime modification of the exported value (on the client).
export const SETTINGS = new Proxy(
    {
        ...currentSettings,
    },
    {
        get(target, prop, _receiver) {
            return currentSettings[prop];
        },
    }
);
