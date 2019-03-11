import { getLocalStorage } from '@thorgate/spa-view';
import addMinutes from 'date-fns/add_minutes';
import { getContext } from 'redux-saga/effects';
import Cookies from 'js-cookie';

import SETTINGS from 'settings';


export function* getToken() {
    if (process.env.BUILD_TARGET === 'server') {
        return yield getContext('token');
    }

    // Handle loading token from cookie
    return Cookies.get(SETTINGS.AUTH_TOKEN_NAME);
}


export function saveToken(access = null, refresh = null) {
    if (!access && !refresh) {
        Cookies.remove(SETTINGS.AUTH_TOKEN_NAME);
        getLocalStorage().removeItem(SETTINGS.AUTH_REFRESH_TOKEN_NAME);
        return;
    }

    const cookieOptions = {
        expires: addMinutes(new Date(), SETTINGS.AUTH_TOKEN_LIFETIME),
    };

    if (process.env.NODE_ENV === 'production') {
        const domain = SETTINGS.SITE_URL.replace('https://', '').replace('http://', '');
        cookieOptions.domain = `.${domain}`;
    }

    Cookies.set(SETTINGS.AUTH_TOKEN_NAME, access, cookieOptions);

    if (refresh) {
        getLocalStorage().setItem(SETTINGS.AUTH_REFRESH_TOKEN_NAME, refresh);
    }
}
