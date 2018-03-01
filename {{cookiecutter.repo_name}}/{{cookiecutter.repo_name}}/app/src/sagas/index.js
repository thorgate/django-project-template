import {all, fork, put, select} from 'redux-saga/effects';

import routes from 'configuration/routes';
import ViewManager, {pageLoad, locationSelector} from 'sagas/ViewManager';

export default function* rootSaga(hot = false) {
    yield all([
        fork(ViewManager, routes),
    ]);

    if (DEV_MODE && hot) {
        const location = yield select(locationSelector);
        yield put(pageLoad(location, () => null));
    }
}
