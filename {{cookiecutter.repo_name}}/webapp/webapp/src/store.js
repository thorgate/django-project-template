import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import rootReducer from './reducers';

export default function configureAppStore(initialState) {
    const store = configureStore({
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat([logger]),
        reducer: rootReducer,
        preloadedState: initialState,
    });

    if (process.env.NODE_ENV !== 'production' && module.hot) {
        module.hot.accept('./reducers', () =>
            store.replaceReducer(rootReducer),
        );
    }

    return store;
}
