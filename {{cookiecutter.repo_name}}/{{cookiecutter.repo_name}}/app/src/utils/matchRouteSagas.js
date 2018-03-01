import {matchRoutes} from 'react-router-config';


const reduceSagas = sagas => (
    sagas.reduce((result, {saga, match}) => {
        if (Array.isArray(saga)) {
            return result.concat(saga.map(s => ({saga: s, args: [match]})));
        }

        result.push({saga, args: [match]});
        return result;
    }, [])
);


export default (routes, pathName) => {
    const branch = matchRoutes(routes, pathName);

    const initialTasks = [];
    const watcherTasks = [];
    branch.forEach(({route, match}) => {
        if (route.initial) {
            initialTasks.push({saga: route.initial, match});
        }

        if (route.watcher) {
            watcherTasks.push({saga: route.watcher, match});
        }
    });

    return {
        initialTasks: reduceSagas(initialTasks),
        watcherTasks: reduceSagas(watcherTasks),
    };
};
