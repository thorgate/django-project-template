/* eslint-disable */
const webpack = require('webpack');
const WriteFilePlugin = require('write-file-webpack-plugin');

const makeConfig = require('./config.base');
const makeServerConfig = require('./serverConfig.base');

// The app/ dir
const filenameTemplate = 'app/[name]';


const config = makeConfig({
    filenameTemplate: filenameTemplate,

    mode: 'development',

    devtool: 'eval-source-map',

    namedModules: true,
    minimize: false,
    extractCss: false,
    minifyCss: false,

    prependSources: [
        'webpack-hot-middleware/client',
        'react-hot-loader/patch',
    ],

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
    ],

    performance: {
        hints: 'warning',
    },
});

const serverConfig = makeServerConfig({
    mode: 'development',

    plugins: [
        new WriteFilePlugin(),
    ],
});
console.log("Using DEV config");

module.exports = [config, serverConfig];
