import { errorReducer } from '@thorgate/spa-errors';
import { entitiesReducer } from '@thorgate/spa-entities';
import { loadingReducer } from '@thorgate/spa-pending-data';
import { userReducer } from '@thorgate/spa-permissions';
import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';

import application, { APP_STATE_KEY } from 'ducks/application';


export default (history) => combineReducers({
    router: connectRouter(history),
    error: errorReducer,
    entities: entitiesReducer,
    loading: loadingReducer,
    user: userReducer,
    [APP_STATE_KEY]: application,
});
