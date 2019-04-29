import * as Sentry from '@sentry/node';

import logger from './logger';


const SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
const NON_ALPHANUMERIC_REGEXP = /([^\\#-~| |!])/g;


export function encodeEntities(value) {
    return value.replace(/&/g, '&amp;').replace(SURROGATE_PAIR_REGEXP, (val) => {
        const hi = val.charCodeAt(0);
        const low = val.charCodeAt(1);
        return `&#${(((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000)};`;
    }).replace(NON_ALPHANUMERIC_REGEXP, (val) => (
        `&#${val.charCodeAt(0)};`
    )).replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}


const errorTemplate = (title, message, language, errorStack = null) => (
    `<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{cookiecutter.project_title}}</title>
    <link href='https://fonts.googleapis.com/css?family=Open+Sans:400' rel='stylesheet' type='text/css'>
    <style>
        body {
            background-color: #fcfcfc; min-height: 300px; font-size: 14px;
            font-family: 'Open Sans', Helvetica, Arial, sans-serif;
        }
        h1 {
            font-size: 42px; line-height: 50px; color: #545454; font-weight: 300; margin: 0.67em 0;
        }
        .panel {
            margin-bottom: 20px; background-color: #fff; border: 1px solid transparent; 
            border-radius: 4px; box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
        }
        .panel {
            border: 1px solid #ececec; border-radius: 4px; box-shadow: none; padding: 50px;
        }
        .panel-shadow {
            box-shadow: 2px 7px 7px rgba(0, 0, 0, 0.04);
        }
        .panel-message-wrapper .panel {
            margin: 250px auto;
        }
        .panel-message {
            margin-left: auto; margin-right: auto; max-width: 500px; margin-top: 45px; 
            padding: 30px 40px 50px; text-align: center; font-size: 16px;
        }
        .panel-message .text-muted {
            color: #aaaaaa;
            text-align: left;
            word-break: break-word;
        }
        .panel-message pre.text-muted {
            overflow: hidden;
        }
        .panel-background {
            background: transparent url('data:image/svg+xml;base64,TODO') center top no-repeat; 
            position: absolute; left: 0; top: 0; opacity: 0.04; z-index: -1; max-width: 100%; max-height: 100%;
        }
        .wide .panel-message {
            margin: 50px auto; max-width: 80%;
        }
    </style>
</head>
<body>
    <div class="panel-message-wrapper ${errorStack ? 'wide' : ''}">
        <div class="panel-background"></div>
        <div class="panel panel-shadow panel-message">
            <h1>${title}</h1>

            <p class="text-muted">
                ${message}
            </p>
            ${errorStack ? `<pre class="text-muted">${errorStack}</pre>` : ''}
        </div>
    </div>
</body>
</html>`
);


export default (dsn) => {
    if (process.env.NODE_ENV === 'production') {
        Sentry.init({
            dsn,
        });
    }

    return async (ctx, next) => {
        ctx.logger.access('GET: %s', ctx.url);

        try {
            await next();
        } catch (error) {
            if (process.env.NODE_ENV === 'production') {
                Sentry.captureException(error);
            }

            logger.error('Error occurred while processing request: %s %s', error, error.stack);

            const title = (error && error.title) || 'Error';
            const message = (error && error.message) || (
                'The server encountered an internal error and was unable to complete your request.'
            );

            let errorStack = null;
            if (process.env.NODE_ENV !== 'production') {
                errorStack = encodeEntities(`${error.stack}`);
            }

            ctx.status = error.statusCode || error.status || 500;
            ctx.body = errorTemplate(title, encodeEntities(message), ctx.state.language || 'en', errorStack);
        }
    };
};
