import React from "react";
import { useTranslation } from "next-i18next";
import throttle from "lodash.throttle";

import {
    ApiSelectOption,
    APIQuery,
    BaseItemType,
    BaseQueryArgType,
    ListQueryResult,
} from "@lib/factories/types";
import { ScrollIntoViewEffect } from "@components/ScrollIntoViewEffect/";
import { Combobox } from "@components/Input";

interface ApiSelectOptionsState<T> {
    options: ApiSelectOption<T>[];
    pageNumber: number;
    hasMore: boolean;
    searchQuery: string;
}

export interface BaseApiSelectFactoryArguments<
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    ValueType,
> {
    retrieveEndpoint: APIQuery<QueryArgType, ListQueryResult<ItemType>>;
    getSearchQueryArgs: (query: string) => Partial<QueryArgType>;
    getOptionForItem: (item: ItemType) => ApiSelectOption<ValueType>;
    throttleWaitTime?: number;
    displayName?: string;
}

export interface ApiSelectFactoryArguments<
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    ValueType,
> extends BaseApiSelectFactoryArguments<ItemType, QueryArgType, ValueType> {
    filterByInitialValueOnInitialOpen?: boolean;
}

export type ApiSelectMultipleFactoryArguments<
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    ValueType,
> = BaseApiSelectFactoryArguments<ItemType, QueryArgType, ValueType>;

export interface ApiSelectOptionWithoutValue {
    label: string;
    /* Key is used as react key, and for the form values, and must be unique string.*/
    key: string;
    /* Display value is rendered in the search box once option is selected, and ideally should be same as the value
     * used for searching the API or option list. Falls back to label. */
    displayValue?: string | undefined;
    needsRefreshFromApi?: boolean;
}

export interface BaseApiSelectProps<QueryArgType> {
    getSearchQueryArgs?: (query: string) => Partial<QueryArgType>;
    label?: React.ReactNode;
    error?: string;
    loadingInitialValue?: boolean;
    testId?: string;
    className?: string;
    disabled?: boolean;
}

export interface ApiSelectProps<T, QueryArgType>
    extends BaseApiSelectProps<QueryArgType> {
    value?: ApiSelectOption<T> | null;
    onChange: (chosenOption: ApiSelectOption<T> | null) => void;
    onReset?: () => void;
}

export interface ApiSelectMultipleProps<T, QueryArgType>
    extends BaseApiSelectProps<QueryArgType> {
    values?: ApiSelectOption<T>[];
    onChange: (chosenOption: ApiSelectOption<T>[]) => void;
}

const loadPageHookFactory = <
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    ValueType,
>(
    factoryArguments: BaseApiSelectFactoryArguments<
        ItemType,
        QueryArgType,
        ValueType
    >,
) => {
    return (
        values: ApiSelectOption<ValueType>[],
        initialSearchQuery: string,
        getSearchQueryArgs?: (query: string) => Partial<QueryArgType>,
    ) => {
        const [trigger] = factoryArguments.retrieveEndpoint.useLazyQuery();
        const [options, setOptions] = React.useState<
            ApiSelectOptionsState<ValueType>
        >({
            options: values,
            pageNumber: 0,
            hasMore: true,
            searchQuery: initialSearchQuery,
        });
        const onLoadPage = React.useCallback(
            (
                data: ListQueryResult<ItemType> | undefined,
                resetOptions: boolean,
                pageNumber: number,
                searchQuery: string | undefined = undefined,
            ) => {
                const results = data?.results || [];
                setOptions((currentOptions) => {
                    const previousOptions = resetOptions
                        ? []
                        : currentOptions.options;
                    const previousKeys = new Set(
                        previousOptions.map((o) => o.key),
                    );
                    const newOptions = [
                        ...previousOptions,
                        ...results
                            .map(factoryArguments.getOptionForItem)
                            .filter((option) => !previousKeys.has(option.key)),
                    ];

                    return {
                        options: newOptions,
                        pageNumber,
                        hasMore:
                            results.length !== 0 &&
                            (!data?.totalCount ||
                                data?.totalCount > newOptions.length),
                        searchQuery:
                            searchQuery !== undefined
                                ? searchQuery
                                : currentOptions.searchQuery,
                    };
                });
            },
            [],
        );
        const onLoadMore = React.useCallback(
            (
                stateOverride?: Pick<
                    ApiSelectOptionsState<ValueType>,
                    "searchQuery" | "options"
                >,
            ) => {
                const nextPage =
                    stateOverride === undefined ? options.pageNumber + 1 : 1;
                if (stateOverride !== undefined || options.hasMore) {
                    trigger(
                        {
                            ...factoryArguments.getSearchQueryArgs(
                                stateOverride?.searchQuery ??
                                    options.searchQuery,
                            ),
                            ...(getSearchQueryArgs
                                ? getSearchQueryArgs(
                                      stateOverride?.searchQuery ??
                                          options.searchQuery,
                                  )
                                : {}),
                            pageNumber: nextPage,
                        } as QueryArgType,
                        true,
                    ).then(({ data }) => {
                        onLoadPage(data, false, nextPage);
                    });
                }
            },
            [onLoadPage, trigger, options, getSearchQueryArgs],
        );
        const onSearchUnthrottled = React.useMemo<
            Required<
                React.ComponentProps<
                    typeof Combobox<ApiSelectOption<ValueType>, false>
                >
            >["onSearch"]
        >(
            () => (value) => {
                trigger(
                    {
                        ...factoryArguments.getSearchQueryArgs(value),
                        ...(getSearchQueryArgs
                            ? getSearchQueryArgs(value)
                            : {}),
                        pageNumber: 1,
                    } as QueryArgType,
                    true,
                )?.then(({ data }) => {
                    onLoadPage(data, true, 1, value);
                });
            },
            [onLoadPage, trigger, getSearchQueryArgs],
        );
        const onSearch = React.useMemo(
            () =>
                throttle(
                    onSearchUnthrottled,
                    factoryArguments.throttleWaitTime || 500,
                    {
                        leading: false,
                        trailing: true,
                    },
                ),
            [onSearchUnthrottled],
        );
        React.useEffect(() => {
            // Every time the value changes, reset the option list in dropdown so that new search happens on
            // dropdown trigger
            onLoadMore({
                options: values,
                searchQuery: initialSearchQuery,
            });
            // But not every time the options change
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [values, initialSearchQuery]);
        return { options, setOptions, onSearch, onLoadMore };
    };
};

export const apiSelectFactory = <
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    ValueType,
>(
    factoryArguments: ApiSelectFactoryArguments<
        ItemType,
        QueryArgType,
        ValueType
    >,
): React.FC<ApiSelectProps<ValueType, QueryArgType>> => {
    const useLoadPage = loadPageHookFactory(factoryArguments);
    const useInitialSearchQuery =
        factoryArguments.filterByInitialValueOnInitialOpen
            ? (value: ApiSelectOption<ValueType> | undefined | null) =>
                  React.useMemo(
                      () =>
                          factoryArguments.filterByInitialValueOnInitialOpen &&
                          value
                              ? (value.displayValue ?? value.label ?? "")
                              : "",
                      [value],
                  )
            : () => React.useMemo(() => "", []);

    const ApiSelect = ({
        value,
        getSearchQueryArgs,
        label,
        onChange,
        onReset,
        disabled,
        error,
    }: ApiSelectProps<ValueType, QueryArgType>) => {
        const { t } = useTranslation();
        const values = React.useMemo(() => (value ? [value] : []), [value]);
        const initialSearchQuery = useInitialSearchQuery(value);

        const { options, setOptions, onSearch, onLoadMore } = useLoadPage(
            values,
            initialSearchQuery,
            getSearchQueryArgs,
        );
        const onClear = React.useCallback(() => {
            setOptions({
                options: [],
                pageNumber: 1,
                hasMore: true,
                searchQuery: "",
            });
            if (onReset) {
                onReset();
            } else {
                onChange(null);
            }
        }, [setOptions, onChange, onReset]);
        const onSelectionChange = React.useCallback(
            (value: ApiSelectOption<ValueType>) => {
                onChange(value || null);
            },
            [onChange],
        );
        return (
            <Combobox<ApiSelectOption<ValueType>, false>
                value={value}
                disabled={disabled}
                onChange={onSelectionChange}
                onSearch={onSearch}
                onClear={onClear}
                multiple={false}
                label={label}
                error={error}
                options={options.options}
                noResetToFirstOnSearch
            >
                {options.hasMore ? (
                    <ScrollIntoViewEffect
                        effect={onLoadMore}
                        className="text-brand-brand-disabled-dark"
                    >
                        {t("errors.loading")}
                    </ScrollIntoViewEffect>
                ) : null}
            </Combobox>
        );
    };
    ApiSelect.displayName = factoryArguments.displayName ?? "ApiBasedSelect";

    return ApiSelect;
};

const emptyValues: ApiSelectOption<never>[] = [];

export const apiSelectMultipleFactory = <
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    ValueType,
>(
    factoryArguments: ApiSelectMultipleFactoryArguments<
        ItemType,
        QueryArgType,
        ValueType
    >,
): React.FC<ApiSelectMultipleProps<ValueType, QueryArgType>> => {
    const useLoadPage = loadPageHookFactory(factoryArguments);

    const ApiSelectMultiple = ({
        values = emptyValues,
        getSearchQueryArgs,
        label,
        onChange,
        loadingInitialValue,
        disabled: outerDisabled,
        error,
    }: ApiSelectMultipleProps<ValueType, QueryArgType>) => {
        const { t } = useTranslation();
        const disabled = React.useMemo(
            () => outerDisabled || loadingInitialValue,
            [outerDisabled, loadingInitialValue],
        );

        const { options, setOptions, onSearch, onLoadMore } = useLoadPage(
            values,
            "",
            getSearchQueryArgs,
        );
        const onClear = React.useCallback(() => {
            setOptions({
                options: [],
                pageNumber: 1,
                hasMore: true,
                searchQuery: "",
            });
            onChange([]);
        }, [setOptions, onChange]);
        const onSelectionChange = React.useCallback(
            (values: ApiSelectOption<ValueType>[]) => {
                onChange(values);
            },
            [onChange],
        );

        return (
            <Combobox<ApiSelectOption<ValueType>, true>
                value={values}
                disabled={disabled}
                onChange={onSelectionChange}
                onSearch={onSearch}
                onClear={onClear}
                multiple
                label={label}
                error={error}
                options={options.options}
                noResetToFirstOnSearch
                selectedOptionsDisplayLimit={1}
            >
                {options.hasMore ? (
                    <ScrollIntoViewEffect
                        effect={onLoadMore}
                        className="text-brand-brand-disabled-dark"
                    >
                        {t("errors.loading")}
                    </ScrollIntoViewEffect>
                ) : null}
            </Combobox>
        );
    };
    ApiSelectMultiple.displayName =
        factoryArguments.displayName ?? "ApiBasedSelectMultiple";

    return ApiSelectMultiple;
};
