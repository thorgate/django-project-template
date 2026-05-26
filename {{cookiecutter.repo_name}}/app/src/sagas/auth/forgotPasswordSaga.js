import { createSaveAction, createFormSaveSaga } from "@thorgate/spa-forms";
import { takeLatest } from "redux-saga/effects";

import api from "@/src/services/api";

/**
 * Trigger Forgot password watcher saga.
 * @returns Created trigger action
 */
export const forgotPassword = createSaveAction(
    "@@sagas/auth/GET_FORGOT_PASSWORD_LINK"
);

function successHook(result, _1, { meta: { setStatus } }) {
    if (result.success) {
        setStatus({ success: true });
    }
}

const forgotPasswordSaga = createFormSaveSaga({
    resource: api.user.forgotPassword,
    successHook,
});

export default function* forgotPasswordWatcherSaga() {
    yield takeLatest(forgotPassword.getType(), forgotPasswordSaga, null);
}
