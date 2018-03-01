/**
 * This Duck is for handling logged in user actions and user data.
 */
import {combineReducers} from 'redux';

export const STATE_KEY = 'users';

const SET_USER = `${STATE_KEY}/SET_USER`;
export const SET_ACTIVE_LANGUAGE = `${STATE_KEY}/SET_ACTIVE_LANGUAGE`;


function userReducer(state = null, action) {
    switch (action.type) {
        case SET_USER:
            return action.user;

        default:
            return state;
    }
}

function authenticatedReducer(state = false, action) {
    switch (action.type) {
        case SET_USER:
            return !!action.user && !!Object.keys(action.user).length;

        default:
            return state;
    }
}

function activeLanguageReducer(state = null, action) {
    switch (action.type) {
        case SET_ACTIVE_LANGUAGE:
            return action.language;

        default:
            return state;
    }
}


export default combineReducers({
    user: userReducer,
    isAuthenticated: authenticatedReducer,
    activeLanguage: activeLanguageReducer,
});

export const setUser = user => ({type: SET_USER, user});
export const setActiveLanguage = language => ({type: SET_ACTIVE_LANGUAGE, language});

export const selectors = {
    isAuthenticated: state => state[STATE_KEY].isAuthenticated,
    user: state => state[STATE_KEY].user,
    activeLanguage: state => state[STATE_KEY].activeLanguage,
};

