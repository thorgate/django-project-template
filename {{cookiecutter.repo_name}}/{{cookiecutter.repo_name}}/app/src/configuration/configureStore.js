import {createStore, applyMiddleware, compose} from 'redux';
import createHistory from 'history/createBrowserHistory';
import {routerMiddleware as routerMiddlewareFactory} from 'react-router-redux';
import createSagaMiddleware from 'redux-saga';
import {createLogger} from 'redux-logger';

import rootReducer, {serverRootReducer} from 'configuration/reducers';
import transformObject from 'utils/transformObject';
import SagaManager from 'sagas/SagaManager';

// Enable Redux devTools in development (only when browser is used, ignored when rendered with node)
const composeEnhancers =
    DEV_MODE && typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

const storeEnhancers = [];

// create the saga middleware
const sagaMiddleware = createSagaMiddleware();

// create list of middleware to spread later, makes easier way to add based on environment
const middlewares = [sagaMiddleware];

// create router middleware only on client
let history = null;
if (typeof window !== 'undefined') {
    history = createHistory();
    const routerMiddleware = routerMiddlewareFactory(history);
    middlewares.push(routerMiddleware);
}

// if not production, add redux logger
if (DEV_MODE) {
    const extraOptions = {};

    if (SERVER_MODE) {
        extraOptions.colors = false;
        extraOptions.actionTransformer = action => transformObject(action);
        extraOptions.stateTransformer = state => transformObject(state);
        extraOptions.titleFormatter = (action, time, took) => (
            `action "${action.type}" @ ${time} (in ${took.toFixed(2)} ms)`
        );
    }

    middlewares.push(createLogger({
        collapsed: true,
        duration: true,
        logger: console,
        ...extraOptions,
    }));
}

export default function configureStore(initialState = {}) {
    // might contain pre-configured enhancers
    storeEnhancers.unshift(applyMiddleware(...middlewares));
    // Server side has extra reducer attached to handle passing cookies and other stuff to frontend server
    const reducer = SERVER_MODE ? serverRootReducer : rootReducer;
    const store = createStore(reducer, initialState, composeEnhancers(...storeEnhancers));

    if (typeof window !== 'undefined') {
        // run sagas only on client
        SagaManager.startSagas(sagaMiddleware);
    }

    /* eslint-disable global-require */
    if (module.hot) {
        module.hot.accept(
            './reducers', () => store.replaceReducer(require('./reducers').default),
        );

        module.hot.accept('../sagas/SagaManager', () => {
            SagaManager.cancelSagas(store);
            require('../sagas/SagaManager').default.startSagas(sagaMiddleware, true);
        });
    }
    /* eslint-enable */

    return {
        store,
        history,
        sagaMiddleware,
    };
}
