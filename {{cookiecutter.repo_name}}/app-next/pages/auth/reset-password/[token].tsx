import type { InferGetServerSidePropsType } from "next";
import * as React from "react";
import Head from "next/head";
import { useTranslation } from "next-i18next";
import { toast } from "react-toastify";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

import { Card } from "@components/Card";
import {
    queriesApi,
    UserForgotPasswordTokenCreateApiArg,
    UserForgotPasswordTokenCreateApiResponse,
    RecoveryPassword,
} from "@lib/queries";
import { wrapper } from "@lib/store";
import { prepareSession } from "@lib/session";
import { useApiBasedForm } from "@lib/factories/hooks";
import { ResetPasswordForm } from "@components/ResetPasswordForm";

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
                token:
                    context.params?.token &&
                    !Array.isArray(context.params?.token)
                        ? context.params?.token
                        : "",
            },
        };
    }
);

const makeQueryArgs = (values: RecoveryPassword) => ({
    recoveryPassword: values,
});

const ResetPassword = ({
    token,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const router = useRouter();
    const { t } = useTranslation(["auth", "common"]);
    const onSuccess = React.useCallback(() => {
        toast.success(t("auth:resetPassword.success"));
        router.push("/auth/login");
    }, [t, router]);
    const form = useApiBasedForm<
        UserForgotPasswordTokenCreateApiResponse,
        UserForgotPasswordTokenCreateApiArg,
        RecoveryPassword
    >({
        endpoint: queriesApi.endpoints.userForgotPasswordTokenCreate,
        makeQueryArgs,
        onSuccess,
    });

    return (
        <>
            <Head>
                <title>{`${t(
                    "auth:resetPassword.title"
                )} - test-project`}</title>
            </Head>
            <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
                <Card>
                    <ResetPasswordForm
                        title={t("auth:resetPassword.title")}
                        form={form}
                        token={token}
                    />
                </Card>
            </div>
        </>
    );
};

export default ResetPassword;
