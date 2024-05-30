const HttpBackend = require('i18next-http-backend/cjs')
const ChainedBackend= require('i18next-chained-backend').default
const LocalStorageBackend = require('i18next-localstorage-backend').default

// @ts-check
const isDev = process.env.NODE_ENV === "development";

/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
    // https://www.i18next.com/overview/configuration-options#logging
    debug: false,
    i18n: {
        defaultLocale: "en",
        locales: ["en", "et"],
    },
    /** To avoid issues when deploying to some paas (vercel...) */
    localePath:
        typeof window === "undefined"
            ? require("path").resolve("./public/locales")
            : "/locales",

    backend: {
        backendOptions: typeof window !== "undefined" ? [
            { expirationTime: 60 * 60 * 1000 },
            {
                loadPath: '/locales/{{lng}}/{{ns}}.json',
            },
        ] : undefined,
        backends:
            typeof window !== "undefined"
                ? [LocalStorageBackend, HttpBackend]
                : [],
    },
    serializeConfig: false,
    use: typeof window !== 'undefined' ? [ChainedBackend] : [],

    reloadOnPrerender: isDev,
};
