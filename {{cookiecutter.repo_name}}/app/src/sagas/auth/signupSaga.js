import { createSaveAction, createFormSaveSaga } from "@thorgate/spa-forms";
import { select, takeLatest, put } from "redux-saga/effects";
import { getLocation, push } from "connected-react-router";
import qs from "qs";
import { resolvePath } from "tg-named-routes";

import { saveToken } from "@/src/sagas/helpers/token";
import api from "@/src/services/api";

/**
 * Trigger Signup watcher saga.
 * @returns Created trigger action
 */
export const signup = createSaveAction("@@sagas/auth/SIGNUP_POST");

function* successHook(result) {
    const { access, refresh } = result;
    saveToken(access, refresh);

    const location = yield select(getLocation);
    let { next } = qs.parse(location.search || "", { ignoreQueryPrefix: true });

    if (!next) {
        next = resolvePath("landing");
    }

    yield put(push(next));
}

const signupSaga = createFormSaveSaga({
    resource: api.user.signup,
    successHook,
});

export default function* loginWatcherSaga() {
    yield takeLatest(signup.getType(), signupSaga, null);
}
