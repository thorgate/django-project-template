import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import {
    paginationState,
    listPageFactory,
} from "@lib/factories/ListPageFactory";
import { queriesApi, UserDetail, UserListApiArg } from "@lib/queries";
import { wrapper } from "@lib/store";
import { prepareSession } from "@lib/session";
import {
    type UserListPageState,
    UserListView,
} from "@/components/User/UserListView";
import { PageStateItemWithAPIInfo } from "@lib/hooks/state";
import { SelectUserWidget } from "@components/FilterWidgets";

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

const TranslatedSearch = () => {
    const { t } = useTranslation("common");
    return <>{t("filters.search")}</>;
};

const [UserList, getExtraProps] = listPageFactory<
    UserDetail,
    UserListApiArg,
    UserListPageState
>({
    retrieveEndpoint: queriesApi.endpoints.userList,
    extraQueryArgument: { pageSize: 5 } satisfies UserListApiArg,
    pageStateDefinition: {
        search: {
            defaultValue: "",
            isFilter: true,
            api: {
                key: "search",
            },
            url: {
                key: "search",
                serializer: (v) => [v],
                deserializer: (v) => v[0],
            },
            widget: {
                label: <TranslatedSearch />,
                deserializer: (value: string) => value,
                index: 10,
            },
        },
        isActive: {
            defaultValue: null,
            isFilter: true,
            api: {
                key: "isActive",
                serializer: (v) => v ?? undefined,
            },
            url: {
                key: "isActive",
                serializer: (v) => (v === null ? [] : [`${v}`]),
                deserializer: (v) => `${v[0]}`.toLowerCase() === "true",
            },
            widget: {
                label: <IsActiveFilterLabel />,
                options: [
                    { label: <TranslatedAll />, value: null },
                    { label: <TranslatedActive />, value: true },
                    { label: <TranslatedInactive />, value: false },
                ],
                index: 20,
            },
        } satisfies PageStateItemWithAPIInfo<
            boolean | null,
            UserListApiArg["isActive"],
            "isActive"
        >,
        isStaff: {
            defaultValue: [],
            isFilter: true,
            api: {
                key: "isStaffIn",
                serializer: (v) => v,
            },
            url: {
                key: "isStaff",
                serializer: (v) => v.map((e) => `${e}`),
                deserializer: (v) =>
                    v.map((e) => `${e}`.toLowerCase() === "true"),
            },
            widget: {
                label: <IsStaffFilterLabel />,
                multiple: true,
                options: [
                    { label: <TranslatedTrue />, value: true },
                    { label: <TranslatedFalse />, value: false },
                ],
                index: 30,
            },
        },
        /* TODO:NEWPROJECT:Remove this, as it is here for illustrative purposes*/
        email: {
            defaultValue: "",
            isFilter: true,
            api: {
                key: "email",
                serializer: (v) => v,
            },
            url: {
                key: "email",
                serializer: (v) => [v],
                deserializer: (v) => v[0],
            },
            widget: {
                label: "Email",
                index: 40,
                component: SelectUserWidget,
            },
        },
        sort: {
            defaultValue: "nameAsc",
            api: {
                key: "sort",
            },
            url: {
                key: "sort",
                serializer: (v) => (v ? [v] : []),
                deserializer: (v) =>
                    (v[0] || undefined) as UserListApiArg["sort"],
            },
        },
        ...paginationState,
    },
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
