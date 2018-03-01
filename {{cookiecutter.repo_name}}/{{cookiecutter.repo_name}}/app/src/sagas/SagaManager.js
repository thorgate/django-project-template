// Borrowed from https://gist.github.com/hoschi/6538249ad079116840825e20c48f1690
// Note that reloading sagas has several issues/caveats to be aware of.
// See https://github.com/yelouafi/redux-saga/issues/22#issuecomment-218737951 for discussion.


import {take, fork, cancel} from 'redux-saga/effects';

import rootSaga from './index';

const sagas = [rootSaga];

export const CANCEL_SAGAS_HMR = '@@saga_manager/CANCEL_SAGAS_HMR';

function createAbortAbleSaga(saga, hot) {
    if (DEV_MODE) {
        return function* main() {
            const sagaTask = yield fork(saga, hot);

            yield take(CANCEL_SAGAS_HMR);
            yield cancel(sagaTask);
        };
    } else {
        return saga;
    }
}

const SagaManager = {
    startSagas(sagaMiddleware, hot = false) {
        if (DEV_MODE) {
            console.log('DEBUG: Staring sagas');
        }
        sagas.map(saga => createAbortAbleSaga(saga, hot)).forEach(saga => sagaMiddleware.run(saga));
    },

    cancelSagas(store) {
        store.dispatch({type: CANCEL_SAGAS_HMR});
    },
};

export default SagaManager;
