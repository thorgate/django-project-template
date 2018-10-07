import path from 'path';
import { ChunkExtractor, ChunkExtractorManager } from '@loadable/server';
import '@tg-resources/fetch-runtime';
import { isAuthenticated } from '@thorgate/spa-permissions';
import { createLocationAction, ViewManagerWorker } from '@thorgate/spa-view-manager';
import Koa from 'koa';
import koaServe from 'koa-static';
import koaHelmet from 'koa-helmet';
import Router from 'koa-router';
import koaLogger from 'koa-logger';
import koaResponseTime from 'koa-response-time';
import koaUserAgent from 'koa-useragent';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import serialize from 'serialize-javascript';
import addYears from 'date-fns/add_years';
import { RenderChildren } from 'tg-named-routes';

import configureStore from 'configuration/configureStore';
import routes from 'configuration/routes';
import { setActiveLanguage } from 'ducks/application';
import SETTINGS from 'settings';

import proxyFactory from './appProxy';
import errorHandler from './errorHandler';
import logger from './logger';


const statsFile = path.resolve(path.join(__dirname, '..', 'build', 'loadable-stats.json'));

// Initialize `koa-router` and setup a route listening on `GET /*`
// Logic has been splitted into two chained middleware functions
// @see https://github.com/alexmingoia/koa-router#multiple-middleware
const router = new Router();
router.get(
    '*',
    async (ctx, next) => {
        console.log('target %s', process.env.BUILD_TARGET);

        const { store } = configureStore({}, {
            sagaMiddleware: {
                context: {
                    token: ctx.cookies.get(SETTINGS.AUTH_TOKEN_NAME),
                },
            },
            location: ctx.originalUrl,
        });

        // Set the language
        const { language } = ctx.state;
        store.dispatch(setActiveLanguage(language));
        ctx.logger.debug('Set language to: %s', language);

        const task = store.runSaga(ViewManagerWorker, routes, createLocationAction(store.getState().router));

        store.close();

        await task.toPromise();

        const authState = isAuthenticated(store.getState());
        ctx.logger.debug('Got auth state: %s', authState);

        const context = {};
        const extractor = new ChunkExtractor({ statsFile, entrypoints: ['client'] });

        ctx.state.markup = renderToString((
            <ChunkExtractorManager extractor={extractor}>
                <Provider store={store}>
                    <StaticRouter context={context} location={ctx.url}>
                        <RenderChildren routes={routes} />
                    </StaticRouter>
                </Provider>
            </ChunkExtractorManager>
        ));
        ctx.state.helmet = Helmet.renderStatic();

        if (context.url) {
            return ctx.redirect(context.url);
        }

        // Provide script tags forward
        ctx.state.linkTags = extractor.getLinkTags();
        ctx.state.scriptTags = extractor.getScriptTags();
        ctx.state.styleTags = extractor.getStyleTags();

        // Serialize state
        ctx.state.serializedState = serialize(store.getState());

        return next();
    },
    (ctx, next) => {
        ctx.status = 200;
        ctx.body = `<!doctype html>
        <html ${ctx.state.helmet.htmlAttributes.toString()}>
        <head>
            ${ctx.state.helmet.title.toString()}
            ${ctx.state.helmet.link.toString()}
            ${ctx.state.helmet.meta.toString()}
            ${ctx.state.helmet.style.toString()}
            ${ctx.state.linkTags}
            ${ctx.state.styleTags}
        </head>
        <body ${ctx.state.helmet.bodyAttributes.toString()}>
            <div id="root">${ctx.state.markup}</div>
            ${ctx.state.scriptTags}
            <script>window.__initial_state__ = ${ctx.state.serializedState};</script>
        </body>
    </html>`;
        return next();
    },
);


const server = new Koa();
server.context.logger = logger;

if (process.env.NODE_ENV !== 'production') {
    server.use(koaLogger((str, args) => logger.info(str, ...args)));
} else {
    // Tell Koa to trust proxy headers
    server.proxy = true;
}

// Configure proxy services
proxyFactory(server, SETTINGS.APP_PROXY || {});

server
    .use(errorHandler(process.env.RAZZLE_RAVEN_BACKEND_DSN))
    // Add response time to headers
    .use(koaResponseTime())
    // Add user agent parsing
    .use(koaUserAgent)
    // `koa-helmet` provides security headers to help prevent common, well known attacks
    // @see https://helmetjs.github.io/
    .use(koaHelmet())
    // Process language to context state
    .use((ctx, next) => {
        const language = ctx.cookies.get(SETTINGS.LANGUAGE_COOKIE_NAME) || SETTINGS.DEFAULT_LANGUAGE;

        ctx.state.language = language;
        ctx.logger.debug('Language: %s', language);
        ctx.cookies.set(SETTINGS.LANGUAGE_COOKIE_NAME, language, {
            expires: addYears(new Date(), 1), httpOnly: false,
        });

        return next();
    })
    // Serve static files located under `process.env.RAZZLE_PUBLIC_DIR`
    .use(koaServe(process.env.RAZZLE_PUBLIC_DIR))
    .use(router.routes())
    .use(router.allowedMethods());

export default server;
