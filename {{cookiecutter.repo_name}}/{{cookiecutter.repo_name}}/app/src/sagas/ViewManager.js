import {all, take, put, fork, cancel, join, race, call} from 'redux-saga/effects';

import {setError} from 'ducks/errors';
import sagaRunner from 'sagas/helpers/sagaRunner';
import getMatchRouteSagas from 'utils/matchRouteSagas';


export const TRIGGER_PAGE_LOAD = 'sagas/PAGE_LOAD';
export const TRIGGER_PAGE_UNLOAD = 'sagas/PAGE_UNLOAD';

export const pageLoad = (location, onFinish) => ({type: TRIGGER_PAGE_LOAD, location, onFinish});
export const pageUnload = () => ({type: TRIGGER_PAGE_UNLOAD});

export const locationSelector = ({router: {location}}) => (location);

/**
 * Wait for page/view unload and then cancel any running saga.
 *
 * @param initialDataTask - Initial data loading task to cancel on view unload
 * @param watcherTask - Watcher tasks to cancel on view unload
 * @returns {boolean}
 */
function* viewUnload(initialDataTask, watcherTask) {
    yield take(TRIGGER_PAGE_UNLOAD);

    if (initialDataTask) {
        yield cancel(initialDataTask);
    }

    if (watcherTask) {
        yield all(watcherTask.map(saga => cancel(saga)));
    }

    return true;
}


/**
 * Start sagas to handle data loading per view.
 * Sagas to run are determined from `routes`.
 */
export default function* ViewManager(routes) {
    while (true) {
        const {location, onFinish} = yield take(TRIGGER_PAGE_LOAD);

        // reset previous error just to be sure new error is displayed correctly
        yield put(setError());

        // find initial sagas to run from routeConfig
        const {initialTasks, watcherTasks} = getMatchRouteSagas(routes, location.pathname);

        let shouldWaitForUnload = true;
        let initialDataSagasTask = null;
        let watcherSagasTask = null;

        // if any initial data sagas present, start them
        if (initialTasks.length) {
            // Start initial data loading sagas in background
            initialDataSagasTask = yield fork(sagaRunner(initialTasks));
        }

        if (watcherTasks.length) {
            // Start watchers for view
            watcherSagasTask = yield all(watcherTasks.map(({saga, args}) => fork(saga, ...args)));
        }

        if (initialDataSagasTask) {
            shouldWaitForUnload = false;
            const {unLoaded} = yield race({
                joined: join(initialDataSagasTask),
                unLoaded: call(viewUnload, initialDataSagasTask, watcherSagasTask),
            });

            if (!unLoaded) {
                // data loading finished
                onFinish();
                shouldWaitForUnload = true;
            }
        }

        if (!initialDataSagasTask) {
            onFinish();
        }

        // If should wait for view unload to stop previous sagas
        if (shouldWaitForUnload) {
            yield call(viewUnload, initialDataSagasTask, watcherSagasTask);
        }
    }
}
