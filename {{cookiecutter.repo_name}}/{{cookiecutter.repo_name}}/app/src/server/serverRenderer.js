import serialize from 'serialize-javascript';

import React from 'react';
import ReactDOMServer from 'react-dom/server';

import {StaticRouter} from 'react-router-dom';
import {renderRoutes} from 'react-router-config';
import Helmet from 'react-helmet';
import {Provider} from 'react-redux';

import configureStore from 'configuration/configureStore';
import routes from 'configuration/routes';
import {selectors as userSelectors, setActiveLanguage} from 'ducks/user';
import sagaRunner from 'sagas/helpers/sagaRunner';
import getMatchRouteSagas from 'utils/matchRouteSagas';
import i18n from 'utils/i18n';

import logger from './utils/logger';
import getLanguage from './utils/language';
import collectAssets from './utils/assets';


const serializeState = state => serialize(state);


const setHeadersFromContext = (ctx) => {
    const mutateRawResponse = (rawResponse) => {
        const setCookieHeader = rawResponse.headers && rawResponse.headers['set-cookie'];
        if (setCookieHeader) {
            ctx.set({
                'Set-Cookie': setCookieHeader,
            });
        }
        return rawResponse;
    };

    return {
        requestConfig: {
            mutateRawResponse,
            cookies: ctx.cookie,
        },
    };
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
            </Provider>,
        );

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

        const {store, sagaMiddleware} = configureStore({}, {
            sagaMiddleware: {
                context: setHeadersFromContext(ctx),
            },
        });

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
