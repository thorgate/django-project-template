{% raw %}## <a name="general"></a>General Info

- Out of the box React-Router, Redux, Redux-Saga & Hot-Reload setup
- In development SPA is running on port `8000` (mapped to `8000`) by default.
    - Webpack dev server is running on `8001`, assets are loaded from there
    - This can be changed by creating `.env.development.local` and adding `PORT=4000` (assets server is then `4001`),
      don't forget to change docker compose mappings as well
- Running behind different host name: Add `SESSION_COOKIE_DOMAIN = 'THE_DOMAIN'` to local django env file


## <a name="structure"></a>SPA Structure

* `components/` - Generic components
* `configuration/` - Redux configurations + route config
* `containers/` - Smart components that connect to Redux for example.
* `containers/core` - `App`, `View`, `PermissionCheck` etc.
* `decorators/` - HOC helpers, easier to manage if not in some other container or component
* `ducks/` - Redux actions & reducers
* `forms/` - Forms used - Separation of Concerns - better to have forms in single location than having to look for them in components
* `sagas/` - Side-effect handlers - each view defines it own required running sagas
* `utils/` - General helpers, e.g i18n, cookies, api router
* `views/` - View components
* `client.js` - Client app entry point
* `server/index.js` - Server renderer entry point


## <a name="viewComponents"></a>View Components

```js
import withView from 'decorators/withView';

const ViewComponent = () => (
    <div>
        <Helmet>
            <title>Page title</title>
        </Helmet>
    </div>
);

export default withView()(ViewComponent);
```

And then in route config to support code splitting:

```js
// Add view as additional chunk to split all related components / views in to separate chunk
// When SSR is enabled, view is loaded synchronously server-side
const ViewComponent = loadable(() => import('views/ViewComponent'));
```

For more info see [loadable-components](https://github.com/smooth-code/loadable-components).


### View helpers
- ``withView`` *(Function)*: Function with signature `(decoratorProps: Object) => Component` HOC to define a view
                             Wrap's base view with `View` component to handle scroll position restore & auth redirect.
                             Decorator props allows overriding `View` component props e.g `NotFoundComponent` to display different 404 page
                             For more info check out [@thorgate/spa-view](https://github.com/thorgate/tg-spa-utils/tree/master/packages/view)

- ``permissionCheck`` *(Function)*: Function with signature `(permissionCheckFn: (props) => boolean, decoratorProps: Object) => Component` HOC to define a view permissions
                             Wrap's base view with `PermissionCheck` component to handle permission check & auth redirect.
                             Decorator props allows overriding `PermissionCheck` component props
                             e.g `PermissionDeniedComponent` to display different 403 page or
                             `redirectLogin` to redirect to login view, can be used only without `PermissionDeniedComponent`
                             For more info check out [@thorgate/spa-permissions](https://github.com/thorgate/tg-spa-utils/tree/master/packages/permissions)


## Loading static assets

 - Loading images
 
```js
import something from 'path-to-images-folder/something.png';


// React <img /> config
const Foo = () => (
    <img src={something} />
);


// Inline background image
const Bar = () => (
    <div style={{backgroundImage: `url('${something}')`}} />
);

```                             


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
- `matchProvider` can be used to wrap watcher to use same worker for the watcher task


### Route helpers
- ``urlResolve`` *(Function)*: Function with signature `(name: string, kwargs: Object, query: Object, state:Object = null) => Object` to use urls with names
                               e.g for url `/test/:id` `kwargs` should be `{id: 1}` and results in `{pathname: '/test/1'}`
                               e.g for optional parameter `/test/:id?` `kwargs` can be `null` and results in `{pathname: '/test'}`
{% endraw %}
