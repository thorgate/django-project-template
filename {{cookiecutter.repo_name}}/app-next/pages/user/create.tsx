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
    UserCreate,
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
    }
);

const makeQueryArgs = (values: UserCreate): UserCreateApiArg => ({
    userCreate: values,
});

const UserCreate = () => {
    const router = useRouter();
    const { t } = useTranslation(["user", "common"]);
    const onSuccess = React.useCallback(
        (user: UserDetail) => {
            toast.success(t("user:created", { name: user.name }));
            router.push("/users");
        },
        [t, router]
    );
    const onCancel = React.useCallback(() => router.push("/users"), [router]);
    const form = useApiBasedForm<
        UserCreateApiResponse,
        UserCreateApiArg,
        UserCreate & { passwordConfirm: string }
    >({
        endpoint: queriesApi.endpoints.userCreate,
        makeQueryArgs,
        onSuccess,
    });

    return (
        <>
            <Head>
                <title>{`${t(
                    "common:pageTitles.userCreate"
                )} - {{ cookiecutter.project_title }}`}</title>
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
