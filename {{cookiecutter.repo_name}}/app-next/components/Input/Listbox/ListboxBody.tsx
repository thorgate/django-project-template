import * as React from "react";
import clsx from "clsx";
import { Listbox as HeadlessListbox, Transition } from "@headlessui/react";
import {
    CheckIcon,
    ChevronUpDownIcon,
    XMarkIcon,
} from "@heroicons/react/20/solid";
import { useTranslation } from "next-i18next";
import { InputWrapper } from "@components/Input/InputWrapper";
import { inputClassNames } from "@components/Input/style";
import { ComboboxValues } from "@components/Input/Combobox/ComboboxValues";

export interface BaseListboxOption {
    key: string;
    label: React.ReactNode;
}

export type ListboxBodyProps<T extends BaseListboxOption> = {
    label?: React.ReactNode;
    onClear?: () => void;
    children?: React.ReactNode;
    options: T[];
    error?: string;
    disabled?: boolean;
    value?: T | T[];
    selectedOptionsDisplayLimit?: number;
};

export const ListboxBody = <T extends BaseListboxOption>({
    label,
    onClear,
    children,
    options,
    error,
    disabled,
    value,
    selectedOptionsDisplayLimit,
}: ListboxBodyProps<T>) => {
    const { t } = useTranslation("common");

    return (
        <InputWrapper
            label={label}
            error={error}
            LabelComponent={HeadlessListbox.Label}
        >
            {({ id }) => (
                <div className="relative w-full group">
                    <div
                        className={inputClassNames({
                            error: Boolean(error),
                            disabled,
                            className: "flex p-0",
                            padding: false,
                        })}
                    >
                        <HeadlessListbox.Button
                            className={inputClassNames({
                                error: Boolean(error),
                                disabled,
                                className:
                                    "grid grid-cols-[1fr,20px] grow ring-0 focus:ring-0 rounded-l-md m-[2px] px-[calc(0.25rem-2px)] py-[calc(0.5rem-2px)] outline-none rounded-md",
                                rounded: false,
                                margin: false,
                                padding: false,
                                ring: false,
                            })}
                        >
                            <ComboboxValues
                                value={value}
                                htmlFor={id}
                                limit={selectedOptionsDisplayLimit}
                                className="inline-block pl-3 text-left mr-0 text-nowrap text-ellipsis overflow-hidden "
                            />
                            <ChevronUpDownIcon
                                className="h-5 w-5 text-brand-primary rounded-md"
                                aria-hidden="true"
                            />
                        </HeadlessListbox.Button>
                        {onClear ? (
                            <button
                                type="button"
                                onClick={onClear}
                                disabled={disabled}
                                tabIndex={-1}
                                className="clear-button"
                                aria-label={t("labels.clear")}
                            >
                                <XMarkIcon className="clear-button-icon" />
                            </button>
                        ) : null}
                    </div>
                    {options.length > 0 || Boolean(children) ? (
                        <Transition
                            as={React.Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <HeadlessListbox.Options
                                className={clsx(
                                    "absolute z-[999] -mt-5 max-h-[320px] w-full overflow-auto rounded-md text-base shadow-lg ring-1 ring-brand-dark ring-opacity-5 focus:outline-none sm:text-sm",
                                    disabled && "bg-brand-disabled-light",
                                    !disabled && "bg-white",
                                )}
                            >
                                {options.map((option) => (
                                    <HeadlessListbox.Option
                                        key={option.key}
                                        value={option}
                                        className={({ active }) =>
                                            clsx(
                                                "relative cursor-default select-none py-2 pl-3 pr-9",
                                                active
                                                    ? "bg-brand-primary text-white"
                                                    : "text-brand-dark bg-white",
                                            )
                                        }
                                    >
                                        {({ active, selected }) => (
                                            <>
                                                <span
                                                    className={clsx(
                                                        "block truncate",
                                                        selected &&
                                                            "font-semibold",
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
                                                                : "text-brand-primary",
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
                                    </HeadlessListbox.Option>
                                ))}
                                {children ? (
                                    <li className="py-1 px-3">{children}</li>
                                ) : null}
                            </HeadlessListbox.Options>
                        </Transition>
                    ) : null}
                </div>
            )}
        </InputWrapper>
    );
};
