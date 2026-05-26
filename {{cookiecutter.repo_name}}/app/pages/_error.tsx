import { NextPageContext } from "next";
import * as Sentry from "@sentry/nextjs";
import NextErrorComponent from "next/error";

interface ErrorProps {
    statusCode: number;
}

ErrorPage.getInitialProps = async (context: NextPageContext) => {
    await Sentry.captureUnderscoreErrorException(context);

    return NextErrorComponent.getInitialProps(context);
};

export default function ErrorPage({ statusCode }: ErrorProps) {
    return <NextErrorComponent statusCode={statusCode} />;
}
