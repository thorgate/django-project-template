import React from 'react';
import ReactDOM from 'react-dom';
import Raven from 'raven-js';
import {Provider} from 'react-redux';

import HelloWorld from 'components/HelloWorld';
import renderNavigationBar from 'components/NavigationBar';

import rootReducer from './reducers';
import configureStore from './store';

// Install Raven in production envs
if (process.env.NODE_ENV === 'production') {
    Raven.config(DJ_CONST.RAVEN_PUBLIC_DSN).install(); // eslint-disable-line
    // handle rejected promises
    window.addEventListener('unhandledrejection', (evt) => {
        Raven.captureException(evt.reason);
    });
    // If we have authenticated user, pass its data on to Raven
    if (DJ_CONST.user) {
        Raven.setUserContext({
            id: DJ_CONST.user.id,
            email: DJ_CONST.user.email,
            name: DJ_CONST.user.name,
        });
    }
}

// Create Redux store
const store = configureStore(rootReducer);

function initNavigationBar() {
    renderNavigationBar({% if cookiecutter.include_cms == 'yes' %}'navigation-bar', 'cms-show-menu'{% else %}'navigation-bar'{% endif %});
}

function init() {
    const elem = document.getElementById("hello-container");
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


export {init, initNavigationBar}; // eslint-disable-line import/prefer-default-export
