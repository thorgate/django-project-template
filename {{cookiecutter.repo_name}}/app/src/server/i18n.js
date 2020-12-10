import addYears from 'date-fns/addYears';
import * as Sentry from '@sentry/node';

import { SETTINGS } from 'settings';

function setPath(object, path, newValue) {
    /* eslint-disable no-param-reassign */
    let stack;
    if (typeof path !== 'string') {
        stack = [].concat(path);
    }

    if (typeof path === 'string') {
        stack = path.split('.');
    }

    while (stack.length > 1) {
        let key = stack.shift();
        if (key.indexOf('###') > -1) key = key.replace(/###/g, '.');
        if (!object[key]) {
            object[key] = {};
        }
        object = object[key];
    }

    let key = stack.shift();
    if (key.indexOf('###') > -1) {
        key = key.replace(/###/g, '.');
    }

    object[key] = newValue;
    /* eslint-enable no-param-reassign */
}

export const loadTranslationsHandler = (i18next, options) => {
    const {
        maxAge = 60 * 60 * 24 * 30,
        cache = process.env.NODE_ENV === 'production',
        lngParam = 'lng',
        nsParam = 'ns',
    } = options || {};

    return function loadTranslations(ctx) {
        if (!i18next.services.backendConnector) {
            ctx.status = 400;
            ctx.body = 'i18next-middleware:: no backend configured';
            return;
        }

        const resources = {};

        // Response is JSON
        ctx.type = 'application/json';

        if (cache) {
            ctx.set('Cache-Control', `public, max-age=${maxAge}`);
            ctx.set(
                'Expires',
                new Date(new Date().getTime() + maxAge * 1000).toUTCString(),
            );
        } else {
            ctx.set('Pragma', 'no-cache');
            ctx.set('Cache-Control', 'no-cache');
        }

        const languages = ctx.query[lngParam]
            ? ctx.query[lngParam].split(' ')
            : [];
        const namespaces = ctx.query[nsParam]
            ? ctx.query[nsParam].split(' ')
            : [];

        // extend ns
        namespaces.forEach((ns) => {
            if (i18next.options.ns && i18next.options.ns.indexOf(ns) < 0) {
                i18next.options.ns.push(ns);
            }
        });

        i18next.services.backendConnector.load(languages, namespaces, () => {
            languages.forEach((lng) => {
                namespaces.forEach((ns) => {
                    setPath(
                        resources,
                        [lng, ns],
                        i18next.getResourceBundle(lng, ns),
                    );
                });
            });

            ctx.body = resources;
        });
    };
};

export const missingKeyHandler = (i18next, options) => {
    const { lngParam = 'lng', nsParam = 'ns' } = options || {};

    return (ctx) => {
        const lng = ctx.params[lngParam];
        const ns = ctx.params[nsParam];
        const { body } = ctx.request;

        if (!i18next.services.backendConnector) {
            ctx.status = 400;
            ctx.body = 'i18next-middleware:: no backend configured';
            return;
        }

        Object.keys(body).forEach((field) => {
            if (field === '_t') {
                // XHR backend sends a timestamp which we don't want to save
                return;
            }

            // Report to sentry in production and add missing keys when not in production
            if (process.env.NODE_ENV === 'production') {
                Sentry.captureException(
                    `Missing translation for ${field}: ${body[field]}. Language ${lng}, namespace ${ns}.`,
                );
            } else {
                i18next.services.backendConnector.saveMissing(
                    [lng],
                    ns,
                    field,
                    body[field],
                );
            }
        });

        ctx.status = 200;
        ctx.body = 'ok';
    };
};

export const koaI18NextMiddleware = (i18next) =>
    async function i18NextMiddleware(ctx, next) {
        const language =
            ctx.cookies.get(SETTINGS.LANGUAGE_COOKIE_NAME) ||
            SETTINGS.DEFAULT_LANGUAGE;

        ctx.logger.debug('Language: %s', language);
        ctx.cookies.set(SETTINGS.LANGUAGE_COOKIE_NAME, language, {
            expires: addYears(new Date(), 1),
            httpOnly: false,
        });

        const i18n = i18next.cloneInstance({ initImmediate: false });
        ctx.state.i18n = i18n;

        ctx.state.language = language;
        ctx.state.languages = i18next.services.languageUtils.toResolveHierarchy(
            language,
        );

        await i18n.changeLanguage(language);

        // Bind translation functions for template
        ctx.state.t = i18n.t.bind(i18n);
        ctx.state.exists = i18n.exists.bind(i18n);

        return next();
    };
