import * as React from "react";
import clsx from "clsx";
import { Popover, Transition } from "@headlessui/react";
import { format } from "date-fns";
import { ForwardedRef, forwardRef } from "react";

import { XMarkIcon } from "@heroicons/react/20/solid";
import { useTranslation } from "next-i18next";
import { useDateFnsLocale } from "@components/Text";
import {
    Calendar,
    stringToCalendarDay,
    zeroPadCalendarNumber,
} from "@components/Calendar";
import { inputClassNames } from "@components/Input/style";
import { InputWrapper } from "@components/Input/InputWrapper";

export interface CalendarInputProps
    extends Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        "onChange" | "disabled" | "value"
    > {
    label?: React.ReactNode;
    error?: string;
    value?: string;
    disabled?: boolean;
    onChange?: (date: string) => void;
    onClear?: () => void;
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
            error,
            label,
            value: initialValue,
            onChange,
            className,
            disabled,
            onClear,
            ...rest
        }: CalendarInputProps,
        ref: ForwardedRef<HTMLInputElement>,
    ) => {
        const { t } = useTranslation("common");
        const locale = useDateFnsLocale();
        const [value, setValue] = React.useState<CalendarDay | undefined>(
            stringToCalendarDay(initialValue),
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
                { locale },
            );
        }, [value, locale]);
        const selectDate = React.useCallback(
            (newValue: CalendarDay) => {
                if (onChange) {
                    onChange(
                        `${newValue.year}-${zeroPadCalendarNumber(
                            newValue.month,
                        )}-${zeroPadCalendarNumber(newValue.day)}`,
                    );
                }
                setValue(newValue);
            },
            [onChange],
        );

        return (
            <InputWrapper label={label} error={error}>
                {({ id }) => (
                    <Popover
                        className={clsx("relative w-full flex", className)}
                    >
                        {({ close }) => (
                            <div className="relative w-full group">
                                <div
                                    className={inputClassNames({
                                        error: Boolean(error),
                                        disabled,
                                        className: "flex p-0",
                                        padding: false,
                                    })}
                                >
                                    <Popover.Button
                                        disabled={disabled}
                                        className="grow outline-none"
                                    >
                                        <input
                                            {...rest}
                                            type="text"
                                            ref={ref}
                                            id={id}
                                            className={inputClassNames({
                                                error: Boolean(error),
                                                disabled,
                                                className:
                                                    "w-full ring-0 focus:ring-0 rounded-l-md m-[2px] pl-3 pr-[calc(0.25rem-2px)] py-[calc(0.5rem-2px)] outline-none",
                                                rounded: false,
                                                margin: false,
                                                padding: false,
                                                ring: false,
                                            })}
                                            readOnly
                                            value={valueString}
                                        />
                                    </Popover.Button>
                                    {onClear ? (
                                        <button
                                            type="button"
                                            onClick={onClear}
                                            disabled={disabled}
                                            tabIndex={-1}
                                            className="clear-button"
                                            aria-label={t("labels.clear")}
                                        >
                                            <XMarkIcon className="clear-button-icon" />
                                        </button>
                                    ) : null}
                                </div>
                                <Transition
                                    as={React.Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <Popover.Panel
                                        focus
                                        className={clsx(
                                            "absolute z-[999] min-w-[300px] -mt-5 p-3 rounded-md text-base shadow-lg ring-1 ring-brand-dark ring-opacity-5 focus:outline-none sm:text-sm",
                                            disabled &&
                                                "bg-brand-disabled-light",
                                            !disabled && "bg-white",
                                        )}
                                        aria-label={t("labels.calendar")}
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
                                </Transition>
                            </div>
                        )}
                    </Popover>
                )}
            </InputWrapper>
        );
    },
);

CalendarInput.displayName = "CalendarInput";
