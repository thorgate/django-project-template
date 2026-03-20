import React from "react";
import throttle from "lodash.throttle";
import debounce from "lodash.debounce";
import { useTranslation } from "next-i18next";
import { toast } from "react-toastify";
import clsx from "clsx";

import { TextFilterWidget } from "@components/ListFilter/TextFilterWidget";
import { SelectMultipleFilterWidget } from "@components/ListFilter/SelectMultipleFilterWidget";
import { SelectFilterWidget } from "@components/ListFilter/SelectFilterWidget";
import { Spinner } from "@components/Spinner";

import {
    AnyWidget,
    isCustomComponentWidget,
    isMultipleChoiceWidget,
    isSingleChoiceWidget,
    isTextWidget,
    PageStateDefinition,
    UsePageStateResult,
    WidgetProps,
} from "@lib/hooks/state";

const chooseFilterComponent = <ValueType,>(
    widget: AnyWidget<ValueType>
): React.ComponentType<WidgetProps<ValueType>> => {
    if (isTextWidget(widget)) {
        return TextFilterWidget;
    }
    if (isSingleChoiceWidget(widget)) {
        return SelectFilterWidget;
    }
    if (isMultipleChoiceWidget(widget)) {
        return SelectMultipleFilterWidget;
    }
    if (isCustomComponentWidget(widget)) {
        return widget.component;
    }
    // Fall back to text widget, will fail to work if value is not text
    return TextFilterWidget;
};

export const FilterWidgetWrapper = <
    PageStateType extends object,
    PageStateKey extends keyof PageStateType
>({
    widget,
    pageStateKey,
    pageState,
    setPageState,
}: {
    pageState: PageStateType;
    setPageState: UsePageStateResult<PageStateType>["setPageState"];
    widget: AnyWidget<PageStateType[PageStateKey]>;
    pageStateKey: PageStateKey;
}) => {
    const component = chooseFilterComponent(widget);
    const value = React.useMemo(
        () => pageState[pageStateKey],
        [pageState, pageStateKey]
    );
    const onChange = React.useMemo(() => {
        const onChangeHandler = (newValue: PageStateType[PageStateKey]) => {
            setPageState({
                [pageStateKey]: newValue,
            } as Record<PageStateKey, PageStateType[PageStateKey]> as Partial<PageStateType>);
        };
        const {
            throttle: shouldThrottle = true,
            debounce: shouldDebounce = false,
        } = widget;
        if (shouldDebounce) {
            return debounce(
                onChangeHandler,
                typeof shouldDebounce === "number" ? shouldDebounce : 500,
                {
                    leading: false,
                    trailing: true,
                }
            ) as typeof onChangeHandler;
        }
        if (shouldThrottle) {
            return throttle(
                onChangeHandler,
                typeof shouldThrottle === "number" ? shouldThrottle : 500,
                {
                    leading: false,
                    trailing: true,
                }
            ) as typeof onChangeHandler;
        }
        return onChangeHandler;
    }, [widget, setPageState, pageStateKey]);
    const onReset = React.useCallback(() => {
        setPageState({}, {
            [pageStateKey]: true,
        } as Record<keyof PageStateType, boolean>);
    }, [pageStateKey, setPageState]);

    return (
        <div
            className={clsx("self-stretch ", {
                "w-full sm:w-[300px]": widget.type !== "small",
                "min-w-full sm:min-w-[100px] sm:max-w-[200px]":
                    widget.type === "small",
            })}
        >
            {React.createElement(component, {
                value,
                onChange,
                onReset,
                widget,
            })}
        </div>
    );
};

export interface FiltersetProps<PageStateType extends object> {
    filtersetDefinition: PageStateDefinition<PageStateType>;
    pageState: PageStateType;
    setPageState: UsePageStateResult<PageStateType>["setPageState"];
    isUpdating: boolean;
    children?: React.ReactNode;
}

export const Filterset = <PageStateType extends object>({
    filtersetDefinition,
    pageState,
    setPageState,
    isUpdating,
    children,
}: FiltersetProps<PageStateType>) => {
    const { t } = useTranslation(["common"]);
    const [filtersShown, setFiltersShown] = React.useState(true);
    const toggleFilters = React.useCallback(() => {
        setFiltersShown((prev) => !prev);
    }, []);
    const resetFilters = React.useCallback(() => {
        setPageState({}, true);
    }, [setPageState]);
    const orderedKeys = React.useMemo(
        () =>
            (Object.keys(filtersetDefinition) as (keyof PageStateType)[])
                .filter(
                    (definition) => !!filtersetDefinition[definition]?.widget
                )
                .sort(
                    (a, b) =>
                        (filtersetDefinition[a]?.widget?.index ?? 0) -
                        (filtersetDefinition[b]?.widget?.index ?? 0)
                ),
        [filtersetDefinition]
    );
    const copyLink = React.useCallback(() => {
        void toast.promise(
            navigator.clipboard.writeText(`${window?.location ?? ""}`),
            {
                pending: t("common:labels.copyLinkProgress.pending"),
                error: t("common:labels.copyLinkProgress.error"),
                success: t("common:labels.copyLinkProgress.success"),
            }
        );
    }, [t]);

    return (
        <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-4 lg:pb-0">
            {orderedKeys.length > 0 ? (
                <div className="flex w-full mb-1">
                    <button
                        className="underline text-brand-dark mt-2 ml-5"
                        onClick={toggleFilters}
                    >
                        {filtersShown
                            ? t("common:labels.hideFilters")
                            : t("common:labels.showFilters")}
                    </button>
                    <button
                        className="underline text-brand-dark mt-2 ml-5"
                        onClick={resetFilters}
                    >
                        {t("common:labels.resetFilters")}
                    </button>
                    <button
                        className="underline text-brand-dark mt-2 pl-5 ml-auto self-end"
                        onClick={copyLink}
                    >
                        {t("common:labels.copyLink")}
                    </button>
                </div>
            ) : null}
            {filtersShown ? (
                <div className="flex flex-wrap gap-x-5 gap-y-0 sm:items-center ml-5">
                    {orderedKeys.map((key) => {
                        const { widget } = filtersetDefinition[key];
                        if (!widget) {
                            return null;
                        }
                        return (
                            <FilterWidgetWrapper
                                pageState={pageState}
                                setPageState={setPageState}
                                key={key as string}
                                pageStateKey={key}
                                widget={widget}
                            />
                        );
                    })}
                    {children}
                    {isUpdating ? <Spinner className="w-10 h-10" /> : null}
                </div>
            ) : null}
        </div>
    );
};
