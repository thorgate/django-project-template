/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
const i18nSettings = require('../i18n.json');

let currentSettings;

export const loadSettings = () => {
    const cfg = {
        __VERSION__: process.env.RAZZLE_COMMIT_HASH || '-',

        DEFAULT_NAMESPACE: '',
        TRANSLATION_NAMESPACES: [],
        DEFAULT_LANGUAGE: '',
        FALLBACK_LANGUAGE: '',
        LANGUAGE_ORDER: [],
        LANGUAGES: {},

        API_BASE: '/api/',
        AUTH_TOKEN_NAME: '{{ cookiecutter.repo_name }}_token',
        // KEEP `AUTH_TOKEN_LIFETIME` IN SYNC WITH backend ACCESS_TOKEN_LIFETIME
        AUTH_TOKEN_LIFETIME: 30, // This value is in minutes
        AUTH_REFRESH_TOKEN_NAME: '{{ cookiecutter.repo_name }}_refresh_token',
        LANGUAGE_COOKIE_NAME: '{{ cookiecutter.repo_name }}_language',
        CSRF_COOKIE_NAME: 'csrftoken',

        DJANGO_URL_PREFIX: '/d/',
        DJANGO_MEDIA_URL: '/media/',
        DJANGO_STATIC_URL: '/assets/',
        DJANGO_ADMIN_PANEL: '/{{ cookiecutter.django_admin_path }}/',

        SITE_URL: process.env.RAZZLE_SITE_URL,
        BACKEND_SITE_URL: process.env.RAZZLE_BACKEND_SITE_URL || '',
        RAW_BACKEND_SITE_URL: process.env.RAZZLE_BACKEND_SITE_URL || '',
        SENTRY_ENVIRONMENT: process.env.RAZZLE_SENTRY_ENVIRONMENT,
        SENTRY_DSN: process.env.RAZZLE_SENTRY_DSN,

        APP_PROXY: {},
        MAX_WORKERS: process.env.RAZZLE_MAX_WORKERS || 0,
        DEBUG:
            process.env.NODE_ENV !== 'production' ? true : process.env.VERBOSE,

        // Overwrite client settings from server runtime
        ...((typeof window !== 'undefined' && window.__settings__) || {}),

        // Define settings and load from base JSON
        ...i18nSettings,
    };

    if (process.env.BUILD_TARGET === 'server') {
        cfg.CLUSTERED = false;
        cfg.FILE_LOGGING = process.env.RAZZLE_FILE_LOGGING === 'true';
        cfg.LOGGING_DIR =
            process.env.RAZZLE_LOGGING_DIR || '/var/log/{{ cookiecutter.repo_name }}/';
        cfg.LOGGING_FILE_PREFIX =
            process.env.RAZZLE_LOGGING_FILE_PREFIX || 'node';
        cfg.MAX_WORKERS = process.env.RAZZLE_MAX_WORKERS || 4;

        if (process.env.NODE_ENV === 'production') {
            if (process.env.RAZZLE_INTERNAL_BACKEND_SITE_URL) {
                // Allow backend to be pointed to internal URL
                cfg.BACKEND_SITE_URL =
                    process.env.RAZZLE_INTERNAL_BACKEND_SITE_URL || '';
            }

            const cluster = require('cluster');
            if (cluster.isWorker) {
                cfg.CLUSTERED = true;
                cfg.WORKER_ID = cluster.worker.id;
            }
            // Proxy Django static assets through Node
            // This is here so the `Site` model in the backend can be used to point to the frontend.
            cfg.APP_PROXY = {
                [cfg.DJANGO_STATIC_URL]: cfg.BACKEND_SITE_URL,
            };
        } else {
            const docker = require('is-docker');

            // If in development and inside docker, change django url to http://django
            if (docker()) {
                cfg.BACKEND_SITE_URL =
                    process.env.RAZZLE_INTERNAL_BACKEND_SITE_URL || '';
            }

            cfg.APP_PROXY = {
                [cfg.API_BASE]: cfg.BACKEND_SITE_URL,
                [cfg.DJANGO_URL_PREFIX]: cfg.BACKEND_SITE_URL,
                [cfg.DJANGO_MEDIA_URL]: cfg.BACKEND_SITE_URL,
                [cfg.DJANGO_STATIC_URL]: cfg.BACKEND_SITE_URL,
                [cfg.DJANGO_ADMIN_PANEL]: cfg.BACKEND_SITE_URL,
            };
        }
    }

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

// We export the settings trough a Proxy to allow runtime modification of the exported value (on the client).
export const SETTINGS = new Proxy(
    {
        ...currentSettings,
    },
    {
        get(target, prop, _receiver) {
            return currentSettings[prop];
        },
    },
);
