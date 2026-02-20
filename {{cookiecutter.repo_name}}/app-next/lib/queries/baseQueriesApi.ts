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

    if (!accessToken || !refreshToken) {
        return result;
    }

    api.dispatch(
        appUserSlice.actions.setTokens({
            accessToken,
            refreshToken,
        })
    );

    return baseQuery(args, api, extraOptions);
};

export const baseQueriesApi = createApi({
    baseQuery,
    tagTypes: [],
    endpoints: () => ({}),
});
