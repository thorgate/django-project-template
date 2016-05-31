const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BundleTracker  = require('webpack-bundle-tracker');
const autoprefixer = require('autoprefixer');


// Which browsers should be supported (regarding css)
const autoprefixer_browsers = ['last 2 versions', '> 5%', 'IE >= 9'];

// The app/ dir
const app_root = path.resolve(__dirname, '..');
// The django app's dir
const project_root = path.resolve(app_root, '..');


function makeConfig(options) {
    return {
        entry: {
            app: options.prependSources.concat(['babel-polyfill', 'main.js']),
            styles: options.prependSources.concat([path.resolve(project_root, 'static', 'styles-src', 'main.js')]),
        },

        output: {
            path: path.resolve(app_root, 'build'),
            filename: options.filenameTemplate + '.js',
            publicPath: options.publicPath,
            library: '{{cookiecutter.repo_name}}',
        },

        module: {
            loaders: [{
                test: /\.js$/, // Transform all .js files required somewhere with Babel
                loader: 'babel',
                exclude: /node_modules/,
            }, {
                test: /\.(css|scss)$/,
                loaders: ExtractTextPlugin.extract('style', ['css?sourceMap', 'postcss', 'resolve-url', 'sass?sourceMap']),
            }, {
                test: /\.(jpe?g|png|gif|svg|woff2?|eot|ttf)$/,
                loader: 'url',
                query: {
                    limit: 2000,
                    name: 'assets/[name].[hash].[ext]',
                },
            }],
        },

        sassLoader: {
            includePaths: [path.resolve(project_root, 'node_modules', 'bootstrap-sass', 'assets', 'stylesheets')],
        },

        postcss: function () {
            return [autoprefixer({browsers: autoprefixer_browsers})];
        },

        plugins: [
            // Always expose NODE_ENV to webpack, in order to use `process.env.NODE_ENV`
            // inside your code for any environment checks; UglifyJS will automatically
            // drop any unreachable code.
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                },
            }),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new ExtractTextPlugin(options.filenameTemplate + '.css', {
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
            // Backwards compatibility for eslint module resolver, until they add Webpack 2 support -
            //  see https://github.com/benmosher/eslint-plugin-import/pull/319
            modulesDirectories: ['app/src', 'node_modules'],
            extensions: [
                '',
                '.js',
            ],
        },

        devtool: options.devtool,
        target: 'web', // Make web variables accessible to webpack, e.g. window
        // stats: false, // Don't show stats in the console
        progress: true,
    };
}


module.exports = makeConfig;
