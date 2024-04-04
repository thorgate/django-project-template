import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AppUserState {
    accessToken: string;
    refreshToken: string;
    sessionExpired: boolean;
    sessionInitialized: boolean;
    locale: string;
}

const initialState = {
    accessToken: "",
    refreshToken: "",
    sessionExpired: false,
    sessionInitialized: false,
    locale: "en",
} as AppUserState;

export const appUserSlice = createSlice({
    name: "appUser",
    initialState,
    reducers: {
        setTokens: (
            state,
            action: PayloadAction<Pick<
                AppUserState,
                "accessToken" | "refreshToken"
            > | null>
        ) => {
            state.accessToken = action.payload?.accessToken || "";
            state.refreshToken = action.payload?.refreshToken || "";
            state.sessionInitialized = true;
        },
        setLocale: (state, action: PayloadAction<string>) => {
            state.locale = action.payload;
        },
    },
});
