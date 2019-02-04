/* eslint-disable no-template-curly-in-string */
import { FetchResource as Resource } from '@tg-resources/fetch';
import { createSagaRouter } from '@tg-resources/redux-saga-router';
import { userActions } from '@thorgate/spa-permissions';
import { getLocalStorage } from '@thorgate/spa-view';
import Cookies from 'js-cookie';
import { call } from 'redux-saga/effects';
import qs from 'qs';

import SETTINGS from 'settings';
import { getToken, saveToken } from 'sagas/helpers/token';

import Sentry from './sentry';


function* mutateRequestConfig(origRequestConfig, resource) {
    const requestConfig = origRequestConfig || {};

    let token = yield call(getToken);
    if (!token && resource.routeName !== 'auth.refresh') {
        token = yield call(refreshToken);
    }

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

function* refreshToken() {
    const refresh = getLocalStorage().getItem(SETTINGS.AUTH_REFRESH_TOKEN_NAME);

    // If no refresh token, exit early
    if (!refresh) {
        return;
    }

    const location = yield select(getLocation);

    try {
        const { access } = yield api.auth.refresh.post(null, { refresh });

        saveToken(access);

        const query = qs.parse(location.search, { ignoreQueryPrefix: true });

        // Act as auth-middleware, try to redirect to next url, if it is present
        if (query && query.next) {
            yield put(replace(query.next));
        }

        return access;
    } catch (e) {
        yield put(userActions.resetUser());

        saveToken();

        // Force current view to re-render
        yield put(replace(location));
    }
}

function onRequestError(error, resource) {
    const isError404 = error.isInvalidResponseCode && [404, 403, 401].includes(error.statusCode);

    if (!error.isValidationError && !isError404) {
        if (process.env.NODE_ENV === 'production') {
            Sentry.captureException(error);
        } else {
            console.log(error);
        }
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
    apiRoot: SETTINGS.BACKEND_SITE_URL + SETTINGS.API_BASE,

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
