import * as React from "react";
import {
    Combobox as HeadlessCombobox,
    ComboboxInput,
    ComboboxButton,
    ComboboxOption,
    ComboboxOptions,
    Transition,
} from "@headlessui/react";

import {
    CheckIcon,
    ChevronUpDownIcon,
    XMarkIcon,
} from "@heroicons/react/20/solid";
import clsx from "clsx";
import { useTranslation } from "next-i18next";
import { InputWrapper } from "../InputWrapper";
import { inputClassNames } from "../style";
import { ComboboxValues } from "./ComboboxValues";
import { isRecord } from "@lib/convertError";

export interface BaseComboboxOption {
    key: string;
    label: React.ReactNode;
}

const extractString = (obj: unknown): string => {
    if (typeof obj === "string") return obj;
    else if (React.isValidElement(obj)) {
        if (isRecord(obj.props) && Array.isArray(obj.props.children)) {
            return obj.props.children
                .map((child: unknown) => extractString(child))
                .join("");
        }
        if (isRecord(obj.props)) {
            return extractString(obj.props.children);
        }
        return obj.toString();
    } else return "";
};

export const defaultFilterFn = (
    option: BaseComboboxOption,
    search: string
): boolean => {
    if (search === "") {
        return true;
    }
    if (!option.label) {
        return option.key.toLowerCase().includes(search.toLowerCase());
    }
    return extractString(option.label)
        .toLowerCase()
        .includes(search.toLowerCase());
};
export const noOpFilterFn = () => true;

export type ComboboxBodyProps<T extends BaseComboboxOption> = {
    label?: React.ReactNode;
    /* onSearch is called evey time input changes, so that option provider can perform some effects based on that
     * (like running API queries) */
    onSearch?: (value: string) => void;
    /* filterFn is applied to list of options to only show relevant ones based on the current search */
    filterFn?: (option: T, search: string) => boolean;
    onClear?: () => void;
    children?: React.ReactNode;
    options: T[];
    error?: string;
    disabled?: boolean;
    value?: T | T[] | null;
    selectedOptionsDisplayLimit?: number;
    noResetOnSelect?: boolean;
    noResetToFirstOnSearch?: boolean;
    /* Option reordering mode
     * `search` - if search query is entered, search results on top, then selected options.
     * `selected` - selected options on top, then search results.
     * `none` - options are ordered as they are provided, missing options that are selected are added to the top.
     * */
    topOptions?: "search" | "selected" | "none";
};

export const ComboboxBody = <T extends BaseComboboxOption>({
    label,
    onSearch = undefined,
    filterFn,
    onClear = undefined,
    children = undefined,
    options: providedOptions,
    error = undefined,
    disabled = false,
    value,
    selectedOptionsDisplayLimit,
    noResetOnSelect = false,
    noResetToFirstOnSearch = false,
    topOptions = "selected",
}: ComboboxBodyProps<T>) => {
    const { t } = useTranslation("common");
    const [searchQuery, setSearchQuery] = React.useState("");
    const onInputChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(e.target.value);
            if (onSearch) {
                onSearch(e.target.value);
            }
        },
        [onSearch]
    );
    const inputRef = React.useRef<HTMLInputElement>(null);

    /* Reset the input value every time new value is selected. This allows the user to instantly start typing again
     * to search for another item. */
    React.useEffect(() => {
        if (!noResetOnSelect) {
            setSearchQuery("");
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
        if (inputRef.current) {
            inputRef.current.blur();
        }
    }, [value, noResetOnSelect]);

    const options = React.useMemo<T[]>(() => {
        const selectedOptions = Array.isArray(value)
            ? value
            : value
            ? [value]
            : [];
        const selectedKeys = selectedOptions.map((option) => option.key);
        const nonSelectedOptions = providedOptions.filter(
            (option) => !selectedKeys.includes(option.key)
        );
        /* This ensures that selected options are always in the same order -
        regardless if they are still in provided options or not -
        and that they are always on top of the list, and that they are
        always included.
        */
        const combinedOptions = [...selectedOptions, ...nonSelectedOptions];

        const filteredOptions = combinedOptions.filter((option) =>
            (
                filterFn ??
                (onSearch === undefined ? defaultFilterFn : noOpFilterFn)
            )(option, searchQuery)
        );
        const filteredKeys = filteredOptions.map((option) => option.key);
        const filteredAndSelectedOptions = combinedOptions.filter(
            (option) =>
                selectedKeys.includes(option.key) ||
                filteredKeys.includes(option.key)
        );

        if (topOptions === "none") {
            return filteredAndSelectedOptions;
        }

        if (
            topOptions === "selected" ||
            (topOptions === "search" && searchQuery === "")
        ) {
            return [
                ...filteredAndSelectedOptions.filter((option) =>
                    selectedKeys.includes(option.key)
                ),
                ...filteredAndSelectedOptions.filter(
                    (option) => !selectedKeys.includes(option.key)
                ),
            ];
        }
        return [
            ...filteredAndSelectedOptions.filter((option) =>
                filteredKeys.includes(option.key)
            ),
            ...filteredAndSelectedOptions.filter(
                (option) => !filteredKeys.includes(option.key)
            ),
        ];
    }, [providedOptions, value, topOptions, searchQuery, filterFn, onSearch]);

    /* Handle selecting 1st element on option list change */
    const optionKeys = React.useMemo(
        () => options.map((option) => option.key).join(),
        [options]
    );

    const onInputKeyDown = React.useCallback<
        React.KeyboardEventHandler<HTMLInputElement>
    >((e) => {
        if (e.key === "Escape" && inputRef.current) {
            inputRef.current.blur();
        }
    }, []);

    return (
        <InputWrapper
            label={label}
            error={error}
            LabelComponent={HeadlessCombobox.Label}
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
                        <ComboboxValues
                            value={value}
                            htmlFor={id}
                            limit={selectedOptionsDisplayLimit}
                            className="block py-2 pl-3 mr-0 text-nowrap text-ellipsis overflow-hidden grow group-focus-within:hidden"
                        />
                        <ComboboxInput
                            className={inputClassNames({
                                error: Boolean(error),
                                disabled,
                                className:
                                    "focus:grow group-focus-within:grow group-focus-within:pl-3 w-0 ring-0 focus:ring-0 rounded-l-md m-[2px] px-[calc(0.25rem-2px)] py-[calc(0.5rem-2px)]",
                                rounded: false,
                                margin: false,
                                padding: false,
                                ring: false,
                            })}
                            onChange={onInputChange}
                            onKeyDown={onInputKeyDown}
                            ref={inputRef}
                            autoComplete="off"
                        />
                        <ComboboxButton
                            className="text-brand-primary mx-1 group-focus-within:my-[2px] my-[1px] p-0"
                            onClick={() =>
                                onSearch?.(inputRef?.current?.value ?? "")
                            }
                            id={id}
                        >
                            <ChevronUpDownIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                            />
                        </ComboboxButton>
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
                            <ComboboxOptions
                                className={clsx(
                                    "absolute z-[999] -mt-5 max-h-[320px] w-full overflow-auto rounded-md text-base shadow-lg ring-1 ring-brand-dark ring-opacity-5 focus:outline-none sm:text-sm",
                                    disabled && "bg-brand-disabled-light",
                                    !disabled && "bg-white"
                                )}
                                /* Re-mounting the whole component due to key change will cause the focus to move to 1st
                                 * checked item (or 1st item if none are checked) */
                                key={
                                    noResetToFirstOnSearch
                                        ? "options"
                                        : optionKeys
                                }
                            >
                                {options.map((option) => (
                                    <ComboboxOption
                                        key={option.key}
                                        value={option}
                                        className={({ focus }) =>
                                            clsx(
                                                "relative cursor-default select-none py-2 pl-3 pr-9",
                                                focus
                                                    ? "bg-brand-primary text-white"
                                                    : "text-brand-dark bg-white"
                                            )
                                        }
                                    >
                                        {({ focus, selected }) => (
                                            <>
                                                <span
                                                    className={clsx(
                                                        "block truncate",
                                                        selected &&
                                                            "font-semibold"
                                                    )}
                                                >
                                                    {option.label}
                                                </span>
                                                {selected ? (
                                                    <span
                                                        className={clsx(
                                                            "absolute inset-y-0 right-0 flex items-center pr-4",
                                                            focus
                                                                ? "text-white"
                                                                : "text-brand-primary"
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
                                    </ComboboxOption>
                                ))}
                                {children ? (
                                    <li className="py-1 px-3">{children}</li>
                                ) : null}
                            </ComboboxOptions>
                        </Transition>
                    ) : null}
                </div>
            )}
        </InputWrapper>
    );
};
