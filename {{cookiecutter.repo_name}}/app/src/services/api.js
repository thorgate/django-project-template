import { FetchResource as Resource } from '@tg-resources/fetch';
import { createSagaRouter } from '@tg-resources/redux-saga-router';
import Cookies from 'js-cookie';
import { call } from 'redux-saga/effects';

import SETTINGS from 'settings';
import { getToken } from 'sagas/helpers/token';

import Sentry from './sentry';


function* mutateRequestConfig(origRequestConfig, resource) {
    const requestConfig = origRequestConfig || {};

    const token = yield call(getToken);
    if (token) {
        requestConfig.headers = () => ({
            Authorization: `Bearer ${token}`,
        });
    }

    // Optional :: Adding valid statusCodes to specific routes via name
    if (resource.routeName === 'user.details') {
        requestConfig.statusSuccess = [200, 201, 204];
    }

    return requestConfig;
}

function onRequestError(error, resource) {
    const isError404 = error.isInvalidResponseCode && error.statusCode === 404;

    if (process.env.NODE_ENV === 'production' && !error.isValidationError && !isError404) {
        Sentry.captureException(error);
    }
}


const api = createSagaRouter({
    auth: {
        obtain: 'auth/token/',
        refresh: 'auth/token/refresh/',
        verify: 'auth/token/verify/',
    },
    user: {
        details: 'user/me',
        signup: 'user/signup',
        forgotPassword: 'user/forgot_password',
        forgotPasswordToken: 'user/forgot_password/token',
    },
}, {
    apiRoot: SETTINGS.DJANGO_SITE_URL + SETTINGS.API_BASE,

    headers: () => ({
        Accept: 'application/json',
        'X-CSRFToken': Cookies.get(SETTINGS.CSRF_COOKIE_NAME),
        'Accept-Language': Cookies.get(SETTINGS.LANGUAGE_COOKIE_NAME),
    }),

    withCredentials: true,

    mutateRequestConfig,
    onRequestError,
}, Resource);

export default api;
