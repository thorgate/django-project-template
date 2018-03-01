/* eslint-disable */
const webpack = require('webpack');
const WebpackSHAHash = require('webpack-sha-hash');

const makeConfig = require('./config.base');
const makeServerConfig = require('./serverConfig.base');


// In production, append hash to filenames
const filenameTemplate = 'app/[name]-[chunkhash]';

const config = makeConfig({
    filenameTemplate: filenameTemplate,

    devtool: 'source-map',

    extractCss: true,
    minifyCss: true,

    prependSources: [],

    plugins: [
        new WebpackSHAHash({
            hashingAlgorithm: "sha512"
        }),
    ],
});

const serverConfig = makeServerConfig({
    extractCss: true,
    minifyCss: true,

    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        })
    ],
});
console.log("Using PRODUCTION config");


module.exports = [config, serverConfig];
