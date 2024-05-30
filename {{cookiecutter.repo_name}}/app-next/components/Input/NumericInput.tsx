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

interface NumericInputProps<TFieldValues extends FieldValues>
    extends Omit<
        InnerNumericInputProps<TFieldValues>,
        "name" | "label" | "form" | "disabled" | "suffix"
    > {
    name: Path<TFieldValues>;
    label?: React.ReactNode;
    form: UseAPIBasedFormResult<TFieldValues>;
    disabled?: boolean;
    suffix?: string | undefined;
}

const InnerNumericInput = <TFieldValues extends FieldValues>(
    {
        label,
        error,
        onChange: outerOnChange,
        suffix,
        disabled,
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
        <div className={clsx("flex flex-col", error && "mb-4")}>
            {label ? (
                <label
                    htmlFor={props.id}
                    className="font-semibold text-sm text-gray-600 dark:text-white pb-1 block"
                >
                    {label}
                </label>
            ) : null}
            <NumericFormat
                getInputRef={ref}
                onChange={onChange}
                suffix={suffix}
                disabled={disabled}
                {...props}
                className={clsx(
                    "border-0 ring-1 ring-inset rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full",
                    "text-black dark:text-white",
                    "focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none",
                    disabled && "bg-slate-50 dark:bg-slate-600",
                    !disabled && "bg-white dark:bg-slate-800",
                    error && "ring-red-500",
                    !error && "ring-slate-300 dark:ring-slate-700",
                    props.className
                )}
            />
            {error ? (
                <span className="text-red-500 text-xs">{error}</span>
            ) : null}
        </div>
    );
};

export const SimpleNumericInput = forwardRef(InnerNumericInput);
SimpleNumericInput.displayName = "InnerNumericInput";

export const NumericInput = <TFieldValues extends FieldValues>({
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
}: NumericInputProps<TFieldValues>) => {
    // Add a space before the unit to separate it from the value
    const unitWithPrecedingSpace: FormattingSymbol = suffix && ` ${suffix}`;

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { value, onChange } }) => (
                <InnerNumericInput
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
