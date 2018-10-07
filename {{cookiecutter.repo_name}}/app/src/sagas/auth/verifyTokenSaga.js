import { call } from 'redux-saga/effects';

import api from 'services/api';
import { getToken } from 'sagas/helpers/token';

import refreshToken from './refreshTokenSaga';


export function* verifyToken() {
    const token = yield call(getToken);

    try {
        yield api.auth.verify.post(null, { token });
    } catch (error) {
        yield call(refreshToken);
    }
}
