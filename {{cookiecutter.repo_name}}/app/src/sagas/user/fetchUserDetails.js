import { userActions } from "@thorgate/spa-permissions";
import { put } from "redux-saga/effects";

import api from "@/src/services/api";

export default function* fetchUserDetails() {
    try {
        const user = yield api.user.details.fetch();

        yield put(userActions.setUser(user, !!(user && user.id)));
    } catch (err) {
        yield put(userActions.resetUser());
    }
}
