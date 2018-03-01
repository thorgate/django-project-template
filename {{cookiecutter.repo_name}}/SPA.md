## <a name="general"></a>General Info

- Out of the box Redux, Redux-Saga & Hot-Reload setup
- In development SPA is running on port `8000` by default, this can be changed with `KOA_PORT` django setting
- Running behind different host name: Add `SESSION_COOKIE_DOMAIN = 'THE_DOMAIN'` to local django settings


## <a name="structure"></a>SPA Structure

* `components/` - Generic components
* `configuration/` - Redux configurations + route config
* `containers/` - Wrapper components e.g App, View etc.
* `decorators/` - HOC helpers, easier to manage if not in some other container or component
* `ducks/` - Redux actions & reducers
* `forms/` - Forms used - Separation of Concerns - better to have forms in single location than having to look for them in components
* `sagas/` - Side-effect handlers - each view defines it own required running sagas
* `server/` - Frontend server app
* `utils/` - General helpers, e.g i18n, cookies, api router
* `views/` - View components


## <a name="viewComponents"></a>View Components

```js
import withView from 'decorators/withView';

const ViewComponent = () => (
    <div />
);

export default withView('Page title')(ViewComponent);
```

And then in route config to support code splitting:

```js
// Add view as additional chunk with SSR support (view is loaded synchronously server-side)
const ViewComponent = universal(import('views/ViewComponent'), {
    loading: Loading,
    resolve: () => require.resolveWeak('views/ViewComponent'),
});
```

For more info see [react-universal-component](https://github.com/faceyspacey/react-universal-component).


### View helpers
- ``withView`` *(Function)*: Function with signature `(title: string, authRequired: bool, decoratorProps: Object) => Component` HOC to define view
                             Wrap's base view with `View` component to handle scroll position restore & auth redirect.
                             Decorator props allows overriding `View` component props e.g `NotFoundComponent` to display different 404 page


## <a name="routeConfig"></a>Route config

```js
const routes = [
    {
        component: App,
        initial: [], // initial data saga
        watcher: [], // listen for actions, not used on server
        // children components or views to render, matched by path
        // routes can be defined for children as well
        routes: [
            {
                path: '/',
                exact: true,
                name: 'landing',
                component: Home,
                initial: [], // initial data saga
                watcher: [], // listen for actions, not used on server
            },         
        ],
    }
];
```

- ``component`` *(class|Function)*: React Component to render for this path
- ``path`` *(String)*: URL for view
- ``name`` *(String)*: View name, can be used with `urlResolve` helper
- ``exact`` *(Boolean)*: Match exact path or only partial, e.g `exact=false`, `/` and `/hello` will be matched but `/` will be used
- ``initial`` *(Array[Generator]|Generator)*: Initial data sagas, can be array to specify more than 1
- ``watcher`` *(Array[Generator]|Generator)*: Watcher sagas, can be array to specify more than 1, front-end only.
- ``routes`` *(Array[RouteObject])*: Children routes, each view can have child routes 
                                             e.g Products can have list & detail view with same base component around it

Initial data generator should have signature `function* saga(match) {...}`. For more info on [`match`](https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config).


### Route helpers
- ``urlResolve`` *(Function)*: Function with signature `(name: string, kwargs: Object) => String` to use urls with names
                               e.g for url `/test/:id` `kwargs` should be `{id: 1}` and results in `/test/1`
                               e.g for optional parameter `/test/:id?` `kwargs` can be `null` and results in `/test`
