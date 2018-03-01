import {call, put, take} from 'redux-saga/effects';
import {push} from 'react-router-redux';

import {setError} from 'ducks/errors';
import {handleApiPost} from 'sagas/helpers/callApi';
import api from 'utils/api';


const TRIGGER_LOGOUT = 'sagas/user/TRIGGER_LOGOUT';
export const logout = nexUrl => ({type: TRIGGER_LOGOUT, nexUrl});

export default function* () {
    const {nexUrl} = yield take(TRIGGER_LOGOUT);
    const {result, error} = yield call(handleApiPost, api.apiUserLogout);

    if (result) {
        yield put(push(nexUrl));
    }

    if (error) {
        yield put(setError(error));
    }
}
