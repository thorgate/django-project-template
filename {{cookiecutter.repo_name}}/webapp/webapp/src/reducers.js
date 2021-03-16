import { combineReducers } from '@reduxjs/toolkit';

import titleReducer from './ducks/title';

const rootReducer = combineReducers({
    title: titleReducer,
});

export default rootReducer;
