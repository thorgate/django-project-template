import {call, takeLatest} from 'redux-saga/effects';

import fetchUserDetails from 'sagas/user/fetchUserDetails';
import {handleApiPost} from 'sagas/helpers/callApi';
import sagaRunner from 'sagas/helpers/sagaRunner';
import api from 'utils/api';
import handleErrorDisplaying from 'utils/formErrors';

const TRIGGER_LOGIN = 'sagas/login/TRIGGER_LOGIN';

export const login = (payload, setErrors, setSubmitting, setStatus) => ({
    type: TRIGGER_LOGIN, payload, setErrors, setSubmitting, setStatus,
});


function* loginSaga({payload, setErrors, setSubmitting, setStatus}) {
    const {result, error} = yield call(handleApiPost, api.apiUserLogin, null, payload);

    if (error) {
        handleErrorDisplaying(error, setStatus, setErrors);
    }

    setSubmitting(false);
    if (result && result.success) {
        yield call(sagaRunner([fetchUserDetails]));
    }
}


export default function* loginWatcherSaga() {
    yield takeLatest(TRIGGER_LOGIN, loginSaga);
}
