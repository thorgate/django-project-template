import React from "react";
import { useRouter } from "next/router";
import { baseParseQueryParameters } from "@lib/factories/util";
import { queriesApi } from "@lib/queries";

import { LoadingState, ErrorState } from "@components/NonIdealState";
import { useExtractNonFieldError } from "@lib/convertError";
import {
    BaseItemType,
    BaseQueryArgType,
    DetailPageFactoryArguments,
    FactoryServerSidePropsFunction,
    HiddenURLParameterSpecification,
} from "@lib/factories/types";

export const detailPageFactory = <
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    ParametersType extends Array<
        HiddenURLParameterSpecification<QueryArgType, keyof QueryArgType>
    >
>({
    queryEndpoint,
    queryParameters,
    DetailView,
}: DetailPageFactoryArguments<ItemType, QueryArgType, ParametersType>): [
    React.FunctionComponent<Record<string, never>>,
    FactoryServerSidePropsFunction
] => {
    const parseQueryParameters = (
        query: ReturnType<typeof useRouter>["query"]
    ) => baseParseQueryParameters<QueryArgType>(query, queryParameters);

    const DetailViewController = () => {
        const router = useRouter();
        const extractNonFieldError = useExtractNonFieldError();
        const urlQueryParameters = React.useMemo(
            () => parseQueryParameters?.(router.query),
            [router.query]
        );

        const {
            data = undefined,
            isLoading: isApiLoading = false,
            error = undefined,
        } = queryEndpoint && urlQueryParameters
            ? queryEndpoint.useQuery(urlQueryParameters)
            : {};

        if (isApiLoading) {
            return <LoadingState />;
        }

        return data !== undefined ? (
            <DetailView data={data} />
        ) : (
            <ErrorState
                description={error ? extractNonFieldError(error) : undefined}
            />
        );
    };

    const getExtraProps: FactoryServerSidePropsFunction = async (
        store,
        context
    ) => {
        const queryParameters = parseQueryParameters(context.query);
        if (queryEndpoint && queryParameters) {
            store.dispatch(queryEndpoint.initiate(queryParameters));
            await Promise.all(
                store.dispatch(queriesApi.util.getRunningQueriesThunk())
            );
        }

        return {} as Record<string, never>;
    };

    return [DetailViewController, getExtraProps];
};
