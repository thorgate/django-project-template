/* eslint-disable global-require */
const i18nSettings = require('../i18n.json');

const backendSiteUrl = process.env.RAZZLE_BACKEND_SITE_URL;

const settings = {
    DEFAULT_NAMESPACE: '',
    TRANSLATION_NAMESPACES: [],
    DEFAULT_LANGUAGE: '',
    FALLBACK_LANGUAGE: '',
    LANGUAGE_ORDER: [],
    LANGUAGES: {},

    __VERSION__: process.env.RAZZLE_COMMIT_HASH,
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
    BACKEND_SITE_URL: backendSiteUrl,
    RAVEN_PUBLIC_DSN: process.env.RAZZLE_RAVEN_PUBLIC_DSN,

    APP_PROXY: {},
    MAX_WORKERS: process.env.RAZZLE_MAX_WORKERS || 0,
    DEBUG: process.env.NODE_ENV !== 'production' ? true : process.env.VERBOSE,

    // Overwrite client settings from server runtime
    ...((typeof window !== 'undefined' && window.__settings__) || {}),

    // Define settings and load from base JSON
    ...i18nSettings,
};

if (process.env.BUILD_TARGET === 'server') {
    settings.CLUSTERED = false;
    settings.FILE_LOGGING = process.env.RAZZLE_FILE_LOGGING === 'true';
    settings.LOGGING_DIR =
        process.env.RAZZLE_LOGGING_DIR || '/var/log/{{ cookiecutter.repo_name }}/';
    settings.LOGGING_FILE_PREFIX =
        process.env.RAZZLE_LOGGING_FILE_PREFIX || 'node';

    const docker = require('is-docker');
    // If in development and inside docker, change django url to http://django
    if (process.env.NODE_ENV !== 'production' && docker()) {
        settings.BACKEND_SITE_URL =
            process.env.RAZZLE_INTERNAL_BACKEND_SITE_URL;
    }

    if (process.env.NODE_ENV !== 'production') {
        settings.APP_PROXY = {
            [settings.API_BASE]: settings.BACKEND_SITE_URL,
            [settings.DJANGO_URL_PREFIX]: settings.BACKEND_SITE_URL,
            [settings.DJANGO_MEDIA_URL]: settings.BACKEND_SITE_URL,
            [settings.DJANGO_STATIC_URL]: settings.BACKEND_SITE_URL,
            [settings.DJANGO_ADMIN_PANEL]: settings.BACKEND_SITE_URL,
        };
    } else {
        const cluster = require('cluster');
        if (cluster.isWorker) {
            settings.CLUSTERED = true;

            settings.WORKER_ID = cluster.worker.id;
        }
    }
}

export const getRuntimeConfig = () => {
    const { __VERSION__, SITE_URL, RAVEN_PUBLIC_DSN } = settings;
    return {
        __VERSION__,
        BACKEND_SITE_URL: backendSiteUrl,
        SITE_URL,
        RAVEN_PUBLIC_DSN,
    };
};

export default Object.freeze(settings);
