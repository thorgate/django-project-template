import {call, takeLatest} from 'redux-saga/effects';

import {SET_ACTIVE_LANGUAGE} from 'ducks/user';
import {setCookie} from 'utils/cookie';
import i18n from 'utils/i18n';


function* setActiveLanguage({language}) {
    yield call(i18n.forceLanguage, language);
    setCookie(DJ_CONST.LANGUAGE_COOKIE_NAME, language);
}


export default function* activeLanguageWatcher() {
    yield takeLatest(SET_ACTIVE_LANGUAGE, setActiveLanguage);
}
