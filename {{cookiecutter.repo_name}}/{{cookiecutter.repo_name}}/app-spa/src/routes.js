import React from 'react';
import {Route, DefaultRoute, NotFoundRoute} from 'react-router';

import Wrapper from './views/Wrapper';
import BaseTemplate from './views/BaseTemplate';

import UserView from './views/UserView';
import LoginView from './views/LoginView';
import HomePage from './views/HomePage';
import NotFound from './views/NotFound';

import {anonymousView, authenticatedView} from './utils/authViewHelpers';


if (process.env.BROWSER && process.env.NODE_ENV !== 'production') {
    // Note: Add stylesheets inside the following files:
    require('./styles/vendor');
    require('./styles/main');
}


const routes = (
    <Route name="root" path="/" handler={Wrapper}>
        <Route name="login" path="/login/" handler={anonymousView()(LoginView)} />

        <Route handler={BaseTemplate}>
            <Route name="users" path="/users/" handler={authenticatedView('login')(UserView)} />

            <DefaultRoute name="home" handler={HomePage} />
            <NotFoundRoute handler={NotFound} />
        </Route>
    </Route>
);

export default routes;
