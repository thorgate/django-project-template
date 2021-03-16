import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

/*
    This specific example doesn't necessarily require redux-thunk
    but this is a basic example of how you can return a function in your action.
    Mostly useful for complex logic that is required before dispatching the action (e.g API calls).
*/
export const createTitle = createAsyncThunk(
    'title/createTitle',
    async (title) => {
        await new Promise((yay) => setTimeout(yay, 1000));

        return title;
    },
);

const titleSlice = createSlice({
    name: 'title',
    initialState: {
        value: '',
    },
    reducers: {
        setTitle: (state, action) => {
            state.value = action.payload;
        },
    },
    extraReducers: {
        [createTitle.fulfilled]: (state, action) => {
            state.value = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setTitle } = titleSlice.actions;

export const selectTitle = (state) => state.title.value;

export default titleSlice.reducer;
