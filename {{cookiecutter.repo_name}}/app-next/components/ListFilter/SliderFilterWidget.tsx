import * as React from "react";
import { HashtagIcon } from "@heroicons/react/20/solid";
import { WidgetProps } from "@lib/hooks/state";
import { Input } from "@components/Input";

export const SliderFilterWidget = ({
    widget,
    onChange: outerOnChange,
    onReset,
    value,
    min,
    max,
    step,
}: WidgetProps<number> & { min: number; max: number; step?: number }) => {
    const Icon = React.useMemo(() => widget.icon ?? HashtagIcon, [widget]);
    const inputElement = React.useRef<HTMLInputElement | null>(null);
    React.useEffect(() => {
        if (inputElement.current) {
            inputElement.current.value = `${value}`;
        }
    }, [value]);

    const onChange = React.useCallback<
        React.ChangeEventHandler<HTMLInputElement>
    >(
        (e) => {
            outerOnChange(parseFloat(e.target.value));
        },
        [outerOnChange],
    );

    return (
        <Input
            label={widget.label}
            Icon={Icon}
            onClear={onReset}
            onChange={onChange}
            defaultValue={value}
            ref={inputElement}
            autoComplete="off"
            type="range"
            min={min}
            max={max}
            step={step}
            className="h-8"
        />
    );
};

export const makeSliderFilterWidget = (configuration: {
    min: number;
    max: number;
    step?: number;
}): React.FC<WidgetProps<number>> => {
    const Widget = (props: WidgetProps<number>) => (
        <SliderFilterWidget {...props} {...configuration} />
    );
    Widget.displayName = "SliderFilterWidget";
    return Widget;
};
