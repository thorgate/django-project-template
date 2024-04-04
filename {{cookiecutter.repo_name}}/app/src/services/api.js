/* eslint-disable no-template-curly-in-string */
import { FetchResource as Resource } from "@tg-resources/fetch";
import { createSagaRouter } from "@tg-resources/redux-saga-router";
// import Cookies from 'js-cookie';
import { call } from "redux-saga/effects";

import { SETTINGS } from "@/src/settings";
import { getToken } from "@/src/sagas/helpers/token";

import Sentry from "./sentry";

function* mutateRequestConfig(origRequestConfig, resource) {
    const requestConfig = origRequestConfig || {};

    const token = yield call(getToken);

    if (token) {
        requestConfig.headers = () => ({
            Authorization: `Bearer ${token}`,
        });
    }

    // Optional :: Adding valid statusCodes to specific routes via name
    if (resource.routeName === "user.details") {
        requestConfig.statusSuccess = [200, 201, 204];
    }

    return requestConfig;
}

function onRequestError(error) {
    const shouldReportError = ![
        error.isInvalidResponseCode &&
            [404, 403, 401].includes(error.statusCode),
        error.isValidationError,
        // Note: network errors should only be ignored on the client
        process.env.BUILD_TARGET === "server" ? false : error.isNetworkError,
        error.isAbortError,
    ].some(Boolean);

    if (shouldReportError) {
        if (process.env.NODE_ENV === "production") {
            Sentry.captureException(error);
        } else {
            // eslint-disable-next-line no-console
            console.log(error);
        }
    }
}

const api = createSagaRouter(
    {
        auth: {
            obtain: "auth/token/",
            refresh: "auth/token/refresh/",
            verify: "auth/token/verify/",
        },
        user: {
            details: "user/me",
            signup: "user/signup",
            forgotPassword: "user/forgot_password",
            forgotPasswordToken: "user/forgot_password/token",
        },
    },
    {
        apiRoot: SETTINGS.BACKEND_SITE_URL + SETTINGS.API_BASE,

        headers: () => ({
            Accept: "application/json",
            // 'X-CSRFToken': Cookies.get(SETTINGS.CSRF_COOKIE_NAME),
            // 'Accept-Language': Cookies.get(SETTINGS.LANGUAGE_COOKIE_NAME),
        }),

        withCredentials: true,

        mutateRequestConfig,
        onRequestError,
    },
    Resource
);

export default api;
