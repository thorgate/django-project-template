import {
    BaseQueryFn,
    createApi,
    FetchArgs,
    fetchBaseQuery,
    FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import * as qs from "qs";
import { RootState, appUserSlice } from "@lib/store";
import { resolveBaseUrl } from "@lib/utils";

// eslint-disable-next-line no-console
console.log("API Base URL:", resolveBaseUrl());

export const nextBaseQuery = fetchBaseQuery({
    baseUrl: resolveBaseUrl(),
    prepareHeaders: async (headers, options) => {
        const state = (options.getState() as RootState)[appUserSlice.name];
        const { accessToken, locale } = state;
        headers.set("Accept-Language", locale);
        if (accessToken) {
            headers.set("Authorization", `Bearer ${accessToken}`);
        }
        return headers;
    },
    paramsSerializer: (params) =>
        qs.stringify(params, {
            arrayFormat: "repeat",
        }),
});

export const baseQuery: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    const result = await nextBaseQuery(args, api, extraOptions);
    if (!result.error || result.error.status !== 401) {
        return result;
    }

    if (typeof window === "undefined") {
        return result;
    }

    const response = await fetch(`/api/auth/session`);
    const session = await response.json();

    const accessToken = session?.user?.accessToken ?? "";
    const refreshToken = session?.user?.refreshToken ?? "";
    const sessionExpired = session?.user?.sessionExpired ?? true;

    if (!accessToken || !refreshToken || sessionExpired) {
        api.dispatch(appUserSlice.actions.setSessionExpired());
        return result;
    }

    api.dispatch(
        appUserSlice.actions.setTokens({
            accessToken,
            refreshToken,
        }),
    );
    const finalResult = await nextBaseQuery(args, api, extraOptions);
    if (!finalResult.error || finalResult.error.status !== 401) {
        return finalResult;
    }
    /* Normally this should not happen, but it may (for example if server Next/Django JWT settings are
     * not consistent. In this case, to avoid redirect loop, consider session expired. */
    api.dispatch(
        appUserSlice.actions.setTokens({
            accessToken: "",
            refreshToken: "",
        }),
    );
    api.dispatch(appUserSlice.actions.setSessionExpired());
    return finalResult;
};

export const baseQueriesApi = createApi({
    baseQuery,
    tagTypes: [],
    endpoints: () => ({}),
});
