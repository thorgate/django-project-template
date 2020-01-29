import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

const __DEV__ = process.env.NODE_ENV === 'development';

const composeEnhancers =
    typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        : compose;

export default function createReduxStore(reducer) {
    /* eslint-disable */
    const middleware = [thunk];

    if (__DEV__) {
        middleware.push(createLogger());
    }
    /* eslint-enable */

    // might contain pre-configured enhancers so start with ours
    const enhancer = composeEnhancers(applyMiddleware(...middleware));

    return createStore(reducer, enhancer);
}
