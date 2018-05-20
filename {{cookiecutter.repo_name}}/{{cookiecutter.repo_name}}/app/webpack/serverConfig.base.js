/* eslint-disable */
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');


const res = p => path.resolve(__dirname, p);

// The app/ dir
const app_root = res('..');
const project_root = res('../..');
const node_modules = res('../../node_modules');


const externals = fs
  .readdirSync(node_modules)
  .filter(x => !/\.bin|react-universal-component|webpack-flush-chunks/.test(x))
  .reduce((externals, mod) => {
    externals[mod] = `commonjs ${mod}`;
    return externals
  }, {});

externals['react-dom/server'] = 'commonjs react-dom/server';


function makeConfig(options) {
    const DJ_CONST = JSON.parse(fs.readFileSync(path.join(project_root, 'constants.json')));

    const mode = options.mode || 'none';
    const output = {
        path: path.resolve(app_root, 'lib', 'server'),
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        publicPath: process.env.ENABLE_PROXY === 'y' ? DJ_CONST.STATIC_URL : DJ_CONST.STATIC_WEBPACK_URL,
    };

    return {
        name: 'server',

        mode,

        externals,

        entry: 'server/serverRenderer.js',

        output,

        module: {
            rules: [{
                test: /\.js$/, // Transform all .js files required somewhere with Babel
                exclude: /node_modules/,
                use: 'babel-loader',
            }, {
                test: /\.(jpe?g|png|gif|svg|woff2?|eot|ttf)$/,
                loader: 'url-loader',
                query: {
                    limit: 2000,
                    name: 'assets/[name].[hash].[ext]',
                },
            }]
        },

        plugins: [
            // Ignore fonts and other assets
            new webpack.NormalModuleReplacementPlugin(
                /\.(css|scss)$/,
                path.resolve(__dirname, './helpers/noop.js'),
            ),

            // Combine all chunks together
            new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: 1
            }),

            // Define common values
            new webpack.DefinePlugin({DEV_MODE: JSON.stringify(process.env.NODE_ENV !== 'production')}),
            new webpack.DefinePlugin({SERVER_MODE: JSON.stringify(true)}),
            new webpack.DefinePlugin({'global.GENTLY': false}),
        ].concat(options.plugins),

        optimization: {
            minimize: false,
        },

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
