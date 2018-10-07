'use strict';
const path = require('path');

const makeLoaderFinder = require('razzle-dev-utils/makeLoaderFinder');
const paths = require('razzle/config/paths');
const LoadablePlugin = require('@loadable/webpack-plugin');

const cssLoaderFinder = makeLoaderFinder('css-loader');

module.exports = {
    plugins: [
        'long-term-caching',
    ],
    modify(baseConfig, secondArg, webpack) {
        const {dev, target} = secondArg;
        /* make a copy of config */
        const config = Object.assign({}, baseConfig);

        const scssLoader = {
            loader: require.resolve('sass-loader'),
            options: {
                sourceMap: dev,
            },
        };

        config.module.rules.filter(cssLoaderFinder).forEach((rule) => {
            const isCssModuleRule = !rule.test.test('module.css');

            const scssExclude = [paths.appBuild];
            let scssTest = /\.s[ac]ss$/;
            if (isCssModuleRule) {
                scssTest = /\.module\.s[ac]ss$/;
            } else {
                scssExclude.push(/\.module\.s[ac]ss$/);
            }

            // Use default configs
            config.module.rules.push({
                test: scssTest,
                exclude: scssExclude,
                use: [
                    ...rule.use,
                    scssLoader,
                ]
            });
        });

        if (target !== 'node') {
            config.plugins.push(new LoadablePlugin({
                filename: path.resolve(path.join(process.cwd(), 'build', 'loadable-stats.json')),
                writeToDisk: true,
            }));
        }

        // adding ./src to module resolver so I can import modules with absolute paths
        config.resolve.modules.push('./src');

        if (target === 'node') {
            config.externals = [
                'tg-named-routes',
                '@loadable/component',
                ...config.externals,
            ];
        }

        return config;
    },
};
