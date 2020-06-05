import { combineReducers } from 'redux';

import title from './ducks/title';

const rootReducer = combineReducers({
    title,
});

export default rootReducer;
