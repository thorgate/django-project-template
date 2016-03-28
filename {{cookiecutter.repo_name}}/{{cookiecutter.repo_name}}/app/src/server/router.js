import is from 'is';
import fs from 'fs';
import path from 'path';

import Router from 'react-router';

import {toString} from 'alt/utils/Render';
import iso from 'iso';

import isMediaPath from './is-media-path';
import routes from '../routes';
import alt from '../alt';
import logger from '../logger';
import i18n from '../i18n';

import CurrentUserStore from '../stores/CurrentUserStore';

import promisify from '../utils/promisify';


const renderWithData = (theAlt, Component, props) => {
    theAlt.buffer = true;

    return toString(Component, props).then((obj) => {
        return {
            html: iso.render(obj.html, theAlt.takeSnapshot(), { iso: 1 })
        };
    }).catch((err) => {
        // return the empty markup in html when there's an error
        return {
            err: err,
            html: iso.render()
        };
    });
};

function getUserState(lang) {
    // Turn buffer off so the api is called now instead of in render
    alt.buffer = false;

    // Load the current user
    CurrentUserStore.getCurrentUser(lang);

    return new Promise((resolve) => {
        // Welp, this is ugly
        let retry = 0;

        function check() {
            if (retry > 50 || CurrentUserStore.hasLoaded()) {
                if (retry > 50) {
                    logger.debug(`Tried ${retry} times, resolving: ${CurrentUserStore.hasLoaded()}`);
                }

                resolve();
            } else {
                retry += 1;
                setTimeout(check, 1);
            }
        }

        setTimeout(check, 1);
    });
}

function getIp(request) {
    return request.headers['x-forwarded-for'] || request.connection.remoteAddress;
}

function getLanguage(cookies) {
    const language = cookies && cookies[DJ_CONST.LANGUAGE_COOKIE_NAME] || DJ_CONST.LANGUAGE_CODE;

    if (is.undef(DJ_CONST.LOCALE_DATA || {})[language]) {
        return DJ_CONST.LANGUAGE_CODE;
    }

    return language;
}


export default async function (request, res, srvStats, logTag) {
    logger.debug(`GET ${request.path}`);

    let router;
    function onAbort(abortReason) {
        const error = new Error();

        // Create specific error for creating a redirection on the server
        if (abortReason.constructor.name === 'Redirect') {
            const url = router.makePath(abortReason.to, abortReason.params, abortReason.query);
            logger.debug('Redirect request to `%s`', url);
            error.redirect = url;
        } else {
            throw abortReason;
        }

        // Throw an error to be catched from the rendering process
        throw error;
    }

    router = Router.create({
        routes: routes,
        location: request.path,
        onAbort: onAbort,

        onError(error) {
            // Don't flood the console output with redirection information
            if (!error.redirect) {
                error.__logged = true;

                logger.error('Routing Error', error);
            }

            // Continue to throw the err
            throw error;
        }
    });

    // Append trailing slash
    if (DJ_CONST.APPEND_SLASH) {
        if (!request.path || !isMediaPath(request.path)) {
            if (!request.path.endsWith('/')) {
                return res.redirect(`${request.path}/`);
            }
        }
    }

    logger.debug('Created router');

    try {
        // Recycle alt
        alt.recycle();

        // Collect request data
        const requestData = {cookies: request.cookies, remoteAddress: getIp(request), userAgent: request.headers['user-agent']};
        logger.debug('Collected request data');

        // Store request data
        CurrentUserStore.cookies = requestData.cookies;
        CurrentUserStore.remoteAddress = requestData.remoteAddress;
        CurrentUserStore.userAgent = requestData.userAgent;
        logger.debug('Stored request data');

        // Prefetch login state
        await getUserState(getLanguage(requestData.cookies));

        const {isAuthenticated, activeLanguage} = CurrentUserStore.getState();

        logger.debug(`Got auth state: ${isAuthenticated}`);

        // Set the language
        logger.debug(`Set language to: ${activeLanguage}`);
        i18n.i18n.forceLanguage(activeLanguage);

        const routerData = await promisify(router.run);
        const Handler = routerData[0];
        const routerState = routerData[1];

        if (!routerState.routes || !routerState.routes.length) {
            // This is sent back when no NotFound route is defined is defined
            res.status(404).send('Not found');
            return true;
        } else {
            logger.debug('Ran router');
        }

        const markup = await renderWithData(alt, Handler, requestData);
        const store = alt.getStore('SeoStore');

        // Catch rendering errors too
        if (markup.err) {
            onAbort(markup.err.err);
        }

        logger.debug('Rendered body');

        // Reload './stats.json' on dev cache it on production
        let assets;
        if (process.env.NODE_ENV === 'development') {
            assets = fs.readFileSync(path.resolve('stats.json'));
            assets = JSON.parse(assets);
        } else {
            assets = srvStats;
        }

        await res.render('layout', {
            HOST: `${request.protocol}://${request.get('host')}`,
            PATH: request.url,
            seoMeta: store.getMeta(),
            ogTags: store.getOG(),

            html: markup.html,
            STATIC_URL: DJ_CONST.STATIC_URL,
            PRODUCTION: process.env.NODE_ENV === 'production',
            assets: assets
        });

        logger.debug('returned html content');

        return true;
    }

    // Catch error from rendering process
    catch (error) {
        if (error.redirect) {
            return res.redirect(error.redirect);
        }

        if (!error.__logged) {
            logger.info('Rendering error');
            logger.info(error);
        }

        // In other cases just return the error
        throw error;
    }
};
