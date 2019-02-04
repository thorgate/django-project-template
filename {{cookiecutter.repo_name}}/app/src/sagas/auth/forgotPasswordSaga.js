import { createSaveAction, createFormSaveSaga } from '@thorgate/spa-forms';
import { takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import api from 'services/api';


/**
 * Trigger Forgot password watcher saga.
 * @returns Created trigger action
 */
export const forgotPassword = createSaveAction('@@sagas/auth/GET_FORGOT_PASSWORD_LINK');


function successHook(result, { payload: { actions: { setStatus } } }) {
    if (result.success) {
        setStatus({ success: true });
    }
}

const forgotPasswordSaga = createFormSaveSaga({
    resource: api.user.forgotPassword,
    successHook,
});

export default function* forgotPasswordWatcherSaga() {
    yield takeLatest(getType(forgotPassword), forgotPasswordSaga, null);
}
