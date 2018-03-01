/* eslint-disable */
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const StatsPlugin = require('stats-webpack-plugin');

const flattenDict = require('./helpers/flatten-dict');


// The app/ dir
const app_root = path.resolve(__dirname, '..');
// The django app's dir
const project_root = path.resolve(app_root, '..');


function makeConfig(options) {
    const DJ_CONST = JSON.parse(fs.readFileSync(path.join(project_root, 'constants.json')));

    const output = {
        path: path.resolve(app_root, 'build'),
        filename: options.filenameTemplate + '.js',
        chunkFilename: options.filenameTemplate + '.chunk.js',
        publicPath: DJ_CONST.STATIC_WEBPACK_URL,
        library: '{{cookiecutter.repo_name}}',
    };

    return {
        name: 'client',

        entry: {
            app: options.prependSources.concat(['babel-polyfill', 'client.js']),
            styles: options.prependSources.concat([path.resolve(project_root, 'static', 'styles-src', 'main.js')]),
        },

        output,

        module: {
            rules: [{
                test: /\.js$/, // Transform all .js files required somewhere with Babel
                exclude: /node_modules/,
                use: 'babel-loader',
            }, {
                test: /\.(css|scss)$/,
                use: ExtractTextPlugin.extract({
                    use: [{
                        loader: "css-loader",
                        options: {
                            sourceMap: true,
                            minimize: options.minifyCss,
                        }
                    }, {
                        loader: "postcss-loader",
                        options: {
                            plugins: function() {
                                return [autoprefixer]
                            }
                        }
                    }, {
                        loader: "resolve-url-loader",
                    }, {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true,
                            outputStyle: 'expanded',
                        }
                    }],
                    fallback: 'style-loader',
                }),
            }, {
                test: /\.(jpe?g|png|gif|svg|woff2?|eot|ttf)$/,
                loader: 'url-loader',
                query: {
                    limit: 2000,
                    name: 'assets/[name].[hash].[ext]',
                },
            }],
        },

        plugins: [
            new ExtractTextPlugin({
                filename: options.filenameTemplate + '.css',
                disable: !options.extractCss,
            }),

            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                minChunks: function (m) {
                    return /node_modules/.test(m.context);
                },
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'manifest',
                // Use hash id for filename to use correct assets
                filename: process.env.NODE_ENV === 'production' ?
                    'app/manifest.[hash].js' :
                    'app/manifest.js',
                minChunks: Infinity,
            }),

            new webpack.DefinePlugin(flattenDict(DJ_CONST, 'DJ_CONST')),
            new webpack.DefinePlugin({DEV_MODE: JSON.stringify(process.env.NODE_ENV !== 'production')}),
            new webpack.DefinePlugin({SERVER_MODE: JSON.stringify(false)}),

            // Write out stats file to app/build directory, useful for production
            new StatsPlugin('stats.json'),
        ].concat(options.plugins),

        resolve: {
            modules: ['app/src', 'node_modules'],
            extensions: ['.js'],
        },

        // Make `webpack` compile empty `fs` module for frontend
        node: {
            fs: 'empty'
        },

        devtool: options.devtool,
        target: 'web', // Make web variables accessible to webpack, e.g. window
        // stats: false, // Don't show stats in the console

        performance: options.performance,
    };
}


module.exports = makeConfig;
