import React from "react";

import { WidgetProps } from "@lib/hooks/state";
import { CalendarInput } from "@components/Input";

export const serializeDate = (date: Date): string => {
    const year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(
        date,
    );
    const month = new Intl.DateTimeFormat("en", { month: "2-digit" }).format(
        date,
    );
    const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
    return `${year}-${month}-${day}`;
};

export const monthStart = (date?: Date) => {
    if (!date) {
        date = new Date();
    }
    return serializeDate(new Date(date.getFullYear(), date.getMonth(), 1));
};
export const monthEnd = (date?: Date) => {
    if (!date) {
        date = new Date();
    }
    return serializeDate(
        new Date(
            date.getFullYear() + Math.floor((date.getMonth() + 1) / 12),
            (date.getMonth() + 1) % 12,
            0,
        ),
    );
};
export const previousMonthStart = (date?: Date) => {
    if (!date) {
        date = new Date();
    }
    return serializeDate(
        new Date(
            date.getFullYear() - Math.floor((date.getMonth() - 1) / 12),
            (date.getMonth() - 1 + 12) % 12,
            1,
        ),
    );
};
export const previousMonthEnd = (date?: Date) => {
    if (!date) {
        date = new Date();
    }
    return serializeDate(new Date(date.getFullYear(), date.getMonth(), 0));
};

export const SelectDateWidget: React.FC<
    WidgetProps<string | null> & {
        displayValueIfNull?: () => string;
    }
> = ({ widget, value, onChange, onReset, displayValueIfNull }) => {
    const valueOrDefault = React.useMemo(
        () => value ?? displayValueIfNull?.() ?? serializeDate(new Date()),
        [displayValueIfNull, value],
    );
    const id = React.useId();

    return (
        <CalendarInput
            value={valueOrDefault}
            onChange={onChange}
            onClear={onReset}
            id={id}
            label={widget.label}
        />
    );
};

export const SelectStartDateWidget: React.FC<WidgetProps<string | null>> = (
    props,
) => <SelectDateWidget {...props} displayValueIfNull={previousMonthStart} />;

export const SelectEndDateWidget: React.FC<WidgetProps<string | null>> = (
    props,
) => <SelectDateWidget {...props} displayValueIfNull={previousMonthEnd} />;
