import * as React from "react";
import { Combobox as HeadlessCombobox } from "@headlessui/react";

import {
    CheckIcon,
    ChevronUpDownIcon,
    XMarkIcon,
} from "@heroicons/react/20/solid";
import clsx from "clsx";
import { ApiSelectOption } from "@lib/factories/types";

export interface ComboboxBodyProps<T> {
    label?: React.ReactNode;
    onSearch: (value: string) => void;
    onClear?: (option?: ApiSelectOption<T>) => void;
    options: ApiSelectOption<T>[];
    selectedOptions: ApiSelectOption<T>[];
    displayValue?: (
        option: ApiSelectOption<T> | ApiSelectOption<T>[]
    ) => string;
    showMore?: React.ReactNode;
    displaySelectedSeparately?: boolean;
    hideSelectedOptionsInList?: boolean;
    allowWrap?: boolean;
    vertical?: boolean;
    disabled?: boolean;
    error?: boolean;
}

const defaultDisplayValue = (
    option: ApiSelectOption<unknown> | ApiSelectOption<unknown>[]
) => {
    const options = Array.isArray(option) ? option : [option];
    return options.map((o) => o?.displayValue || o?.label || "").join(", ");
};

export const ComboboxBody = <T,>({
    label,
    onSearch,
    onClear = undefined,
    options,
    selectedOptions,
    disabled = false,
    showMore = undefined,
    displayValue = defaultDisplayValue,
    allowWrap = true,
    vertical = false,
    displaySelectedSeparately = true,
    hideSelectedOptionsInList = false,
    error = false,
}: ComboboxBodyProps<T>) => {
    const onClearAll = React.useMemo(
        () =>
            onClear
                ? () => {
                      onClear();
                  }
                : undefined,
        [onClear]
    );
    const displayValueForInput = React.useMemo(
        () =>
            displaySelectedSeparately || !displayValue
                ? undefined
                : displayValue,
        [displaySelectedSeparately, displayValue]
    );
    const onInputChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => onSearch(e.target.value),
        [onSearch]
    );

    return (
        <div>
            {label ? (
                <HeadlessCombobox.Label className="block text-sm font-medium leading-6 text-gray-900">
                    {label}
                </HeadlessCombobox.Label>
            ) : null}
            <div className="w-full flex items-stretch mt-1">
                <div className="relative grow w-full">
                    <div
                        className={clsx(
                            "flex w-full border-0 py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset sm:text-sm sm:leading-6",
                            "focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600",
                            !!onClear && "rounded-l-md",
                            !onClear && "rounded-md",
                            allowWrap && "flex-wrap",
                            vertical && "flex-col",
                            disabled && "bg-slate-50 dark:bg-slate-600",
                            !disabled && "bg-white dark:bg-slate-800",
                            error && "ring-red-500",
                            !error && "ring-slate-300 dark:ring-slate-700"
                        )}
                    >
                        {displaySelectedSeparately && selectedOptions.length > 0
                            ? selectedOptions.map((option) => (
                                  <span
                                      className={clsx(
                                          "rounded px-1.5 mb-0.5 mr-1.5 w-max whitespace-nowrap text-sm flex",
                                          "text-black dark:text-white",
                                          "bg-slate-200 dark:bg-slate-600"
                                      )}
                                      key={option.key}
                                  >
                                      {displayValue(option)}
                                      <button
                                          type="button"
                                          className="py-0.5"
                                          onClick={
                                              onClear
                                                  ? () => onClear(option)
                                                  : undefined
                                          }
                                          disabled={disabled}
                                      >
                                          <XMarkIcon className="h-4 w-4 text-gray-400" />
                                      </button>
                                  </span>
                              ))
                            : null}
                        <HeadlessCombobox.Input
                            // Somehow, if disabled and enabled the display value here is lost. We force re-mounting
                            // this component by changing the key every time disabled changes.
                            key={`${disabled}`}
                            className={clsx(
                                "grow border-0 m-0 p-0 ring-0 focus:ring-0 sm:text-sm sm:leading-6 w-full",
                                "text-black dark:text-white",
                                disabled && "bg-slate-50 dark:bg-slate-600",
                                !disabled && "bg-white dark:bg-slate-800"
                            )}
                            onChange={onInputChange}
                            data-testid="combobox-input"
                            displayValue={displayValueForInput}
                        />
                    </div>
                    <HeadlessCombobox.Button
                        className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
                        data-testid="combobox-button"
                        onClick={() => onSearch("")}
                    >
                        <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                        />
                    </HeadlessCombobox.Button>
                    {options.length > 0 || showMore ? (
                        <HeadlessCombobox.Options
                            data-testid="combobox-options"
                            className={clsx(
                                "absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm",
                                disabled && "bg-slate-50 dark:bg-slate-600",
                                !disabled && "bg-white dark:bg-slate-800"
                            )}
                        >
                            {options.map((option) => (
                                <HeadlessCombobox.Option
                                    key={option.key}
                                    value={option}
                                    className={({ active, selected }) =>
                                        clsx(
                                            "relative cursor-default select-none py-2 pl-3 pr-9",
                                            selected &&
                                                hideSelectedOptionsInList &&
                                                "hidden",
                                            active
                                                ? "bg-indigo-600 text-white"
                                                : "text-gray-900 text-black dark:text-white"
                                        )
                                    }
                                >
                                    {({ active, selected }) => (
                                        <>
                                            <span
                                                className={clsx(
                                                    "block truncate",
                                                    selected && "font-semibold"
                                                )}
                                            >
                                                {option.label}
                                            </span>
                                            {selected ? (
                                                <span
                                                    className={clsx(
                                                        "absolute inset-y-0 right-0 flex items-center pr-4",
                                                        active
                                                            ? "text-white"
                                                            : "text-indigo-600"
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
                                </HeadlessCombobox.Option>
                            ))}
                            {showMore ? (
                                <li className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-500">
                                    <span className="block truncate">
                                        {showMore}
                                    </span>
                                </li>
                            ) : null}
                        </HeadlessCombobox.Options>
                    ) : null}
                </div>
                {onClear ? (
                    <div>
                        <button
                            type="button"
                            className={clsx(
                                "h-full relative -ml-px inline-flex items-center rounded-r-md px-2 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 dark:ring-slate-700",
                                "text-black dark:text-white",
                                "focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none",
                                disabled && "bg-slate-50 dark:bg-slate-600",
                                !disabled && "bg-white dark:bg-slate-800",
                                disabled &&
                                    "hover:bg-slate-200 dark:hover:bg-slate-600",
                                !disabled &&
                                    "hover:bg-gray-50 dark:hover:bg-slate-700"
                            )}
                            onClick={onClearAll}
                            disabled={disabled}
                        >
                            <XMarkIcon className="h-5 w-5 text-gray-400" />
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
};
