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
import routes from 'configuration/routes';
import { setActiveLanguage } from 'sagas/user/activateLanguage';
import SETTINGS from 'settings';
import Sentry from 'services/sentry';


// Configure Sentry only in production
if (process.env.NODE_ENV === 'production') {
    Sentry.init({
        dsn: SETTINGS.RAVEN_PUBLIC_DSN,
    });
}

// Store initial state in variable
const initialState = window.__initial_state__ || {};

// If not in development, clear the value attached to window
if (process.env.NODE_ENV === 'production') {
    window.__initial_state__ = null;
}

const { store, history } = configureStore(initialState, {
    sagaMiddleware: { context: { i18n: { t: i18n.t.bind(i18n), i18n } } },
});

// Get correct language from store and cookies
const initialLanguage = window.__initial_language__;
const cookieLanguage = Cookies.get(SETTINGS.LANGUAGE_COOKIE_NAME);

// Get valid language
const currentLanguage = initialLanguage || cookieLanguage || SETTINGS.DEFAULT_LANGUAGE;


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

const renderApp = (appRoutes) => {
    hydrate(
        <App appRoutes={appRoutes} />,
        document.getElementById('root'),
    );
};


loadableReady().then(() => setupI18Next(currentLanguage)).then(async () => {
    store.dispatch(setActiveLanguage(currentLanguage));

    renderApp(routes);
});

if (module.hot) {
    module.hot.accept('./configuration/routes', () => {
        renderApp(routes);
    });
}
