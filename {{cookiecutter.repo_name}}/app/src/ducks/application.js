{% raw %}import { combineReducers } from 'redux';

import SETTINGS from 'settings';


// State mount point
export const APP_STATE_KEY = 'application';

// Action types
export const SET_ACTIVE_LANGUAGE = 'application/SET_ACTIVE_LANGUAGE';


const initialState = {
    activeLanguage: SETTINGS.DEFAULT_LANGUAGE,
};


/**
 * Store active language state.
 * @param {null|string} state current state
 * @param {Object} action Redux action object
 * @param {string} action.type Redux action type
 * @param {string} action.language New active language code
 * @returns {null|string} Previous state if not a valid action for this reducer, new state object otherwise
 */
function activeLanguageReducer(state = initialState.activeLanguage, action) {
    switch (action.type) {
        case SET_ACTIVE_LANGUAGE:
            return action.language;

        default:
            return state;
    }
}


export default combineReducers({
    activeLanguage: activeLanguageReducer,
});


/**
 * Create set active language Redux action
 * @param {string} language Language code to activate
 * @returns {{type: string, language: string}} Created action
 */
export const setActiveLanguage = (language) => ({ type: SET_ACTIVE_LANGUAGE, language });


export const applicationSelectors = {
    /**
     * Get active language state
     * @param {Object} state Root state
     * @returns {null|string} Currently active language
     */
    activeLanguage: (state) => state[APP_STATE_KEY].activeLanguage,
};{% endraw %}
