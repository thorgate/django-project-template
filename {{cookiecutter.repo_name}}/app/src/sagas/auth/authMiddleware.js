import { call, put, take } from 'redux-saga/effects';

import { getToken } from 'sagas/helpers/token';

export const REQUEST_TOKEN = 'sagas/auth/middleware/REQUEST_TOKEN';
export const RESOLVE_TOKEN = 'sagas/auth/middleware/RESOLVE_TOKEN';

export const requestToken = () => ({ type: REQUEST_TOKEN });
export const resolveToken = (token) => ({ type: RESOLVE_TOKEN, token });

export function* refreshToken() {
    let token = yield call(getToken);

    if (token) {
        return token;
    }

    if (process.env.BUILD_TARGET === 'server') {
        // Refresh is not used for server
        return null;
    }

    yield put(requestToken());

    ({ token } = yield take((action) => action?.type === RESOLVE_TOKEN));

    return token;
}
