const path = require('path');
const webpack = require('webpack');

const makeConfig = require('./config.base');


// The app/ dir
const app_root = path.resolve(__dirname, '..');
const filenameTemplate = '[name]';


const config = makeConfig({
    filenameTemplate: filenameTemplate,

    devtool: 'cheap-module-eval-source-map',

    extractCss: false,

    // Needed for inline CSS (via JS) - see set-public-path.js for more info
    prependSources: [path.resolve(app_root, 'webpack', 'set-public-path.js')],

    // This must be same as Django's STATIC_URL setting
    publicPath: '/static/',

    plugins: [
    ],
});
console.log("Using DEV config");


module.exports = config;
