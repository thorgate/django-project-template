import * as React from "react";
import numeral from "numeral";
import clsx from "clsx";

export interface NumberProps {
    children: number | string | undefined | null;
    decimalPlaces?: number;
    className?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
}

export const makeNumeralNumber = (value: number | string | undefined | null) =>
    numeral(
        String(value ?? "0")
            .replace(",", "")
            .replace(/\s+/g, ""),
    );

export const Number: React.FC<NumberProps> = ({
    children: value,
    decimalPlaces = 2,
    className,
    prefix,
    suffix,
}) => {
    const numberFormat = React.useMemo(() => {
        const decimalZeros = "0".repeat(decimalPlaces);
        return `0,0.${decimalZeros}`;
    }, [decimalPlaces]);
    const numeralNumber = React.useMemo(
        () => makeNumeralNumber(value),
        [value],
    );
    const displayValue = React.useMemo(
        () => numeralNumber.format(numberFormat),
        [numeralNumber, numberFormat],
    );

    if (value === null || value === undefined) {
        return null;
    }

    return (
        <span
            className={clsx(className, {
                "text-gray-400": numeralNumber.value() == 0,
            })}
        >
            {prefix ?? null}
            {displayValue}
            {suffix ?? null}
        </span>
    );
};
