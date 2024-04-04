import {
    configureStore,
    ThunkAction,
    Action,
    Middleware,
} from "@reduxjs/toolkit";
import type { Store } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { createBrowserHistory, History } from "history";
import { routerMiddleware as routerMiddlewareFactory } from "connected-react-router";
import { createWrapper, Context } from "next-redux-wrapper";
import { createLogger } from "redux-logger";
import createSagaMiddleware, { END, Saga, Task } from "redux-saga";
import config from "@lib/config";

// legacy reducers
import { errorReducer } from "@thorgate/spa-errors";
import { entitiesReducer } from "@thorgate/spa-entities";
import { loadingReducer } from "@thorgate/spa-pending-data";
import { userReducer } from "@thorgate/spa-permissions";
import { connectRouter } from "connected-react-router";

import { queriesApi } from "@lib/queries";
import { appUserSlice } from "@lib/slices/appUser";

export const makeStore = ({
    reduxWrapperMiddleware,
}: Context & { reduxWrapperMiddleware?: Middleware }) => {
    let history: History | null = null;
    if (typeof window !== "undefined") {
        history = createBrowserHistory();
    }

    const sagaMiddleware = createSagaMiddleware();

    const reducer = {
        [queriesApi.reducerPath]: queriesApi.reducer,
        [appUserSlice.name]: appUserSlice.reducer,
        error: errorReducer,
        entities: entitiesReducer,
        loading: loadingReducer as any,
        user: userReducer,
    };

    if (history) {
        // @ts-ignore
        reducer.router = connectRouter(history);
    }

    const store = configureStore({
        reducer: reducer,
        middleware: (gDM) => {
            const middlewares = gDM();

            if (
                (typeof window !== "undefined" && config("DEBUG", "boolean")) ||
                (typeof window === "undefined" &&
                    process.env.APP_SSR_REDUX_LOGGER === "true")
            ) {
                middlewares.push(
                    createLogger({
                        collapsed: true,
                        duration: true,
                        logger: console,
                    })
                );
            }

            middlewares.push(queriesApi.middleware);

            if (reduxWrapperMiddleware) {
                middlewares.push(reduxWrapperMiddleware);
            }

            if (history) {
                middlewares.push(routerMiddlewareFactory(history));
            }

            middlewares.push(sagaMiddleware);

            return middlewares;
        },
        devTools: true,
    });

    type LocalStore = typeof store & {
        close?: () => void;
        runSaga?: (saga: Saga, ...args: any[]) => Task;
        history?: typeof history;
    };
    const localStore = store as LocalStore;

    localStore.history = history;
    localStore.close = () => store.dispatch(END);
    localStore.runSaga = (saga, ...args) => sagaMiddleware.run(saga, ...args);

    setupListeners(store.dispatch);

    return localStore;
};

export type RootState = ReturnType<ReturnType<typeof makeStore>["getState"]>;
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action
>;

export { appUserSlice } from "@lib/slices/appUser";

export const wrapper = createWrapper<Store<RootState>>(makeStore, {
    debug: config("DEBUG", "boolean"),
});
