import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import {createLogger} from 'redux-logger';

const dev = process.env.NODE_ENV === 'development';

export default function createReduxStore(reducer) {
    /* eslint-disable */
    const composeEnhancers =
        typeof window === 'object' &&
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
            window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;

    const middleware = [];
    dev ? middleware.push(thunk, createLogger()) : middleware.push(thunk);
    /* eslint-enable */

    const enhancer = composeEnhancers(
        applyMiddleware(...middleware),
    );

    return createStore(reducer, enhancer);
}
