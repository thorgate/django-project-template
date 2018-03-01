const SET_ERROR = 'errors/SET_ERROR';

export default function reducer(state = null, action) {
    switch (action.type) {
        case SET_ERROR:
            return action.error;

        default:
            return state;
    }
}

export const setError = error => ({
    type: SET_ERROR,
    error: error ? {
        statusCode: error.statusCode,
        message: error.message || error.toString(),
        stack: error.stack,
        responseText: error.responseText,
    } : null,
});
