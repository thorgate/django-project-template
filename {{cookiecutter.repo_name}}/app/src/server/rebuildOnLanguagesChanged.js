if (process.env.NODE_ENV !== 'production') {
    /**
     * Walk all languages in the locale directory and require them.
     *
     *  By requiring them they are added as a dependency to any files depending on this one.
     *  As a result when the translations change those files are rebuilt and which makes the app use
     *   fresh translations.
     *
     *  Note: This does not work when new namespace json files are created. In that case you still need
     *         to restart the node server.
     */

    // Require all json files in the locales folder
    const ctx = require.context('../../public/locales/', true, /\.json$/);

    ctx.keys().forEach(ctx);
}
