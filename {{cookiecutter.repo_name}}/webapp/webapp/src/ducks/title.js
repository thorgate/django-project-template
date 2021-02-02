// Actions
const SET_TITLE = 'TITLE/SET_TITLE';

// Initial state for reducer
const initialState = {
    title: '',
};

// Reducer(s)
export default function titleReducer(state = initialState, action) {
    switch (action.type) {
        case SET_TITLE:
            return {
                ...state,
                title: action.title,
            };
        default:
            return state;
    }
}

// Action creators
export const setTitle = (title) => ({ type: SET_TITLE, title });

/*
    This specific example doesn't necessarily require redux-thunk
    but this is a basic example of how you can return a function in your action.
    Mostly useful for complex logic that is required before dispatching the action (e.g API calls).
*/
export const createTitle = (title) => (dispatch) => {
    dispatch(setTitle(title));
};
