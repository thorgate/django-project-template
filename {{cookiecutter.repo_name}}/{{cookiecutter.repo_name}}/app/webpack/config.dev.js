/* eslint-disable */
const webpack = require('webpack');
const WriteFilePlugin = require('write-file-webpack-plugin');

const makeConfig = require('./config.base');
const makeServerConfig = require('./serverConfig.base');

// The app/ dir
const filenameTemplate = 'app/[name]';


const config = makeConfig({
    filenameTemplate: filenameTemplate,

    devtool: 'eval-source-map',

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
});

const serverConfig = makeServerConfig({
    extractCss: false,
    minifyCss: false,

    plugins: [
        new WriteFilePlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development')
            }
        })
    ],
});
console.log("Using DEV config");

module.exports = [config, serverConfig];
