import { createSaveAction, createFormSaveSaga } from '@thorgate/spa-forms';
import { select, takeLatest, put } from 'redux-saga/effects';
import { getLocation, push } from 'connected-react-router';
import qs from 'qs';

import { urlResolve } from 'configuration/routes';
import api from 'services/api';


/**
 * Trigger Signup watcher saga.
 * @returns Created trigger action
 */
export const signup = createSaveAction('auth/SIGNUP_POST');


function* apiSaveHook(params, payload) {
    return yield api.user.signup.post(null, payload);
}


function* successHook() {
    const location = yield select(getLocation);
    let { next } = qs.parse(location.search || '');

    if (!next) {
        next = urlResolve('landing');
    }

    yield put(push(next));
}


const signupSaga = createFormSaveSaga({
    resource: api.user.signup,
    apiSaveHook, successHook,
});


export default function* loginWatcherSaga() {
    yield takeLatest(signup.type, signupSaga);
}
