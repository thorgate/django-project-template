import React from "react";

import throttle from "lodash.throttle";
import { TextFilterWidget } from "@components/ListFilter/TextFilterWidget";
import { SelectMultipleFilterWidget } from "@components/ListFilter/SelectMultipleFilterWidget";
import { SelectFilterWidget } from "@components/ListFilter/SelectFilterWidget";
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
        if (widget.throttle !== undefined && !widget.throttle) {
            return onChangeHandler;
        }
        return throttle(
            onChangeHandler,
            typeof widget?.throttle === "number" ? widget.throttle : 500,
            {
                leading: true,
                trailing: true,
            }
        ) as typeof onChangeHandler;
    }, [widget.throttle, setPageState, pageStateKey]);
    const onReset = React.useCallback(() => {
        setPageState({}, {
            [pageStateKey]: true,
        } as Record<keyof PageStateType, boolean>);
    }, [pageStateKey, setPageState]);

    return (
        <div className="mt-3 ml-5 self-stretch min-w-[300px]">
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
}

export const Filterset = <PageStateType extends object>({
    filtersetDefinition,
    pageState,
    setPageState,
}: FiltersetProps<PageStateType>) => {
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

    return (
        <div className="px-4 sm:px-6 lg:px-8 pt-4">
            <div className="flex flex-wrap space-x-5 space-y-3 sm:items-center">
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
            </div>
        </div>
    );
};
