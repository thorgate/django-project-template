const webpack = require('webpack');

const makeConfig = require('./config.base');


// In production, append hash to filenames
const filenameTemplate = 'app/[name]-[hash]';

const config = makeConfig({
    filenameTemplate: filenameTemplate,

    devtool: 'source-map',

    extractCss: true,
    minifyCss: true,

    // This must be same as Django's STATIC_URL setting
    publicPath: '/assets/',

    prependSources: [],

    plugins: [],
});
console.log("Using PRODUCTION config");


module.exports = config;
