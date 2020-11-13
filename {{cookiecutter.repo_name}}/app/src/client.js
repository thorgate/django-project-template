import '@tg-resources/fetch-runtime';
import { loadableReady } from '@loadable/component';
import React from 'react';
import { hydrate } from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import Cookies from 'js-cookie';
import { useSSR } from 'react-i18next';
import { RenderChildren } from 'tg-named-routes';

import configureStore from 'configuration/configureStore';
import i18n, { setupI18Next } from 'configuration/i18n';
import logger from 'logger';
import routes from 'configuration/routes';
import { setActiveLanguage } from 'sagas/user/activateLanguage';
import SETTINGS, { loadSettings } from 'settings';
import Sentry from 'services/sentry';

let store;
let history;
let initialState;
let initialLanguage;
let currentLanguage;

// eslint-disable-next-line
const App = ({ appRoutes }) => {
    useSSR(window.__initial_i18n_store__, initialLanguage);
    return (
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <RenderChildren routes={appRoutes} />
            </ConnectedRouter>
        </Provider>
    );
};

const renderApp = appRoutes => {
    hydrate(<App appRoutes={appRoutes} />, document.getElementById('root'));
};

async function initReactApp() {
    try {
        const ducks = configureStore(initialState, {
            sagaMiddleware: {
                context: { i18n: { t: i18n.t.bind(i18n), i18n } },
            },
        });

        store = ducks.store; // eslint-disable-line prefer-destructuring
        history = ducks.history; // eslint-disable-line prefer-destructuring

        await loadableReady();
        await setupI18Next(currentLanguage);
        await store.dispatch(setActiveLanguage(currentLanguage));

        renderApp(routes);
    } catch (e) {
        Sentry.captureException(e);
        throw e;
    }
}

const maybeInitReactApp = () => {
    if (!window.__initial_ready__) {
        // Wait for the state to be available before we init the app
        logger.warn('Initial state not available yet - not hydrating');
        return;
    }

    if (window.__app_initialized__) {
        // Don't initialize twice
        return;
    }

    // Remember that we have initialized the app
    window.__app_initialized__ = true;

    // Ensure settings are up to date
    loadSettings();

    // Configure Sentry only in production
    if (process.env.NODE_ENV === 'production') {
        Sentry.init({
            dsn: SETTINGS.SENTRY_DSN,
            environment: SETTINGS.SENTRY_ENVIRONMENT,
        });
    }

    // Store initial state in variable
    initialState = window.__initial_state__ || {};

    // If not in development, clear the value attached to window
    if (process.env.NODE_ENV === 'production') {
        window.__initial_state__ = null;
    }

    initialLanguage = window.__initial_language__;

    // Get correct language from store and cookies
    const cookieLanguage = Cookies.get(SETTINGS.LANGUAGE_COOKIE_NAME);

    // Get valid language
    currentLanguage =
        initialLanguage || cookieLanguage || SETTINGS.DEFAULT_LANGUAGE;

    const env = SETTINGS.SENTRY_ENVIRONMENT
        ? `env:${SETTINGS.SENTRY_ENVIRONMENT} `
        : '';

    logger.info(`Initializing ${env}with language ${currentLanguage}...`);
    logger.debug(`API url is ${SETTINGS.BACKEND_SITE_URL}${SETTINGS.API_BASE}`);

    initReactApp().then(() => {
        logger.info(`App version ${SETTINGS.__VERSION__} initialized!`);
    });
};

window.maybeInitReactApp = maybeInitReactApp;

maybeInitReactApp();

if (module.hot) {
    module.hot.accept('./configuration/routes', () => {
        renderApp(routes);
    });

    module.hot.accept();
    module.hot.dispose(() => {
        // eslint-disable-next-line no-underscore-dangle
        window.__app_initialized__ = false;
    });
}
