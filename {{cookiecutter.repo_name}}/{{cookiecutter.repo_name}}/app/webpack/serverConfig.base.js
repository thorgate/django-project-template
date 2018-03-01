/* eslint-disable */
const path = require('path');
const webpack = require('webpack');


// The app/ dir
const app_root = path.resolve(__dirname, '..');


function makeConfig(options) {
    const output = {
        path: path.resolve(app_root, 'lib', 'server'),
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        publicPath: '',
    };

    return {
        name: 'server',

        entry: 'server/serverRenderer.js',

        output,

        module: {
            rules: [{
                test: /\.js$/, // Transform all .js files required somewhere with Babel
                exclude: /node_modules/,
                use: 'babel-loader',
            }]
        },

        plugins: [
            // Ignore fonts and other assets
            new webpack.IgnorePlugin(/\.(css|scss)$/),
            new webpack.IgnorePlugin(/\.(jpe?g|png|gif|svg|woff2?|eot|ttf)$/),

            // Combine all chunks together
            new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: 1
            }),

            // Define common values
            new webpack.DefinePlugin({DEV_MODE: JSON.stringify(process.env.NODE_ENV !== 'production')}),
            new webpack.DefinePlugin({SERVER_MODE: JSON.stringify(true)}),
            new webpack.DefinePlugin({'global.GENTLY': false}),
        ].concat(options.plugins),

        resolve: {
            modules: ['app/src', 'node_modules'],
            extensions: ['.js'],
        },

        node: {
            __dirname: true,
        },

        devtool: 'source-map',
        target: 'node', // Use node target

        performance: options.performance,
    };
}


module.exports = makeConfig;
