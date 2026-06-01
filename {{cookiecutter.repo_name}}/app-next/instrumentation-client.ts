import * as Sentry from "@sentry/nextjs";
import config from "./lib/config";

Sentry.init({
    dsn: config("SENTRY_DSN"),
    environment: config("SENTRY_ENVIRONMENT"),
    // Release should be baked into the image code as static values
    release: process.env.NEXT_PUBLIC_RELEASE_VERSION || 'development',
    tracesSampleRate: config("SENTRY_SAMPLE_RATE", "number") ?? 0.25,
    replaysSessionSampleRate: 0.25,
    replaysOnErrorSampleRate: 1,
    integrations: [Sentry.replayIntegration()],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
