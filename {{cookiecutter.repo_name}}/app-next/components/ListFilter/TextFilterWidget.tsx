import React from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { isTextWidget, WidgetProps } from "@lib/hooks/state";

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
            isTextWidget(widget) &&
                onChange(widget.deserializer(e.target.value));
        },
        [onChange, widget]
    );
    const id = React.useId();

    return (
        <>
            <label
                htmlFor={id}
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
            >
                {widget.label}
            </label>
            <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon
                        className="h-5 w-5 text-brand-dark dark:text-brand-light"
                        aria-hidden="true"
                    />
                </div>
                <div className="mt-2 flex rounded-md shadow-sm">
                    <input
                        type="text"
                        name={id}
                        id={id}
                        className="block w-full rounded-l-md border-0 py-1.5 pl-10 text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-800 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder={
                            (isTextWidget(widget) && widget.placeholder) || ""
                        }
                        onChange={onSearch}
                        defaultValue={currentSearchQuery}
                        ref={inputElement}
                    />
                    <button
                        type="button"
                        className="border-0 relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-2 py-2 text-sm font-semibold ring-1 ring-inset text-black dark:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none bg-white dark:bg-slate-800 ring-slate-300 dark:ring-slate-700"
                        onClick={onReset}
                    >
                        <XMarkIcon className="h-5 w-5 text-gray-400" />
                    </button>
                </div>
            </div>
        </>
    );
};
