import { userActions } from '@thorgate/spa-permissions';
import { getLocalStorage } from '@thorgate/spa-view';
import { getLocation, replace } from 'connected-react-router';
import { put, select } from 'redux-saga/effects';

import SETTINGS from 'settings';
import { saveToken } from 'sagas/helpers/token';
import api from 'services/api';


export default function* refreshToken() {
    const refresh = getLocalStorage().getItem(SETTINGS.AUTH_REFRESH_TOKEN_NAME);

    // If no refresh token, exit early
    if (!refresh) {
        return;
    }

    try {
        const { access } = yield api.auth.refresh.post(null, { refresh });

        saveToken(access);
    } catch (e) {
        yield put(userActions.resetUser());

        saveToken();

        // Force current view to re-render
        const location = yield select(getLocation);
        yield put(replace(location));
    }
}
