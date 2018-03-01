import React from 'react';
import ReactDOM from 'react-dom';
import Raven from 'raven-js';

import {Provider} from 'react-redux';
import {ConnectedRouter} from 'react-router-redux';
import {renderRoutes} from 'react-router-config';
import {AppContainer} from 'react-hot-loader';

import configureStore from 'configuration/configureStore';
import routes from 'configuration/routes';
import {selectors as userSelectors} from 'ducks/user';
import i18n from 'utils/i18n';
import {getCookie} from 'utils/cookie';


// Install Raven in production envs
if (!DEV_MODE) {
    Raven.config(DJ_CONST.RAVEN_PUBLIC_DSN).install(); // eslint-disable-line
    // handle rejected promises
    window.addEventListener('unhandledrejection', (evt) => {
        Raven.captureException(evt.reason);
    });
}


// We want to handle scroll restoration on our own (this only really works in Chrome)
// So sorry Chrome & Firefox users
if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
}

const initialState = window.__initial_state__ || {};
const {store, history} = configureStore(initialState);

const currentLanguage = userSelectors.activeLanguage(store.getState());
i18n.forceLanguage(currentLanguage || getCookie(DJ_CONST.LANGUAGE_COOKIE_NAME) || DJ_CONST.LANGUAGE_CODE);

const render = (appRoutes) => {
    ReactDOM.hydrate(
        <AppContainer>
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    {renderRoutes(appRoutes)}
                </ConnectedRouter>
            </Provider>
        </AppContainer>,
        document.getElementById('root'));
};

if (module.hot) {
    module.hot.accept('./configuration/routes', () => {
        const appRoutes = require('./configuration/routes').default; // eslint-disable-line
        render(appRoutes);
    });
}

function init() {
    render(routes);
}

init();
