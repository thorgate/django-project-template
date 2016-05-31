const webpack = require('webpack');

const makeConfig = require('./config.base');


// In production, append hash to filenames
const filenameTemplate = '[name]-[hash]';

const config = makeConfig({
    filenameTemplate: filenameTemplate,

    devtool: 'source-map',

    extractCss: true,

    // This must be same as Django's STATIC_URL setting
    publicPath: '/assets/',

    prependSources: [],

    plugins: [
        new webpack.optimize.DedupePlugin(),

        new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true,
                warnings: false,
            },
            comments: false,
        }),
    ],
});
console.log("Using PRODUCTION config");


module.exports = config;
