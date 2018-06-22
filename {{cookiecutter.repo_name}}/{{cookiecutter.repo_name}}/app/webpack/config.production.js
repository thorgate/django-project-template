/* eslint-disable */
const webpack = require('webpack');
const WebpackSHAHash = require('webpack-sha-hash');

const makeConfig = require('./config.base');
const makeServerConfig = require('./serverConfig.base');


// In production, append hash to filenames
const filenameTemplate = 'app/[name]-[chunkhash]';

const config = makeConfig({
    filenameTemplate: filenameTemplate,

    mode: 'production',

    devtool: 'source-map',

    namedModules: false,
    minimize: true,
    extractCss: true,
    minifyCss: true,

    prependSources: [],

    plugins: [],

    performance: {
        hints: 'warning',
    },
});

const serverConfig = makeServerConfig({
    plugins: [],
});
console.log("Using PRODUCTION config");


module.exports = [config, serverConfig];
