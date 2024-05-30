import React from "react";
import { format } from "date-fns";
import { enIE, et } from "date-fns/locale";
import { useTranslation } from "next-i18next";

export interface DateTimeProps {
    children: string | Date;
    time?: boolean;
    date?: boolean;
    locale?: string;
    timeZone?: string;
}

// en-IE uses D/M/Y format and is in english, so it is somewhat suitable for international use in Europe for dates
export const defaultLocale = "en-IE";
export const defaultTimezone = "Europe/Tallinn";
export const languageLocaleMap = {
    en: "en-IE",
    et: "et-EE",
} as Record<string, string>;
export const languageLocaleMapDateFns = {
    en: enIE,
    et: et,
} as Record<string, typeof enIE | typeof et>;
export const defaultDateFnsLocale = enIE;

const defaultDateOptions: Intl.DateTimeFormatOptions = {
    weekday: undefined,
    era: undefined,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
};

const defaultTimeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
};

export const DateTime = ({
    children,
    time = true,
    date = true,
    locale: localeOverride,
    timeZone = defaultTimezone,
}: DateTimeProps) => {
    const { i18n } = useTranslation();
    const value = React.useMemo(
        () => (typeof children === "string" ? new Date(children) : children),
        [children]
    );
    const locale = React.useMemo(
        () =>
            localeOverride || languageLocaleMap[i18n.language] || defaultLocale,
        [localeOverride, i18n]
    );

    if (time && date) {
        /* Sadly, it seems that server side and client side format for datetime strings
         * differs for Estonian (for example, in google chrome, date and time are separated by `,` while
         * on server side there is no `,`. To avoid different rendering in SSR and locally, construct date
         * and time from separate components. */
        return (
            <time dateTime={value.toISOString()}>
                {value.toLocaleDateString(locale, {
                    ...defaultDateOptions,
                    timeZone,
                })}{" "}
                {value.toLocaleTimeString(locale, {
                    ...defaultTimeOptions,
                    timeZone,
                })}
            </time>
        );
    }

    if (time) {
        return (
            <time dateTime={value.toISOString()}>
                {value.toLocaleTimeString(locale, {
                    ...defaultTimeOptions,
                    timeZone,
                })}
            </time>
        );
    }

    if (date) {
        return (
            <time dateTime={value.toISOString()}>
                {value.toLocaleDateString(locale, {
                    ...defaultDateOptions,
                    timeZone,
                })}
            </time>
        );
    }

    return null;
};

export interface MonthNameProps {
    month: number;
    locale?: typeof enIE | typeof et;
}

const capitalizeFirstLetter = (s: string): string => {
    return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
};

export const useDateFnsLocale = (
    localeOverride: typeof enIE | typeof et | undefined = undefined
): typeof enIE | typeof et => {
    const { i18n } = useTranslation();
    const locale = React.useMemo(
        () =>
            localeOverride ||
            languageLocaleMapDateFns[i18n.language] ||
            defaultDateFnsLocale,
        [localeOverride, i18n]
    );
    return locale;
};

export const MonthName: React.FunctionComponent<MonthNameProps> = ({
    month,
    locale: localeOverride,
}) => {
    const locale = useDateFnsLocale(localeOverride);
    const date = React.useMemo(() => new Date(1970, month - 1, 1), [month]);

    return <>{capitalizeFirstLetter(format(date, "LLLL", { locale }))}</>;
};

export interface WeekDayName {
    day: number;
    format?: "short" | "shorter" | "long";
    locale?: typeof enIE | typeof et;
}

const weekDayFormatMap = {
    short: "EEEEEE",
    shorter: "EEEEE",
    long: "EEEE",
};

export const WeekDayName: React.FunctionComponent<WeekDayName> = ({
    day,
    locale: localeOverride,
    format: nameFormat = "short",
}) => {
    const locale = useDateFnsLocale(localeOverride);
    // 2018 started on a Monday
    const date = React.useMemo(() => new Date(2018, 0, day), [day]);

    return (
        <>
            {capitalizeFirstLetter(
                format(date, weekDayFormatMap[nameFormat], {
                    locale,
                })
            )}
        </>
    );
};
