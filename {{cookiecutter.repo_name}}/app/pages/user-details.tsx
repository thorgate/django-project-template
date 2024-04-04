import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";
import * as React from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { wrapper } from "@lib/store";
import { prepareSession } from "@lib/session";
import { useUserMeRetrieveQuery } from "@lib/queries";

export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async (context) => {
        const session = await prepareSession(store, context);

        return {
            props: {
                ...(await serverSideTranslations(context.locale!, [
                    "common",
                    "userDetails",
                ])),
                session,
            },
        };
    }
);

export default function UserDetails() {
    const { data: session } = useSession({ required: true });
    const { data, status } = useUserMeRetrieveQuery();
    const { t } = useTranslation(["userDetails", "common"]);

    return (
        <>
            <Head>
                <title>{`${t(
                    "common:pageTitles.user-details"
                )} - {{ cookiecutter.project_title }}`}</title>
            </Head>
            <div className="tw-flex tw-flex-col tw-space-between tw-items-center tw-min-h-100vh tw-p-10">
                <div className="tw-p-2 md:tw-p-1">
                    <h1 data-testid="welcome">{t("common:restricted-view")}</h1>
                </div>

                <div className="tw-p-2 md:tw-p-1">
                    <div className="dark:tw-text-white">
                        <pre>
                            {t("userDetails:user")}:{" "}
                            {JSON.stringify(data, null, 2)}
                        </pre>
                        <pre>
                            {t("userDetails:email")}: {data?.email}
                        </pre>
                        <pre>
                            {t("common:status")}: {status}
                        </pre>
                    </div>
                </div>
            </div>
        </>
    );
}
