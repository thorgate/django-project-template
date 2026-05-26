import { userActions } from "@thorgate/spa-permissions";
import { getLocalStorage } from "@thorgate/spa-view";
import { getLocation, replace } from "connected-react-router";
import { call, select, put, retry, take } from "redux-saga/effects";
import qs from "qs";

import { SETTINGS } from "@/src/settings";
import api from "@/src/services/api";
import { resolveToken, REQUEST_TOKEN } from "@/src/sagas/auth/authMiddleware";
import { getToken, saveToken } from "@/src/sagas/helpers/token";

function* refreshToken() {
    const token = yield call(getToken);

    if (token) {
        return token;
    }

    const refresh = getLocalStorage().getItem(SETTINGS.AUTH_REFRESH_TOKEN_NAME);

    // If no refresh token, exit early
    if (!refresh) {
        return null;
    }

    try {
        const { access } = yield api.auth.refresh.post(null, { refresh });

        saveToken(access);

        const location = yield select(getLocation);
        const query = qs.parse(location.search, { ignoreQueryPrefix: true });

        // Act as auth-middleware, try to redirect to next url, if it is present
        if (query && query.next) {
            yield put(replace(query.next));
        }

        return access;
    } catch (e) {
        if (e.isNetworkError) {
            throw e;
        }

        // If non-network error occurred, reset user and force views to act based on user
        yield put(userActions.resetUser());

        saveToken();

        // Force current view to re-render
        const location = yield select(getLocation);
        yield put(replace(location));
    }

    return null;
}

export default function* watcher() {
    while (true) {
        // Wait for the token request
        yield take(REQUEST_TOKEN);

        let token;
        try {
            // Get new access token, retry 3 times on network errors
            token = yield retry(3, 100, refreshToken);
        } catch (e) {
            // ignore failed 3rd attempt
        }

        // And send it to action listeners
        yield put(resolveToken(token));
    }
}
