const { withSentryConfig } = require("@sentry/nextjs");

const { i18n } = require("./next-i18next.config.js");
const backendSiteUrl =
    process?.env?.["APP_PUBLIC_BACKEND_SITE_URL"] ||
    "http://{{cookiecutter.default_django_app}}.localtest.me:8000";

const [backendScheme, rest] = backendSiteUrl.split("://");
const backendHost = rest.split(":")[0];

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Strict mode causes page to render twice
    //  which causes issues with the hydration running twice
    reactStrictMode: false,

    i18n,

    sentry: {
        disableServerWebpackPlugin: true,
        disableClientWebpackPlugin: true,
    },

    images: {
        minimumCacheTTL: 60, // 1 minute
        remotePatterns: [
            // https://placehold.co/...
            {
                protocol: "https",
                hostname: "placehold.co",
            },
            // https://*.saturn.thorgate-digital.dev/...
            {
                protocol: "https",
                hostname: "**.saturn.thorgate-digital.dev",
            },
            {
                protocol: backendScheme,
                hostname: backendHost,
            },
        ],
    },
};

module.exports = withSentryConfig(nextConfig);
