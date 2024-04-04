import Head from "next/head";
import * as React from "react";
import { LoremIpsum } from "lorem-ipsum";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    const lorem = new LoremIpsum({
        sentencesPerParagraph: {
            max: 8,
            min: 4,
        },
        wordsPerSentence: {
            max: 16,
            min: 4,
        },
    });

    return {
        props: {
            ...(await serverSideTranslations(context.locale!, ["common"])),
            paragraphs: [
                lorem.generateParagraphs(1),
                lorem.generateParagraphs(1),
            ],
        },
    };
};

export default function About({
    paragraphs,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const { t } = useTranslation("common");

    const [p1, p2] = paragraphs;
    return (
        <>
            <Head>
                <title>{`${t("pageTitles.about")} - {{ cookiecutter.project_title }}`}</title>
            </Head>
            <div className="tw-flex tw-flex-col tw-space-between tw-items-center tw-min-h-100vh tw-p-10">
                <div className="tw-p-2 md:tw-p-1">
                    <h1 data-testid="welcome">{t("pageTitles.about")}</h1>
                </div>
                <div className="tw-p-2 md:tw-p-1">
                    <p>{p1}</p>
                    <p>{p2}</p>
                </div>
            </div>
        </>
    );
}
