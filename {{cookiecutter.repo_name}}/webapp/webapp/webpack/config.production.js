/* eslint-disable */
const webpack = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const makeConfig = require('./config.base');


// In production, append hash to filenames
const filenameTemplate = 'webapp/[name]-[hash]';

const config = makeConfig({
    filenameTemplate: filenameTemplate,

    mode: 'production',

    devtool: 'source-map',

    minimize: true,

    // This must be same as Django's STATIC_URL setting
    publicPath: '/assets/',

    prependSources: [],

    plugins: [
        // Minimize CSS
        new OptimizeCssAssetsPlugin({
            cssProcessorPluginOptions: {
                preset: ['default', {discardComments: {removeAll: true}}],
            },
        }),
    ],

    performance: {
        hints: 'warning',
    },
});
console.log("Using PRODUCTION config");


module.exports = config;
