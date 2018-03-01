import {call, put} from 'redux-saga/effects';

import api from 'utils/api';
import {handleApiFetch} from 'sagas/helpers/callApi';

import {setUser} from 'ducks/user';


export default function* fetchUserDetails() {
    const {result: response, error} = yield call(handleApiFetch, api.apiUserDetails, null, null, [200, 201, 204, 401]);

    if (response) {
        let user = response;

        if (response.authenticated === false) {
            user = null;
        }

        yield put(setUser(user));
    }

    if (error) {
        yield put(setUser(null));
        return error;
    }

    return null;
}
