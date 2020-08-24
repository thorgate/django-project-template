import {
    createSaveAction,
    createFormSaveSaga,
    formErrorsHandler,
} from '@thorgate/spa-forms';
import { call, takeLatest } from 'redux-saga/effects';

import api from 'services/api';

/**
 * Trigger Reset password watcher saga.
 * @returns Created trigger action
 */
export const resetPassword = createSaveAction(
    '@@sagas/auth/forgotPassword/RESET_PASSWORD',
);

function* errorHook(options) {
    yield call(formErrorsHandler, options);

    if (options.error.isValidationError) {
        const { uid_and_token_b64: tokenError } = options.error.errors.errors;
        if (tokenError) {
            options.setStatus({
                message: tokenError.toString(),
            });
        }
    }
}

function successHook(_0, _1, { meta: { setStatus } }) {
    setStatus({ success: true });
}

const resetPasswordSaga = createFormSaveSaga({
    resource: api.user.forgotPasswordToken,
    errorHook,
    successHook,
});

export default function* resetPasswordWatcherSaga() {
    yield takeLatest(resetPassword.getType(), resetPasswordSaga, null);
}
