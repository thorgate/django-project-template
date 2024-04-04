const { withSentryConfig } = require("@sentry/nextjs");

const { i18n } = require("./next-i18next.config.js");

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
};

module.exports = withSentryConfig(nextConfig);
