import React from "react";

import { useRouter } from "next/router";
import { queriesApi } from "@lib/queries";
import { Pagination } from "@components/Pagination";
import { Filterset } from "@components/ListFilter";
import {
    baseParseQueryParameters,
    defaultURLParameterQuerySerializer,
} from "@lib/factories/util";
import { useExtractNonFieldError } from "@lib/convertError";
import { LoadingState, ErrorState } from "@components/NonIdealState";
import {
    BaseItemType,
    BaseQueryArgType,
    FactoryServerSidePropsFunction,
    ListPageFactoryArguments,
    ReplaceQueryParametersFunction,
    ValidURLParameterForItemAndQueryArg,
} from "@lib/factories/types";

export const pageURLParameterSpecification = {
    type: "page-number",
    queryArg: "pageNumber",
    routeQueryArg: "queryPath",
    querySerializer: (value: unknown) =>
        value === undefined ? [] : [`${value}`],
} as const;

export const defaultPaginatedURLParameters = [
    pageURLParameterSpecification,
] as const;

export const listPageFactory = <
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    UrlParametersType extends Array<
        ValidURLParameterForItemAndQueryArg<QueryArgType>
    >
>({
    retrieveEndpoint,
    parameters,
    ListView,
}: ListPageFactoryArguments<ItemType, QueryArgType, UrlParametersType>): [
    React.FunctionComponent<Record<string, never>>,
    FactoryServerSidePropsFunction
] => {
    const parseQueryParameters = (
        query: ReturnType<typeof useRouter>["query"]
    ) => baseParseQueryParameters(query, parameters);

    const paginationParameters = (parameters || []).filter(
        (parameter) => parameter.type === "page-number"
    );

    const makeReplaceQueryParameter =
        (
            setQueryParameters: React.Dispatch<
                React.SetStateAction<QueryArgType>
            >
        ): ReplaceQueryParametersFunction<QueryArgType> =>
        ({ parameter, value, options, router: currentRouter }) => {
            const shouldResetPagination = !(
                options?.keepPagination || parameter.type === "page-number"
            );

            setQueryParameters((currentQueryParameters) => ({
                ...currentQueryParameters,
                ...(shouldResetPagination
                    ? paginationParameters.reduce(
                          (acc, p) => ({
                              ...acc,
                              [p.queryArg]: p.defaultValue,
                          }),
                          {}
                      )
                    : {}),
                [parameter.queryArg]: value,
            }));
            const routeQueryArg = parameter.routeQueryArg
                ? String(parameter.routeQueryArg)
                : String(parameter.queryArg);
            const newQuery: typeof currentRouter.query = {
                ...currentRouter.query,
                ...(shouldResetPagination
                    ? paginationParameters.reduce(
                          (acc, p) => ({
                              ...acc,
                              [p.routeQueryArg || p.queryArg]: (
                                  p.querySerializer ||
                                  defaultURLParameterQuerySerializer
                              )(undefined),
                          }),
                          {}
                      )
                    : {}),
                [routeQueryArg]: (
                    parameter.querySerializer ||
                    defaultURLParameterQuerySerializer
                )(value),
            };
            if (Array.isArray(value) && Array.isArray(parameter.defaultValue)) {
                // For arrays, compare arrays by value
                if (
                    JSON.stringify([...value].sort()) ===
                    JSON.stringify([...parameter.defaultValue].sort())
                ) {
                    delete newQuery[routeQueryArg];
                }
            } else {
                // Compare to default value, and remove if it matches
                if (value === parameter.defaultValue) {
                    delete newQuery[routeQueryArg];
                }
            }

            currentRouter.push(
                {
                    query: newQuery,
                },
                undefined,
                { shallow: true }
            );
        };

    const ListViewController = () => {
        const router = useRouter();
        const validateAndParseQueryParameters = (
            query: ReturnType<typeof useRouter>["query"]
        ) => {
            const parsedParams = parseQueryParameters(query);

            return Object.entries(parsedParams).reduce((acc, [key, value]) => {
                const parameterDefinition = parameters.find(
                    (param) => param.queryArg === key
                );

                if (
                    !parameterDefinition?.validate ||
                    parameterDefinition.validate(value)
                ) {
                    acc[key as keyof QueryArgType] = value;
                }
                return acc;
            }, {} as QueryArgType);
        };

        const urlQueryParameters = React.useMemo(
            () => validateAndParseQueryParameters(router.query),
            [router]
        );
        const [queryParameters, setQueryParameters] =
            React.useState<QueryArgType>(() => urlQueryParameters);
        React.useEffect(() => {
            setQueryParameters(urlQueryParameters);
        }, [urlQueryParameters]);

        const replaceQueryParameter = React.useMemo(
            () => makeReplaceQueryParameter(setQueryParameters),
            []
        );

        const {
            data,
            error,
            isLoading: isApiLoading,
        } = retrieveEndpoint.useQuery(queryParameters);

        const pageData: ItemType[] = data?.results || [];
        const extractNonFieldError = useExtractNonFieldError();

        if (isApiLoading) {
            return <LoadingState />;
        }
        if (data === undefined) {
            return (
                <ErrorState
                    description={
                        error ? extractNonFieldError(error) : undefined
                    }
                />
            );
        }

        return (
            <div className="pb-24">
                {parameters ? (
                    <Filterset
                        parameters={parameters}
                        initial={urlQueryParameters}
                        replaceQueryParameter={replaceQueryParameter}
                    />
                ) : null}
                <ListView
                    pageData={pageData}
                    parameters={parameters || []}
                    queryParameters={queryParameters}
                    replaceQueryParameter={replaceQueryParameter}
                />
                {/* Normally, we'll only have one pagination type parameter */}
                {parameters
                    ? parameters.map((parameter) => {
                          if (parameter.type !== "page-number") {
                              return null;
                          }

                          return (
                              <Pagination
                                  key={String(parameter.queryArg)}
                                  data={data}
                                  setPageNumber={(value) => {
                                      replaceQueryParameter({
                                          parameter,
                                          value: value as
                                              | QueryArgType[typeof parameter.queryArg]
                                              | undefined,
                                          router,
                                      });
                                  }}
                              />
                          );
                      })
                    : null}
            </div>
        );
    };
    ListViewController.defaultProps = {};

    const getExtraProps: FactoryServerSidePropsFunction = async (
        store,
        context
    ) => {
        const queryParameters = parseQueryParameters(context.query);

        store.dispatch(retrieveEndpoint.initiate(queryParameters));
        await Promise.all(
            store.dispatch(queriesApi.util.getRunningQueriesThunk())
        );

        return {} as Record<string, never>;
    };

    return [ListViewController, getExtraProps];
};
