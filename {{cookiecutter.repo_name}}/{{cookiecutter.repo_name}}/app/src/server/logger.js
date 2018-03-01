import winston from 'winston';
import path from 'path';


const transports = [];

function addLogger(level) {
    const logDir = '/var/log/{{cookiecutter.repo_name}}/';
    const cfg = {
        name: `${level}-log`,
        filename: path.join(logDir, `koa-${level}.log`),
        level,
        json: false,
        colorize: false,
    };

    if (level === 'error') {
        cfg.handleExceptions = true;
        cfg.humanReadableUnhandledException = true;
    }

    transports.push(new winston.transports.File(cfg));
}

if (global.DEV_MODE && !global.CLUSTERED) {
    transports.push(new winston.transports.Console({
        level: 'debug',
        handleExceptions: true,
        humanReadableUnhandledException: true,
        json: false,
        colorize: true,
    }));
} else {
    addLogger('info');
    addLogger('error');

    if (process.env.DEBUG) {
        addLogger('debug');
    }
}

const logger = new winston.Logger({
    transports,
    exitOnError: true,
});

// We also hijack console.log
if (typeof window === 'undefined' && (global.DEV_MODE || global.CLUSTERED)) {
    console.log = function () {
        logger.info([].slice.call(arguments)); // eslint-disable-line
    };
}

logger.stream = {
    write: (message) => { // eslint-disable-line
        logger.info(message);
    },
};

export default logger;
