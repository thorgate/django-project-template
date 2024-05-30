import { signIn } from "next-auth/react";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as qs from "qs";
import { RootState, appUserSlice } from "@lib/store";
import { verifyToken } from "@lib/jwt";
import { resolveBaseUrl } from "@lib/utils";

// eslint-disable-next-line no-console
console.log("API Base URL:", resolveBaseUrl());

export const baseQuery = fetchBaseQuery({
    baseUrl: resolveBaseUrl(),
    prepareHeaders: async (headers, options) => {
        const state = (options.getState() as RootState)[appUserSlice.name];
        const { locale } = state;
        let { accessToken } = state;

        if (typeof window !== "undefined" && accessToken) {
            if (!(await verifyToken(accessToken))) {
                // Force session update
                await signIn("credentials", {
                    redirect: false,
                    refreshToken: state.refreshToken,
                });

                // Get new token from the session
                const response = await fetch("/api/auth/session");
                const result = await response.json();
                accessToken = result?.user?.accessToken;
            }
        }

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

export const baseQueriesApi = createApi({
    baseQuery,
    tagTypes: [],
    endpoints: () => ({}),
});
