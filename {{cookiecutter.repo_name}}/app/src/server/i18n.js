import addYears from 'date-fns/addYears';
import I18NMiddleware from 'i18next-http-middleware';
import { SETTINGS } from 'settings';

const getMiddlewareOptions = (ctx) => ({
    getPath: () => ctx.path,
    getOriginalUrl: () => ctx.originalUrl,
    getUrl: () => ctx.url,
    setUrl: (req, url) => {
        ctx.url = url;
    },
    getQuery: () => ctx.query,
    getHeaders: () => ctx.request.headers,
    getHeader: (res, name) => ctx.request.headers[name],
    setStatus: (res, statusCode) => {
        ctx.status = statusCode;
    },
    setHeader: (res, name, value) => {
        ctx.set(name, value);
    },
    send: (res, resources) => {
        ctx.body = resources;
    },
});

export const getMissingKeyHandler = (i18next) => (ctx, next) =>
    I18NMiddleware.missingKeyHandler(i18next, getMiddlewareOptions(ctx))(
        ctx,
        null,
        next,
    );

export const getResourcesHandler = (i18next) => (ctx, next) =>
    I18NMiddleware.getResourcesHandler(i18next, getMiddlewareOptions(ctx))(
        ctx,
        null,
        next,
    );

export const koaI18NextMiddleware = (i18next) => {
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
    }

    return i18NextMiddleware;
};
