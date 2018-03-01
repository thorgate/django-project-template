export const STATE_KEY = 'serverClient';

const SET_MUTATOR = `${STATE_KEY}/SET_MUTATOR`;
const SET_COOKIES = `${STATE_KEY}/SET_COOKIES`;

const initialState = {
    mutator: null,
    cookies: null,
};

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_MUTATOR:
            return {...state, mutator: action.mutator};

        case SET_COOKIES:
            return {...state, cookies: action.cookies};

        default:
            return state;
    }
}


export const setMutator = mutator => ({type: SET_MUTATOR, mutator});
export const setCookies = cookies => ({type: SET_COOKIES, cookies});

export const selectConfig = (state) => {
    const config = {};

    if (state[STATE_KEY]) {
        config.mutateRawResponse = state[STATE_KEY].mutator;
        config.cookies = state[STATE_KEY].cookies;
    }

    return config;
};
