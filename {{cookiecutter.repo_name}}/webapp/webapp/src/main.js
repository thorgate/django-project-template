import * as Sentry from '@sentry/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import HelloWorld from 'components/HelloWorld';
import renderNavigationBar from 'components/NavigationBar';

import configureAppStore from './store';

// Configure Sentry in deployed envs
if (process.env.NODE_ENV === 'production') {
    Sentry.init({
        dsn: DJ_CONST.SENTRY_DSN,
        environment: DJ_CONST.SENTRY_ENVIRONMENT,
    });

    // handle rejected promises
    window.addEventListener('unhandledrejection', (evt) => {
        Sentry.captureException(evt.reason);
    });
    // If we have authenticated user, pass its data on to Sentry
    if (DJ_CONST.user) {
        Sentry.configureScope((scope) => {
            scope.setUser({
                id: DJ_CONST.user.id,
                email: DJ_CONST.user.email,
            });
            Sentry.setContext('name', DJ_CONST.user.name);
        });
    }
}

// Create Redux store
const store = configureAppStore({});

function initNavigationBar() {
    renderNavigationBar('navigation-bar');
}

function init() {
    const elem = document.getElementById('hello-container');
    if (!elem) {
        return;
    }

    ReactDOM.render(
        <Provider store={store}>
            <HelloWorld />
        </Provider>,
        elem,
    );
}

export { init, initNavigationBar };
