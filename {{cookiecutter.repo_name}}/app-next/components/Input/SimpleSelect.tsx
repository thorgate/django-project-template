import {
    FieldValues,
    PathValue,
    UseControllerProps,
} from "react-hook-form/dist/types";
import { Controller, Path } from "react-hook-form";
import React, { ReactNode } from "react";

import { StyledListBox } from "@components/Input/StyledListBox";

interface SimpleSelectProps<T extends FieldValues = FieldValues>
    extends UseControllerProps<T> {
    options: { value: PathValue<T, Path<T>>; label: ReactNode }[];
    allowClear?: boolean;
    disabled?: boolean;
}

export const SimpleSelect = <T extends FieldValues = FieldValues>({
    name,
    options,
    control,
    defaultValue,
    allowClear = true,
    disabled = false,
}: SimpleSelectProps<T>) => {
    return (
        <Controller
            control={control}
            name={name}
            defaultValue={defaultValue}
            render={({ field }) => {
                const selectedOption = options.find(
                    (option) => option.value === field.value
                );
                return (
                    <StyledListBox
                        options={options}
                        selectedOption={selectedOption ?? null}
                        onChange={(option) => field.onChange(option.value)}
                        disabled={disabled}
                        onReset={() => field.onChange("")}
                        allowClear={allowClear}
                    />
                );
            }}
        />
    );
};
