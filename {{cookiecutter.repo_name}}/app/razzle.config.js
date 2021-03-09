'use strict';
const path = require('path');

const LoadablePlugin = require('@loadable/webpack-plugin');

module.exports = {
    plugins: [
        'eslint',
        'modify-eslint-loader-config', // This plugin should always be after eslint plugin
        'scss',
        {
            name: 'long-term-caching',
            options: {
                aggressiveCaching: true,
            },
        },
    ],
    modifyWebpackConfig({
                            env: { target, dev },
                            webpackConfig,
                            webpackObject,
                            options,
                            paths,
                        }) {
        /* make a copy of config */
        const config = Object.assign({}, webpackConfig);

        if (target !== 'node') {
            config.plugins.push(
                new LoadablePlugin({
                    outputAsset: false,
                    writeToDisk: {
                        filename: path.resolve(__dirname, 'build'),
                    },
                }),
            );
        }

        // adding ./src to module resolver so I can import modules with absolute paths
        config.resolve.modules.push('./src');

        // Use browser shim of winston on the client
        config.resolve.alias['@winston'] =
            target === 'node'
                ? 'winston'
                : path.join(paths.appSrc, 'client', 'winston');

        return config;
    },
};
