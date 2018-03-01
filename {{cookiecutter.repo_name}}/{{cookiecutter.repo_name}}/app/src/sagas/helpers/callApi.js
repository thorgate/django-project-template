import Raven from 'raven-js';
import {call, select} from 'redux-saga/effects';

import {selectConfig} from 'ducks/serverClient';


/**
 * Call `Resource` with saga and pass config in when Server-Side rendered
 * @param resource - `Resource` object
 * @param method - API method to call
 * @param rest - Additional options (must be in same order as `Resource.<method>` requires)
 * @returns {*} - Response from API call
 */
function* handleApiCall(resource, method, ...rest) {
    let requestConfig = {};
    if (SERVER_MODE) {
        requestConfig = yield select(selectConfig);
    }

    const validStatusCodes = rest.pop();

    // allow valid status codes to be overwritten
    if (Array.isArray(validStatusCodes)) {
        requestConfig.statusSuccess = validStatusCodes;
    }

    // append request config to override settings
    rest.push(requestConfig);

    let response = null;
    try {
        response = yield call([resource, method], ...rest);
    } catch (error) {
        const shouldCapture404 = (
            !DJ_CONST.KOA_APP_IGNORE_404 && error.isInvalidResponseCode && error.statusCode === 404
        );

        if (!DEV_MODE && !error.isValidationError && shouldCapture404) {
            Raven.captureException(error);
        }
        return {error};
    }

    return {result: response};
}


export function* handleApiFetch(resource, kwargs, query, validStatusCodes = null) {
    return yield call(handleApiCall, resource, 'fetch', kwargs, query, validStatusCodes);
}

export function* handleApiPost(resource, kwargs, data, query, validStatusCodes = null) {
    return yield call(handleApiCall, resource, 'post', kwargs, data, query, validStatusCodes);
}

export function* handleApiDelete(resource, kwargs, data, query, validStatusCodes = null) {
    return yield call(handleApiCall, resource, 'del', kwargs, data, query, validStatusCodes);
}

export function* handleApiPut(resource, kwargs, data, query, validStatusCodes = null) {
    return yield call(handleApiCall, resource, 'put', kwargs, data, query, validStatusCodes);
}
