import { ParsedUrlQuery } from "querystring";
import React from "react";

import {
    ApiEndpointQuery,
    QueryDefinition,
    MutationDefinition,
    ApiEndpointMutation,
    Api,
    CoreModule,
} from "@reduxjs/toolkit/query";
import {
    TypedUseQuery,
    TypedUseQueryState,
    TypedUseQuerySubscription,
    TypedUseLazyQuery,
    TypedUseLazyQuerySubscription,
    TypedUseMutation,
} from "@reduxjs/toolkit/dist/query/react";

import { useRouter } from "next/router";
import { GetServerSidePropsContext, PreviewData } from "next/types";
import { baseQuery } from "@lib/queries/baseQueriesApi";
import { AppStore } from "@lib/store";
import { UsePageStateResult } from "@lib/hooks/state";
import { queriesApi } from "@lib/queries";
import { ApiSelectOptionWithoutValue } from "@lib/factories/ApiSelectFactory";

export interface ListQueryPageOnlyResult {
    totalCount?: number;
    next?: { pageNumber?: number; pageSize?: number } | null;
    previous?: { pageNumber?: number; pageSize?: number } | null;
    current?: { pageNumber?: number; pageSize?: number } | null;
}
export interface ListQueryResult<ItemType> extends ListQueryPageOnlyResult {
    results: ItemType[];
}
export type BaseQuery = typeof baseQuery;
export type API = typeof queriesApi;
export type Definitions =
    API extends Api<BaseQuery, infer D, string, string, CoreModule> ? D : never;

export type APIQuery<QueryArgType, QueryResultType> = Extract<
    API["endpoints"][keyof API["endpoints"]],
    ApiEndpointQuery<
        QueryDefinition<QueryArgType, BaseQuery, string, QueryResultType>,
        Definitions
    > & {
        useQuery: TypedUseQuery<QueryResultType, QueryArgType, BaseQuery>;
        useQueryState: TypedUseQueryState<
            QueryResultType,
            QueryArgType,
            BaseQuery
        >;
        useQuerySubscription: TypedUseQuerySubscription<
            QueryResultType,
            QueryArgType,
            BaseQuery
        >;
        useLazyQuery: TypedUseLazyQuery<
            QueryResultType,
            QueryArgType,
            BaseQuery
        >;
        useLazyQuerySubscription: TypedUseLazyQuerySubscription<
            QueryResultType,
            QueryArgType,
            BaseQuery
        >;
    }
>;
export type APIMutation<QueryArgType, QueryResultType> = Extract<
    API["endpoints"][keyof API["endpoints"]],
    ApiEndpointMutation<
        MutationDefinition<QueryArgType, BaseQuery, string, QueryResultType>,
        Definitions
    > & {
        useMutation: TypedUseMutation<QueryResultType, QueryArgType, BaseQuery>;
    }
>;

export type BaseItemType = object;
export type BaseQueryArgType = object;

export type ReplaceQueryParametersFunction<
    QueryArgType extends BaseQueryArgType,
    QueryArgBase = unknown,
> = <
    QueryArg extends keyof QueryArgType & QueryArgBase,
>({}: ReplaceQueryParametersOptions<
    QueryArgType,
    QueryArg,
    URLParameterSpecification<QueryArgType, QueryArg>
>) => void;

export type ValidURLParameterForItemAndQueryArg<
    QueryArgType extends BaseQueryArgType,
> = {
    [QueryArg in keyof QueryArgType]: URLParameterSpecification<
        QueryArgType,
        QueryArg
    >;
}[keyof QueryArgType];

export interface ListViewProps<
    ItemType extends BaseItemType,
    PageStateType extends object,
> {
    pageData: ItemType[];
    pageState: PageStateType;
    setPageState: UsePageStateResult<PageStateType>["setPageState"];
    isUpdating: boolean;
}

export interface BaseURLParameterSpecificationForList<
    QueryArgType extends BaseQueryArgType,
    ValueType = unknown,
> {
    type: string;
    queryArg: keyof QueryArgType;
    // How this parameter will be presented in the URL handled by next router
    routeQueryArg?: string;
    placeholder?: string;
    label?: React.ReactNode;
    defaultValue?: ValueType;
    queryExtractor?: (queryValues: Array<string>) => ValueType;
    querySerializer?: (value: ValueType | undefined) => Array<string>;
    validate?: (value: string) => boolean;
}

interface BaseURLParameterSpecification<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
> extends BaseURLParameterSpecificationForList<
        QueryArgType,
        QueryArgType[QueryArg]
    > {
    // The argument for RTKq query
    queryArg: QueryArg;
    // How this parameter will be presented in the URL handled by next router
    defaultValue?: QueryArgType[QueryArg];
    queryExtractor?: (queryValues: Array<string>) => QueryArgType[QueryArg];
    querySerializer?: (
        value: QueryArgType[QueryArg] | undefined,
    ) => Array<string>;
}

export interface HiddenURLParameterSpecification<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
> extends BaseURLParameterSpecification<QueryArgType, QueryArg> {
    type: "hidden";
}

export interface CustomFilterWidgetProps<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
    UrlParameter extends CustomWidgetURLParameterSpecification<
        QueryArgType,
        QueryArg
    >,
> {
    parameter: UrlParameter;
    initial: QueryArgType[QueryArg] | undefined;
    replaceQueryParameter: ReplaceQueryParametersFunction<QueryArgType>;
}

export interface CustomWidgetURLParameterSpecification<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
> extends BaseURLParameterSpecification<QueryArgType, QueryArg> {
    type: "custom";
    widget: React.ComponentType<
        CustomFilterWidgetProps<
            QueryArgType,
            QueryArg,
            CustomWidgetURLParameterSpecification<QueryArgType, QueryArg>
        >
    >;
    validate?: (value: string) => boolean;
}

export interface PageNumberURLParameterSpecification<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
> extends BaseURLParameterSpecification<QueryArgType, QueryArg> {
    type: "page-number";
}

export interface SearchURLParameterSpecification<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
> extends BaseURLParameterSpecification<QueryArgType, QueryArg> {
    type: "search";
    throttleWaitTime?: number;
}

export interface SelectOption<ValueType> {
    label: React.ReactNode;
    value: ValueType;
    key?: string;
}

export interface SelectURLParameterSpecification<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
> extends BaseURLParameterSpecification<QueryArgType, QueryArg> {
    type: "select";
    options: Array<SelectOption<QueryArgType[QueryArg]>>;
}

export type ArrayArgItemType<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
> = QueryArgType[QueryArg] extends Array<infer ItemType> | undefined
    ? ItemType
    : never;

export interface SelectMultipleURLParameterSpecification<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
> extends BaseURLParameterSpecificationForList<
        QueryArgType,
        QueryArgType[QueryArg]
    > {
    type: "multi-select";
    options: Array<SelectOption<ArrayArgItemType<QueryArgType, QueryArg>>>;
    // The argument for RTKq query
    queryArg: QueryArg;
    // How this parameter will be presented in the URL handled by next router
    defaultValue?: QueryArgType[QueryArg];
    queryExtractor?: (queryValues: Array<string>) => QueryArgType[QueryArg];
    querySerializer?: (
        value: QueryArgType[QueryArg] | undefined,
    ) => Array<string>;
}

export type URLParameterSpecification<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
> =
    | HiddenURLParameterSpecification<QueryArgType, QueryArg>
    | CustomWidgetURLParameterSpecification<QueryArgType, QueryArg>
    | PageNumberURLParameterSpecification<QueryArgType, QueryArg>
    | SearchURLParameterSpecification<QueryArgType, QueryArg>
    | SelectURLParameterSpecification<QueryArgType, QueryArg>
    | SelectMultipleURLParameterSpecification<QueryArgType, QueryArg>;

export interface ReplaceQueryParametersOptions<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
    Parameter extends URLParameterSpecification<QueryArgType, QueryArg>,
> {
    parameter: Parameter;
    value: QueryArgType[QueryArg] | undefined;
    options?: { keepPagination?: boolean };
    router: ReturnType<typeof useRouter>;
}

export type DetailRetrieveQuery<
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
> = QueryDefinition<QueryArgType, typeof baseQuery, string, ItemType>;

export interface DetailQueryParameter<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
> {
    queryArg: QueryArg;
    routeQueryArg?: string;
    defaultValue?: QueryArgType[QueryArg];
    queryValueExtractor?: (
        queryValues: Array<string>,
    ) => QueryArgType[QueryArg];
}

export interface DetailViewProps<ItemType extends BaseItemType> {
    data: ItemType;
}

export type TypeFromQueryEndpoint<Endpoint> =
    Endpoint extends APIQuery<
        infer QueryArgType extends BaseQueryArgType,
        infer ResultType extends BaseItemType
    >
        ? { result: ResultType; arg: QueryArgType }
        : never;

export type DetailViewPropsFromEndpoint<
    Endpoint extends API["endpoints"][keyof API["endpoints"]],
> = DetailViewProps<TypeFromQueryEndpoint<Endpoint>["result"]>;

export type FactoryServerSidePropsFunction = (
    store: AppStore,
    context: Pick<
        GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
        "query"
    >,
) => Promise<Record<string, never>>;

export interface ApiSelectOption<T> extends ApiSelectOptionWithoutValue {
    value: T;
}

export interface BaseHookFormFactoryArguments<
    ItemType extends BaseItemType,
    InitialQueryArgType extends BaseQueryArgType,
    ValueType,
> {
    initialValueRetrieveEndpoint: APIQuery<InitialQueryArgType, ItemType>;
    getInitialValueQueryArgs: (initialValue: ValueType) => InitialQueryArgType;
    valueToKey?: (value: ValueType) => string;
}
