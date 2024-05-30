import React from "react";
import { useTranslation } from "next-i18next";
import throttle from "lodash.throttle";
import { Combobox } from "@headlessui/react";

import {
    ApiSelectFactoryArguments,
    ApiSelectMultipleFactoryArguments,
    ApiSelectMultipleProps,
    ApiSelectOption,
    ApiSelectProps,
    BaseApiSelectFactoryArguments,
    BaseItemType,
    BaseQueryArgType,
    RetrieveQueryResult,
} from "@lib/factories/types";
import { ScrollIntoViewEffect } from "@components/ScrollIntoViewEffect/";
import { ComboboxBody } from "@components/Input/Combobox";

interface ApiSelectOptionsState<T> {
    options: ApiSelectOption<T>[];
    pageNumber: number;
    hasMore: boolean;
    searchQuery: string;
}

const loadPageHookFactory = <
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    ValueType
>(
    factoryArguments: BaseApiSelectFactoryArguments<
        ItemType,
        QueryArgType,
        ValueType
    >
) => {
    return (
        values: ApiSelectOption<ValueType>[],
        initialSearchQuery: string
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
        React.useEffect(() => {
            // Every time the value changes, reset the option list in dropdown so that new search happens on
            // dropdown trigger
            setOptions({
                options: values,
                pageNumber: 0,
                hasMore: true,
                searchQuery: initialSearchQuery,
            });
        }, [values, initialSearchQuery]);

        const onLoadPage = React.useCallback(
            (
                data: RetrieveQueryResult<ItemType> | undefined,
                resetOptions: boolean,
                pageNumber: number,
                searchQuery: string | undefined = undefined
            ) => {
                const results = data?.results || [];
                setOptions((currentOptions) => {
                    const previousOptions = resetOptions
                        ? []
                        : currentOptions.options;
                    const previousKeys = new Set(
                        previousOptions.map((o) => o.key)
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
            []
        );
        const onLoadMore = React.useCallback(() => {
            const nextPage = options.pageNumber + 1;
            if (options.hasMore) {
                trigger({
                    ...factoryArguments.getSearchQueryArgs(options.searchQuery),
                    pageNumber: nextPage,
                } as QueryArgType).then(({ data }) => {
                    onLoadPage(data, false, nextPage);
                });
            }
        }, [onLoadPage, trigger, options]);
        const onSearchUnthrottled = React.useMemo<
            Required<React.ComponentProps<typeof ComboboxBody>>["onSearch"]
        >(
            () => (value) => {
                trigger({
                    ...factoryArguments.getSearchQueryArgs(value),
                    pageNumber: 1,
                } as QueryArgType)?.then(({ data }) => {
                    onLoadPage(data, true, 1, value);
                });
            },
            [onLoadPage, trigger]
        );
        const onSearch = React.useMemo(
            () =>
                throttle(
                    onSearchUnthrottled,
                    factoryArguments.throttleWaitTime || 500,
                    {
                        leading: true,
                        trailing: true,
                    }
                ),
            [onSearchUnthrottled]
        );
        return { options, setOptions, onSearch, onLoadMore };
    };
};

export const apiSelectFactory = <
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    ValueType
>(
    factoryArguments: ApiSelectFactoryArguments<
        ItemType,
        QueryArgType,
        ValueType
    >
): React.FC<ApiSelectProps<ValueType>> => {
    const useLoadPage = loadPageHookFactory(factoryArguments);
    const useInitialSearchQuery =
        factoryArguments.filterByInitialValueOnInitialOpen
            ? (value: ApiSelectOption<ValueType> | undefined | null) =>
                  React.useMemo(
                      () =>
                          factoryArguments.filterByInitialValueOnInitialOpen &&
                          value
                              ? value.displayValue ?? value.label ?? ""
                              : "",
                      [value]
                  )
            : () => React.useMemo(() => "", []);

    const ApiSelect = ({
        value,
        label,
        onChange,
        testId,
        className,
        disabled,
    }: ApiSelectProps<ValueType>) => {
        const { t } = useTranslation();
        const [selectedValue, setSelectedValue] =
            React.useState<ApiSelectOption<ValueType> | null>(value || null);
        const selectedValues = React.useMemo(
            () => (selectedValue ? [selectedValue] : []),
            [selectedValue]
        );
        const values = React.useMemo(() => (value ? [value] : []), [value]);
        const initialSearchQuery = useInitialSearchQuery(value);

        const { options, setOptions, onSearch, onLoadMore } = useLoadPage(
            values,
            initialSearchQuery
        );
        const onClear = React.useCallback(() => {
            setOptions({
                options: [],
                pageNumber: 1,
                hasMore: true,
                searchQuery: "",
            });
            setSelectedValue(null);
            onChange(null);
        }, [setOptions, onChange]);
        const onSelectionChange = React.useCallback(
            (value: ApiSelectOption<ValueType>) => {
                setSelectedValue(value);
                onChange(value || null);
            },
            [onChange]
        );
        React.useEffect(() => {
            setSelectedValue(value ?? null);
        }, [value]);
        return (
            <Combobox
                value={value}
                by="key"
                disabled={disabled}
                onChange={onSelectionChange}
                nullable={true}
                multiple={false}
                as="div"
                className={className}
                data-testid={testId ?? undefined}
            >
                <ComboboxBody
                    label={label}
                    onSearch={onSearch}
                    onClear={onClear}
                    options={options.options}
                    selectedOptions={selectedValues}
                    showMore={
                        options.hasMore ? (
                            <ScrollIntoViewEffect effect={onLoadMore}>
                                {t("errors.loading")}
                            </ScrollIntoViewEffect>
                        ) : null
                    }
                    displaySelectedSeparately={false}
                    allowWrap={false}
                    disabled={disabled}
                    {...(factoryArguments.extraComboboxBodyProps || {})}
                />
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
    ValueType
>(
    factoryArguments: ApiSelectMultipleFactoryArguments<
        ItemType,
        QueryArgType,
        ValueType
    >
): React.FC<ApiSelectMultipleProps<ValueType>> => {
    const useLoadPage = loadPageHookFactory(factoryArguments);

    const ApiSelectMultiple = ({
        values = emptyValues,
        label,
        onChange,
        loadingInitialValue,
        testId,
        className,
        disabled: outerDisabled,
    }: ApiSelectMultipleProps<ValueType>) => {
        const { t } = useTranslation();
        const disabled = React.useMemo(
            () => outerDisabled || loadingInitialValue,
            [outerDisabled, loadingInitialValue]
        );

        const { options, setOptions, onSearch, onLoadMore } = useLoadPage(
            values,
            ""
        );
        const onClear = React.useCallback(
            (option?: ApiSelectOption<ValueType>) => {
                if (option) {
                    onChange(values.filter((v) => v.value !== option.value));
                    return;
                }
                setOptions({
                    options: [],
                    pageNumber: 1,
                    hasMore: true,
                    searchQuery: "",
                });
                onChange([]);
            },
            [values, setOptions, onChange]
        );
        const onSelectionChange = React.useCallback(
            (values: ApiSelectOption<ValueType>[]) => {
                onChange(values);
            },
            [onChange]
        );

        return (
            <Combobox
                value={values}
                by="key"
                disabled={disabled}
                onChange={onSelectionChange}
                nullable={false}
                multiple={true}
                as="div"
                className={className}
                data-testid={testId ?? undefined}
            >
                <ComboboxBody
                    label={label}
                    onSearch={onSearch}
                    onClear={onClear}
                    options={options.options}
                    selectedOptions={values}
                    showMore={
                        options.hasMore ? (
                            <ScrollIntoViewEffect effect={onLoadMore}>
                                {t("errors.loading")}
                            </ScrollIntoViewEffect>
                        ) : null
                    }
                    disabled={disabled}
                    {...(factoryArguments.extraComboboxBodyProps || {})}
                />
            </Combobox>
        );
    };
    ApiSelectMultiple.displayName =
        factoryArguments.displayName ?? "ApiBasedSelectMultiple";

    return ApiSelectMultiple;
};
