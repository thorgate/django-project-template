// Note: @winston is aliased to node_modules winston on the server and to `client/winston.js` on the client.
import { join, normalize } from 'path';

import SETTINGS from 'settings';
import { addColors, createLogger, transports, format } from '@winston';

const { combine, colorize, label, splat, printf, timestamp } = format;

const levelOnly = format((info, opts) => {
    if (opts.level !== info.level && opts.enabled) {
        return false;
    }
    return info;
});

function createTransport(level) {
    const cfg = {
        level,
        format: combine(
            levelOnly({ level, enabled: !['access', 'info'].includes(level) }),
            splat(),
            label({ label: `[worker-${SETTINGS.WORKER_ID}]` }),
            timestamp(),
            printf(
                info =>
                    `${info.timestamp} [${info.level}]${info.label || ''}: ${
                        info.message
                    }`,
            ),
        ),
    };

    if (SETTINGS.FILE_LOGGING) {
        cfg.filename = normalize(
            join(
                SETTINGS.LOGGING_DIR,
                `${SETTINGS.LOGGING_FILE_PREFIX}-${level}.log`,
            ),
        );
    }

    if (level === 'error' || level === 'debug') {
        cfg.handleExceptions = true;
    }

    if (SETTINGS.FILE_LOGGING) {
        return new transports.File(cfg);
    }

    return new transports.Console(cfg);
}

const loggerTransports = [];
const exceptionHandlers = [];
if (process.env.NODE_ENV !== 'production') {
    loggerTransports.push(
        new transports.Console({
            level: 'debug',
            handleExceptions: true,
            format: combine(
                colorize({ all: true }),
                splat(),
                printf(nfo => `[${nfo.level}]: ${nfo.message}`),
            ),
        }),
    );
} else {
    const exceptionTransport = createTransport('exception');

    loggerTransports.push(
        createTransport('access'),
        createTransport('info'),
        createTransport('error'),
        exceptionTransport,
    );

    exceptionHandlers.push(exceptionTransport);

    if (SETTINGS.DEBUG) {
        loggerTransports.push(createTransport('debug'));
    }
}

addColors({
    exception: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    access: 'cyan',
    http: 'green',
    verbose: 'cyan',
    debug: 'blue',
});

const logger = createLogger({
    levels: {
        exception: 0,
        error: 1,
        warn: 2,
        info: 3,
        access: 4,
        http: 5,
        verbose: 6,
        debug: 7,
    },
    transports: loggerTransports,
    exceptionHandlers,
    exitOnError: false,
});

// On the server we also hijack console.log, console.warn and console.error
if (process.env.BUILD_TARGET === 'server') {
    // eslint-disable-next-line no-console
    console.log = function log() {
        logger.info(...arguments); // eslint-disable-line
    };

    // eslint-disable-next-line no-console
    console.error = function log() {
        logger.error(...arguments); // eslint-disable-line
    };

    // eslint-disable-next-line no-console
    console.warn = function log() {
        logger.warn(...arguments); // eslint-disable-line
    };
}

export default logger;
