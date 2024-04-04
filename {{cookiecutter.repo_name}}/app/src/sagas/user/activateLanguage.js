import { takeLatest } from "redux-saga/effects";

const SET_ACTIVE_LANGUAGE = "sagas/app/SET_ACTIVE_LANGUAGE";

/**
 * Create set active language Redux action
 * @param {string} language Language code to activate
 * @returns {{type: string, language: string}} Created action
 */
export const setActiveLanguage = (language) => ({
    type: SET_ACTIVE_LANGUAGE,
    language,
});

function setActiveLanguageWorker({ language }) {}

export default function* activeLanguageWatcher() {
    yield takeLatest(SET_ACTIVE_LANGUAGE, setActiveLanguageWorker);
}
