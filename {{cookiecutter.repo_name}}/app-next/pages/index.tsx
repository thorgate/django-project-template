import * as React from "react";
import Head from "next/head";
import Image from "next/image";
import { getCsrfToken } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { UserInfo } from "@/components/UserInfo";
import { prepareSession } from "@lib/session";
import { appUserSlice, wrapper } from "@lib/store";
import { useAppSelector } from "@lib/hooks";

const placeholderImage =
    "https://placehold.co/300x200/png?text={{ cookiecutter.project_title }}";

export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async (context) => {
        const session = await prepareSession(store, context);
        const csrfToken = await getCsrfToken(context);

        return {
            props: {
                ...(await serverSideTranslations(context.locale!, [
                    "common",
                    "user",
                ])),
                csrfToken: csrfToken || null,
                session,
            },
        };
    }
);

function Home() {
    const { t } = useTranslation("common");

    const accessToken = useAppSelector((state) => {
        return state[appUserSlice.name].accessToken;
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
            <div className="flex flex-col space-between items-center min-h-100vh p-10">
                <div className="p-2 md:p-1">
                    <h1 data-testid="welcome">{t("welcomeMessage")}</h1>
                </div>

                <div className="p-2 md:p-1">
                    <Image
                        src={placeholderImage}
                        width={300}
                        height={200}
                        alt="{{ cookiecutter.project_title }}"
                    />
                </div>

                <div className="p-2 md:p-1">
                    <div>
                        <UserInfo key={accessToken} />
                    </div>
                </div>
            </div>
        </>
    );
}
export default Home;
