import { ViewManager } from "@thorgate/spa-view-manager";
import { getLocation, replace } from "connected-react-router";
import { fork, put, select } from "redux-saga/effects";

import routes from "@/src/configuration/routes";

export default function* rootSaga(hot = false) {
    yield fork(ViewManager, routes, { allowLogger: true });

    if (hot) {
        const location = yield select(getLocation);
        yield put(replace(location));
    }
}
