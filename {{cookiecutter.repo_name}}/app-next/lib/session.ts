import { ParsedUrlQuery } from "querystring";
import { GetServerSidePropsContext, PreviewData } from "next";
import { getServerSession } from "next-auth/next";
import { AppStore, appUserSlice } from "@lib/store";
import { queriesApi } from "@lib/queries";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { defaultLocale } from "@lib/config";

export const prepareSession = async (
    store: AppStore,
    context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
) => {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions,
    );

    store.dispatch(
        appUserSlice.actions.setLocale(context.locale || defaultLocale),
    );

    if (session) {
        // Set only relevant fields to avoid sending undefined values
        session.user = {
            accessToken: session.user.accessToken,
            refreshToken: session.user.refreshToken,
            sessionExpired: session.user.sessionExpired,
        };

        if (!session.user.sessionExpired) {
            if (session.user.accessToken && session.user.refreshToken) {
                store.dispatch(
                    appUserSlice.actions.setTokens({
                        accessToken: session.user.accessToken,
                        refreshToken: session.user.refreshToken,
                    }),
                );
            }
            store.dispatch(
                queriesApi.endpoints.userMeRetrieve.initiate(
                    // There seems to be an issue with RTKq that causes no not providing query argument here
                    // to break subscription for components; and providing null (not undefined) seems to
                    // fix it.
                    null as unknown as void,
                ),
            );
            await Promise.all(
                store.dispatch(queriesApi.util.getRunningQueriesThunk()),
            );
        } else {
            store.dispatch(appUserSlice.actions.setSessionExpired());
        }
    } else {
        store.dispatch(appUserSlice.actions.setSessionExpired());
    }

    return session;
};
