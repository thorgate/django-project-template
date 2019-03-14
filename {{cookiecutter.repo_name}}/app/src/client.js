import '@tg-resources/fetch-runtime';
import { loadableReady } from '@loadable/component';
import React from 'react';
import { hydrate } from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import Cookies from 'js-cookie';
import { RenderChildren } from 'tg-named-routes';

import configureStore from 'configuration/configureStore';
import routes from 'configuration/routes';
import { setActiveLanguage, applicationSelectors } from 'ducks/application';
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

const { store, history } = configureStore(initialState);

// Get correct language from store and cookies
const stateLanguage = applicationSelectors.activeLanguage(store.getState());
const cookieLanguage = Cookies.get(SETTINGS.LANGUAGE_COOKIE_NAME);

// Get valid language
const currentLanguage = stateLanguage || cookieLanguage || SETTINGS.DEFAULT_LANGUAGE;


const renderApp = (appRoutes) => {
    hydrate(
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <RenderChildren routes={appRoutes} />
            </ConnectedRouter>
        </Provider>,
        document.getElementById('root'),
    );
};


loadableReady().then(() => {
    // Update language if necessary
    if (stateLanguage !== currentLanguage) {
        store.dispatch(setActiveLanguage(currentLanguage));
    }

    renderApp(routes);
});

if (module.hot) {
    module.hot.accept('./configuration/routes', () => {
        renderApp(routes);
    });
}
