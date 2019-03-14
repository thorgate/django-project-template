import SETTINGS from 'settings';


const resolveAsset = (url, basePath = null, sitePath = SETTINGS.BACKEND_SITE_URL) => {
    let path = `${basePath || ''}${url}`;

    if (!path.startsWith('/') && !/https?:\/\//.test(path)) {
        path = `/${path}`;
    }

    if (process.env.NODE_ENV !== 'production') {
        return `${sitePath}${path}`;
    }

    return `${path}`;
};

/**
 * Resolve media file, should be full path e.g `/some.pdf` => `/media/some.pdf`
 * Media files coming from API should have SITE_URL already in front so no need to use this with those.
 * Only using full path cause server will most likely prefix this to the file.
 *
 * @param {string} url Path to media file without `/media` prefix.
 * @returns {string} Path for media file with correct prefix
 */
export const resolveMedia = (url) => resolveAsset(url, SETTINGS.DJANGO_MEDIA_URL);
