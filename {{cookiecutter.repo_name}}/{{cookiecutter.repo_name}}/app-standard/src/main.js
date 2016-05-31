import React from 'react';
import ReactDOM from 'react-dom';
import Raven from 'raven-js';

import HelloWorld from 'components/HelloWorld';


// Install Raven in production envs
if (process.env.NODE_ENV === 'production') {
    Raven.config(DJ_CONST.RAVEN_PUBLIC_DSN).install(); // eslint-disable-line
    // If we have authenticated user, pass its data on to Raven
    if (DJ_CONST.user) {
        Raven.setUserContext({
            id: DJ_CONST.user.id,
            email: DJ_CONST.user.email,
            name: DJ_CONST.user.name,
        });
    }
}


function init() {
    const elem = document.getElementById("hello-container");
    if (!elem) {
        return;
    }

    ReactDOM.render(<HelloWorld />, elem);
}


export {init};
