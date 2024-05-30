import * as React from "react";
import { useTranslation } from "next-i18next";

const EMPTY_RECORD: Record<string, unknown> = {};
export const isRecord = (value: unknown): value is Record<string, unknown> =>
    Object.prototype.toString.call(value) ===
    Object.prototype.toString.call(EMPTY_RECORD);

export const extractErrorData = (data: unknown): string => {
    if (typeof data === "string") {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map((element) => extractErrorData(element)).join(" ");
    }

    if (isRecord(data) && typeof data.message === "string") {
        return data.message;
    }

    if (isRecord(data)) {
        return extractErrorData(
            Object.entries(data).map(
                ([key, value]) => `${key}: ${extractErrorData(value)}`
            )
        );
    }

    return `${data}`;
};

export const extractFieldError = (
    {
        data,
        message,
    }: {
        data?: unknown;
        message?: string;
    },
    selector: (data: unknown) => unknown
): string | undefined => {
    if (!data) {
        return undefined;
    }

    const selectedData = selector(data);

    if (selectedData === undefined) {
        return undefined;
    }

    if (typeof selectedData === "string") {
        return selectedData;
    }
    if (typeof message === "string") {
        return message;
    }

    return extractErrorData(selectedData);
};

export const extractNonFieldError = (
    {
        status,
        data,
        message,
    }: {
        status?: number | string;
        data?: unknown;
        message?: string;
    },
    fallbackWithCode: (code: number | string) => string,
    fallback: string
): string | undefined => {
    if (status && status !== 400) {
        return fallbackWithCode(status);
    }

    if (!data) {
        if (typeof message === "string") {
            return message;
        }

        return fallback;
    }

    if (
        typeof data === "string" &&
        // Naively check if this is HTML and skip trying to display it
        !data.startsWith("<") &&
        // Also skip displaying any error messages that look to long to be a comprehensive error message
        data.length < 2048
    ) {
        return data;
    }

    if (data && Array.isArray(data)) {
        return extractErrorData(data);
    }

    if (isRecord(data) && data["nonFieldErrors"] !== undefined) {
        return extractErrorData(data["nonFieldErrors"]);
    }
    if (typeof message === "string") {
        return message;
    }

    return undefined;
};

export const useExtractNonFieldError = () => {
    const { t } = useTranslation("common");
    return React.useCallback(
        (
            {
                status,
                data,
                message,
            }: {
                status?: number | string;
                data?: unknown;
                message?: string;
            },
            fallback: string | undefined = undefined
        ): string | undefined =>
            extractNonFieldError(
                { status, data, message },
                (code) => t("errors.unexpectedErrorWithCode", { code }),
                fallback || t("errors.unexpectedError")
            ),
        [t]
    );
};
