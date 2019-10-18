import { getLocalStorage } from '@thorgate/spa-view';
import addMinutes from 'date-fns/addMinutes';
import { getContext } from 'redux-saga/effects';
import Cookies from 'js-cookie';

import SETTINGS from 'settings';
import { isValidIpAddress } from 'utils/validators/ipAddress';


export function* getToken() {
    if (process.env.BUILD_TARGET === 'server') {
        return yield getContext('token');
    }

    // Handle loading token from cookie
    return Cookies.get(SETTINGS.AUTH_TOKEN_NAME);
}


export function saveToken(access = null, refresh = null) {
    const cookieOptions = {
        expires: addMinutes(new Date(), SETTINGS.AUTH_TOKEN_LIFETIME),
    };

    // Replace http protocol and strip port if present
    const domain = `${SETTINGS.SITE_URL}`.replace(/^https?:\/\//, '').replace(/:\d+$/, '');

    if (process.env.NODE_ENV === 'production' || !isValidIpAddress(domain)) {
        cookieOptions.domain = `.${domain}`;
    }

    if (!access && !refresh) {
        Cookies.remove(SETTINGS.AUTH_TOKEN_NAME, cookieOptions);
        getLocalStorage().removeItem(SETTINGS.AUTH_REFRESH_TOKEN_NAME);
        return;
    }

    Cookies.set(SETTINGS.AUTH_TOKEN_NAME, access, cookieOptions);

    if (refresh) {
        getLocalStorage().setItem(SETTINGS.AUTH_REFRESH_TOKEN_NAME, refresh);
    }
}
