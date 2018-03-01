import universal from 'react-universal-component';

import Loading from 'components/Loading';
import App from 'containers/App';
import PageNotFound from 'views/PageNotFound';

import activateLanguage from 'sagas/user/activateLanguage';
import fetchUserDetails from 'sagas/user/fetchUserDetails';
import logoutSaga from 'sagas/user/logoutSaga';
import loginWatcher from 'sagas/user/loginSaga';


const Home = universal(() => import('views/Home'), {
    loading: Loading,
    resolve: () => require.resolveWeak('views/Home'),
});
const Login = universal(() => import('views/Login'), {
    loading: Loading,
    resolve: () => require.resolveWeak('views/Login'),
});

const routes = [
    {
        component: App,
        initial: fetchUserDetails,
        watcher: [
            logoutSaga,
            activateLanguage,
        ],
        routes: [
            {
                path: '/',
                exact: true,
                name: 'landing',
                component: Home,
            },
            {
                path: '/login',
                exact: true,
                name: 'login',
                component: Login,
                watcher: loginWatcher,
            },
            {
                path: '*',
                component: PageNotFound,
            },
        ],
    },
];

const urlMapCache = {};

export const rebuildUrlCache = (routeData = routes, namespace = null) => {
    routeData.forEach((route) => {
        const baseName = !namespace ? '' : `${namespace}:`;

        if (route.path && route.name) {
            const base = route.path.split('/');
            const regex = /:([^/?]+)(\??)/g;

            urlMapCache[`${baseName}${route.name}`] = {
                pattern: route.path,
                resolve: (kwargs) => {
                    const parameters = kwargs || {};
                    const urlFragments = base.map((fragment) => {
                        const result = regex.exec(fragment);
                        if (result) {
                            const parameterName = result[1];
                            const optional = result[2];

                            if (parameters[parameterName] === undefined && !optional) {
                                throw Error('Parametrized url missing parameters');
                            }

                            return parameters[parameterName];
                        }

                        return fragment;
                    }).filter(fragment => !!fragment).join('/');

                    return `/${urlFragments}`;
                },
            };
        }

        if (route.routes) {
            rebuildUrlCache(route.routes, `${baseName}${route.name || ''}`);
        }
    });
};

rebuildUrlCache();

export const urlResolve = (name, kwargs) => {
    if (!Object.keys(urlMapCache)) {
        rebuildUrlCache();
    }

    if (!urlMapCache[name]) {
        throw Error(`Unknown url name : ${name}`);
    }

    return urlMapCache[name].resolve(kwargs);
};

export default routes;
