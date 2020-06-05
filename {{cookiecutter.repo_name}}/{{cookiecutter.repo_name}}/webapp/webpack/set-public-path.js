/**
 * In development mode, Webpack loads styles via JS, adding them to page as <link> element.
 *
 * This will break loading of external resources such as fonts or images. The reason is that Webpack uses blob: url for
 * the style content and external resources must be accessed by full url there (including hostname).
 *
 * We could add static hostname (e.g. localhost:8000) to output.publicPath in Webpack config, but that would make it
 * harder to use other hostnames or ports in development mode. So instead, we define the resource path at runtime, using
 * Django's SITE_URL setting.
 * 
 * Also note that this file must be specified separately for each Webpack entry point, requiring it from other files 
 * will not work.
 */

__webpack_public_path__ = DJ_CONST.SITE_URL + DJ_CONST.STATIC_URL;
