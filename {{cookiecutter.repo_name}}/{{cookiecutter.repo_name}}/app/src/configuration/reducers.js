import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';

import users, {STATE_KEY as USERS_KEY} from 'ducks/user';
import errors from 'ducks/errors';


const reducers = {
    errors,
    [USERS_KEY]: users,
    router: routerReducer,
};

export default combineReducers(reducers);
