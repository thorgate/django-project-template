import fs from 'fs';
import http from 'http';
import net from 'net';
import path from 'path';

import express from 'express';
import is from 'is';
import cookieParser from 'cookie-parser';
import nunjucks from 'nunjucks';
import morgan from 'morgan';
import raven from 'raven';

import DJ_CONST from './constants';
import isMediaPath from './is-media-path';
import router from './router';
import logger from '../logger';
import {gettext, i18n} from '../i18n';

if (process.send) {
    process.send('online');
}

let app = express();
const env = process.env.NODE_ENV || 'development';

// Set view engine
app.set('view engine', 'html');

// Get real user ip from nginx
app.enable('trust proxy');

// Configure nunjucks for templating
nunjucks.configure(path.join(__dirname, './templates'), {
    autoescape: true,
    express: app
});

// Load stats file
const stats = JSON.parse(fs.readFileSync(path.join('stats.json')));

// Allow access to /public locally
if (env !== 'production') {
    app.use('/public', express.static(path.join(__dirname, '..', '..', 'build', 'public')));
    app.use('/media', express.static(path.join(__dirname, '..', '..', '..', 'media')));
    app.use(`/${DJ_CONST.STATIC_URL.trim('/')}`, express.static(path.join(__dirname, '..', '..', '..', DJ_CONST.STATIC_URL.trim('/'))));
}


// Add logging middleware
app.use(morgan('combined', {'stream': logger.stream}));

// Add express cookie middleware
app.use(cookieParser());

// Handle the request via AltIso
app.use((req, res, next) => {
    // Don't run when requesting a media file
    if (isMediaPath(req.path)) {
        next();
        return;
    }

    // if router succeeds response is rendered, otherwise we let
    //  express handle the error.
    router(req, res, stats).then(() => {}).catch((err) => {
        // Note: In production this results in an 'Internal Server Error' response
        next(err);
    });
});


// Configure raven (Sentry)
if (env === 'production') {
    app.use(raven.middleware.express.requestHandler(DJ_CONST.RAVEN_FRONTEND_DSN));
    app.use(raven.middleware.express.errorHandler(DJ_CONST.RAVEN_FRONTEND_DSN));

    app.use((err, req, res, next) => {
        if (res.headersSent) {
            return next(err);
        }

        // Set correct language. We use a try/catch block here to
        // ensure we don't raise another exception when handling the previous one
        try {
            i18n.forceLanguage(getLanguage(req));
        } catch (e) {}  // eslint-disable-line

        res.status(500);
        res.render('500', {
            sentry: res.sentry || null,
            error: {
                'title': gettext('Something went wrong'),
                'message': gettext('Something went wrong on our side... \n Please hold on while we fix it.').replace('\n', '<br>'),
                'sentry': gettext('Fault code: #')
            }
        });
    });
}


let server = http.createServer(app);

process.on('SIGTERM', () => {
    logger.info(`Received shutdown command.`);

    if (server) {
        server.close();
    }

    process.exit(); // eslint-disable-line no-process-exit
});


export default {
    leak: (info) => {
        logger.error('Memory leak detected', info);
    },

    listen: (clusterIndex) => {
        let thePort;

        if (!is.undef(clusterIndex)) {
            thePort = (DJ_CONST.EXPRESS_PORT + '').replace('$index', clusterIndex);
        } else {
            thePort = DJ_CONST.EXPRESS_PORT;
        }

        // Setup auto socket cleaner
        if (is.string(thePort)) {
            server.on('error', (e) => {
                if (e.code === 'EADDRINUSE') {
                    const clientSocket = new net.Socket();

                    // handle error trying to talk to server
                    clientSocket.on('error', function(e) {
                        // No other server listening
                        if (e.code === 'ECONNREFUSED') {
                            fs.unlinkSync(thePort);

                            server.listen(thePort, () => {
                                logger.info(`Application started on ${thePort}${!is.undef(clusterIndex) ? " in cluster mode" : ""}`);
                            });
                        }
                    });

                    clientSocket.connect({path: thePort}, function() {
                        process.exit();
                    });
                }
            });
        }

        server.listen(thePort, () => {
            logger.info(`Application started on ${thePort}${!is.undef(clusterIndex) ? " in cluster mode" : ""}`);
        });
    }
};
