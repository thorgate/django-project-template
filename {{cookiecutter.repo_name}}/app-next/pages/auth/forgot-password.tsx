import * as React from "react";
import Head from "next/head";
import { useTranslation } from "next-i18next";
import { toast } from "react-toastify";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

import { Card } from "@components/Card";
import {
    queriesApi,
    UserForgotPasswordCreateApiArg,
    UserForgotPasswordCreateApiResponse,
    ForgotPassword as APIForgotPassword,
} from "@lib/queries";
import { wrapper } from "@lib/store";
import { prepareSession } from "@lib/session";
import { useApiBasedForm } from "@lib/factories/hooks";
import { ForgotPasswordForm } from "@components/ForgotPasswordForm";

export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async (context) => {
        const session = await prepareSession(store, context);

        return {
            props: {
                ...(await serverSideTranslations(context.locale!, [
                    "common",
                    "auth",
                ])),
                session,
            },
        };
    },
);

const makeQueryArgs = (
    values: APIForgotPassword,
): UserForgotPasswordCreateApiArg => ({
    forgotPasswordRequest: values,
});

const ForgotPassword = () => {
    const router = useRouter();
    const { t } = useTranslation(["auth", "common"]);
    const onSuccess = React.useCallback(() => {
        toast.success(t("auth:forgotPassword.success"));
        router.push("/auth/login");
    }, [t, router]);
    const form = useApiBasedForm<
        UserForgotPasswordCreateApiResponse,
        UserForgotPasswordCreateApiArg,
        APIForgotPassword
    >({
        endpoint: queriesApi.endpoints.userForgotPasswordCreate,
        makeQueryArgs,
        onSuccess,
    });

    return (
        <>
            <Head>
                <title>{`${t(
                    "auth:forgotPassword.title",
                )} - {{ cookiecutter.project_title }}`}</title>
            </Head>
            <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
                <Card>
                    <ForgotPasswordForm
                        title={t("auth:forgotPassword.title")}
                        form={form}
                    />
                </Card>
            </div>
        </>
    );
};

export default ForgotPassword;
