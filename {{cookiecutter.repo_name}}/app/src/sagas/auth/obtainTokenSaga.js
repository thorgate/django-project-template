import { createSaveAction, createFormSaveSaga } from '@thorgate/spa-forms';
import { select, takeLatest, put } from 'redux-saga/effects';
import { getLocation, push } from 'connected-react-router';
import qs from 'qs';

import { urlResolve } from 'configuration/routes';
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
        next = urlResolve('landing');
    }

    yield put(push(next));
}


const obtainTokenSaga = createFormSaveSaga({
    resource: api.auth.obtain,
    successHook,
});

export default function* loginWatcherSaga() {
    yield takeLatest(obtainToken.getType(), obtainTokenSaga, null);
}
