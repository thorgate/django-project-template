import * as React from "react";
import { Combobox as HeadlessCombobox } from "@headlessui/react";

import {
    BaseComboboxOption,
    ComboboxBody,
    ComboboxBodyProps,
} from "./ComboboxBody";

type ComboboxProps<
    TValue extends BaseComboboxOption,
    TMultiple extends boolean | undefined,
> = Omit<
    typeof HeadlessCombobox<
        TMultiple extends true ? TValue[] : TValue | null
    > extends (props: infer P) => React.JSX.Element
        ? P
        : never,
    "nullable" | "multiple"
> &
    ComboboxBodyProps<TValue> & {
        multiple?: TMultiple;
    };

export const Combobox = <
    T extends BaseComboboxOption,
    TMultiple extends boolean | undefined,
>({
    label,
    onSearch = undefined,
    filterFn = undefined,
    onClear = undefined,
    children = undefined,
    options,
    error = undefined,
    disabled = false,
    selectedOptionsDisplayLimit = undefined,
    noResetOnSelect = false,
    topOptions = undefined,
    multiple = undefined,
    defaultValue: providedDefaultValue = undefined,
    value: providedValue = undefined,
    ...props
}: ComboboxProps<T, TMultiple>) => {
    const defaultValue = React.useMemo(() => {
        if (providedValue !== undefined) {
            return undefined;
        }
        if (providedDefaultValue !== undefined) {
            return providedDefaultValue;
        }
        if (multiple) {
            return [];
        }
        return options?.[0] ?? undefined;
    }, [multiple, options, providedDefaultValue, providedValue]);

    return (
        /* HeadlessCombobox has 4 overloads and is a generic of 4 parameters, I have spent a lot of time trying to convince
         * typescript to correctly infer the types and understand that we're passing correct types here. I failed, if you
         * succeed then please let me know.*/
        <HeadlessCombobox<TMultiple extends true ? T[] : T | null>
            {...(props as React.ComponentProps<
                typeof HeadlessCombobox<TMultiple extends true ? T[] : T | null>
            >)}
            disabled={disabled}
            by={
                "key" as React.ComponentProps<
                    typeof HeadlessCombobox<
                        TMultiple extends true ? T[] : T | null
                    >
                >["by"]
            }
            multiple={
                multiple as React.ComponentProps<
                    typeof HeadlessCombobox<
                        TMultiple extends true ? T[] : T | null
                    >
                >["multiple"]
            }
            nullable={
                !multiple as React.ComponentProps<
                    typeof HeadlessCombobox<
                        TMultiple extends true ? T[] : T | null
                    >
                >["nullable"]
            }
            value={providedValue}
            defaultValue={
                defaultValue as React.ComponentProps<
                    typeof HeadlessCombobox<
                        TMultiple extends true ? T[] : T | null
                    >
                >["defaultValue"]
            }
        >
            {({ value }) => (
                <ComboboxBody<T>
                    label={label}
                    onSearch={onSearch}
                    onClear={onClear}
                    options={options}
                    error={error}
                    disabled={disabled}
                    value={value}
                    filterFn={filterFn}
                    selectedOptionsDisplayLimit={selectedOptionsDisplayLimit}
                    noResetOnSelect={noResetOnSelect}
                    topOptions={topOptions}
                >
                    {children}
                </ComboboxBody>
            )}
        </HeadlessCombobox>
    );
};
