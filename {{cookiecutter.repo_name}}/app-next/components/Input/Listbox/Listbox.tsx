import * as React from "react";
import { Listbox as HeadlessListbox } from "@headlessui/react";

import {
    ListboxBody,
    BaseListboxOption,
    ListboxBodyProps,
} from "./ListboxBody";

type ListboxDefaultTag = React.ExoticComponent<{
    children?: React.ReactNode;
}>;

type ListboxProps<
    TValue extends BaseListboxOption,
    TMultiple extends boolean | undefined,
> = Omit<
    typeof HeadlessListbox<
        ListboxDefaultTag,
        TMultiple extends true ? TValue[] : TValue
    > extends (props: infer P) => React.JSX.Element
        ? P
        : never,
    "multiple"
> &
    ListboxBodyProps<TValue> & {
        multiple?: TMultiple;
    };

export const Listbox = <
    T extends BaseListboxOption,
    TMultiple extends boolean | undefined,
>({
    label,
    onClear = undefined,
    children = undefined,
    options,
    error = undefined,
    disabled = false,
    value = undefined,
    defaultValue = undefined,
    selectedOptionsDisplayLimit = undefined,
    multiple = undefined,
    ...props
}: ListboxProps<T, TMultiple>) => (
    <HeadlessListbox
        {...props}
        multiple={multiple}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
    >
        {({ value }) => (
            <ListboxBody
                label={label}
                onClear={onClear}
                options={options}
                error={error}
                disabled={disabled}
                selectedOptionsDisplayLimit={selectedOptionsDisplayLimit}
                value={value}
            >
                {children}
            </ListboxBody>
        )}
    </HeadlessListbox>
);
