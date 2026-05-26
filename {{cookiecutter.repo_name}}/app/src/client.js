import "@tg-resources/fetch-runtime";
import React from "react";
import { HelmetProvider } from "react-helmet-async";
import { ConnectedRouter } from "connected-react-router";
import { RenderChildren } from "tg-named-routes";

// import configureStore from '@/src/configuration/configureStore';
// import i18n, { setupI18Next } from '@/src/configuration/i18n';
import routes from "@/src/configuration/routes";
import { setActiveLanguage } from "@/src/sagas/user/activateLanguage";
import { SETTINGS, loadSettings } from "@/src/settings";
import Sentry from "@/src/services/sentry";

let store;
let history;
let initialState;
let initialLanguage;
let currentLanguage;

// eslint-disable-next-line
const App = ({ appRoutes, history }) => {
    return (
        <HelmetProvider>
            <ConnectedRouter history={history}>
                <RenderChildren routes={appRoutes} />
            </ConnectedRouter>
        </HelmetProvider>
    );
};

export const LegacyApp = ({ history }) => (
    <App appRoutes={routes} history={history} />
);

// const renderApp = (appRoutes) => {
//     hydrate(<App appRoutes={appRoutes} />, document.getElementById('root'));
// };
//
// async function initReactApp() {
//     try {
//         const ducks = configureStore(initialState, {
//             sagaMiddleware: {
//                 context: { i18n: { t: i18n.t.bind(i18n), i18n } },
//             },
//         });
//
//         store = ducks.store; // eslint-disable-line prefer-destructuring
//         history = ducks.history; // eslint-disable-line prefer-destructuring
//
//         await loadableReady();
//         await setupI18Next(currentLanguage);
//         await store.dispatch(setActiveLanguage(currentLanguage));
//
//         renderApp(routes);
//     } catch (e) {
//         Sentry.captureException(e);
//         throw e;
//     }
// }
//
// const maybeInitReactApp = () => {
//     if (!window.__initial_ready__) {
//         // Wait for the state to be available before we init the app
//         logger.warn('Initial state not available yet - not hydrating');
//         return;
//     }
//
//     if (window.__app_initialized__) {
//         // Don't initialize twice
//         return;
//     }
//
//     // Remember that we have initialized the app
//     window.__app_initialized__ = true;
//
//     // Ensure settings are up to date
//     loadSettings();
//
//     // Configure Sentry only in production
//     if (process.env.NODE_ENV === 'production') {
//         Sentry.init({
//             dsn: SETTINGS.SENTRY_DSN,
//             environment: SETTINGS.SENTRY_ENVIRONMENT,
//         });
//     }
//
//     // Store initial state in variable
//     initialState = window.__initial_state__ || {};
//
//     // If not in development, clear the value attached to window
//     if (process.env.NODE_ENV === 'production') {
//         window.__initial_state__ = null;
//     }
//
//     initialLanguage = window.__initial_language__;
//
//     // Get correct language from store and cookies
//     const cookieLanguage = Cookies.get(SETTINGS.LANGUAGE_COOKIE_NAME);
//
//     // Get valid language
//     currentLanguage =
//         initialLanguage || cookieLanguage || SETTINGS.DEFAULT_LANGUAGE;
//
//     const env = SETTINGS.SENTRY_ENVIRONMENT
//         ? `env:${SETTINGS.SENTRY_ENVIRONMENT} `
//         : '';
//
//     logger.info(`Initializing ${env}with language ${currentLanguage}...`);
//     logger.debug(`API url is ${SETTINGS.BACKEND_SITE_URL}${SETTINGS.API_BASE}`);
//
//     initReactApp().then(() => {
//         logger.info(`App version ${SETTINGS.__VERSION__} initialized!`);
//     });
// };
//
// window.maybeInitReactApp = maybeInitReactApp;
