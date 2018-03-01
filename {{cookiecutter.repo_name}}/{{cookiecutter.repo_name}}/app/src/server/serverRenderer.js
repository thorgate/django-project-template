import path from 'path';

import serialize from 'serialize-javascript';

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {flushModuleIds} from 'react-universal-component/server';
import flushChunks from 'webpack-flush-chunks';
import {put} from 'redux-saga/effects';

import {StaticRouter} from 'react-router-dom';
import {renderRoutes} from 'react-router-config';
import Helmet from 'react-helmet';
import {Provider} from 'react-redux';

import configureStore from 'configuration/configureStore';
import routes from 'configuration/routes';
import {STATE_KEY as SERVER_STATE_KEY, setMutator, setCookies} from 'ducks/serverClient';
import {selectors as userSelectors, setActiveLanguage} from 'ducks/user';
import sagaRunner from 'sagas/helpers/sagaRunner';
import logger from 'server/logger';
import getMatchRouteSagas from 'utils/matchRouteSagas';
import i18n from 'utils/i18n';
import getLanguage from './language';


function collectAssets(ctx, clientStats) {
    // DEV: Use webpack-dev-middleware compiled version
    // Production: Use cached stats file

    const loadOrder = ['manifest', 'vendor', 'app', 'styles'];
    const appendPublicPath = asset => `${DJ_CONST.STATIC_WEBPACK_URL}${asset}`;
    let scripts = [];
    let styles = [];

    // When not pre-rendering, add all chunks
    if (ctx.state.noPreRender) {
        const assetsByChunkName = clientStats.assetsByChunkName;

        const isScript = asset => asset.endsWith('.js');
        const isStyles = asset => asset.endsWith('.css');
        const appendAssets = (chunk) => {
            let chunks = chunk;
            if (!Array.isArray(chunks)) {
                chunks = [chunks];
            }

            scripts = scripts.concat(chunks.filter(isScript));
            styles = styles.concat(chunks.filter(isStyles));
        };

        loadOrder.forEach((chunkName) => {
            appendAssets(assetsByChunkName[chunkName]);
        });

        Object.entries(assetsByChunkName).forEach(([name, chunk]) => {
            if (loadOrder.find(key => name === key)) {
                return;
            }

            appendAssets(chunk);
        });
    } else {
        const moduleIds = flushModuleIds();
        const chunks = flushChunks(clientStats, {
            moduleIds,
            before: loadOrder,
            after: [],
            rootDir: path.join(__dirname, '..'),
        });
        scripts = chunks.scripts;
        styles = chunks.stylesheets;
    }
    return {
        script: scripts.map(appendPublicPath),
        style: styles.map(appendPublicPath),
    };
}

const serializeState = state => serialize(Object.entries(state).reduce((result, [key, data]) => {
    if (key !== SERVER_STATE_KEY) {
        result[key] = data;  // eslint-disable-line no-param-reassign
    }
    return result;
}, {}));


const setHeadersFromContext = ctx => function* mutatorSetter() {
    const mutator = (rawResponse) => {
        const setCookieHeader = rawResponse.headers && rawResponse.headers['set-cookie'];
        if (setCookieHeader) {
            ctx.set({
                'Set-Cookie': setCookieHeader,
            });
        }
        return rawResponse;
    };
    yield put.resolve(setMutator(mutator));
    yield put.resolve(setCookies(ctx.cookie));
};


const preRender = async (ctx, store, handleError, doRedirect, clientStats) => {
    try {
        const isAuthenticated = userSelectors.isAuthenticated(store.getState());
        logger.debug(`Got auth state: ${isAuthenticated}`);

        const context = {};
        const html = ReactDOMServer.renderToString(
            <Provider store={store}>
                <StaticRouter location={ctx.url} context={context}>
                    {renderRoutes(routes)}
                </StaticRouter>
            </Provider>);

        const header = Helmet.renderStatic();

        if (context.url) {
            doRedirect(context.url);
        } else {
            let statusCode = 200;
            if (context.status) {
                statusCode = context.status;
            }

            // Load chunk'ed assets
            const assets = collectAssets(ctx, clientStats);

            ctx.status = statusCode;
            await ctx.render('layout', {
                HOST: `${ctx.protocol}://${ctx.host}`,
                PATH: ctx.url,
                header: {
                    htmlAttributes: header.htmlAttributes.toString(),
                    title: header.title.toString(),
                    link: header.link.toString(),
                },
                html,
                assets,

                initialState: serializeState(store.getState()),
                noPreRender: false,

                STATIC_URL: DJ_CONST.DJANGO_SITE_URL + DJ_CONST.STATIC_URL,
                PRODUCTION: !DEV_MODE,
                WORKER: WORKER_ID,
                PRERENDER: 'yes',
            });
        }
    } catch (e) {
        handleError(e, 'render-outer-pre-render');
    }
};

export default options => async (ctx) => {
    function doRedirect(uri, status = null) {
        // to override default 302 status code
        if (status) {
            ctx.status = status;
        }
        ctx.redirect(uri);
    }

    const handleError = (error, type) => {
        // log the error
        logger.error('Routing error %s: %s %s', type, error.toString(), error.stack);

        // let koa handle the response
        ctx.throw(500, type, {error});
    };

    // Append trailing slash
    if (DJ_CONST.APPEND_SLASH) {
        if (!ctx.path) {
            if (!ctx.path.endsWith('/')) {
                doRedirect(`${ctx.path}/`);
                return;
            }
        }
    }

    try {
        logger.debug(`GET ${ctx.path}`);

        const {store, sagaMiddleware} = configureStore();

        const mutatorSetter = sagaMiddleware.run(sagaRunner([setHeadersFromContext(ctx)]));
        await mutatorSetter.done;

        // Find all initial data loaders
        const {initialTasks} = getMatchRouteSagas(routes, ctx.url);

        // Run any server side data loader, if present
        if (initialTasks.length) {
            const task = sagaMiddleware.run(sagaRunner(initialTasks));
            await task.done;
        }

        // Collect assets
        const language = getLanguage(ctx);

        // Set the language
        store.dispatch(setActiveLanguage(language));
        logger.debug(`Set language to: ${language}`);
        i18n.forceLanguage(language);

        if (!options.noPreRender) {
            await preRender(ctx, store, handleError, doRedirect, options.clientStats);
        } else {
            // Render the output directly (this is a lot less resource-heavy on the server)
            ctx.status = 200;
            await ctx.render('layout', {
                HOST: `${ctx.protocol}://${ctx.host}`,
                PATH: ctx.url,
                initialState: serializeState(store.getState()),
                noPreRender: true,

                html: '',
                STATIC_URL: DJ_CONST.DJANGO_SITE_URL + DJ_CONST.STATIC_URL,
                PRODUCTION: !global.DEV_MODE,
                WORKER: WORKER_ID,
                PRERENDER: 'no',
                assets: collectAssets(ctx, options.clientStats),
            });
        }
    } catch (e) {
        handleError(e, 'fatal');
    }
};
