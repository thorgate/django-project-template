import * as React from "react";
import { useTranslation } from "next-i18next";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { addDays, addMonths } from "date-fns";

import { MonthName, WeekDayName } from "@components/Text";

interface CalendarDay {
    year: number;
    day: number;
    month: number;
}

export const stringToCalendarDay = (
    dateString: string | undefined,
): CalendarDay | undefined => {
    if (dateString === undefined) {
        return undefined;
    }
    const date = new Date(dateString);
    if (
        Number.isNaN(date.getDate()) ||
        Number.isNaN(date.getMonth()) ||
        Number.isNaN(date.getFullYear())
    ) {
        return undefined;
    }

    return {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
    };
};

export interface CalendarProps {
    initial?: {
        month: number;
        year: number;
    };
    selected?:
        | {
              year: number;
              day: number;
              month: number;
          }
        | string;
    onSelect?: (day: { year: number; day: number; month: number }) => void;
    scrollButtons?: boolean;
}

export const zeroPadCalendarNumber = (value: number) =>
    value.toString().padStart(2, "0");

interface CalendarDayWithMeta {
    date: CalendarDay;
    isoFormat: string;
    isToday?: boolean;
    isCurrentMonth?: boolean;
    isSelected?: boolean;
}

export const Calendar = ({
    initial,
    selected: rawSelected,
    onSelect,
    scrollButtons = true,
}: CalendarProps) => {
    const { t } = useTranslation(["common"]);
    const selected = React.useMemo(() => {
        if (typeof rawSelected === "string") {
            return stringToCalendarDay(rawSelected);
        }
        return rawSelected;
    }, [rawSelected]);
    const today = React.useMemo(() => {
        const today = new Date();
        return {
            year: today.getFullYear(),
            month: today.getMonth() + 1,
            day: today.getDate(),
        };
    }, []);
    const [month, setMonth] = React.useState<{ month: number; year: number }>(
        initial ?? {
            month: today.month,
            year: today.year,
        },
    );

    const changeMonth = React.useCallback((offset: number) => {
        setMonth((currentMonth) => {
            let newMonth = currentMonth.month + offset;
            let newYear = currentMonth.year;
            while (newMonth > 12) {
                newMonth -= 12;
                newYear += 1;
            }
            while (newMonth < 1) {
                newMonth += 12;
                newYear -= 1;
            }
            return {
                month: newMonth,
                year: newYear,
            };
        });
    }, []);
    const onNextMonth = React.useCallback(() => {
        changeMonth(1);
    }, [changeMonth]);
    const onPreviousMonth = React.useCallback(() => {
        changeMonth(-1);
    }, [changeMonth]);
    const days = React.useMemo<CalendarDayWithMeta[]>(() => {
        const result: CalendarDayWithMeta[] = [];
        const monthStart = new Date(
            `${month.year}-${zeroPadCalendarNumber(month.month)}-01`,
        );

        const monthEnd = addDays(addMonths(monthStart, 1), -1);

        const calendarStart = addDays(
            monthStart,
            -(monthStart.getDay() + 6) % 7,
        );
        let extraDays = 7 - monthEnd.getDay();
        if (extraDays === 7) {
            extraDays = 0;
        }
        const calendarEnd = addDays(monthEnd, extraDays);
        for (
            let date = new Date(calendarStart);
            date <= calendarEnd;
            date.setDate(date.getDate() + 1)
        ) {
            result.push({
                date: {
                    day: date.getDate(),
                    month: date.getMonth() + 1,
                    year: date.getFullYear(),
                },
                isoFormat: `${date.getFullYear()}-${
                    date.getMonth() + 1
                }-${date.getDate()}`,
                isCurrentMonth: date.getMonth() + 1 === month.month,
                isToday:
                    date.getMonth() + 1 == today.month &&
                    date.getDate() === today.day &&
                    date.getFullYear() === today.year,
                isSelected:
                    selected &&
                    date.getMonth() + 1 == selected.month &&
                    date.getDate() === selected.day &&
                    date.getFullYear() === selected.year,
            });
        }
        return result;
    }, [month, today, selected]);

    return (
        <div className="mt-10 text-center lg:col-start-8 lg:col-end-13 lg:row-start-1 lg:mt-9 xl:col-start-9">
            <div className="flex items-center text-gray-900 dark:text-gray-100">
                {scrollButtons ? (
                    <button
                        type="button"
                        onClick={onPreviousMonth}
                        className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-brand-primary"
                    >
                        <span className="sr-only">
                            {t("calendar.nextMonth")}
                        </span>
                        <ChevronLeftIcon
                            className="h-5 w-5"
                            aria-hidden="true"
                        />
                    </button>
                ) : null}
                <div className="flex-auto text-sm font-semibold text-brand-dark">
                    <MonthName month={month.month} /> {month.year}
                </div>
                {scrollButtons ? (
                    <button
                        type="button"
                        onClick={onNextMonth}
                        className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-brand-primary"
                    >
                        <span className="sr-only">
                            {t("calendar.previousMonth")}
                        </span>
                        <ChevronRightIcon
                            className="h-5 w-5"
                            aria-hidden="true"
                        />
                    </button>
                ) : null}
            </div>
            <div className="mt-6 grid grid-cols-7 text-xs leading-6 text-brand-light">
                <div>
                    <WeekDayName day={1} />
                </div>
                <div>
                    <WeekDayName day={2} />
                </div>
                <div>
                    <WeekDayName day={3} />
                </div>
                <div>
                    <WeekDayName day={4} />
                </div>
                <div>
                    <WeekDayName day={5} />
                </div>
                <div>
                    <WeekDayName day={6} />
                </div>
                <div>
                    <WeekDayName day={0} />
                </div>
            </div>
            <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-md bg-brand-disabled-light ring-brand-disabled-light text-sm shadow ring-1 ">
                {days.map((day, dayIdx) => (
                    <button
                        key={day.isoFormat}
                        type="button"
                        className={clsx(
                            "py-1.5 hover:bg-brand-bg-highlight focus:z-10",
                            day.isCurrentMonth
                                ? "bg-white"
                                : "bg-brand-disabled-light",
                            (day.isSelected || day.isToday) && "font-semibold",
                            day.isSelected && "text-white ",
                            !day.isSelected &&
                                day.isCurrentMonth &&
                                !day.isToday &&
                                "text-brand-dark",
                            !day.isSelected &&
                                !day.isCurrentMonth &&
                                !day.isToday &&
                                "text-brand-disabled-dark",
                            day.isToday &&
                                !day.isSelected &&
                                "text-brand-light",
                            dayIdx === 0 && "rounded-tl-md",
                            dayIdx === 6 && "rounded-tr-md",
                            dayIdx === days.length - 7 && "rounded-bl-md",
                            dayIdx === days.length - 1 && "rounded-br-md",
                        )}
                        onClick={
                            onSelect ? () => onSelect(day.date) : undefined
                        }
                    >
                        <time
                            dateTime={day.isoFormat}
                            className={clsx(
                                "mx-auto flex h-7 w-7 items-center justify-center rounded-full",
                                day.isSelected &&
                                    day.isToday &&
                                    "bg-brand-light",
                                day.isSelected &&
                                    !day.isToday &&
                                    "bg-brand-dark ",
                            )}
                        >
                            {day.date.day}
                        </time>
                    </button>
                ))}
            </div>
        </div>
    );
};
