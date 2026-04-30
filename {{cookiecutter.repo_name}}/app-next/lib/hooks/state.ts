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
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
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

export type BaseWidgetOptions = {
    label: React.ReactNode;
    placeholder?: string;
    type?: "small";
    index?: number;
    icon?: typeof MagnifyingGlassIcon;
} & (
    | {
          throttle?: boolean | number;
          debounce?: undefined;
      }
    | {
          throttle?: undefined;
          debounce?: boolean | number;
      }
);

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
    defaultValueFactory?: () => ValueType;
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

export interface PageStateItemWithAPIInfo<
    ValueType,
    PageStateType,
    ApiArgType,
    ApiArgKey extends keyof ApiArgType
> extends PageStateItem<ValueType> {
    api?:
        | (ValueType extends ApiArgType[ApiArgKey]
              ? {
                    key: ApiArgKey;
                    serializer?: undefined;
                }
              : never)
        | {
              key?: undefined;
              serializer: (
                  value: ValueType,
                  completeState: PageStateType
              ) => Partial<ApiArgType>;
          };
}

export type PageStateDefinitionWithAPIInfo<
    PageStateType extends object,
    ApiArgType extends object
> = {
    [K in keyof PageStateType]: {
        [AK in keyof ApiArgType]: PageStateItemWithAPIInfo<
            PageStateType[K],
            PageStateType,
            ApiArgType,
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
        reset?: Record<keyof PageStateType, boolean> | true
    ) => void;
}

const normalizeQueryValue = (
    value: string | string[] | undefined
): string[] | undefined =>
    (value && typeof value !== "string" && value) ||
    (value !== undefined && [value]) ||
    undefined;

export const defaultValueForPageStateItem = <T>(item: PageStateItem<T>): T =>
    item?.defaultValueFactory?.() ?? item.defaultValue;

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
                : (defaultValueForPageStateItem(
                      definition[key]
                  ) as PageStateType[typeof key]);
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
                    (resetState === true
                        ? (Object.keys(definition) as (keyof PageStateType)[])
                        : (Object.keys(resetState) as (keyof PageStateType)[])
                    ).forEach((key) => {
                        completeNewState[key] = defaultValueForPageStateItem(
                            definition[key]
                        ) as PageStateType[typeof key];
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
                            completeNewState[key] =
                                defaultValueForPageStateItem(
                                    definition[key]
                                ) as PageStateType[typeof key];
                        }
                    });
                }

                /* Manage URL parameters */
                const changedQuery: typeof query = {};
                for (const key of Object.keys(
                    completeNewState
                ) as (keyof PageStateType)[]) {
                    const defaultValue = defaultValueForPageStateItem(
                        definition[key]
                    );
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
    let newState = { ...unmanagedApiState };
    for (const key of Object.keys(definition) as (keyof PageStateType)[]) {
        const { key: apiKey, serializer } = definition[key].api ?? {};
        if (apiKey) {
            newState[apiKey] = pageState[
                key
            ] as unknown as ApiArgType[keyof ApiArgType];
        } else if (serializer) {
            newState = {
                ...newState,
                ...serializer(pageState[key], pageState),
            };
        }
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
