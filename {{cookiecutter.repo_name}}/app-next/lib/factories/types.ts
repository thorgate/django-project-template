import React from "react";

import {
    ApiEndpointQuery,
    EndpointDefinitions,
    QueryDefinition,
} from "@reduxjs/toolkit/query";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next/types";
import {
    ControllerProps,
    FieldPath,
    FieldValues,
} from "react-hook-form/dist/types";
import {
    TypedUseLazyQuery,
    TypedUseQuery,
    TypedUseQueryState,
} from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@lib/queries/baseQueriesApi";
import { CustomFilterWidgetProps } from "@components/ListFilter/types";
import { AppStore } from "@lib/store";
import { UsePageStateResult } from "@lib/hooks/state";

export type QueryHooks<Definition> = Definition extends QueryDefinition<
    infer QueryArg,
    typeof baseQuery,
    string,
    infer ResultType
>
    ? {
          useQuery: TypedUseQuery<ResultType, QueryArg, typeof baseQuery>;
          useLazyQuery: TypedUseLazyQuery<
              ResultType,
              QueryArg,
              typeof baseQuery
          >;
          useQueryState: TypedUseQueryState<
              ResultType,
              QueryArg,
              typeof baseQuery
          >;
      }
    : never;

export interface RetrieveQueryPageOnlyResult {
    totalCount?: number;
    next?: { pageNumber?: number; pageSize?: number } | null;
    previous?: { pageNumber?: number; pageSize?: number } | null;
    current?: { pageNumber?: number; pageSize?: number } | null;
}
export interface RetrieveQueryResult<ItemType>
    extends RetrieveQueryPageOnlyResult {
    results: ItemType[];
}

export type BaseItemType = object;
export type BaseQueryArgType = object;

export type RetrieveQueryDefinition<
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType
> = QueryDefinition<
    QueryArgType,
    typeof baseQuery,
    string,
    RetrieveQueryResult<ItemType>
>;

export type ReplaceQueryParametersFunction<
    QueryArgType extends BaseQueryArgType,
    QueryArgBase = unknown
> = <
    QueryArg extends keyof QueryArgType & QueryArgBase
>({}: ReplaceQueryParametersOptions<
    QueryArgType,
    QueryArg,
    URLParameterSpecification<QueryArgType, QueryArg>
>) => void;

export interface ListViewProps<
    ItemType extends BaseItemType,
    PageStateType extends object
> {
    pageData: ItemType[];
    pageState: PageStateType;
    setPageState: UsePageStateResult<PageStateType>["setPageState"];
    isUpdating: boolean;
}

export type QueryDefinitionFromEndpoint<Endpoint> = Endpoint extends QueryHooks<
    infer QueryDefinitionType
>
    ? QueryDefinitionType extends RetrieveQueryDefinition<
          infer ItemType,
          infer QueryArgType
      >
        ? ItemType extends BaseItemType
            ? QueryArgType extends BaseQueryArgType
                ? QueryDefinitionType
                : never
            : never
        : never
    : never;

export interface BaseURLParameterSpecificationForList<
    QueryArgType extends BaseQueryArgType,
    ValueType = unknown
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
    QueryArg extends keyof QueryArgType
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
        value: QueryArgType[QueryArg] | undefined
    ) => Array<string>;
}

export interface HiddenURLParameterSpecification<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType
> extends BaseURLParameterSpecification<QueryArgType, QueryArg> {
    type: "hidden";
}

export interface CustomWidgetURLParameterSpecification<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType
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
    QueryArg extends keyof QueryArgType
> extends BaseURLParameterSpecification<QueryArgType, QueryArg> {
    type: "page-number";
}

export interface SearchURLParameterSpecification<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType
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
    QueryArg extends keyof QueryArgType
> extends BaseURLParameterSpecification<QueryArgType, QueryArg> {
    type: "select";
    options: Array<SelectOption<QueryArgType[QueryArg]>>;
}

export type ArrayArgItemType<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType
> = QueryArgType[QueryArg] extends Array<infer ItemType> | undefined
    ? ItemType
    : never;

export interface SelectMultipleURLParameterSpecification<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType
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
        value: QueryArgType[QueryArg] | undefined
    ) => Array<string>;
}

export type URLParameterSpecification<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType
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
    Parameter extends URLParameterSpecification<QueryArgType, QueryArg>
> {
    parameter: Parameter;
    value: QueryArgType[QueryArg] | undefined;
    options?: { keepPagination?: boolean };
    router: ReturnType<typeof useRouter>;
}

export interface ApiSelectOptionWithoutValue {
    label: string;
    /* Key is used as react key, and for the form values, and must be unique string.*/
    key: string;
    /* Display value is rendered in the search box once option is selected, and ideally should be same as the value
     * used for searching the API or option list. Falls back to label. */
    displayValue?: string | undefined;
    needsRefreshFromApi?: boolean;
}

export interface ApiSelectOption<T> extends ApiSelectOptionWithoutValue {
    value: T;
}

export interface BaseApiSelectFactoryArguments<
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    ValueType
> {
    retrieveEndpoint: ApiEndpointQuery<
        RetrieveQueryDefinition<ItemType, QueryArgType>,
        EndpointDefinitions
    > &
        QueryHooks<RetrieveQueryDefinition<ItemType, QueryArgType>>;
    getSearchQueryArgs: (query: string) => Partial<QueryArgType>;
    getOptionForItem: (item: ItemType) => ApiSelectOption<ValueType>;
    throttleWaitTime?: number;
    displayName?: string;
}

export interface ApiSelectFactoryArguments<
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    ValueType
> extends BaseApiSelectFactoryArguments<ItemType, QueryArgType, ValueType> {
    filterByInitialValueOnInitialOpen?: boolean;
}

export type ApiSelectMultipleFactoryArguments<
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    ValueType
> = BaseApiSelectFactoryArguments<ItemType, QueryArgType, ValueType>;

export interface BaseApiSelectProps<QueryArgType> {
    getSearchQueryArgs?: (query: string) => Partial<QueryArgType>;
    label?: React.ReactNode;
    loadingInitialValue?: boolean;
    testId?: string;
    className?: string;
    disabled?: boolean;
}

export interface ApiSelectProps<T, QueryArgType>
    extends BaseApiSelectProps<QueryArgType> {
    value?: ApiSelectOption<T> | null;
    onChange: (chosenOption: ApiSelectOption<T> | null) => void;
    onReset?: () => void;
}

export interface ApiSelectMultipleProps<T, QueryArgType>
    extends BaseApiSelectProps<QueryArgType> {
    values?: ApiSelectOption<T>[];
    onChange: (chosenOption: ApiSelectOption<T>[]) => void;
}

export type DetailRetrieveQuery<
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType
> = QueryDefinition<QueryArgType, typeof baseQuery, string, ItemType>;

export interface DetailViewProps<ItemType extends BaseItemType> {
    data: ItemType;
}

export interface DetailPageFactoryArguments<
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    ParametersType extends Array<
        HiddenURLParameterSpecification<QueryArgType, keyof QueryArgType>
    >
> {
    queryEndpoint: ApiEndpointQuery<
        DetailRetrieveQuery<ItemType, QueryArgType>,
        EndpointDefinitions
    > &
        QueryHooks<DetailRetrieveQuery<ItemType, QueryArgType>>;
    queryParameters: ParametersType;
    DetailView: React.ComponentType<DetailViewProps<ItemType>>;
}

export type FactoryServerSidePropsFunction = (
    store: AppStore,
    context: Pick<GetServerSidePropsContext, "query">
) => Promise<Record<string, never>>;

type FallbackValue =
    | {
          label: string;
          needsRefreshFromApi?: boolean;
      }
    | string;

export interface ApiSelectWithLoadInitialValueProps<ValueT, QueryArgType> {
    value: ValueT | null;
    fallbackValueLabel?: FallbackValue;
    getSearchQueryArgs?: (query: string) => Partial<QueryArgType>;
    onChange?: (value: ValueT | null) => void;
    onReset?: () => void;
    selectProps: Omit<
        ApiSelectProps<ValueT, QueryArgType>,
        "onChange" | "initialValue" | "loadingInitialValue" | "disabled"
    >;
    disabled?: boolean;
}

export interface ApiSelectMultipleWithLoadInitialValueProps<
    ValueT,
    QueryArgType
> {
    values: ValueT[];
    fallbackValueLabel?: (value: ValueT) => FallbackValue;
    getSearchQueryArgs?: (query: string) => Partial<QueryArgType>;
    onChange?: (options: ValueT[]) => void;
    selectProps: Omit<
        ApiSelectProps<ValueT, QueryArgType>,
        "onChange" | "initialValue" | "loadingInitialValue" | "disabled"
    >;
    disabled?: boolean;
}

export interface ApiSelectHookFormProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
    TValue extends TFieldValues[TName],
    QueryArgType
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
    selectProps?: Omit<
        ApiSelectProps<TValue, QueryArgType>,
        "onChange" | "initialValue" | "loadingInitialValue"
    >;
    initialValueLabel?: string;
}

export interface ApiSelectMultipleHookFormProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
    TValue,
    QueryArgType
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
    selectProps?: Omit<
        ApiSelectMultipleProps<TValue & TFieldValues[TName], QueryArgType>,
        "onChange" | "initialValue" | "loadingInitialValue"
    >;
    initialValueLabels?: (value: TValue) => string;
}

export interface BaseHookFormFactoryArguments<
    ItemType extends BaseItemType,
    InitialQueryArgType extends BaseQueryArgType,
    ValueType
> {
    initialValueRetrieveEndpoint: ApiEndpointQuery<
        DetailRetrieveQuery<ItemType, InitialQueryArgType>,
        EndpointDefinitions
    > &
        QueryHooks<DetailRetrieveQuery<ItemType, InitialQueryArgType>>;
    getInitialValueQueryArgs: (initialValue: ValueType) => InitialQueryArgType;
    valueToKey?: (value: ValueType) => string;
}

export interface ApiSelectHookFormFactoryArguments<
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    ValueType,
    InitialQueryArgType extends BaseQueryArgType
> extends ApiSelectFactoryArguments<ItemType, QueryArgType, ValueType>,
        BaseHookFormFactoryArguments<
            ItemType,
            InitialQueryArgType,
            ValueType
        > {}

export interface ApiSelectMultipleHookFormFactoryArguments<
    ItemType extends BaseItemType,
    QueryArgType extends BaseQueryArgType,
    ValueType,
    InitialQueryArgType extends BaseQueryArgType
> extends ApiSelectMultipleFactoryArguments<ItemType, QueryArgType, ValueType>,
        BaseHookFormFactoryArguments<
            ItemType,
            InitialQueryArgType,
            ValueType
        > {}
