import React from "react";
import { SearchFilter } from "@components/ListFilter/SearchFilter";
import {
    BaseQueryArgType,
    ReplaceQueryParametersFunction,
    ValidURLParameterForItemAndQueryArg,
} from "@lib/factories/types";
import { SelectMultipleFilter } from "@components/ListFilter/SelectMultipleFilter";
import { SelectFilter } from "@components/ListFilter/SelectFilter";

export interface FiltersetProps<QueryArgType extends BaseQueryArgType> {
    parameters: Array<ValidURLParameterForItemAndQueryArg<QueryArgType>>;
    initial: Partial<QueryArgType>;
    replaceQueryParameter: ReplaceQueryParametersFunction<QueryArgType>;
}

export const Filterset = <QueryArgType extends BaseQueryArgType>({
    parameters,
    initial,
    replaceQueryParameter,
}: FiltersetProps<QueryArgType>) => {
    return (
        <div className="px-4 sm:px-6 lg:px-8 pt-4">
            <div className="sm:flex sm:items-center">
                {parameters.map((parameter) => {
                    let filterComponent: React.ReactNode | undefined =
                        undefined;

                    if (parameter.type === "search") {
                        filterComponent = (
                            <SearchFilter
                                parameter={parameter}
                                initial={
                                    initial[parameter.queryArg] as
                                        | QueryArgType[typeof parameter.queryArg]
                                        | undefined
                                }
                                replaceQueryParameter={replaceQueryParameter}
                            />
                        );
                    }

                    if (parameter.type === "select") {
                        filterComponent = (
                            <SelectFilter
                                parameter={parameter}
                                initial={
                                    initial[parameter.queryArg] as
                                        | QueryArgType[typeof parameter.queryArg]
                                        | undefined
                                }
                                replaceQueryParameter={replaceQueryParameter}
                            />
                        );
                    }

                    if (parameter.type === "multi-select") {
                        filterComponent = (
                            <SelectMultipleFilter
                                parameter={parameter}
                                initial={
                                    initial[parameter.queryArg] as
                                        | QueryArgType[typeof parameter.queryArg]
                                        | undefined
                                }
                                replaceQueryParameter={replaceQueryParameter}
                            />
                        );
                    }

                    if (parameter.type === "custom") {
                        filterComponent = (
                            <parameter.widget
                                parameter={parameter}
                                initial={
                                    initial[parameter.queryArg] as
                                        | QueryArgType[typeof parameter.queryArg]
                                        | undefined
                                }
                                replaceQueryParameter={replaceQueryParameter}
                            />
                        );
                    }

                    if (filterComponent) {
                        return (
                            <div
                                key={String(parameter.queryArg)}
                                className="pr-5 basis-1/3 self-stretch"
                            >
                                {filterComponent}
                            </div>
                        );
                    }

                    return null;
                })}
            </div>
        </div>
    );
};
