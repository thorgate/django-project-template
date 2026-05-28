/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BundleTracker = require('webpack-bundle-tracker');
const autoprefixer = require('autoprefixer');


// The app/ dir
const app_root = path.resolve(__dirname, '..');
// The django app's dir
const project_root = path.resolve(app_root, '..');
// node_modules directory
const node_modules_root = path.resolve(project_root, 'node_modules');

// Enable deprecation warnings
process.traceDeprecation = true;


function makeConfig(options) {
    const mode = options.mode || 'none';
    const output = {
        path: path.resolve(app_root, 'build'),
        filename: options.filenameTemplate + '.js',
        chunkFilename: options.filenameTemplate + '.chunk.js',
        publicPath: options.publicPath,
        library: '{{cookiecutter.repo_name}}',
        hashFunction: 'sha512',
        hashDigestLength: 32,
    };

    return {
        entry: {
            app: [
                // Must come after vendor styles - if any defined
                path.resolve(project_root, 'static', 'styles-src', 'main.scss'),
                // Main entry point of the app, the entrypoint will be exposed as output.library
                '@babel/polyfill',
                'main.js',
            ],
            adminStyles: path.resolve(project_root, 'static', 'styles-src', 'admin.scss'),
        },

        mode,

        output,

        module: {
            rules: [
                {
                    test: /\.([tj])sx?$/, // Transform all .js/.jsx/.ts/.tsx files required somewhere with Babel
                    exclude: /node_modules/,
                    use: 'babel-loader',
                },
                {
                    test: /\.(css|scss)$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                                importLoaders: 1,
                                modules: {
                                    localIdentName: '[path][name]__[local]--[hash:base64:5]',
                                    getLocalIdent: (loaderContext, localIdentName, localName, options) => {
                                        // Everything that comes from our global style folder and node_modules will be in global scope
                                        if (/styles-src|node_modules/.test(loaderContext.resourcePath)) {
                                            return localName;
                                        }

                                        return null;
                                    },
                                    namedExport: true,
                                    exportLocalsConvention: 'dashesOnly',
                                    mode: resourcePath => {
                                        if (/styles-src|node_modules/.test(resourcePath)) {
                                            return 'global';
                                        }
                                        return 'local';
                                    },
                                },
                            },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: function() {
                                        return [autoprefixer]
                                    },
                                }
                            },
                        },
                        {
                            loader: 'resolve-url-loader',
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true,
                                sassOptions: {
                                    loadPaths: [
                                        path.resolve(project_root, 'static', 'styles-src'),
                                        node_modules_root,
                                    ],
                                    outputStyle: 'expanded',
                                }
                            }
                        },
                    ],
                },
                {
                    test: /\.(jpe?g|png|gif|svg|woff2?|eot|ttf)$/,
                    loader: 'url-loader',
                    options: {
                        limit: 2000,
                        name: 'assets/[name].[contenthash].[ext]',
                    },
                },
            ],
        },

        plugins: [
            new MiniCssExtractPlugin({
                filename: options.filenameTemplate + '.css',
                chunkFilename: options.filenameTemplate + '.chunk.css',
            }),
            new BundleTracker({
                path: app_root,
                filename: 'webpack-stats.json',
                indent: 2,
                logTime: true,
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV), // Inject environmental variables to client side
            }),
        ].concat(options.plugins || []),

        optimization: {
            minimize: options.minimize,
            minimizer: options.minimizer,

            splitChunks: {
                chunks: 'all',

                cacheGroups: {
                    default: false,
                    defaultVendors: {
                        idHint: 'vendors',
                        test: /node_modules/,  // Include all assets in node_modules directory
                        reuseExistingChunk: true,
                        enforce: true,
                        chunks: 'initial',
                        minChunks: 1,
                    },
                },
            },
            runtimeChunk: 'single',
        },

        resolve: {
            modules: ['webapp/src', 'node_modules'],
            extensions: ['.js', '.ts', '.tsx'],
            alias: {
                '@app': path.resolve(project_root, 'webapp', 'src'),
            },
        },

        devtool: options.devtool,
        target: 'web', // Make web variables accessible to webpack, e.g. window
        // stats: false, // Don't show stats in the console

        performance: options.performance,
    };
}


module.exports = makeConfig;
