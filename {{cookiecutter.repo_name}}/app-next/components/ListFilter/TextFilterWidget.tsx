import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { isTextWidget, WidgetProps } from "@lib/hooks/state";
import { Input } from "@components/Input";

export const TextFilterWidget = <ValueType,>({
    widget,
    onChange,
    onReset,
    value,
}: WidgetProps<ValueType>) => {
    const Icon = React.useMemo(
        () => widget.icon ?? MagnifyingGlassIcon,
        [widget]
    );
    const currentSearchQuery = React.useMemo(
        () =>
            isTextWidget(widget) && widget.serializer
                ? widget.serializer(value)
                : `${value}`,
        [widget, value]
    );
    const inputElement = React.useRef<HTMLInputElement | null>(null);
    React.useEffect(() => {
        if (inputElement.current) {
            inputElement.current.value = currentSearchQuery;
        }
    }, [currentSearchQuery]);

    const onSearch = React.useMemo<
        Required<React.InputHTMLAttributes<HTMLInputElement>>["onChange"]
    >(
        () => (e) => {
            if (isTextWidget(widget)) {
                onChange(widget.deserializer(e.target.value));
            }
        },
        [onChange, widget]
    );
    const extraInputProps = React.useMemo(
        () => (isTextWidget(widget) && widget.inputProps) || {},
        [widget]
    );

    return (
        <Input
            label={widget.label}
            Icon={Icon}
            onClear={onReset}
            onChange={onSearch}
            defaultValue={currentSearchQuery}
            ref={inputElement}
            autoComplete="off"
            {...extraInputProps}
        />
    );
};
