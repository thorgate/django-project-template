import * as React from "react";
import clsx from "clsx";
import { ForwardedRef, forwardRef } from "react";
import { NumericFormat } from "react-number-format";
import type { NumericFormatProps } from "react-number-format";
import { Controller } from "react-hook-form";
import {
    UseFormSetValue,
    FieldValues,
    Path,
    get as getByFormPath,
} from "react-hook-form";
import { UseAPIBasedFormResult } from "@lib/factories/hooks";
import { InputWrapper } from "@components/Input/InputWrapper";
import { inputClassNames } from "@components/Input/style";

export const THOUSANDS_SEPARATOR = " ";
export const DECIMAL_SEPARATOR = ".";

export type FormattingSymbol = "" | ` ${string}`;

const formatStringValue = (str: string, symbol: FormattingSymbol): string => {
    if (!str) {
        return "0";
    }

    const withoutSeparators = str
        .split(THOUSANDS_SEPARATOR)
        .join("")
        .split(DECIMAL_SEPARATOR)
        .join(".");

    if (symbol === "") {
        return withoutSeparators;
    }

    return withoutSeparators.slice(0, -symbol.length + 1);
};

export interface InnerNumericInputProps<TFieldValues extends FieldValues>
    extends Omit<NumericFormatProps, "suffix"> {
    label?: React.ReactNode;
    error?: string;
    setValue?: UseFormSetValue<TFieldValues>;
    suffix?: FormattingSymbol;
}

interface NumericInputProps<
    TFieldValues extends FieldValues,
    TName extends Path<TFieldValues>
> extends Omit<
        InnerNumericInputProps<TFieldValues>,
        "name" | "label" | "form" | "disabled" | "suffix"
    > {
    name: TName;
    label?: React.ReactNode;
    form: UseAPIBasedFormResult<TFieldValues>;
    disabled?: boolean;
    suffix?: string | undefined;
}

interface SimpleNumericInputWithRef
    extends ReturnType<
        typeof forwardRef<HTMLInputElement, InnerNumericInputProps<FieldValues>>
    > {
    <TFieldValues extends FieldValues>(
        x: InnerNumericInputProps<TFieldValues>
    ): React.ReactNode;
}

export const SimpleNumericInput: SimpleNumericInputWithRef = forwardRef(
    <TFieldValues extends FieldValues>(
        {
            label,
            error,
            onChange: outerOnChange,
            suffix,
            disabled,
            className,
            ...props
        }: InnerNumericInputProps<TFieldValues>,
        ref: ForwardedRef<HTMLInputElement>
    ) => {
        const onChange = React.useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                outerOnChange?.({
                    ...e,
                    target: {
                        ...e.target,
                        value: formatStringValue(e.target.value, suffix || ""),
                    },
                });
            },
            [outerOnChange, suffix]
        );

        return (
            <InputWrapper label={label} error={error}>
                {({ id }) => (
                    <NumericFormat
                        {...props}
                        getInputRef={ref}
                        onChange={onChange}
                        suffix={suffix}
                        disabled={disabled}
                        id={id}
                        className={inputClassNames({
                            error: !!error,
                            disabled,
                            className,
                        })}
                    />
                )}
            </InputWrapper>
        );
    }
);
SimpleNumericInput.displayName = "InnerNumericInput";

export const NumericInput = <
    TFieldValues extends FieldValues,
    TName extends Path<TFieldValues>
>({
    name,
    label,
    disabled,
    form: {
        formState: { errors },
        isLoading,
        control,
    },
    className,
    suffix = "",
    decimalScale = 2,
    fixedDecimalScale = true,
    thousandSeparator = THOUSANDS_SEPARATOR,
    decimalSeparator = DECIMAL_SEPARATOR,
    ...rest
}: NumericInputProps<TFieldValues, TName>) => {
    // Add a space before the unit to separate it from the value
    const unitWithPrecedingSpace: FormattingSymbol = suffix && ` ${suffix}`;

    return (
        <Controller<TFieldValues, TName>
            control={control}
            name={name}
            render={({ field: { value, onChange } }) => (
                <SimpleNumericInput<TFieldValues>
                    id={name}
                    type={"tel"} // "tel" = numeric keyboard on mobile
                    label={label ?? String(name)}
                    error={getByFormPath(errors, name)?.message}
                    disabled={isLoading || disabled}
                    className={clsx(className, disabled && "bg-slate-50")}
                    suffix={unitWithPrecedingSpace}
                    decimalScale={decimalScale}
                    decimalSeparator={decimalSeparator}
                    fixedDecimalScale={fixedDecimalScale}
                    thousandSeparator={thousandSeparator}
                    value={value}
                    onChange={onChange}
                    {...rest}
                />
            )}
        />
    );
};
