import { select } from "redux-saga/effects";

export function* getToken() {
    // Handle loading token from cookie
    return yield select((state) => state.appUser.accessToken);
}

export function saveToken(access = null, refresh = null) {}
