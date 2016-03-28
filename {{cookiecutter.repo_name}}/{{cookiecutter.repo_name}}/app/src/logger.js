import winston from 'winston';
import path from 'path';


const transports = [];

function addLogger(level) {
    const logDir = '/var/log/{{ cookiecutter.repo_name }}/';
    const cfg = {
        name: `${level}-log`,
        filename: path.join(logDir, `express-${level}.log`),
        level: level,
        json: false
    };

    if (level === 'error') {
        cfg.handleExceptions = true;
        cfg.humanReadableUnhandledException = true;
    }

    transports.push(new winston.transports.File(cfg));
}

let filterFunc;

if (process.env.NODE_ENV !== 'production' && !process.env.CLUSTERED) {
    transports.push(new winston.transports.Console({
        level: 'debug',
        handleExceptions: true,
        humanReadableUnhandledException: true,
        json: false,
        colorize: true
    }));
} else {
    addLogger('info');
    addLogger('error');

    if (process.env.DEBUG) {
        addLogger('debug');
    }

    filterFunc = (msg) => {
        return !!process.env.CLUSTERED ? `worker-${process.env.CLUSTER_INDEX} - ${msg}` : msg;
    };
}

const logger = new winston.Logger({
    transports: transports,
    exitOnError: true
});

if (filterFunc) {
    logger.addFilter(filterFunc);
}

// We also hijack console.log
if ((process.env.NODE_ENV === 'production' || process.env.CLUSTERED) && typeof window === 'undefined') {
    console.log = function() {
        logger.info([].slice.call(arguments));
    };
}

logger.stream = {
    write: (message) => {
        logger.info(message);
    }
};

export default logger;
