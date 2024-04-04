import { GetStaticProps } from "next";
import NextErrorComponent from "next/error";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? "en", ["common"])),
        },
    };
};

const ServerErrorPage = () => {
    const { t } = useTranslation("common");
    return (
        <NextErrorComponent
            statusCode={500}
            title={t("pageTitles.internalError")}
        />
    );
};

export default ServerErrorPage;
