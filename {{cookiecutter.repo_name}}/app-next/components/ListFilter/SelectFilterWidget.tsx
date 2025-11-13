import React from "react";
import {
    BaseQueryArgType,
    ReplaceQueryParametersFunction,
    SelectURLParameterSpecification,
} from "@lib/factories/types";
import { Listbox } from "@components/Input";
import {
    isSingleChoiceWidget,
    SingleChoiceWidget,
    WidgetProps,
} from "@lib/hooks/state";

export interface SelectFilterProps<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
    UrlParameter extends SelectURLParameterSpecification<
        QueryArgType,
        QueryArg
    >,
> {
    parameter: UrlParameter;
    initial: QueryArgType[QueryArg] | undefined;
    replaceQueryParameter: ReplaceQueryParametersFunction<QueryArgType>;
}

export const SelectFilterWidget = <ValueType,>({
    widget,
    onChange: outerOnChange,
    onReset,
    value,
}: WidgetProps<ValueType>) => {
    const options = React.useMemo<
        { key: string; label: React.ReactNode; value: ValueType }[]
    >(() => {
        const { options: providedOptions } = isSingleChoiceWidget(widget)
            ? widget
            : ({ options: [] } satisfies SingleChoiceWidget<ValueType>);
        return providedOptions.map((option) => ({
            ...option,
            key: option.key ?? `${option.value}`,
        }));
    }, [widget]);
    const selectedOption = React.useMemo(
        () =>
            options.find((option) => option.value === value) ??
            options[0] ?? { key: "null", label: "" },
        [options, value],
    );
    const onChange = React.useCallback(
        (option: { value: ValueType } | { value: ValueType }[]) => {
            if (Array.isArray(option)) {
                outerOnChange(option[0].value);
                return;
            }
            outerOnChange(option.value);
        },
        [outerOnChange],
    );

    return (
        <Listbox
            onChange={onChange}
            value={selectedOption}
            by="key"
            onClear={onReset}
            options={options}
            label={widget.label}
        />
    );
};
