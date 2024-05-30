import React from "react";
import { useTranslation } from "next-i18next";
import { Listbox, Transition } from "@headlessui/react";
import {
    CheckIcon,
    ChevronUpDownIcon,
    XMarkIcon,
} from "@heroicons/react/20/solid";
import clsx from "clsx";
import { useRouter } from "next/router";
import {
    ArrayArgItemType,
    BaseQueryArgType,
    ReplaceQueryParametersFunction,
    SelectOption,
    SelectMultipleURLParameterSpecification,
} from "@lib/factories/types";

export interface SelectMultipleFilterProps<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
    UrlParameter extends SelectMultipleURLParameterSpecification<
        QueryArgType,
        QueryArg
    >
> {
    parameter: UrlParameter;
    initial: QueryArgType[QueryArg] | undefined;
    replaceQueryParameter: ReplaceQueryParametersFunction<QueryArgType>;
}
export const SelectMultipleFilter = <
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
    UrlParameter extends SelectMultipleURLParameterSpecification<
        QueryArgType,
        QueryArg
    >
>({
    parameter,
    initial,
    replaceQueryParameter,
}: SelectMultipleFilterProps<QueryArgType, QueryArg, UrlParameter>) => {
    const { t } = useTranslation("common");
    const router = useRouter();

    const initialOptions = React.useMemo<
        SelectOption<ArrayArgItemType<QueryArgType, QueryArg>>[]
    >(() => {
        if (!initial) {
            return [];
        }

        return parameter.options.filter((option) =>
            (
                initial as Array<ArrayArgItemType<QueryArgType, QueryArg>>
            ).includes(option.value)
        );
    }, [parameter.options, initial]);

    const defaultOptions = React.useMemo<
        SelectOption<ArrayArgItemType<QueryArgType, QueryArg>>[]
    >(() => {
        if (!parameter.defaultValue) {
            return [];
        }

        return parameter.options.filter((option) =>
            (
                parameter.defaultValue as Array<
                    ArrayArgItemType<QueryArgType, QueryArg>
                >
            ).includes(option.value)
        );
    }, [parameter.options, parameter.defaultValue]);

    const [selectedOptions, setSelectedOptions] = React.useState<
        SelectOption<ArrayArgItemType<QueryArgType, QueryArg>>[] | undefined
    >(initialOptions);
    React.useEffect(() => {
        setSelectedOptions(initialOptions);
    }, [initialOptions]);

    const onChange = React.useCallback(
        (
            values:
                | SelectOption<ArrayArgItemType<QueryArgType, QueryArg>>[]
                | null
        ) => {
            setSelectedOptions(values || []);
            replaceQueryParameter<QueryArg>({
                parameter,
                value: (values
                    ? values.map((option) => option.value)
                    : []) as QueryArgType[QueryArg],
                router,
            });
        },
        [parameter, router, replaceQueryParameter]
    );

    const onReset = React.useMemo<
        Required<React.InputHTMLAttributes<HTMLButtonElement>>["onClick"]
    >(
        () => () => {
            onChange(defaultOptions);
        },
        [defaultOptions, onChange]
    );

    return (
        // TODO: This is pretty much the same as SelectFilter, consider creating a common component
        <Listbox value={selectedOptions} onChange={onChange} multiple={true}>
            {({ open }) => (
                <>
                    <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                        {parameter.label ?? t("filters.select")}
                    </Listbox.Label>
                    <div className="relative mt-2 flex ">
                        <Listbox.Button className="relative w-full cursor-default rounded-l-md py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset sm:text-sm sm:leading-6 text-black dark:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none bg-white dark:bg-slate-800 ring-slate-300 dark:ring-slate-700">
                            <span className="block truncate">
                                {selectedOptions && selectedOptions.length > 0
                                    ? selectedOptions.map((v, index) => (
                                          <React.Fragment
                                              key={v.key ?? String(v.value)}
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
                                {parameter.options.map((option) => (
                                    <Listbox.Option
                                        key={option.key ?? String(option.value)}
                                        className={({ active }) =>
                                            clsx(
                                                active
                                                    ? "bg-indigo-600 text-white"
                                                    : "text-gray-900 text-black dark:text-white",
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
