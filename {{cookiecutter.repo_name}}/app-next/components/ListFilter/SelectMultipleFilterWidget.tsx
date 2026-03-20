import React from "react";

import {
    isMultipleChoiceWidget,
    MultipleChoiceWidget,
    WidgetProps,
} from "@lib/hooks/state";
import { Listbox } from "@components/Input";

export const SelectMultipleFilterWidget = <ValueType,>({
    widget,
    onChange: outerOnChange,
    onReset,
    value,
}: WidgetProps<ValueType>) => {
    const options = React.useMemo<
        {
            key: string;
            label: React.ReactNode;
            value: ValueType extends Array<infer T> ? T : never;
        }[]
    >(() => {
        const { options: providedOptions } = isMultipleChoiceWidget(widget)
            ? widget
            : ({
                  options: [],
                  multiple: true,
              } satisfies MultipleChoiceWidget<ValueType>);
        return providedOptions.map((option) => ({
            ...option,
            key: option.key ?? `${option.value}`,
        }));
    }, [widget]);
    const selectedOptions = React.useMemo(
        () =>
            options.filter(
                (option) =>
                    Array.isArray(value) &&
                    value.find((v) => v === option.value) !== undefined
            ),
        [options, value]
    );
    const onChange = React.useCallback(
        (
            newOptions:
                | {
                      value: ValueType extends Array<infer T> ? T : never;
                  }[]
                | {
                      value: ValueType extends Array<infer T> ? T : never;
                  }
        ) => {
            const newValues = (
                Array.isArray(newOptions) ? newOptions : [newOptions]
            ).map((option) => option.value);
            outerOnChange(newValues as ValueType);
        },
        [outerOnChange]
    );

    return (
        <Listbox
            onChange={onChange}
            value={selectedOptions}
            by="key"
            onClear={onReset}
            options={options}
            label={widget.label}
            multiple
            selectedOptionsDisplayLimit={2}
        />
    );
};
