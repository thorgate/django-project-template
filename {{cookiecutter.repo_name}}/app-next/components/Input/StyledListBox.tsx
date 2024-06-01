import React from "react";
import { Listbox, Transition } from "@headlessui/react";
import clsx from "clsx";
import {
    CheckIcon,
    ChevronUpDownIcon,
    XMarkIcon,
} from "@heroicons/react/20/solid";
import { useTranslation } from "next-i18next";

interface Option<T> {
    value: T;
    label: React.ReactNode;
    key?: string;
}

interface StyledListBoxProps<T> {
    options: Option<T>[];
    selectedOption: Option<T> | null;
    onChange: (option: Option<T>) => void;
    onReset: (event: React.MouseEvent<HTMLButtonElement>) => void;
    label?: React.ReactNode;
    allowClear?: boolean;
    disabled?: boolean;
    error?: boolean;
}

export const StyledListBox = <T,>({
    selectedOption,
    onChange,
    label,
    options,
    onReset,
    allowClear = true,
    disabled = false,
    error = false,
}: StyledListBoxProps<T>) => {
    const { t } = useTranslation("common");

    return (
        <Listbox value={selectedOption} onChange={onChange} disabled={disabled}>
            {({ open }) => (
                <>
                    <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                        {label}
                    </Listbox.Label>
                    <div className="relative mt-2 flex ">
                        <Listbox.Button
                            className={clsx(
                                "relative w-full cursor-default rounded-l-md py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset sm:text-sm sm:leading-6",
                                "text-black dark:text-white",
                                "focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none",
                                disabled && "bg-slate-50 dark:bg-slate-600",
                                !disabled && "bg-white dark:bg-slate-800",
                                error && "ring-red-500",
                                !error && "ring-slate-300 dark:ring-slate-700",
                                !allowClear && "rounded-r-md"
                            )}
                        >
                            <span className="block truncate">
                                {selectedOption?.label ??
                                    t("filters.nothingSelected")}
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
                                                    : "text-gray-900 dark:text-white",
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
                        {allowClear ? (
                            <button
                                type="button"
                                disabled={disabled}
                                className={clsx(
                                    "border-0 relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-2 py-2 text-sm font-semibold ring-1 ring-inset",
                                    "text-black dark:text-white",
                                    "focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none",
                                    disabled && "bg-slate-50 dark:bg-slate-600",
                                    !disabled && "bg-white dark:bg-slate-800",
                                    error && "ring-red-500",
                                    !error &&
                                        "ring-slate-300 dark:ring-slate-700"
                                )}
                                onClick={onReset}
                            >
                                <XMarkIcon className="h-5 w-5 text-gray-400" />
                            </button>
                        ) : null}
                    </div>
                </>
            )}
        </Listbox>
    );
};
