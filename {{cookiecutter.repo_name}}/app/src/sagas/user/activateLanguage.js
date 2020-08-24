{% raw %}import { takeLatest } from 'redux-saga/effects';
import Cookies from 'js-cookie';

import SETTINGS from 'settings';

const SET_ACTIVE_LANGUAGE = 'sagas/app/SET_ACTIVE_LANGUAGE';

/**
 * Create set active language Redux action
 * @param {string} language Language code to activate
 * @returns {{type: string, language: string}} Created action
 */
export const setActiveLanguage = language => ({
    type: SET_ACTIVE_LANGUAGE,
    language,
});

function setActiveLanguageWorker({ language }) {
    const cookieLanguage = Cookies.get(SETTINGS.LANGUAGE_COOKIE_NAME);

    // Update language cookie
    if (language !== cookieLanguage) {
        Cookies.set(SETTINGS.LANGUAGE_COOKIE_NAME, language, { expires: 365 });
    }
}

export default function* activeLanguageWatcher() {
    yield takeLatest(SET_ACTIVE_LANGUAGE, setActiveLanguageWorker);
}{% endraw %}
