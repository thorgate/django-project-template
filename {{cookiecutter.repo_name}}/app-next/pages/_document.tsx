import { Html, Head, Main, NextScript, DocumentProps } from "next/document";
import Script from "next/script";
import * as React from "react";

export default function Document(props: DocumentProps) {
    const currentLocale = props.__NEXT_DATA__.locale || "en";

    return (
        <Html lang={currentLocale} className="h-full">
            <Head>
                <Script src="/__ENV.js" strategy="beforeInteractive" />
            </Head>
            <body className="h-full">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
