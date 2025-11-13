import * as React from "react";
import Head from "next/head";
import { useTranslation } from "next-i18next";
import { toast } from "react-toastify";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import {
    queriesApi,
    UserCreateApiArg,
    UserCreateApiResponse,
    UserCreateRequest,
    UserDetail,
} from "@lib/queries";

import { wrapper } from "@lib/store";
import { prepareSession } from "@lib/session";
import { useApiBasedForm } from "@lib/factories/hooks";
import { UserCreateForm } from "@components/User";

export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async (context) => {
        const session = await prepareSession(store, context);

        return {
            props: {
                ...(await serverSideTranslations(context.locale!, [
                    "common",
                    "user",
                ])),
                session,
            },
        };
    },
);

const makeQueryArgs = (values: UserCreateRequest): UserCreateApiArg => ({
    userCreateRequest: values,
});

const UserCreate = () => {
    const router = useRouter();
    const { t } = useTranslation(["user", "common"]);
    const onSuccess = React.useCallback(
        (user: UserDetail) => {
            toast.success(t("user:created", { name: user.name }));
            router.push("/users");
        },
        [t, router],
    );
    const onCancel = React.useCallback(() => router.push("/users"), [router]);
    const form = useApiBasedForm<
        UserCreateApiResponse,
        UserCreateApiArg,
        UserCreateRequest & { passwordConfirm: string }
    >({
        endpoint: queriesApi.endpoints.userCreate,
        makeQueryArgs,
        onSuccess,
    });

    return (
        <>
            <Head>
                <title>{`${t(
                    "common:pageTitles.userCreate",
                )} - Cumberland Recycling`}</title>
            </Head>
            <UserCreateForm
                title={t("user:titleCreate")}
                onCancel={onCancel}
                form={form}
            />
        </>
    );
};

export default UserCreate;
