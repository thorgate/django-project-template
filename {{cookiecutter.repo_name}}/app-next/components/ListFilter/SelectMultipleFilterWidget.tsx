import React from "react";
import { useTranslation } from "next-i18next";
import { Listbox, Transition } from "@headlessui/react";
import {
    CheckIcon,
    ChevronUpDownIcon,
    XMarkIcon,
} from "@heroicons/react/20/solid";
import clsx from "clsx";
import {
    isMultipleChoiceWidget,
    MultipleChoiceWidget,
    WidgetProps,
} from "@lib/hooks/state";

export const SelectMultipleFilterWidget = <ValueType,>({
    widget,
    onChange: outerOnChange,
    onReset,
    value,
}: WidgetProps<ValueType>) => {
    const { t } = useTranslation("common");
    const { options } = React.useMemo(
        () =>
            isMultipleChoiceWidget(widget)
                ? widget
                : ({
                      options: [],
                      multiple: true,
                  } as MultipleChoiceWidget<ValueType>),
        [widget]
    );
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
            newOptions: {
                value: ValueType extends Array<infer T> ? T : never;
            }[]
        ) => {
            outerOnChange(newOptions.map((o) => o.value) as ValueType);
        },
        [outerOnChange]
    );

    return (
        // TODO: This is pretty much the same as SelectFilter, consider creating a common component
        <Listbox value={selectedOptions} onChange={onChange} multiple={true}>
            {({ open }) => (
                <>
                    <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                        {widget.label}
                    </Listbox.Label>
                    <div className="relative mt-2 flex ">
                        <Listbox.Button className="relative w-full cursor-default rounded-l-md py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset sm:text-sm sm:leading-6 text-black dark:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none bg-white dark:bg-slate-800 ring-slate-300 dark:ring-slate-700">
                            <span className="block truncate">
                                {selectedOptions && selectedOptions.length > 0
                                    ? selectedOptions.map((v, index) => (
                                          <React.Fragment
                                              key={
                                                  v.key ??
                                                  JSON.stringify(v.value)
                                              }
                                          >
                                              {v.label}
                                              {index <
                                              selectedOptions.length - 1
                                                  ? ", "
                                                  : null}
                                          </React.Fragment>
                                      ))
                                    : t("filters.select")}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronUpDownIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                            </span>
                        </Listbox.Button>
                        <Transition
                            show={open}
                            as={React.Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Listbox.Options className="absolute z-10 mt-9 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {options.map((option) => (
                                    <Listbox.Option
                                        key={
                                            option.key ??
                                            JSON.stringify(option.value)
                                        }
                                        className={({ active }) =>
                                            clsx(
                                                active
                                                    ? "bg-indigo-600 text-white"
                                                    : "text-black dark:text-white",
                                                "relative cursor-default select-none py-2 pl-3 pr-9"
                                            )
                                        }
                                        value={option}
                                    >
                                        {({ selected, active }) => (
                                            <>
                                                <span
                                                    className={clsx(
                                                        selected
                                                            ? "font-semibold"
                                                            : "font-normal",
                                                        "block truncate"
                                                    )}
                                                >
                                                    {option.label}
                                                </span>

                                                {selected ? (
                                                    <span
                                                        className={clsx(
                                                            active
                                                                ? "text-white"
                                                                : "text-indigo-600",
                                                            "absolute inset-y-0 right-0 flex items-center pr-4"
                                                        )}
                                                    >
                                                        <CheckIcon
                                                            className="h-5 w-5"
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </Transition>
                        <button
                            type="button"
                            className="border-0 relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-2 py-2 text-sm font-semibold ring-1 ring-inset text-black dark:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none bg-white dark:bg-slate-800 ring-slate-300 dark:ring-slate-700"
                            onClick={onReset}
                        >
                            <XMarkIcon className="h-5 w-5 text-gray-400" />
                        </button>
                    </div>
                </>
            )}
        </Listbox>
    );
};
