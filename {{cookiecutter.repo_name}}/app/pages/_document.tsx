import { Html, Head, Main, NextScript, DocumentProps } from "next/document";
import Script from "next/script";
import * as React from "react";

export default function Document(props: DocumentProps) {
    const currentLocale = props.__NEXT_DATA__.locale || "en";

    return (
        <Html lang={currentLocale}>
            <Head>
                <Script src="/__ENV.js" strategy="beforeInteractive" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
