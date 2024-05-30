import * as React from "react";
import numeral from "numeral";
import "numeral/locales/et";

numeral.locale("et");

export interface NumberProps {
    children: number | string;
    decimalPlaces?: number;
}

export const Number: React.FC<NumberProps> = ({
    children: value,
    decimalPlaces = 2,
}) => {
    const numberFormat = React.useMemo(() => {
        const decimalZeros = "0".repeat(decimalPlaces);
        return `0,0.${decimalZeros}`;
    }, [decimalPlaces]);
    const numeralNumber = React.useMemo(
        () => numeral(String(value).replace(".", ",").replace(" ", "")),
        [value]
    );
    const displayValue = React.useMemo(
        () => numeralNumber.format(numberFormat),
        [numeralNumber, numberFormat]
    );

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{displayValue}</>;
};
