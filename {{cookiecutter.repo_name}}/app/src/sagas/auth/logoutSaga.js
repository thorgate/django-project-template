import { userActions } from '@thorgate/spa-permissions';
import { put, select } from 'redux-saga/effects';
import qs from 'qs';
import { getLocation, replace } from 'connected-react-router';
import { resolvePath } from 'tg-named-routes';

import { saveToken } from 'sagas/helpers/token';

export default function* logoutWorker() {
    let url = resolvePath('landing');

    const location = yield select(getLocation);

    const query = qs.parse(location.search, { ignoreQueryPrefix: true });
    if (query.next) {
        url = query.next;
    }

    saveToken();

    if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log('Logging out, next url:', url);
    }

    yield put(userActions.resetUser());
    yield put(replace(url));
}
