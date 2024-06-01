import * as React from "react";
import numeral from "numeral";
import "numeral/locales/et";
import clsx from "clsx";

numeral.locale("et");

export interface NumberProps {
    children: number | string | undefined | null;
    decimalPlaces?: number;
    className?: string;
}

export const makeNumeralNumber = (value: number | string | undefined | null) =>
    numeral(
        String(value ?? "0")
            .replace(".", ",")
            .replace(" ", "")
    );

export const Number: React.FC<NumberProps> = ({
    children: value,
    decimalPlaces = 2,
    className,
}) => {
    const numberFormat = React.useMemo(() => {
        const decimalZeros = "0".repeat(decimalPlaces);
        return `0,0.${decimalZeros}`;
    }, [decimalPlaces]);
    const numeralNumber = React.useMemo(
        () => makeNumeralNumber(value),
        [value]
    );
    const displayValue = React.useMemo(
        () => numeralNumber.format(numberFormat),
        [numeralNumber, numberFormat]
    );

    if (value === null || value === undefined) {
        return null;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return (
        <span
            className={clsx(className, {
                "text-gray-400": numeralNumber.value() == 0,
            })}
        >
            {displayValue}
        </span>
    );
};
