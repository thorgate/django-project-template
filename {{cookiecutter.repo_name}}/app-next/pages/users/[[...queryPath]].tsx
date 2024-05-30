import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import {
    defaultPaginatedURLParameters,
    listPageFactory,
} from "@lib/factories/ListPageFactory";
import { queriesApi, UserListApiArg } from "@lib/queries";
import { wrapper } from "@lib/store";
import { prepareSession } from "@lib/session";
import {
    UserListView,
    userListSortParameter,
} from "@/components/User/UserListView";
import {
    booleanArrayQueryParameterExtractor,
    booleanQueryParameterExtractor,
} from "@lib/factories/util";
import { SelectMultipleURLParameterSpecification } from "@lib/factories/types";

const IsStaffFilterLabel = () => {
    const { t } = useTranslation("common");
    return <>{t("filters.titles.isStaff")}</>;
};

const TranslatedTrue = () => {
    const { t } = useTranslation("common");
    return <>{t("filters.values.true")}</>;
};

const TranslatedFalse = () => {
    const { t } = useTranslation("common");
    return <>{t("filters.values.false")}</>;
};

const IsActiveFilterLabel = () => {
    const { t } = useTranslation("common");
    return <>{t("filters.titles.isActive")}</>;
};

const TranslatedAll = () => {
    const { t } = useTranslation("common");
    return <>{t("filters.values.all")}</>;
};

const TranslatedActive = () => {
    const { t } = useTranslation("common");
    return <>{t("filters.values.active")}</>;
};

const TranslatedInactive = () => {
    const { t } = useTranslation("common");
    return <>{t("filters.values.inactive")}</>;
};

const isStaffFilter: SelectMultipleURLParameterSpecification<
    UserListApiArg,
    "isStaffIn"
> = {
    /* This is a showcase of API based filter, and has no value for any real use case as it will always
     * only choose one user. TODO:NEWPROJECT remove this filter.*/
    type: "multi-select",
    queryArg: "isStaffIn",
    label: <IsStaffFilterLabel />,
    options: [
        { label: <TranslatedTrue />, value: true },
        { label: <TranslatedFalse />, value: false },
    ],
    defaultValue: [],
    queryExtractor: booleanArrayQueryParameterExtractor,
};

const [UserList, getExtraProps] = listPageFactory({
    retrieveEndpoint: queriesApi.endpoints.userList,
    parameters: [
        ...defaultPaginatedURLParameters,
        { type: "search", queryArg: "search", defaultValue: "" },
        {
            type: "select",
            queryArg: "isActive",
            label: <IsActiveFilterLabel />,
            defaultValue: true,
            options: [
                { label: <TranslatedAll />, value: undefined },
                { label: <TranslatedActive />, value: true },
                { label: <TranslatedInactive />, value: false },
            ],
            queryExtractor: booleanQueryParameterExtractor,
        },
        isStaffFilter,
        userListSortParameter,
    ],
    ListView: UserListView,
});

export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async (context) => {
        const session = await prepareSession(store, context);

        return {
            props: {
                ...(await serverSideTranslations(context.locale!, [
                    "common",
                    "user",
                ])),
                ...(await getExtraProps(store, context)),
                session,
            },
        };
    }
);

export default UserList;
