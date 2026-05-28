/* eslint-disable */
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const makeConfig = require('./config.base');


// The app/ dir
const filenameTemplate = 'webapp/[name]';


const config = makeConfig({
    filenameTemplate: filenameTemplate,

    mode: 'development',

    devtool: 'eval-source-map',

    minimize: false,

    // This must be same as Django's STATIC_URL setting
    publicPath: '/assets/',

    plugins: [new ReactRefreshWebpackPlugin()],

    performance: {
        hints: 'warning',
    },
});
console.log('Using DEV config');


module.exports = {
    ...config,
    // We need to replace babel-loader by another one that has react-refresh/babel plugin
    module: {
        rules: [
            {
                test: /\.([tj])sx?$/, // Transform all .js/.jsx/.ts/.tsx files required somewhere with Babel
                exclude: /node_modules/,
                use: [
                    {
                        loader: require.resolve('babel-loader'),
                        options: {
                            plugins: [require.resolve('react-refresh/babel')],
                        },
                    },
                ],
            },
            ...config.module.rules.slice(1),
        ],
    },
    devServer: {
        port: 8000,
        hot: true,
        // Prevent flooding the console with hot reload messages
        client: {
            logging: 'warn',
            overlay: {
                errors: true,
                warnings: false,
                runtimeErrors: true,
            },
        },
        // Proxy all requests to Django dev server. When running inside container WDS_PROXY_TARGET must be set;
        // when outside, fallback to the exposed locally Django on port 8001
        proxy: [
            {
                context: ['/'],
                target: process.env.WDS_PROXY_TARGET ?? 'http://127.0.0.1:8001',
            }
        ],
    },
};
