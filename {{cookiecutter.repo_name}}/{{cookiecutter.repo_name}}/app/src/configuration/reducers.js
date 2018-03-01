import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';

import users, {STATE_KEY as USERS_KEY} from 'ducks/user';
import errors from 'ducks/errors';
import serverClient, {STATE_KEY as SERVER_STATE_KEY} from 'ducks/serverClient';

const reducers = {
    errors,
    [USERS_KEY]: users,
    router: routerReducer,
};

export default combineReducers(reducers);

export const serverRootReducer = SERVER_MODE ? combineReducers({
    ...reducers,
    [SERVER_STATE_KEY]: serverClient,
}) : null;
