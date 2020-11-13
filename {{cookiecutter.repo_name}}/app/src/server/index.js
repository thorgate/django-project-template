{% raw %}import { ChunkExtractor, ChunkExtractorManager } from '@loadable/server';
import '@tg-resources/fetch-runtime';
import { isAuthenticated } from '@thorgate/spa-permissions';
import {
    createLocationAction,
    ServerViewManagerWorker,
} from '@thorgate/spa-view-manager';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import I18NextFSBackend from 'i18next-node-fs-backend';
import Koa from 'koa';
import koaBody from 'koa-bodyparser';
import koaServe from 'koa-static';
import koaHelmet from 'koa-helmet';
import Router from 'koa-router';
import koaLogger from 'koa-logger';
import koaResponseTime from 'koa-response-time';
import koaUserAgent from 'koa-useragent';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import serializeJS from 'serialize-javascript';
import { RenderChildren, stringifyLocation } from 'tg-named-routes';

import configureStore from 'configuration/configureStore';
import routes from 'configuration/routes';
import { setActiveLanguage } from 'sagas/user/activateLanguage';
import SETTINGS, { getRuntimeConfig } from 'settings';

import proxyFactory from './appProxy';
import errorHandler from './errorHandler';
import {
    loadTranslationsHandler,
    missingKeyHandler,
    koaI18NextMiddleware,
} from './i18n';
import logger from './logger';
import { statsFile, publicDir } from './paths';

i18next
    // Load translations through the filesystem on the server side
    .use(I18NextFSBackend)
    .init({
        fallbackLng: SETTINGS.DEFAULT_LANGUAGE,
        load: 'languageOnly', // No region-specific locales (en-US, de-DE, etc.)
        ns: SETTINGS.TRANSLATION_NAMESPACES,
        defaultNS: SETTINGS.DEFAULT_NAMESPACE,
        preload: SETTINGS.LANGUAGE_ORDER,
        returnEmptyString: false,
        saveMissing: true,
        saveMissingTo: 'all',
        interpolation: {
            escapeValue: false, // Not needed for React
        },
        react: {
            // Currently Suspense is not server ready
            useSuspense: false,
        },
        backend: {
            loadPath: `${publicDir}/locales/{{lng}}/{{ns}}.json`,
            addPath: `${publicDir}/locales/{{lng}}/{{ns}}.missing.json`,
        },

        // Disable async loading
        initImmediate: false,
    });

// Initialize `koa-router`
const router = new Router();

router.post('/locales/add/:lng/:ns', missingKeyHandler(i18next));

// Add multi-loading i18next backend support
router.get('/locales/resources.json', loadTranslationsHandler(i18next));

// Setup a route listening on `GET /*`
// Logic has been splitted into two chained middleware functions
// @see https://github.com/alexmingoia/koa-router#multiple-middleware
router.get(
    '*',
    async (ctx, next) => {
        const { i18n } = ctx.state;
        const { store } = configureStore(
            {},
            {
                sagaMiddleware: {
                    context: {
                        token: ctx.cookies.get(SETTINGS.AUTH_TOKEN_NAME),
                        i18n: { t: i18n.t.bind(i18n), i18n },
                    },
                },
                location: ctx.originalUrl,
            },
        );

        // Set the language
        const { language } = ctx.state;
        store.dispatch(setActiveLanguage(language));
        ctx.logger.debug('Set language to: %s', language);

        const sagaContext = {};
        const task = store.runSaga(
            ServerViewManagerWorker,
            routes,
            createLocationAction(store.getState().router),
            {
                allowLogger: false,
            },
            sagaContext,
        );

        // Stop task propagation and wait for all task to finish
        await task.toPromise();

        // Handle saga redirects
        if (sagaContext.location) {
            return ctx.redirect(stringifyLocation(sagaContext.location));
        }

        const authState = isAuthenticated(store.getState());
        ctx.logger.debug('Got auth state: %s', authState);

        const context = {};
        const extractor = new ChunkExtractor({
            statsFile,
            entrypoints: ['client'],
        });

        ctx.state.markup = renderToString(
            <ChunkExtractorManager extractor={extractor}>
                <I18nextProvider i18n={i18n}>
                    <Provider store={store}>
                        <StaticRouter context={context} location={ctx.url}>
                            <RenderChildren routes={routes} />
                        </StaticRouter>
                    </Provider>
                </I18nextProvider>
            </ChunkExtractorManager>,
        );

        if (context.url) {
            return ctx.redirect(context.url);
        }

        // Parse Helmet context
        ctx.state.helmet = Helmet.renderStatic();

        // Provide script tags forward
        ctx.state.statusCode = context.statusCode;
        ctx.state.linkTags = extractor.getLinkTags();
        ctx.state.scriptTags = extractor.getScriptTags();
        ctx.state.styleTags = extractor.getStyleTags();

        // Serialize state
        ctx.state.serializedState = serializeJS(store.getState());

        // Serialize runtime settings
        ctx.state.runtimeConfig = serializeJS(getRuntimeConfig());

        // Serialize i18next store
        const initialI18nStore = i18n.languages.reduce(
            (acc, lng) =>
                Object.assign(acc, {
                    [lng]: i18n.services.resourceStore.data[lng],
                }),
            {},
        );
        ctx.state.initialI18nStore = serializeJS(initialI18nStore);

        return next();
    },
    (ctx, next) => {
        ctx.status = ctx.state.statusCode || 200;
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
            <script>
                window.__settings__ = ${ctx.state.runtimeConfig};
                window.__initial_state__ = ${ctx.state.serializedState};
                window.__initial_i18n_store__ = ${ctx.state.initialI18nStore};
                window.__initial_language__ = '${ctx.state.language}';
            </script>
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
    .use(errorHandler(SETTINGS.SENTRY_DSN, SETTINGS.SENTRY_ENVIRONMENT))
    // Add response time to headers
    .use(koaResponseTime())
    // Add user agent parsing
    .use(koaUserAgent)
    // `koa-helmet` provides security headers to help prevent common, well known attacks
    // @see https://helmetjs.github.io/
    .use(
        koaHelmet({
            hsts: false, // hsts is managed by nginx
        }),
    )
    // Parse body of the request, required for adding missing translations
    .use(koaBody())
    // Process language to context state
    .use(koaI18NextMiddleware(i18next))
    // Serve static files located under `process.env.RAZZLE_PUBLIC_DIR`
    .use(koaServe(process.env.RAZZLE_PUBLIC_DIR))
    .use(router.routes())
    .use(router.allowedMethods());

export default server;{% endraw %}
