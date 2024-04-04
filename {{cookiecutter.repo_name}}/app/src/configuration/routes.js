import loadable from "@loadable/component";
import "@tg-resources/fetch-runtime";
import {
    buildUrlCache,
    createLanguageRoutes,
    storeLanguages,
} from "tg-i18n-named-routes";

import i18nSettings from "@/i18n.json";

import App from "@/src/containers/AppShell";
import PageNotFound from "@/src/views/PageNotFound";

import permissionCheck from "@/src/sagas/auth/permissionCheckSaga";
import activateLanguage from "@/src/sagas/user/activateLanguage";
import fetchUserDetails from "@/src/sagas/user/fetchUserDetails";

import { createAuthenticationRoutes } from "./routes/authentication";

const Home = loadable(() => import("@/src/views/Home"));
const RestrictedView = loadable(() => import("@/src/views/RestrictedView"));

const NotFoundRoute = {
    name: "404",
    path: "*",
    component: PageNotFound,
};

const routes = createLanguageRoutes(
    i18nSettings.DEFAULT_LANGUAGE,
    i18nSettings.LANGUAGES,
    [
        {
            component: App,
            initial: [fetchUserDetails],
            watcher: [activateLanguage],
            routes: [
                {
                    path: {
                        en: "/en/",
                        et: "/et/",
                    },
                    exact: true,
                    name: "landing",
                    component: Home,
                },
                {
                    path: {
                        en: "/en/restricted",
                        et: "/et/restricted",
                    },
                    exact: true,
                    name: "restricted",
                    component: RestrictedView,
                    initial: permissionCheck,
                },
                createAuthenticationRoutes(NotFoundRoute),
                NotFoundRoute,
            ],
        },
    ]
);

storeLanguages(i18nSettings.LANGUAGES);

buildUrlCache(routes);

export default routes;
