import { useEffect, useState, useRef, ReactNode } from "react";
import { AppStore, wrapper } from "@lib/store";

import { useAppSelector } from "@lib/hooks";
import { useStore } from "react-redux";
import { loadableReady } from "@loadable/component";

// @ts-ignore
import { LegacyApp } from "@/src/client";

import rootSaga from "@/src/sagas";
import { Task } from "redux-saga";
import {GetServerSidePropsContext} from "next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

export const getServerSideProps =  wrapper.getServerSideProps(
    () => async (context) => {
            return {
                props: {
                    ...(await serverSideTranslations(context.locale!, ["translations"])),
                }
            }
        });

/**
 * This is the entry point for legacy application.
 *
 * It is responsible for:
 * - Running sagas for various views
 *
 */
function App() {
    wrapper.useHydration({});

    const [isMounted, setIsMounted] = useState(false);
    const store = useStore() as unknown as AppStore;
    const accessToken = useAppSelector((state) => state.appUser.accessToken);
    const taskRef = useRef<Task>();

    useEffect(() => {
        void loadableReady(() => {
            setIsMounted(true);
        });
    }, []);

    useEffect(() => {
        if (isMounted) {
            setTimeout(() => {
                if (store?.runSaga) {
                    taskRef.current = store.runSaga(rootSaga, true);
                }
            }, 16);
        }

        return () => {
            if (taskRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                taskRef.current.cancel();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted, accessToken]);

    // @ts-ignore
    return isMounted ? <LegacyApp history={store.history} /> : null;
}

App.getLayout = (page: ReactNode) => page;

export default App;
