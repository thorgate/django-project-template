import { isAuthenticated } from '@thorgate/spa-permissions';
import is from 'is_js';
import { select } from 'redux-saga/effects';

/**
 * Store state validation saga.
 * Throws error when checkPermissions returns false or state.user.isAuthenticated !== true
 *
 * @param {function: boolean} checkPermissions - State selector to do custom check if user has permission or not.
 * @returns {IterableIterator<*|SelectEffect>}
 */
export default function* isLoggedIn(checkPermissions = null) {
    let hasPermission = false;

    if (is.function(checkPermissions)) {
        hasPermission = yield select(checkPermissions);
    } else {
        hasPermission = yield select(isAuthenticated);
    }

    if (!hasPermission) {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
}
