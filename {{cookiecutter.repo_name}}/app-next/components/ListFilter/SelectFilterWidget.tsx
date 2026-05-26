import React from "react";
import {
    BaseQueryArgType,
    ReplaceQueryParametersFunction,
    SelectURLParameterSpecification,
} from "@lib/factories/types";
import { StyledListBox } from "@components/Input/StyledListBox";
import {
    isSingleChoiceWidget,
    SingleChoiceWidget,
    WidgetProps,
} from "@lib/hooks/state";

export interface SelectFilterProps<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
    UrlParameter extends SelectURLParameterSpecification<QueryArgType, QueryArg>
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
    const { options } = React.useMemo(
        () =>
            isSingleChoiceWidget(widget)
                ? widget
                : ({ options: [] } as SingleChoiceWidget<ValueType>),
        [widget]
    );
    const selectedOption = React.useMemo(
        () => options.find((option) => option.value === value) ?? null,
        [options, value]
    );
    const onChange = React.useCallback(
        (option: { value: ValueType }) => {
            outerOnChange(option.value);
        },
        [outerOnChange]
    );

    return (
        <StyledListBox
            selectedOption={selectedOption}
            onChange={onChange}
            onReset={onReset}
            options={options}
            label={widget.label}
        />
    );
};
