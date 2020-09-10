import loadable from '@loadable/component';
import '@tg-resources/fetch-runtime';
import { buildUrlCache, resolvePath } from 'tg-named-routes';

import App from 'containers/AppShell';
import PageNotFound from 'views/PageNotFound';

import permissionCheck from 'sagas/auth/permissionCheckSaga';
import activateLanguage from 'sagas/user/activateLanguage';
import fetchUserDetails from 'sagas/user/fetchUserDetails';

import { createAuthenticationRoutes } from './routes/authentication';

const Home = loadable(() => import('views/Home'));
const RestrictedView = loadable(() => import('views/RestrictedView'));

const NotFoundRoute = {
    name: '404',
    path: '*',
    component: PageNotFound,
};

const routes = [
    {
        component: App,
        initial: [fetchUserDetails],
        watcher: [activateLanguage],
        routes: [
            {
                path: '/',
                exact: true,
                name: 'landing',
                component: Home,
            },
            {
                path: '/restricted',
                exact: true,
                name: 'restricted',
                component: RestrictedView,
                initial: permissionCheck,
            },
            createAuthenticationRoutes(NotFoundRoute),
            NotFoundRoute,
        ],
    },
];

buildUrlCache(routes);

/**
 * Resolve url name to valid path.
 *   Also known as `resolveUrl` or `reverseUrl`.
 *
 * Providing query string can be done with object or string.
 * Caveat with string is that it should be formatted correctly e.g `foo=bar` or `foobar`
 *
 * @deprecated
 * @param name URL name
 * @param [kwargs=null] URL parameters
 * @param [query=null] URL query string
 * @param [state=null] URL state object to pass to next url
 * @returns URL matching name and kwargs
 */
export const urlResolve = resolvePath;

export default routes;
