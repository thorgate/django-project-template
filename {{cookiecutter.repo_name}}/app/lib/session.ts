import { AppStore, appUserSlice } from "@lib/store";
import { GetServerSidePropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";
import { getServerSession } from "next-auth/next";
import { queriesApi } from "@lib/queries";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const prepareSession = async (
    store: AppStore,
    context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) => {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    );

    if (session) {
        // Set only relevant fields to avoid sending undefined values
        session.user = {
            accessToken: session.user.accessToken,
            refreshToken: session.user.refreshToken,
            sessionExpired: session.user.sessionExpired,
        };
    }

    store.dispatch(appUserSlice.actions.setLocale(context.locale || "en"));
    store.dispatch(
        appUserSlice.actions.setTokens(
            session
                ? {
                      accessToken: session.user.accessToken || "",
                      refreshToken: session.user.refreshToken || "",
                  }
                : null
        )
    );
    store.dispatch(queriesApi.endpoints.userMeRetrieve.initiate());
    await Promise.all(store.dispatch(queriesApi.util.getRunningQueriesThunk()));
    return session;
};
