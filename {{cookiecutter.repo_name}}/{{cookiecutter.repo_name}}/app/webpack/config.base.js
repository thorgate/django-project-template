/* eslint-disable */
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const autoprefixer = require('autoprefixer');
const StatsWriterPlugin = require("webpack-stats-plugin").StatsWriterPlugin;

const flattenDict = require('./helpers/flatten-dict');


// The app/ dir
const app_root = path.resolve(__dirname, '..');
// The django app's dir
const project_root = path.resolve(app_root, '..');

// Show Deprecation warnings
process.traceDeprecation = true;


function makeConfig(options) {
    const DJ_CONST = JSON.parse(fs.readFileSync(path.join(project_root, 'constants.json')));

    const mode = options.mode || 'none';
    const output = {
        path: path.resolve(app_root, 'build'),
        filename: options.filenameTemplate + '.js',
        chunkFilename: options.filenameTemplate + '.chunk.js',
        publicPath: process.env.ENABLE_PROXY === 'y' ? DJ_CONST.STATIC_URL : DJ_CONST.STATIC_WEBPACK_URL,
        library: '{{cookiecutter.repo_name}}',
        hashFunction: 'sha512',
        hashDigestLength: 32,
    };

    return {
        name: 'client',

        mode,

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
                use: [
                    !options.extractCss ? 'style-loader' : MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            options: {
                                sourceMap: true,
                                minimize: options.minifyCss,
                            },
                        },
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
                    },
                ],
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
            new MiniCssExtractPlugin({
                filename: options.filenameTemplate + '.css',
                chunkFilename: options.filenameTemplate + '.chunk.css',
            }),

            new webpack.DefinePlugin(flattenDict(DJ_CONST, 'DJ_CONST')),
            new webpack.DefinePlugin({DEV_MODE: JSON.stringify(process.env.NODE_ENV !== 'production')}),
            new webpack.DefinePlugin({SERVER_MODE: JSON.stringify(false)}),

            // Write out stats file to app/build directory, useful for production
            new StatsWriterPlugin({
                filename: 'stats.json',
                fields: [
                    'errors',
                    'warnings',
                    'version',
                    'hash',
                    'publicPath',
                    'outputPath',
                    'assetsByChunkName',
                    'modules',
                ],
            }),
        ].concat(options.plugins),

        optimization: {
            namedModules: options.namedModules,
            minimize: options.minimize,

            splitChunks: {
                chunks: 'all',
                name : false,

                cacheGroups: {
                    default: false,
                    vendors: {
                        name: 'vendors',
                        test: /node_modules/,  // Include all assets in node_modules directory
                        reuseExistingChunk: true,
                        enforce: true,
                        chunks: 'initial',
                        minChunks: 2,
                    },
                },
            },
            runtimeChunk: true,
        },

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

        performance: options.performance,
    };
}


module.exports = makeConfig;
