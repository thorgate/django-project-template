import * as Sentry from "@sentry/nextjs";
import config from "./lib/config";

Sentry.init({
    dsn: config("SENTRY_DSN"),
    environment: config("SENTRY_ENVIRONMENT"),
    tracesSampleRate: 0.2,
});
