import * as React from "react";
import clsx from "clsx";
import { Popover } from "@headlessui/react";
import { format } from "date-fns";
import { ForwardedRef, forwardRef } from "react";

import { Controller } from "react-hook-form";
import {
    ControllerProps,
    FieldPath,
    FieldValues,
} from "react-hook-form/dist/types";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { CustomInput } from "@components/Input/CustomInput";
import { useDateFnsLocale } from "@components/Text";
import { Calendar, stringToCalendarDay } from "@components/Calendar";

export interface CalendarInputProps {
    label?: string;
    error?: string;
    value?: string;
    disabled?: boolean;
    allowClear?: boolean;
    onChange?: (date: string) => void;
    className?: string;
}

interface CalendarDay {
    day: number;
    month: number;
    year: number;
}

export const CalendarInput = forwardRef(
    (
        {
            label,
            error,
            value: initialValue,
            onChange,
            className,
            disabled,
            allowClear,
        }: CalendarInputProps,
        ref: ForwardedRef<HTMLInputElement>
    ) => {
        const locale = useDateFnsLocale();
        const [value, setValue] = React.useState<CalendarDay | undefined>(
            stringToCalendarDay(initialValue)
        );
        React.useEffect(() => {
            setValue(stringToCalendarDay(initialValue));
        }, [initialValue]);
        const valueString = React.useMemo(() => {
            if (value === undefined) {
                return "";
            }
            return format(
                new Date(value.year, value.month - 1, value.day),
                "P",
                { locale }
            );
        }, [value, locale]);
        const selectDate = React.useCallback(
            (newValue: CalendarDay) => {
                if (onChange) {
                    onChange(
                        `${newValue.year}-${newValue.month}-${newValue.day}`
                    );
                }
                setValue(newValue);
            },
            [onChange]
        );
        const clearDate = React.useCallback(() => {
            if (onChange) {
                onChange("");
            }
            setValue(undefined);
        }, [onChange]);

        return (
            <CustomInput label={label} error={error}>
                <Popover className={clsx("relative w-full flex", className)}>
                    {({ close }) => (
                        <>
                            <Popover.Button
                                disabled={disabled}
                                className="w-full"
                            >
                                <input
                                    type="text"
                                    ref={ref}
                                    className={clsx(
                                        "border px-3 py-2 mt-1 mb-5 text-sm w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white",
                                        allowClear && "rounded-l-md",
                                        !allowClear && "rounded-md",
                                        error && "border-red-500",
                                        !error && "border-slate-300"
                                    )}
                                    readOnly
                                    value={valueString}
                                />
                            </Popover.Button>
                            {allowClear ? (
                                <button
                                    type="button"
                                    onClick={clearDate}
                                    className="mt-1 mb-5 relative -ml-px inline-flex items-center rounded-r-md px-2 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                >
                                    <XMarkIcon className="h-5 w-5 text-gray-400" />
                                </button>
                            ) : null}
                            <Popover.Panel
                                focus
                                className="absolute top-10 z-10 bg-white p-5 border rounded-lg min-w-max"
                            >
                                <Calendar
                                    initial={value}
                                    selected={value}
                                    onSelect={(date) => {
                                        selectDate(date);
                                        close();
                                    }}
                                />
                            </Popover.Panel>
                        </>
                    )}
                </Popover>
            </CustomInput>
        );
    }
);

CalendarInput.displayName = "CalendarInput";

export interface HookFormCalendarInputProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>
> extends Omit<ControllerProps<TFieldValues, TName>, "render">,
        Pick<
            CalendarInputProps,
            "label" | "error" | "className" | "disabled" | "allowClear"
        > {}

export const HookFormCalendarInput = <
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>
>({
    label,
    error,
    className,
    disabled,
    allowClear,
    ...rest
}: HookFormCalendarInputProps<TFieldValues, TName>) => (
    <Controller
        {...rest}
        render={({ field: { value, onChange } }) => (
            <CalendarInput
                label={label}
                error={error}
                className={className}
                value={value}
                onChange={onChange}
                disabled={disabled}
                allowClear={allowClear}
            />
        )}
    />
);
