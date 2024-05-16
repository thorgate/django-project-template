import * as React from "react";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { getCsrfToken } from "next-auth/react";
import { useSelector } from "react-redux";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { UserInfo } from "@/components/UserInfo";
import { prepareSession } from "@lib/session";
import { RootState, appUserSlice, wrapper } from "@lib/store";

export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async (context) => {
        const session = await prepareSession(store, context);
        const csrfToken = await getCsrfToken(context);

        return {
            props: {
                ...(await serverSideTranslations(context.locale!, [
                    "common",
                    "userDetails",
                ])),
                csrfToken: csrfToken || null,
                session,
            },
        };
    }
);

function Home() {
    const { t } = useTranslation(["common"]);

    const accessToken = useSelector((state) => {
        return (state as RootState)[appUserSlice.name].accessToken;
    });

    return (
        <>
            <Head>
                <title>{{ cookiecutter.project_title }}</title>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="tw-flex tw-flex-col tw-space-between tw-items-center tw-min-h-100vh tw-p-10">
                <div className="tw-p-2 md:tw-p-1">
                    <h1 data-testid="welcome">{t("common:welcomeMessage")}</h1>
                </div>

                <div className="tw-p-2 md:tw-p-1">
                    <div>
                        <UserInfo key={accessToken} />
                    </div>
                </div>
            </div>
        </>
    );
}
export default Home;
