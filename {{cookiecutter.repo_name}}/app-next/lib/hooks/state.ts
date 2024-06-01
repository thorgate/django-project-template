import type { ParsedUrlQuery } from "querystring";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import * as React from "react";
import { useRouter } from "next/router";
import { isRecord } from "@lib/convertError";

export interface WidgetProps<ValueType> {
    value: ValueType;
    onChange: (value: ValueType) => void;
    onReset: () => void;
    widget: AnyWidget<ValueType>;
}

export interface CustomComponentWidget<ValueType> {
    component: React.ComponentType<WidgetProps<ValueType>>;
}

export interface TextWidget<ValueType> {
    deserializer: (value: string) => ValueType;
    serializer?: (value: ValueType) => string;
}

export interface MultipleChoiceWidget<ValueType> {
    options: {
        label: React.ReactNode;
        value: ValueType extends Array<infer T> ? T : never;
        key?: string;
    }[];
    multiple: true;
}

export interface SingleChoiceWidget<ValueType> {
    options: { label: React.ReactNode; value: ValueType; key?: string }[];
    multiple?: false;
}

export interface BaseWidgetOptions {
    label: React.ReactNode;
    placeholder?: string;
    throttle?: boolean | number;
    index?: number;
    icon?: typeof MagnifyingGlassIcon;
}

export type AnyWidget<ValueType> = BaseWidgetOptions &
    (
        | MultipleChoiceWidget<ValueType>
        | SingleChoiceWidget<ValueType>
        | TextWidget<ValueType>
        | CustomComponentWidget<ValueType>
    );

export const isCustomComponentWidget = <ValueType>(
    value: AnyWidget<ValueType>
): value is CustomComponentWidget<ValueType> & BaseWidgetOptions =>
    Object.hasOwn(value, "component");

export const isTextWidget = <ValueType>(
    value: AnyWidget<ValueType>
): value is TextWidget<ValueType> & BaseWidgetOptions =>
    Object.hasOwn(value, "deserializer");

export const isSingleChoiceWidget = <ValueType>(
    value: AnyWidget<ValueType>
): value is SingleChoiceWidget<ValueType> & BaseWidgetOptions =>
    Object.hasOwn(value, "options") && isRecord(value) && !value.multiple;

export const isMultipleChoiceWidget = <ValueType>(
    value: AnyWidget<ValueType>
): value is MultipleChoiceWidget<ValueType> & BaseWidgetOptions =>
    Object.hasOwn(value, "options") && isRecord(value) && !!value.multiple;

export interface PageStateItem<ValueType = never> {
    defaultValue: ValueType;
    /* Pagination state needs to be reset if filters change */
    isPagination?: boolean;
    isFilter?: boolean;
    url?: {
        key: string;
        // ToDo: only require serializer if value is not string
        serializer: (value: ValueType) => string[];
        deserializer: (value: string[]) => ValueType;
    };
    widget?: AnyWidget<ValueType>;
}

export interface PageStateItemWithAPIInfo<ValueType, ApiArgType, ApiArgKey>
    extends PageStateItem<ValueType> {
    api?: {
        key: ApiArgKey;
        // ToDo: only allow undefined serializer if value is of correct type already
        serializer?: (value: ValueType) => ApiArgType;
    };
}

export type PageStateDefinitionWithAPIInfo<
    PageStateType extends object,
    ApiArgType extends object
> = {
    [K in keyof PageStateType]: {
        [AK in keyof ApiArgType]: PageStateItemWithAPIInfo<
            PageStateType[K],
            ApiArgType[AK],
            AK
        >;
    }[keyof ApiArgType];
};

export type PageStateDefinition<PageState extends object> = {
    [K in keyof PageState]: PageStateItem<PageState[K]>;
};

export interface UsePageStateResult<PageStateType extends object> {
    pageState: PageStateType;
    setPageState: (
        newState: Partial<PageStateType>,
        reset?: Record<keyof PageStateType, boolean>
    ) => void;
}

const normalizeQueryValue = (
    value: string | string[] | undefined
): string[] | undefined =>
    (value && typeof value !== "string" && value) ||
    (value !== undefined && [value]) ||
    undefined;

export const pageStateFromQueryParameters = <PageStateType extends object>(
    definition: PageStateDefinition<PageStateType>,
    query: ParsedUrlQuery
): PageStateType => {
    const initialState: Partial<PageStateType> = {};
    for (const key of Object.keys(definition) as (keyof PageStateType)[]) {
        const { key: urlKey, deserializer } = definition[key].url ?? {};
        const valueFromUrl = urlKey
            ? normalizeQueryValue(query[urlKey])
            : undefined;

        initialState[key] =
            valueFromUrl !== undefined && deserializer
                ? (deserializer(valueFromUrl) as PageStateType[typeof key])
                : (definition[key].defaultValue as PageStateType[typeof key]);
    }
    return initialState as PageStateType;
};

export const usePageState = <PageStateType extends object>(
    definition: PageStateDefinition<PageStateType>
): UsePageStateResult<PageStateType> => {
    const { query, push } = useRouter();

    const [state, setState] = React.useState<PageStateType>(() =>
        pageStateFromQueryParameters(definition, query)
    );

    /* Use mutable refs instead of re-creating the setPageState function every time - this helps with throttling and
     * should reduce the number of renders. */
    const pushRef = React.useRef<typeof push>(push);
    React.useEffect(() => {
        pushRef.current = push;
    }, [push]);

    const setPageState = React.useCallback<
        UsePageStateResult<PageStateType>["setPageState"]
    >(
        (newState, resetState) => {
            const setNewState = (
                currentState: PageStateType
            ): PageStateType => {
                const completeNewState: PageStateType = {
                    ...currentState,
                    ...newState,
                };
                if (resetState) {
                    (
                        Object.keys(resetState) as (keyof PageStateType)[]
                    ).forEach((key) => {
                        completeNewState[key] = definition[key]
                            .defaultValue as PageStateType[typeof key];
                    });
                }
                const paginationResetNeeded =
                    (Object.keys(newState) as (keyof PageStateType)[]).some(
                        (key) => definition[key].isFilter
                    ) ||
                    (resetState &&
                        (
                            Object.keys(resetState) as (keyof PageStateType)[]
                        ).some((key) => definition[key].isFilter));

                if (paginationResetNeeded) {
                    (
                        Object.keys(definition) as (keyof PageStateType)[]
                    ).forEach((key) => {
                        if (definition[key].isPagination) {
                            completeNewState[key] = definition[key]
                                .defaultValue as PageStateType[typeof key];
                        }
                    });
                }

                /* Manage URL parameters */
                const changedQuery: typeof query = {};
                for (const key of Object.keys(
                    completeNewState
                ) as (keyof PageStateType)[]) {
                    const { defaultValue } = definition[key];
                    const { key: urlKey, serializer } =
                        definition[key].url ?? {};
                    if (!urlKey || !serializer) {
                        continue;
                    }

                    const newValue = completeNewState[key];
                    changedQuery[urlKey] = serializer(newValue);
                    if (
                        Array.isArray(newValue) &&
                        Array.isArray(defaultValue)
                    ) {
                        // For arrays, compare arrays by value, remove if matches default value
                        if (
                            JSON.stringify([...newValue].sort()) ===
                            JSON.stringify([...defaultValue].sort())
                        ) {
                            delete changedQuery[urlKey];
                        }
                    } else {
                        // Compare to default value, and remove if it matches
                        if (newValue === defaultValue) {
                            delete changedQuery[urlKey];
                        }
                    }
                }
                void pushRef.current({ query: changedQuery }, undefined, {
                    shallow: true,
                });
                return completeNewState;
            };

            /* Manage state */
            setState(setNewState);
        },
        [definition]
    );

    return { pageState: state, setPageState };
};

export const apiStateFromPageState = <
    PageStateType extends object,
    ApiArgType extends object
>(
    definition: PageStateDefinitionWithAPIInfo<PageStateType, ApiArgType>,
    {
        pageState,
        unmanagedApiState,
    }: {
        pageState: PageStateType;
        unmanagedApiState: ApiArgType;
    }
): ApiArgType => {
    const newState = { ...unmanagedApiState };
    for (const key of Object.keys(definition) as (keyof PageStateType)[]) {
        const { key: apiKey, serializer } = definition[key].api ?? {};
        if (!apiKey) {
            continue;
        }

        newState[apiKey] = serializer
            ? serializer(pageState[key])
            : (pageState[key] as unknown as ApiArgType[keyof ApiArgType]);
    }

    return newState;
};

export const useApiState = <
    PageStateType extends object,
    ApiArgType extends object
>(
    definition: PageStateDefinitionWithAPIInfo<PageStateType, ApiArgType>,
    {
        pageState,
        unmanagedApiState,
    }: {
        pageState: PageStateType;
        unmanagedApiState: ApiArgType;
    }
): ApiArgType => {
    return React.useMemo<ApiArgType>(
        () =>
            apiStateFromPageState(definition, { pageState, unmanagedApiState }),
        [definition, pageState, unmanagedApiState]
    );
};
