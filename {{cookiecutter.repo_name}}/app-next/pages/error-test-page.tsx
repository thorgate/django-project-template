import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect } from "react";
import { wrapper } from "@lib/store";
import { prepareSession } from "@lib/session";

export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async (context) => {
        const session = await prepareSession(store, context);

        if (context.query.error) {
            throw new Error("Error from getServerSideProps");
        }

        return {
            props: {
                ...(await serverSideTranslations(context.locale!, ["common"])),
                session,
            },
        };
    }
);

export default function ErrorTestPage() {
    useEffect(() => {
        if (typeof window !== "undefined") {
            throw new Error("Error from useEffect");
        }
    }, []);

    return (
        <div className="flex flex-col space-between items-center min-h-100vh p-10">
            <div className="p-2 md:p-1">
                <h1 data-testid="welcome">Error Test Page</h1>
                <p>
                    Add <code>?error=1</code> to the URL to trigger a server
                    side error.
                </p>
            </div>
        </div>
    );
}
