/* eslint-disable */
const webpack = require('webpack');
const MinimizerPlugin = require('minimizer-webpack-plugin');

const makeConfig = require('./config.base');


// In production, append hash to filenames
const filenameTemplate = 'webapp/[name]-[hash]';

const config = makeConfig({
    filenameTemplate: filenameTemplate,

    mode: 'production',

    devtool: 'source-map',

    minimize: true,
    minimizer: [
        // Keeps the default Terser plugin for JS files
        '...',
        new MinimizerPlugin({
            test: /\.css(\?.*)?$/i,
            minify: MinimizerPlugin.cssnanoMinify,
            // Options - https://cssnano.github.io/cssnano/docs/config-file/
            minimizerOptions: {
                preset: 'default',
            },
        }),
    ],

    // This must be same as Django's STATIC_URL setting
    publicPath: '/assets/',

    prependSources: [],

    performance: {
        hints: 'warning',
    },
});
console.log('Using PRODUCTION config');


module.exports = config;
