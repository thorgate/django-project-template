import React, {Component, PropTypes} from 'react';
import is from 'is';

import CurrentUserStore from '../stores/CurrentUserStore';


let _lastAuthTransitionPath = null;

/**
 *
 * @param {Component} ChildComponent
 * @param {function} predicate
 * @param {function} redirectUrl
 * @return {AuthStateView}
 */
function makeView(ChildComponent, predicate, redirectUrl) {
    let redirectFunc;
    if (!is.fn(redirectUrl)) {
        redirectFunc = () => {
            return redirectUrl;
        };
    } else {
        redirectFunc = redirectUrl;
    }

    class AuthStateView extends Component {
        static contextTypes = {
            router: PropTypes.func.isRequired
        };

        static willTransitionTo(transition, params, query, callback) {
            _lastAuthTransitionPath = transition.path;

            const state = CurrentUserStore.getState();
            if (AuthStateView.predicate(state.isAuthenticated)) {
                transition.redirect(AuthStateView.redirectUrl());
            }

            callback();
        }

        render() {
            return (<ChildComponent {...this.props} />);
        }
    }

    AuthStateView.predicate = predicate;
    AuthStateView.redirectUrl = redirectFunc;

    return AuthStateView;
}


/**
 * 'Higher Order Component' that checks that the user is not
 *  authenticated and redirects to specified url if she is.
 *
 *  Can be used directly:
 *
 *   >>> anonymousView('home')(MyComponent)
 *
 *  or as a ES7 decorator:
 *
 *   >>> @anonymousView('home')
 *   >>> class MyComponent extends Component {...}
 * @param redirectUrl
 */
export function anonymousView(redirectUrl) {
    if (!redirectUrl) {
        redirectUrl = () => {
            return DJ_CONST.LOGIN_REDIRECT;
        };
    }

    return function decorator(ChildComponent) {
        return makeView(ChildComponent, authenticated => authenticated, redirectUrl);
    };
}


/**
 * 'Higher Order Component' that checks that the user is
 *  authenticated and redirects to specified url if she is not.
 *
 *  Can be used directly:
 *
 *   >>> authenticatedView('home')(MyComponent)
 *
 *  or as a ES7 decorator:
 *
 *   >>> @authenticatedView('home')
 *   >>> class MyComponent extends Component {...}
 */
export function authenticatedView(redirectUrl) {
    return function decorator(ChildComponent) {
        return makeView(ChildComponent, authenticated => !authenticated, redirectUrl);
    };
}


export function getLoginRedirectUrl() {
    return _lastAuthTransitionPath || DJ_CONST.LOGIN_REDIRECT;
}
