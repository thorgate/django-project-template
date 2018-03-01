/* eslint-disable global-require, import/no-extraneous-dependencies */
import fs from 'fs';
import path from 'path';

import Koa from 'koa';
import koaCookie from 'koa-cookie';
import koaResponseTime from 'koa-response-time';
import koaNunjucks from 'koa-nunjucks-2';
import koaMorgan from 'koa-morgan';
import koaRaven from 'koa2-raven';
import koaUserAgent from 'koa-useragent';
import Raven from 'raven';

import DJ_CONST from './constants';
import getLanguage from './language';
import logger from './logger';
import i18n, {gettext} from '../utils/i18n';
import koaHostname from './middleware/hostnameValidation';


if (process.send) {
    process.send('online');
}

const app = new Koa();

global.WORKER_ID = null;
global.CLUSTERED = false;
global.NO_PRE_RENDERER = process.env.PRERENDER === 'n';
if (!global.DEV_MODE) {
    /* eslint-disable */
    const cluster = require('cluster');

    // Attach worker ID to global for faster accessing
    if (cluster.isWorker) {
        CLUSTERED = true;
        WORKER_ID = cluster.worker.id;
        console.log(`Worker #${WORKER_ID} : started`);
    }

    // Disable pre-renderer on last worker
    // To enable this feature, un-comment following lines
    // Need to test this without breaking existing setup
    // E.g You could enable it and deploy to see if nothing breaks when rendering (reduce worker count in package.json)
    // if (WORKER_ID && `${process.env.WORKER_COUNT}` === `${WORKER_ID}`) {
    //     NO_PRE_RENDERER = true;
    //     console.log(`Worker #${WORKER_ID} : Pre-renderer disabled`);
    // }
    /* eslint-enable */
}

// Get real user ip from nginx
app.proxy = true;

// Validate host name
app.use(koaHostname(DJ_CONST.ALLOWED_HOSTS));

// Add response time to headers
app.use(koaResponseTime());

// Add user agent parsing
app.use(koaUserAgent);

// Add proxy middleware in development
if (global.DEV_MODE) {
    /* eslint-disable global-require */
    const appProxy = require('./middleware/appProxy').default;

    // Apply app proxy
    appProxy(app, DJ_CONST.KOA_APP_PROXY);
    /* eslint-enable global-require */
}

// Configure nunjucks for templates
app.use(koaNunjucks({
    ext: 'html',
    path: path.join(__dirname, './templates'),
    nunjucksConfig: {
        autoescape: true,
        watch: !!global.DEV_MODE,
    },
}));

// Add logging middleware
app.use(koaMorgan('combined', {stream: logger.stream}));

// Add Koa cookie middleware
app.use(koaCookie());


if (!global.DEV_MODE) {
    // Configure raven (Sentry)
    const client = Raven
        .config(DJ_CONST.RAVEN_BACKEND_DSN, {allowSecretKey: true})
        .install({unhandledRejection: true});
    app.context.raven = client;
    koaRaven(app, client);

    app.use(async (ctx, next) => {
        // If middleware fail, show error page
        try {
            await next();
        } catch (err) {
            logger.error('error page');
            // Set correct language. We use a try/catch block here to
            // ensure we don't raise another exception when handling the previous one
            try {
                i18n.forceLanguage(getLanguage(ctx));
            } catch (e) { // eslint-disable-line
            }

            await ctx.render('500', {
                sentry: ctx.res.sentry || null,
                error: {
                    title: gettext('Something went wrong'),
                    message: gettext('Something went wrong on our side... \n Please hold on while we fix it.')
                        .replace('\n', '<br>'),
                    sentry: gettext('Fault code: #'),
                },
            });
        }
    });
}


if (DEV_MODE) {
    const koaDevware = require('./middleware/koaDevware').default;
    const koaHotware = require('./middleware/koaHotware').default;

    const webpack = require('webpack');
    const webpackDevMiddleware = require('webpack-dev-middleware');
    const webpackHotMiddleware = require('webpack-hot-middleware');
    const webpackHotServerMiddleware = require('webpack-hot-server-middleware');
    const config = require('../../webpack/config.dev.js');
    const publicPath = config[0].output.publicPath;

    // Webpack compiler
    const compiler = webpack(config);

    // Dev middleware
    app.use(koaDevware(webpackDevMiddleware(compiler, {
        watchOptions: {
            aggregateTimeout: 300,
            poll: true,
        },
        publicPath,
        serverSideRender: true,
        stats: {
            colors: true,
            hash: false,
            timings: true,
            chunks: true,
            chunkModules: false,
            modules: false,
        },
    }), compiler));

    // Hot client middleware
    app.use(koaHotware(webpackHotMiddleware(
        compiler.compilers.find(comp => comp.name === 'client'),
        {noInfo: true, publicPath},
    )));

    // Hot server middleware
    app.use(webpackHotServerMiddleware(compiler, {
        serverRendererOptions: {noPreRender: global.NO_PRE_RENDERER},
        createHandler: webpackHotServerMiddleware.createKoaHandler,
    }));
} else {
    const webpackStats = JSON.parse(fs.readFileSync(path.join('app/build/stats.json')));
    const serverRender = require('./main.js').default; // eslint-disable-line import/no-unresolved

    // Add serverRender middleware
    app.use(serverRender({clientStats: webpackStats, noPreRender: global.NO_PRE_RENDERER}));
}


let server;

const serverExit = () => {
    logger.info('Received shutdown command.');

    if (server) {
        server.shutdown(() => {
            process.exit(); // eslint-disable-line no-process-exit
        });
    } else {
        process.exit(); // eslint-disable-line no-process-exit
    }
};

process.on('SIGTERM', serverExit);
process.on('SIGINT', serverExit);
process.on('unhandledRejection', (reason, p) => {
    logger.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});


app.port = DJ_CONST.KOA_PORT || 3000;
app.hostname = '0.0.0.0';


export const leak = (info) => {
    logger.error('Memory leak detected', info);
};


export const listen = () => {
    const gracefulShutdown = require('http-graceful-shutdown');

    server = app.listen(app.port, () => {
        logger.info(`Application started on ${app.port}`);

        if (global.DEV_MODE) {
            logger.info(`==> Listening on port ${app.port}. Open up ${DJ_CONST.SITE_URL} in your browser.`);
        }
    });

    // Enable server graceful shutdown
    // Otherwise WebSockets (keep-alive connections) might keep server running
    gracefulShutdown(server);
};

export default app;
