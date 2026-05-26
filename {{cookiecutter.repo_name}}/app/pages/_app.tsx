import { useEffect } from "react";
import { AppLayoutProps, AppProps } from "next/app";
import { useRouter } from "next/router";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { appWithTranslation } from "next-i18next";
import { Provider } from "react-redux";

import "@/styles/globals.css";
import "@/src/styles/main.scss";
import "@/src/styles/Home.css";
import NextI18nextConfig from "@/next-i18next.config";
import { Button } from "@components/Button";
import { Layout } from "@components/Layout";
import { useAppDispatch, useAppSelector } from "@lib/hooks";
import { wrapper, appUserSlice } from "@lib/store";
import { queriesApi, useUserMeRetrieveQuery } from "@lib/queries";

interface TokenWatcherProps {
    pageProps: Omit<AppProps, "Component">;
}

const TokenWatcher = ({ pageProps }: TokenWatcherProps) => {
    const { hydrating } = wrapper.useHydration(pageProps);

    const dispatch = useAppDispatch();
    const router = useRouter();
    const currentAccessToken = useAppSelector(
        (state) => state.appUser.accessToken
    );

    const { data: session, status } = useSession();
    useEffect(() => {
        if (status === "loading") {
            return;
        }

        if (status === "authenticated" && !session?.user?.sessionExpired) {
            if (currentAccessToken !== session.user.accessToken) {
                dispatch(
                    appUserSlice.actions.setTokens(
                        session
                            ? {
                                  accessToken: session.user.accessToken || "",
                                  refreshToken: session.user.refreshToken || "",
                              }
                            : null
                    )
                );

                if (hydrating) {
                    dispatch(queriesApi.util.invalidateTags(["user", "auth"]));
                }
            }
        } else {
            // Clear session if refresh token is expired
            if (session?.user?.sessionExpired) {
                void signOut({ redirect: false }).then(() => {
                    router.reload();
                });
            }
        }
    }, [dispatch, status, session, router, hydrating, currentAccessToken]);

    return null;
};

const AuthButton = () => {
    const router = useRouter();
    const { status } = useSession();
    const { data: user } = useUserMeRetrieveQuery();

    if (status === "authenticated") {
        return (
            <Button
                id="sign-out"
                onClick={async () => {
                    await signOut({ redirect: false });
                    router.reload();
                }}
            >
                Sign out
            </Button>
        );
    }

    return (
        <Button className="nav-link" href="auth/login" variant="primary">
            Sign In
        </Button>
    );
};

const App = ({ Component, ...props }: AppLayoutProps) => {
    const store = wrapper.useStore();
    const { session, ...pageProps } = props.pageProps;

    const getLayout =
        Component.getLayout ||
        ((page) => <Layout authElements={<AuthButton />}>{page}</Layout>);

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
