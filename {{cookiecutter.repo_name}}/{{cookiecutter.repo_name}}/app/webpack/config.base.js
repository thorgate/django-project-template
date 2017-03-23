const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BundleTracker  = require('webpack-bundle-tracker');
const autoprefixer = require('autoprefixer');


// The app/ dir
const app_root = path.resolve(__dirname, '..');
// The django app's dir
const project_root = path.resolve(app_root, '..');


function makeConfig(options) {
    const output = {
        path: path.resolve(app_root, 'build'),
        filename: options.filenameTemplate + '.js',
        publicPath: options.publicPath,
        library: '{{cookiecutter.repo_name}}',
    };

    return {
        entry: {
            app: options.prependSources.concat(['babel-polyfill', 'main.js']),
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
                            includePaths: [path.resolve(project_root, 'node_modules', 'bootstrap-sass', 'assets', 'stylesheets'),],
                            sourceMap: true,
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
            new BundleTracker({
                path: __dirname,
                filename: '../webpack-stats.json',
                indent: 2,
                logTime: true,
            }),
        ].concat(options.plugins),

        resolve: {
            modules: ['app/src', 'node_modules'],
            extensions: ['.js'],
        },

        devtool: options.devtool,
        target: 'web', // Make web variables accessible to webpack, e.g. window
        // stats: false, // Don't show stats in the console

        performance: options.performance,
    };
}


module.exports = makeConfig;
