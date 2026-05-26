import React from "react";

import { ApiEndpointQuery } from "@reduxjs/toolkit/dist/query/core/module";
import { EndpointDefinitions } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import { QueryHooks } from "@reduxjs/toolkit/dist/query/react/buildHooks";

import { queriesApi } from "@lib/queries";
import { useExtractNonFieldError } from "@lib/convertError";
import { LoadingState, ErrorState } from "@components/NonIdealState";

import {
    BaseItemType,
    BaseQueryArgType,
    FactoryServerSidePropsFunction,
    ListViewProps,
    RetrieveQueryDefinition,
} from "@lib/factories/types";
import {
    apiStateFromPageState,
    PageStateDefinitionWithAPIInfo,
    pageStateFromQueryParameters,
    useApiState,
    usePageState,
} from "@lib/hooks/state";
import { Pagination } from "@components/Pagination";
import { Filterset } from "@components/ListFilter";

export interface PaginatedPageState {
    pageNumber: number;
}

export const paginationState = {
    pageNumber: {
        defaultValue: 1,
        isPagination: true,
        api: {
            key: "pageNumber",
        },
        url: {
            key: "queryPath",
            serializer: (v: number) => (v ? [`${v}`] : []),
            deserializer: (v: string[]) => (v.length ? parseInt(v[0], 10) : 1),
        },
    },
} as const;

export const listPageFactory = <
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    PageStateType extends object
>({
    retrieveEndpoint,
    extraQueryArgument,
    pageStateDefinition,
    ListView,
}: {
    retrieveEndpoint: ApiEndpointQuery<
        RetrieveQueryDefinition<ItemType, QueryArgType>,
        EndpointDefinitions
    > &
        QueryHooks<RetrieveQueryDefinition<ItemType, QueryArgType>>;
    extraQueryArgument: QueryArgType;
    pageStateDefinition: PageStateDefinitionWithAPIInfo<
        PageStateType,
        QueryArgType
    >;
    ListView: React.ComponentType<ListViewProps<ItemType, PageStateType>>;
}): [
    React.FunctionComponent<Record<string, never>>,
    FactoryServerSidePropsFunction
] => {
    const paginationKeys = (
        Object.keys(
            pageStateDefinition
        ) as (keyof PageStateDefinitionWithAPIInfo<
            PageStateType,
            QueryArgType
        >)[]
    ).filter((k) => pageStateDefinition[k].isPagination);

    // Only allow pagination to work with exactly one pagination parameter
    const paginationKey =
        paginationKeys?.length === 1 ? paginationKeys[0] : undefined;

    const ListViewController = () => {
        const { pageState, setPageState } = usePageState(pageStateDefinition);
        const queryArg = useApiState(pageStateDefinition, {
            pageState,
            unmanagedApiState: extraQueryArgument,
        });

        const setPageNumber = React.useMemo(
            () =>
                paginationKey
                    ? (pageNumber: number | undefined) => {
                          setPageState({
                              [paginationKey]: pageNumber,
                          } as Partial<PageStateType>);
                      }
                    : undefined,
            [setPageState]
        );

        const {
            data,
            error,
            isLoading: isApiLoading,
        } = retrieveEndpoint.useQuery(queryArg);

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
                <Filterset
                    filtersetDefinition={pageStateDefinition}
                    pageState={pageState}
                    setPageState={setPageState}
                />
                <ListView
                    pageData={pageData}
                    pageState={pageState}
                    setPageState={setPageState}
                />
                {/* Normally, we'll only have one pagination type parameter */}
                {setPageNumber ? (
                    <Pagination data={data} setPageNumber={setPageNumber} />
                ) : null}
            </div>
        );
    };
    ListViewController.defaultProps = {};

    const getExtraProps: FactoryServerSidePropsFunction = async (
        store,
        context
    ) => {
        const pageState = pageStateFromQueryParameters(
            pageStateDefinition,
            context.query
        );
        const queryArgument = apiStateFromPageState(pageStateDefinition, {
            pageState,
            unmanagedApiState: extraQueryArgument,
        });

        store.dispatch(retrieveEndpoint.initiate(queryArgument));
        await Promise.all(
            store.dispatch(queriesApi.util.getRunningQueriesThunk())
        );

        return {} as Record<string, never>;
    };

    return [ListViewController, getExtraProps];
};
