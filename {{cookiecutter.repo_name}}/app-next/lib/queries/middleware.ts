import { isRejectedWithValue } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";
import { i18n } from "next-i18next";
import { toast } from "react-toastify";
import { extractNonFieldError } from "@lib/convertError";

export const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
    /* This middleware is a fallback for handling errors that are unlikely to be handled elsewhere properly by
     * showing an error toast. It triggers for errors 5xx server errors, which may happen on fetch and save alike,
     * and also for rate limiting errors. */
    // Don't run on server side, as toast notification can't be shown there (and it won't be passed over to che client)
    if (typeof window === "undefined") {
        return next(action);
    }

    // RTK Query uses `createAsyncThunk` from redux-toolkit under the hood, so we're able to utilize these matchers
    // Actions with meta.source === "GSSP" are coming from get server side props rehydration and will be re-tried on
    // the client on error due to the nature of how RTKq work. We don't want to show an error message for these,
    // as it will either work client side and error message will be misleading, or it will fail and error message will
    // be duplicated.
    if (isRejectedWithValue(action) && action.meta && 'source' in action.meta && action.meta?.source !== "GSSP") {
        const t =
            i18n?.t ||
            (((key: string) => key) as (
                key: string,
                context?: unknown
            ) => string);

        const payload = action?.payload as {
            status?: number | string;
            originalStatus?: number;
            data?: unknown;
            message?: string;
        } | undefined;

        if (payload?.status === 429) {
            toast.error(t("errors.rateLimited"));
        }
        if (payload && Math.floor((payload?.originalStatus || 0) / 100) === 5) {
            const message = extractNonFieldError(
                payload,
                (code) => t("errors.unexpectedErrorWithCode", {code}),
                t("errors.unexpectedError")
            );
            toast.error(message);
        }
    }

    return next(action);
};
