/* eslint-disable */

'use strict';

require('babel-polyfill');
require('babel-register')();

var path = require('path');

var logger = require('../src/logger').default;
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var watch = require('node-watch');

var makeConfig = require('./dev-config').default;


function start() {
    var config = makeConfig();
    var compiler = webpack(config.webpack);
    var devServer = new WebpackDevServer(compiler, config.server.options);

    devServer.listen(config.server.port, '0.0.0.0', function () {
        logger.debug('webpack-dev-server listen on port %s', config.server.port);
    });

    return {
        devServer: devServer,

        close: function (callBack) {
            devServer.listeningApp.close(callBack);
        }
    };
}

var activeServer = start();

// Watch changes on constants.json
watch(path.join(__dirname, '../../constants.json'), function () {
    logger.debug('Reloading webpack-dev-server');

    activeServer.close(function () {
        logger.debug('Old webpack-dev-server closed');

        setTimeout(function () {
            activeServer = start();
        }, 500);
    });
});
