const resolveAsset = (url, basePath = null, sitePath = DJ_CONST.SITE_URL) => {
    let path = `${basePath || ''}${url}`;

    if (!path.startsWith('/')) {
        path = `/${path}`;
    }

    if (DEV_MODE) {
        return `${sitePath}${path}`;
    }

    return `${path}`;
};

/**
 * Resolve media file, should be full path e.g `/media/some.pdf`
 * Media files coming from API should have SITE_URL already in front so no need to use this with those.
 * Only using full path cause server will most likely prefix this to the file.
 *
 * @param url - Path to media file without `/media` prefix.
 */
export const resolveMedia = url => resolveAsset(url, DJ_CONST.MEDIA_URL);

/**
 * Resolve static file, should be full path under static directory.
 * Example: url for `${PROJECT}/static/robots.txt` => `robots.txt`
 *
 * @param url - Path to static file in `/static` directory
 */
export const resolveStatic = url => resolveAsset(url, DJ_CONST.STATIC_URL);
