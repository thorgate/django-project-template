import React from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid";
import throttle from "lodash.throttle";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import {
    BaseQueryArgType,
    ReplaceQueryParametersFunction,
    SearchURLParameterSpecification,
} from "@lib/factories/types";

export interface SearchFilterProps<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
    UrlParameter extends SearchURLParameterSpecification<QueryArgType, QueryArg>
> {
    parameter: UrlParameter;
    initial: QueryArgType[QueryArg] | undefined;
    replaceQueryParameter: ReplaceQueryParametersFunction<QueryArgType>;
}

export const SearchFilter = <
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
    UrlParameter extends SearchURLParameterSpecification<QueryArgType, QueryArg>
>({
    parameter,
    initial,
    replaceQueryParameter,
}: SearchFilterProps<QueryArgType, QueryArg, UrlParameter>) => {
    const { t } = useTranslation("common");
    const router = useRouter();

    const initialSearchQuery = React.useMemo(
        () => `${initial}` || "",
        [initial]
    );
    const inputElement = React.useRef<HTMLInputElement | null>(null);
    React.useEffect(() => {
        if (inputElement.current) {
            inputElement.current.value = initialSearchQuery;
        }
    }, [initialSearchQuery]);
    const throttledReplaceQueryParameter = React.useMemo(
        () =>
            throttle(replaceQueryParameter, parameter.throttleWaitTime || 500, {
                leading: true,
                trailing: true,
            }) as typeof replaceQueryParameter,
        [replaceQueryParameter, parameter.throttleWaitTime]
    );

    const onSearch = React.useMemo<
        Required<React.InputHTMLAttributes<HTMLInputElement>>["onChange"]
    >(
        () => (e) => {
            throttledReplaceQueryParameter({
                parameter,
                value: e.target.value as QueryArgType[QueryArg],
                router,
            });
        },
        [throttledReplaceQueryParameter, parameter, router]
    );

    const onReset = React.useMemo<
        Required<React.InputHTMLAttributes<HTMLButtonElement>>["onClick"]
    >(
        () => () => {
            throttledReplaceQueryParameter({
                parameter,
                value: parameter.defaultValue,
                router,
            });
            if (inputElement.current) {
                inputElement.current.value = parameter.defaultValue
                    ? `${parameter.defaultValue}`
                    : "";
            }
        },
        [throttledReplaceQueryParameter, parameter, router]
    );

    return (
        <>
            <label
                htmlFor={`search-filter-${parameter.queryArg as string}`}
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
            >
                {parameter.label ?? t("filters.search")}
            </label>
            <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon
                        className="h-5 w-5 text-gray-400 dark:text-gray-600"
                        aria-hidden="true"
                    />
                </div>
                <div className="mt-2 flex rounded-md shadow-sm">
                    <input
                        type="text"
                        name={`search-filter-${parameter.queryArg as string}`}
                        id={`search-filter-${parameter.queryArg as string}`}
                        className="block w-full rounded-l-md border-0 py-1.5 pl-10 text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-800 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="you@example.com"
                        onChange={onSearch}
                        defaultValue={initialSearchQuery}
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
