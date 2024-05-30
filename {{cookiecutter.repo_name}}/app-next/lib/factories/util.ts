import { useRouter } from "next/router";
import {
    BaseQueryArgType,
    URLParameterSpecification,
} from "@lib/factories/types";

export const defaultURLParameterQueryExtractor = (
    queryValues: Array<string>
): string => queryValues.join(",");

export const defaultURLParameterQuerySerializer = (
    value: unknown
): string[] => [`${value}`];

export const booleanQueryParameterExtractor = (value: string[]) => {
    const firstValue: string | undefined = value[0]?.toLowerCase();

    if (firstValue === "true") {
        return true;
    }

    if (firstValue === "false") {
        return false;
    }

    return undefined;
};

export const makeArrayQueryParameterExtractor =
    <T>(
        childExtractor: (value: string[]) => T | undefined
    ): ((value: string[]) => T[] | undefined) =>
    (value: string[]) => {
        if (value.length === 0) {
            return undefined;
        }

        const results: T[] = [];
        value.forEach((item: string) =>
            item.split(",").forEach((subItem) => {
                const convertedSubItem = childExtractor([subItem]);
                if (convertedSubItem !== undefined) {
                    results.push(convertedSubItem);
                }
            })
        );

        return results;
    };

export const stringArrayQueryParameterExtractor =
    makeArrayQueryParameterExtractor(defaultURLParameterQueryExtractor);

export const booleanArrayQueryParameterExtractor =
    makeArrayQueryParameterExtractor(booleanQueryParameterExtractor);

export const normalizeQueryValue = (
    value: string | string[] | undefined
): string[] | undefined =>
    (value && typeof value !== "string" && value) ||
    (value !== undefined && [value]) ||
    undefined;

export const baseParseQueryParameters = <QueryArgType extends BaseQueryArgType>(
    query: ReturnType<typeof useRouter>["query"],
    parameters:
        | Array<URLParameterSpecification<QueryArgType, keyof QueryArgType>>
        | undefined
): QueryArgType => {
    /* This function is used internally in list and detail view factories to parse parameters from URL based on
     * specification passed into the view factory and into query parameters for respective endpoint. It handles
     * default values based on parameter specification as well. */

    const resultingQueryArguments = {} as Partial<QueryArgType>;

    if (parameters) {
        parameters.forEach((parameter) => {
            const routeQueryArg = String(
                parameter.routeQueryArg ?? parameter.queryArg
            );

            // Take all values for this parameter from URL
            const values: Array<string> | undefined = normalizeQueryValue(
                query[routeQueryArg]
            );

            // Use explicitly provided extractor function to convert array of strings coming from URL parameters
            // into proper value for this RTK query argument. If no extractor function is provided, use default
            // one, naively assuming that passing a single string to RTK query argument will work out.
            const extractorFn =
                parameter.queryExtractor ??
                (defaultURLParameterQueryExtractor as unknown as (
                    values: Array<string>
                ) => QueryArgType[typeof parameter.queryArg]);

            const convertedValue:
                | QueryArgType[typeof parameter.queryArg]
                | undefined =
                values !== undefined
                    ? extractorFn(values)
                    : parameter.defaultValue;

            if (convertedValue !== undefined) {
                resultingQueryArguments[parameter.queryArg] = convertedValue;
            }
        });
    }

    // Assume that the resulting query arguments form complete set and are enough to form full argument for RTK query.
    // While it is possible to make typescript to check for parameters to be exhaustive, it is not practical at this
    // point
    return resultingQueryArguments as QueryArgType;
};
