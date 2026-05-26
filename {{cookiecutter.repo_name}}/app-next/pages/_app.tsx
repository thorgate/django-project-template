import { useEffect, useRef } from "react";
import { AppLayoutProps, AppProps } from "next/app";
import { useRouter } from "next/router";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { appWithTranslation } from "next-i18next/pages";
import { Provider } from "react-redux";
import { useTranslation } from "next-i18next/pages";
import { toast } from "react-toastify";

import "@/styles/globals.css";
import { Button } from "@components/Button";
import { Layout } from "@components/Layout";
import { useAppDispatch, useAppSelector } from "@lib/hooks";
import { wrapper } from "@lib/store";
import { queriesApi } from "@lib/queries";
import NextI18nextConfig from "@/next-i18next.config";

interface TokenWatcherProps {
    pageProps: Omit<AppProps, "Component">;
}

const TokenWatcher = ({ pageProps }: TokenWatcherProps) => {
    const { t } = useTranslation(["common"]);
    wrapper.useHydration(pageProps);

    const { push } = useRouter();
    const dispatch = useAppDispatch();
    const currentAccessToken = useAppSelector(
        (state) => state.appUser.accessToken,
    );
    const previousAccessTokenRef = useRef(currentAccessToken);
    const sessionExpired = useAppSelector(
        (state) => state.appUser.sessionExpired,
    );
    const previouslyExpiredRef = useRef(sessionExpired);

    useEffect(() => {
        if (currentAccessToken !== previousAccessTokenRef.current) {
            dispatch(queriesApi.util.invalidateTags(["user", "auth"]));
            previousAccessTokenRef.current = currentAccessToken;
        }
    }, [dispatch, currentAccessToken]);

    useEffect(() => {
        if (sessionExpired && !previouslyExpiredRef.current) {
            toast.warning(t("errors.sessionExpired"));
            previouslyExpiredRef.current = true;
            signOut({ redirect: false }).then(() => push("/auth/login"));
        }
        if (!sessionExpired && previouslyExpiredRef.current) {
            previouslyExpiredRef.current = false;
        }
    }, [t, sessionExpired, push]);

    return null;
};

const AuthButton = () => {
    const { t } = useTranslation("common");
    const router = useRouter();
    const { status } = useSession();

    if (status === "authenticated") {
        return (
            <Button
                id="sign-out"
                onClick={async () => {
                    await signOut({ redirect: false });
                    router.reload();
                }}
                variant="safe"
            >
                {t("navigation.signOut")}
            </Button>
        );
    }

    return (
        <Button className="nav-link" href="/auth/login" variant="safe">
            {t("navigation.signIn")}
        </Button>
    );
};

const App = ({ Component, ...props }: AppLayoutProps) => {
    const store = wrapper.useStore();
    const { session, ...pageProps } = props.pageProps;

    const getLayout =
        Component.getLayout ||
        ((page) => (
            <Layout
                authElements={<AuthButton />}
                {...(Component.getLayoutProps?.() ?? {})}
            >
                {page}
            </Layout>
        ));

    return (
        <SessionProvider session={session}>
            <Provider store={store}>
                <TokenWatcher pageProps={pageProps} />
                {getLayout(<Component {...pageProps} />)}
            </Provider>
        </SessionProvider>
    );
};

export default appWithTranslation(App, NextI18nextConfig);
