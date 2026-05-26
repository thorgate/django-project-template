import type {
    GetServerSidePropsContext,
    InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import { getCsrfToken } from "next-auth/react";
import { getServerSession } from "next-auth";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React from "react";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Card } from "@/components/Card";
import { LoginForm } from "@/components/LoginForm";

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    );

    // If the user is already logged in, redirect.
    if (session) {
        return { redirect: { destination: "/" } };
    }

    return {
        props: {
            ...(await serverSideTranslations(context.locale!, [
                "auth",
                "common",
            ])),
            csrfToken: (await getCsrfToken(context)) || null,
        },
    };
}

export default function Login({
    csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const { t } = useTranslation("common");

    return (
        <>
            <Head>
                <title>{`${t(
                    "pageTitles.login"
                )} - {{ cookiecutter.project_title }}`}</title>
            </Head>
            <div className="flex flex-col justify-center">
                <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
                    <Card>
                        <LoginForm csrfToken={csrfToken} />
                    </Card>
                </div>
            </div>
        </>
    );
}

// Uncomment this to use a custom page layout. For example, this adds the navbar to the login page:
// Login.getLayout = (page: ReactNode) => <Container>{page}</Container>;
