import {
    createSaveAction,
    createFormSaveSaga,
    formErrorsHandler,
} from '@thorgate/spa-forms';
import { call, select, takeLatest, put } from 'redux-saga/effects';
import { getLocation, push } from 'connected-react-router';
import qs from 'qs';
import { resolvePath } from 'tg-named-routes';

import { saveToken } from 'sagas/helpers/token';
import api from 'services/api';

/**
 * Trigger obtain token watcher saga.
 * @returns Created trigger action
 */
export const obtainToken = createSaveAction('@@sagas/auth/OBTAIN_TOKEN');

function* successHook(result) {
    const { access, refresh } = result;
    saveToken(access, refresh);

    const location = yield select(getLocation);
    let { next } = qs.parse(location.search || '', { ignoreQueryPrefix: true });

    if (!next) {
        next = resolvePath('landing');
    }

    yield put(push(next));
}

function* errorHook(data) {
    // If credentials are invalid, the API responds with a status of 401
    //   which results in an InvalidResponseCode error.
    //   Let's show the original message to the user.
    const { error, setStatus } = data;
    if (error?.statusCode === 401) {
        try {
            // The InvalidResponseCode error has no JSON associated, but contains a responseText as plain text.
            // Let's try to parse it as JSON. Otherwise just fall back to the default formErrorsHandler
            const { detail } = JSON.parse(error?.responseText);
            yield call(setStatus, { message: detail });
            return;
        } catch (_err) {} // eslint-disable-line no-empty
    }

    yield call(formErrorsHandler, data);
}

const obtainTokenSaga = createFormSaveSaga({
    resource: api.auth.obtain,
    successHook,
    errorHook,
});

export default function* loginWatcherSaga() {
    yield takeLatest(obtainToken.getType(), obtainTokenSaga, null);
}
