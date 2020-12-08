import { ssrRedirectMiddleware } from '@thorgate/spa-view-manager';
import { routerMiddleware as routerMiddlewareFactory } from 'connected-react-router';
import { createBrowserHistory, createMemoryHistory } from 'history';
import serializeJS from 'serialize-javascript';
import { createStore, applyMiddleware, compose } from 'redux';
import { createLogger } from 'redux-logger';
import createSagaMiddleware, { END } from 'redux-saga';
import { SagaHotReloader } from 'tg-saga-manager';

import rootReducer from 'configuration/reducers';
import rootSaga from 'sagas';
import { onComponentError } from 'services/sentry';

// Are we using development mode & client app
const isDevClient =
    process.env.BUILD_TARGET === 'client' &&
    process.env.NODE_ENV !== 'production';

// Enable Redux devTools in development (only on development client app)
const composeEnhancers =
    isDevClient && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        : compose;

// Enable Redux-Saga devTools in development (only on development client app)
const sagaMonitor = isDevClient ? window.__SAGA_MONITOR_EXTENSION__ : null;

export default function configureStore(initialState = {}, options = {}) {
    const storeEnhancers = [];

    // Get Saga middleware options
    const sagaMiddleWareOptions = {
        ...(options.sagaMiddleware || {}),
    };

    if (process.env.BUILD_TARGET === 'client' && sagaMonitor) {
        sagaMiddleWareOptions.sagaMonitor = sagaMonitor;
    }

    sagaMiddleWareOptions.onError = onComponentError;

    // Create SagaMiddleware with options
    const sagaMiddleware = createSagaMiddleware(sagaMiddleWareOptions);

    // create router middleware only on client
    let history = null;
    if (process.env.BUILD_TARGET === 'client') {
        history = createBrowserHistory();
    } else {
        history = createMemoryHistory({
            initialEntries: [options.location || '/'],
        });
    }

    // create list of middleware to spread later, makes easier way to add based on environment
    const middlewares = [routerMiddlewareFactory(history)];

    if (process.env.BUILD_TARGET === 'server') {
        middlewares.unshift(ssrRedirectMiddleware());
    }

    // if not production, add redux logger
    if (process.env.NODE_ENV !== 'production') {
        const extraOptions = {};

        if (process.env.BUILD_TARGET === 'server') {
            extraOptions.actionTransformer = (action) =>
                serializeJS(action, { unsafe: true });
            extraOptions.stateTransformer = (state) =>
                serializeJS(state, { unsafe: true });
            extraOptions.titleFormatter = (action, time, took) =>
                `action "${action}" @ ${time} (in ${took.toFixed(2)} ms)`;
            extraOptions.colors = false;
        }

        middlewares.push(
            createLogger({
                collapsed: true,
                duration: true,
                logger: console,
                ...extraOptions,
            }),
        );
    }

    // Add saga middleware as the final middleware
    middlewares.push(sagaMiddleware);

    // might contain pre-configured enhancers
    storeEnhancers.unshift(applyMiddleware(...middlewares));

    // Root reducer will be wrapped in connectedRouter reducer which maps to `router`
    const store = createStore(
        rootReducer(history),
        initialState,
        composeEnhancers(...storeEnhancers),
    );

    // Add support to stop all sagas
    store.close = () => store.dispatch(END);

    // Add runSaga to limit point of failures
    store.runSaga = (saga, ...args) => sagaMiddleware.run(saga, ...args);

    const sagaHotReloader = new SagaHotReloader(store, sagaMiddleware);

    if (process.env.BUILD_TARGET === 'client') {
        sagaHotReloader.startRootSaga(rootSaga);
    }

    /* eslint-disable global-require */
    if (module.hot) {
        module.hot.accept('./reducers', () => {
            const nextRootReducer = require('./reducers').default;
            store.replaceReducer(nextRootReducer(history));
        });

        if (process.env.BUILD_TARGET === 'client') {
            module.hot.accept('../sagas', () => {
                sagaHotReloader
                    .replaceRootSaga(require('../sagas').default)
                    .then(() => {
                        // eslint-disable-next-line no-console
                        console.log('🔁  HMR Reloaded `./sagas` ...');
                    });
            });
        }
    }
    /* eslint-enable */

    return {
        store,
        history,
    };
}
