import {
    configureStore,
    ThunkAction,
    Action,
    Middleware,
    Store,
} from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { createWrapper, Context } from "next-redux-wrapper";
import { createLogger } from "redux-logger";
import config from "@lib/config";

import { queriesApi } from "@lib/queries";
import { rtkQueryErrorLogger } from "@lib/queries/middleware";
import { appUserSlice } from "@lib/slices/appUser";

export const makeStore = ({
    reduxWrapperMiddleware,
}: {
    context: Context;
    reduxWrapperMiddleware?: Middleware;
}) => {
    const store = configureStore({
        reducer: {
            [queriesApi.reducerPath]: queriesApi.reducer,
            [appUserSlice.name]: appUserSlice.reducer,
        },
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
                    }) as Middleware
                );
            }

            middlewares.push(rtkQueryErrorLogger);
            middlewares.push(queriesApi.middleware);

            if (reduxWrapperMiddleware) {
                middlewares.push(reduxWrapperMiddleware);
            }

            return middlewares;
        },
        devTools: true,
    });

    setupListeners(store.dispatch);
    return store;
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
