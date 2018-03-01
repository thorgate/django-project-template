import {call, put} from 'redux-saga/effects';

import {setError} from 'ducks/errors';
import {isObject} from 'utils/typeChecks';


export default sagas => function* sagaRunner() {
    try {
        let result = null;
        for (let i = 0; i < sagas.length; i++) {
            // if current item is Object, run it with args
            if (isObject(sagas[i])) {
                const {saga, args = []} = sagas[i];
                result = yield call(saga, ...args);
            } else {
                result = yield call(sagas[i]);
            }

            // if saga returned truthy break as it is marked as not successful
            if (result) {
                if (DEV_MODE) {
                    // It is much more helpful to see real error message
                    console.error(result);
                }

                const error = new Error(`Saga "${i}" failed with ${result}.`);
                error.statusCode = result.statusCode;
                error.displayMessage = result.displayMessage;
                throw error;
            }
        }
    } catch (error) {
        if (DEV_MODE) {
            console.error('Data loading failed: %s', error);
        }
        yield put(setError(error));
    }
};
