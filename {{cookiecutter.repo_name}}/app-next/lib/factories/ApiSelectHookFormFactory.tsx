import React from "react";
import { FieldPath, FieldValues } from "react-hook-form/dist/types";
import { Controller } from "react-hook-form";
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
    InitialQueryArgType extends BaseQueryArgType
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
    }: ApiSelectWithLoadInitialValueProps<ValueType>) => {
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
            [rawFallbackLabel, value]
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
            [value, fallbackLabel]
        );
        const [chosenOption, setChosenOption] = React.useState<
            ApiSelectOption<ValueType> | null | undefined
        >(fallbackValue);
        React.useEffect(() => {
            if (
                (chosenOption &&
                    fallbackValue &&
                    chosenOption.key === fallbackValue.key) ||
                (!chosenOption && !fallbackValue)
            ) {
                return;
            }
            setChosenOption(fallbackValue);
            // We only need to reset on change of fallback value, not on change of chosen option
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [fallbackValue]);
        const skipLoading = React.useMemo(
            () => value === null || !fallbackLabel.needsRefreshFromApi,
            [fallbackLabel, value]
        );
        const queryArguments = React.useMemo(
            () =>
                value === null
                    ? ({} as InitialQueryArgType)
                    : getInitialValueQueryArgs(value),
            [value]
        );
        const { data: valueData, isLoading: loadingValueData } =
            initialValueRetrieveEndpoint.useQuery(queryArguments, {
                skip: skipLoading,
            });

        React.useEffect(() => {
            if (loadingValueData) {
                return;
            }
            if (valueData) {
                setChosenOption(factoryArguments.getOptionForItem(valueData));
            }
        }, [valueData, loadingValueData]);

        const onChange = React.useCallback(
            (option: ApiSelectOption<ValueType> | null) => {
                setChosenOption(option);
                outerOnChange?.(option?.value ?? null);
            },
            [outerOnChange]
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
    ValueType
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
    }: ApiSelectMultipleWithLoadInitialValueProps<ValueType>) => {
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
            [fallbackValueLabel]
        );

        const [chosenOptions, setChosenOptions] = React.useState<
            ApiSelectOption<ValueType>[]
        >([]);
        React.useEffect(() => {
            const currentValuesByValue: Record<
                string,
                ApiSelectOption<ValueType>
            > = {};
            chosenOptions.forEach((option) => {
                currentValuesByValue[option.key] = option;
            });
            const valuesWithFallback = values.map((originalValue) => {
                const mappedValue = mapValuesToFallbackOptions(originalValue);
                return {
                    originalValue,
                    mappedValue,
                };
            });

            setChosenOptions(
                valuesWithFallback.map(
                    (value) =>
                        currentValuesByValue[value.mappedValue.key] ??
                        value.mappedValue
                )
            );

            valuesWithFallback
                .filter((value) => value.mappedValue.needsRefreshFromApi)
                .forEach((value) => {
                    const queryArguments = getInitialValueQueryArgs(
                        value.originalValue
                    );
                    trigger(queryArguments).then((result) => {
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
                                o.key === option.key ? option : o
                            );
                        });
                    });
                });
            // We don't want to re-run the effect every time the options change, so chosenOptions
            // are not included in the dependency array
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [mapValuesToFallbackOptions, values, trigger]);

        const onChange = React.useCallback(
            (options: ApiSelectOption<ValueType>[]) => {
                setChosenOptions(options);
                outerOnChange?.(options.map((option) => option.value));
            },
            [outerOnChange]
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
    InitialQueryArgType extends BaseQueryArgType
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
        TName extends FieldPath<TFieldValues>
    >({
        selectProps = {},
        initialValueLabel,
        ...rest
    }: ApiSelectHookFormProps<
        TFieldValues,
        TName,
        TFieldValues[TName] & ValueType
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
    InitialQueryArgType extends BaseQueryArgType
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
        TName extends FieldPath<TFieldValues>
    >({
        selectProps = {},
        initialValueLabels,
        ...rest
    }: ApiSelectMultipleHookFormProps<TFieldValues, TName, ValueType>) => (
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
