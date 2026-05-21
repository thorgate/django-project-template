import React from "react";
import { FieldPath, FieldValues, Controller } from "react-hook-form";
import {
    ApiSelectHookFormFactoryArguments,
    ApiSelectHookFormProps,
    ApiSelectMultipleHookFormFactoryArguments,
    ApiSelectMultipleHookFormProps,
    ApiSelectMultipleWithLoadInitialValueProps,
    ApiSelectOption,
    ApiSelectWithLoadInitialValueProps,
    BaseItemType,
    BaseQueryArgType,
} from "@lib/factories/types";
import {
    apiSelectFactory,
    apiSelectMultipleFactory,
} from "@lib/factories/ApiSelectFactory";
import { isMutationResultError } from "@lib/factories/hooks";

export const apiSelectWithLoadInitialValueFactory = <
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    ValueType,
    InitialQueryArgType extends BaseQueryArgType,
>({
    initialValueRetrieveEndpoint,
    getInitialValueQueryArgs,
    ...factoryArguments
}: ApiSelectHookFormFactoryArguments<
    ItemType,
    QueryArgType,
    ValueType,
    InitialQueryArgType
>) => {
    const OriginalApiSelect = apiSelectFactory(factoryArguments);
    const ApiSelectWithLoadInitialValue = ({
        value,
        fallbackValueLabel: rawFallbackLabel,
        selectProps,
        onChange: outerOnChange,
        disabled,
    }: ApiSelectWithLoadInitialValueProps<ValueType, QueryArgType>) => {
        const fallbackLabel = React.useMemo<{
            label: string;
            needsRefreshFromApi?: boolean;
        }>(
            () =>
                rawFallbackLabel && typeof rawFallbackLabel !== "string"
                    ? rawFallbackLabel
                    : {
                          label: rawFallbackLabel ?? String(value),
                          needsRefreshFromApi: false,
                      },
            [rawFallbackLabel, value],
        );
        const fallbackValue = React.useMemo(
            () =>
                value
                    ? {
                          key:
                              factoryArguments?.valueToKey?.(value) ??
                              String(value),
                          value,
                          label: fallbackLabel.label,
                          needsRefreshFromApi:
                              !!fallbackLabel.needsRefreshFromApi,
                      }
                    : null,
            [value, fallbackLabel],
        );
        const [chosenOption, setChosenOption] = React.useState<
            ApiSelectOption<ValueType> | null | undefined
        >(fallbackValue);
        const [prevFallbackValue, setPrevFallbackValue] =
            React.useState(fallbackValue);
        if (fallbackValue !== prevFallbackValue) {
            setPrevFallbackValue(fallbackValue);
            if (
                !(
                    chosenOption &&
                    fallbackValue &&
                    chosenOption.key === fallbackValue.key
                ) &&
                !(!chosenOption && !fallbackValue)
            ) {
                setChosenOption(fallbackValue);
            }
        }
        const skipLoading = React.useMemo(
            () => value === null || !fallbackLabel.needsRefreshFromApi,
            [fallbackLabel, value],
        );
        const queryArguments = React.useMemo(
            () =>
                value === null
                    ? ({} as InitialQueryArgType)
                    : getInitialValueQueryArgs(value),
            [value],
        );
        const { data: valueData, isLoading: loadingValueData } =
            initialValueRetrieveEndpoint.useQuery(queryArguments, {
                skip: skipLoading,
            });

        const [prevValueData, setPrevValueData] = React.useState(valueData);
        if (valueData !== prevValueData) {
            setPrevValueData(valueData);
            if (!loadingValueData && valueData) {
                setChosenOption(factoryArguments.getOptionForItem(valueData));
            }
        }

        const onChange = React.useCallback(
            (option: ApiSelectOption<ValueType> | null) => {
                setChosenOption(option);
                outerOnChange?.(option?.value ?? null);
            },
            [outerOnChange],
        );

        return (
            <OriginalApiSelect
                onChange={onChange}
                value={chosenOption}
                loadingInitialValue={!skipLoading && loadingValueData}
                disabled={disabled}
                {...selectProps}
            />
        );
    };

    ApiSelectWithLoadInitialValue.displayName = OriginalApiSelect.displayName;
    return ApiSelectWithLoadInitialValue;
};

export const apiSelectMultipleWithLoadInitialValueFactory = <
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    InitialQueryArgType extends BaseQueryArgType,
    ValueType,
>({
    initialValueRetrieveEndpoint,
    getInitialValueQueryArgs,
    ...factoryArguments
}: ApiSelectMultipleHookFormFactoryArguments<
    ItemType,
    QueryArgType,
    ValueType,
    InitialQueryArgType
>) => {
    const OriginalApiSelectMultiple =
        apiSelectMultipleFactory(factoryArguments);
    const ApiSelectMultipleWithLoadInitialValue = ({
        values,
        fallbackValueLabel,
        selectProps,
        onChange: outerOnChange,
        disabled,
    }: ApiSelectMultipleWithLoadInitialValueProps<ValueType, QueryArgType>) => {
        const [trigger] = initialValueRetrieveEndpoint.useLazyQuery();
        const mapValuesToFallbackOptions = React.useCallback(
            (value: ValueType): ApiSelectOption<ValueType> => {
                const rawFallbackLabel = fallbackValueLabel?.(value);
                const fallbackLabel: {
                    label: string;
                    needsRefreshFromApi?: boolean;
                } =
                    rawFallbackLabel && typeof rawFallbackLabel !== "string"
                        ? rawFallbackLabel
                        : {
                              label: rawFallbackLabel ?? String(value),
                              needsRefreshFromApi: false,
                          };

                return {
                    value: value,
                    key: factoryArguments?.valueToKey?.(value) ?? String(value),
                    label: fallbackLabel.label,
                    needsRefreshFromApi: !!fallbackLabel.needsRefreshFromApi,
                };
            },
            [fallbackValueLabel],
        );

        const [chosenOptions, setChosenOptions] = React.useState<
            ApiSelectOption<ValueType>[]
        >([]);

        const valuesWithFallback = React.useMemo(
            () =>
                values.map((originalValue) => ({
                    originalValue,
                    mappedValue: mapValuesToFallbackOptions(originalValue),
                })),
            [values, mapValuesToFallbackOptions],
        );

        const [prevValuesWithFallback, setPrevValuesWithFallback] =
            React.useState(valuesWithFallback);
        if (valuesWithFallback !== prevValuesWithFallback) {
            setPrevValuesWithFallback(valuesWithFallback);
            setChosenOptions((currentOptions) => {
                const currentValuesByKey: Record<
                    string,
                    ApiSelectOption<ValueType>
                > = {};
                currentOptions.forEach((option) => {
                    currentValuesByKey[option.key] = option;
                });
                return valuesWithFallback.map(
                    (v) =>
                        currentValuesByKey[v.mappedValue.key] ?? v.mappedValue,
                );
            });
        }

        React.useEffect(() => {
            valuesWithFallback
                .filter((value) => value.mappedValue.needsRefreshFromApi)
                .forEach((value) => {
                    const queryArguments = getInitialValueQueryArgs(
                        value.originalValue,
                    );
                    trigger(queryArguments, true).then((result) => {
                        if (isMutationResultError(result)) {
                            return;
                        }
                        const { data } = result;
                        if (!data) {
                            return;
                        }
                        const option = factoryArguments.getOptionForItem(data);
                        setChosenOptions((currentOptions) => {
                            return currentOptions.map((o) =>
                                o.key === option.key ? option : o,
                            );
                        });
                    });
                });
        }, [valuesWithFallback, trigger]);

        const onChange = React.useCallback(
            (options: ApiSelectOption<ValueType>[]) => {
                setChosenOptions(options);
                outerOnChange?.(options.map((option) => option.value));
            },
            [outerOnChange],
        );

        return (
            <OriginalApiSelectMultiple
                onChange={onChange}
                values={chosenOptions}
                loadingInitialValue={false}
                disabled={disabled}
                {...selectProps}
            />
        );
    };

    ApiSelectMultipleWithLoadInitialValue.displayName =
        OriginalApiSelectMultiple.displayName;
    return ApiSelectMultipleWithLoadInitialValue;
};

export const apiSelectHookFormFactory = <
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    ValueType,
    InitialQueryArgType extends BaseQueryArgType,
>({
    initialValueRetrieveEndpoint,
    getInitialValueQueryArgs,
    ...factoryArguments
}: ApiSelectHookFormFactoryArguments<
    ItemType,
    QueryArgType,
    ValueType,
    InitialQueryArgType
>) => {
    const InnerApiSelect = apiSelectWithLoadInitialValueFactory({
        initialValueRetrieveEndpoint,
        getInitialValueQueryArgs,
        ...factoryArguments,
    });

    const ApiSelect = <
        TFieldValues extends FieldValues,
        TName extends FieldPath<TFieldValues>,
    >({
        selectProps = {},
        initialValueLabel,
        ...rest
    }: ApiSelectHookFormProps<
        TFieldValues,
        TName,
        TFieldValues[TName] & ValueType,
        QueryArgType
    >) => (
        <Controller
            {...rest}
            render={({ field: { value, onChange } }) => (
                <InnerApiSelect
                    onChange={onChange}
                    value={value}
                    fallbackValueLabel={initialValueLabel}
                    selectProps={selectProps}
                />
            )}
        ></Controller>
    );
    ApiSelect.displayName = InnerApiSelect.displayName;
    return ApiSelect;
};

export const apiSelectMultipleHookFormFactory = <
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    ValueType,
    InitialQueryArgType extends BaseQueryArgType,
>({
    initialValueRetrieveEndpoint,
    getInitialValueQueryArgs,
    ...factoryArguments
}: ApiSelectMultipleHookFormFactoryArguments<
    ItemType,
    QueryArgType,
    ValueType,
    InitialQueryArgType
>) => {
    const InnerApiSelect = apiSelectMultipleWithLoadInitialValueFactory({
        initialValueRetrieveEndpoint,
        getInitialValueQueryArgs,
        ...factoryArguments,
    });

    const ApiSelect = <
        TFieldValues extends FieldValues,
        TName extends FieldPath<TFieldValues>,
    >({
        selectProps = {},
        initialValueLabels,
        ...rest
    }: ApiSelectMultipleHookFormProps<
        TFieldValues,
        TName,
        ValueType,
        QueryArgType
    >) => (
        <Controller
            {...rest}
            render={({ field: { value, onChange } }) => (
                <InnerApiSelect
                    onChange={onChange}
                    values={value}
                    selectProps={selectProps}
                    fallbackValueLabel={initialValueLabels}
                />
            )}
        ></Controller>
    );
    ApiSelect.displayName = InnerApiSelect.displayName;
    return ApiSelect;
};
