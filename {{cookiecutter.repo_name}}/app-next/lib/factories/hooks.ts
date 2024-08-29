import React from "react";
import { useTranslation } from "next-i18next";
import {
    Path,
    useForm,
    UseFormProps,
    FieldValues,
    ErrorOption,
} from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { EndpointDefinitions } from "@reduxjs/toolkit/dist/query/endpointDefinitions";

import { MutationDefinition } from "@reduxjs/toolkit/query";
import { ApiEndpointMutation } from "@reduxjs/toolkit/dist/query/core/module";
import { MutationHooks } from "@reduxjs/toolkit/dist/query/react/buildHooks";
import { SerializedError } from "@reduxjs/toolkit";
import { BaseQueryError } from "@reduxjs/toolkit/dist/query/baseQueryTypes";
import {
    extractErrorData,
    useExtractNonFieldError,
    isRecord,
} from "@lib/convertError";
import { baseQuery } from "@lib/queries/baseQueriesApi";
import { BaseItemType, BaseQueryArgType } from "@lib/factories/types";

export type ApiError =
    | SerializedError
    | Exclude<BaseQueryError<typeof baseQuery>, undefined>;

export type OnError = (error: ApiError) => void;

export interface UseAPIBasedFormProps<
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    TFieldValues extends FieldValues
> {
    endpoint: ApiEndpointMutation<
        MutationDefinition<QueryArgType, typeof baseQuery, string, ItemType>,
        EndpointDefinitions
    > &
        MutationHooks<
            MutationDefinition<QueryArgType, typeof baseQuery, string, ItemType>
        >;
    makeQueryArgs: (values: TFieldValues) => QueryArgType;
    onSuccess?: (result: ItemType) => void;
    resetOnSuccess?: boolean;
    onError?: OnError;
    formProps?: UseFormProps<TFieldValues>;
}

export interface UseAPIBasedFormResult<TFieldValues extends FieldValues>
    extends Omit<UseFormReturn<TFieldValues, undefined>, "handleSubmit"> {
    isLoading: boolean;
    handleSubmit: () => void;
}

export const isMutationResultError = (
    result: unknown
): result is {
    error:
        | SerializedError
        | Exclude<BaseQueryError<typeof baseQuery>, undefined>;
} => isRecord(result) && result.hasOwnProperty("error");

const hasSubErrorsField = (
    data: unknown
): data is { errors: unknown } => (
    isRecord(data) && data.hasOwnProperty("errors") && !!(data as { errors: unknown }).errors
);

export const extractErrorsRecursively = <T>(
    referenceValue: unknown,
    errors: unknown,
    setError: (path: Path<T>, error: ErrorOption) => void,
    currentPath: Path<T>
): void => {
    const pathPrefix = currentPath === "root" ? "" : `${currentPath}.`;
    if (Array.isArray(referenceValue) && Array.isArray(errors)) {
        errors.map((error, index) =>
            extractErrorsRecursively(
                referenceValue[index],
                error,
                setError,
                `${pathPrefix}${index}` as Path<T>
            )
        );
    } else if (isRecord(referenceValue) && isRecord(errors)) {
        Object.entries(errors).forEach(([key, value]) =>
            extractErrorsRecursively(
                referenceValue[key],
                value,
                setError,
                `${pathPrefix}${key}` as Path<T>
            )
        );
    } else {
        setError(currentPath, { message: extractErrorData(errors) });
    }
};

const defaultFormProps = {};

export const useApiBasedForm = <
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    TFieldValues extends FieldValues
>({
    endpoint,
    makeQueryArgs,
    onSuccess,
    resetOnSuccess,
    onError,
    formProps = defaultFormProps as UseFormProps<TFieldValues>,
}: UseAPIBasedFormProps<
    ItemType,
    QueryArgType,
    TFieldValues
>): UseAPIBasedFormResult<TFieldValues> => {
    const {
        handleSubmit: handleFormSubmit,
        setError,
        formState,
        reset,
        ...form
    } = useForm<TFieldValues>(formProps);
    const [trigger, { isLoading }] = endpoint.useMutation();
    const extractNonFieldError = useExtractNonFieldError();
    const onSubmit = React.useCallback(
        (value: TFieldValues) => {
            const queryArgs = makeQueryArgs(value);
            trigger(queryArgs).then((result) => {
                if (!isMutationResultError(result)) {
                    if (onSuccess) {
                        onSuccess(result.data);
                    }
                    if (resetOnSuccess) {
                        reset();
                    }
                    return;
                }
                const { error } = result;
                if (onError) {
                    onError(error);
                }

                const nonFieldErrors = extractNonFieldError(error);
                if (nonFieldErrors) {
                    setError("root", { message: nonFieldErrors });
                }

                const { data } = error as {
                    data: unknown;
                };
                if (!(data && typeof data === "object")) {
                    return;
                }

                extractErrorsRecursively(value, hasSubErrorsField(data) ? data.errors : data, setError, "root");
            });
        },
        [
            reset,
            resetOnSuccess,
            onError,
            onSuccess,
            setError,
            extractNonFieldError,
            makeQueryArgs,
            trigger,
        ]
    );
    const handleSubmit = React.useMemo<() => void>(
        () => handleFormSubmit(onSubmit),
        [handleFormSubmit, onSubmit]
    );

    return {
        handleSubmit,
        setError,
        formState,
        reset,
        isLoading: formState.isSubmitting || isLoading,
        ...form,
    };
};

export const useLoadingFallbackValueLabel = () => {
    const { t } = useTranslation(["common"]);

    return React.useMemo(
        () => ({
            label: t("common:errors.loading"),
            needsRefreshFromApi: true,
        }),
        [t]
    );
};
