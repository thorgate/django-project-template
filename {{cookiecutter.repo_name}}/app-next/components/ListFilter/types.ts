import {
    QueryArgFrom,
    ResultTypeFrom,
} from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import {
    BaseItemType,
    BaseQueryArgType,
    CustomWidgetURLParameterSpecification,
    QueryDefinitionFromEndpoint,
    ReplaceQueryParametersFunction,
    RetrieveQueryResult,
} from "@lib/factories/types";

export type ListResultTypeFromEndpoint<Endpoint> = ResultTypeFrom<
    QueryDefinitionFromEndpoint<Endpoint>
> extends RetrieveQueryResult<infer ItemType>
    ? ItemType extends BaseItemType
        ? ItemType
        : never
    : never;

export type ListQueryArgFromEndpoint<Endpoint> = QueryArgFrom<
    QueryDefinitionFromEndpoint<Endpoint>
> extends BaseQueryArgType
    ? QueryArgFrom<QueryDefinitionFromEndpoint<Endpoint>>
    : never;

export interface CustomFilterWidgetProps<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
    UrlParameter extends CustomWidgetURLParameterSpecification<
        QueryArgType,
        QueryArg
    >
> {
    parameter: UrlParameter;
    initial: QueryArgType[QueryArg] | undefined;
    replaceQueryParameter: ReplaceQueryParametersFunction<QueryArgType>;
}

export type CustomFilterWidgetPropsFromEndpoint<
    Endpoint,
    QueryArg extends keyof QueryArgType,
    QueryArgType extends ListQueryArgFromEndpoint<Endpoint> = ListQueryArgFromEndpoint<Endpoint>
> = CustomFilterWidgetProps<
    QueryArgType,
    QueryArg,
    CustomWidgetURLParameterSpecification<QueryArgType, QueryArg>
>;
