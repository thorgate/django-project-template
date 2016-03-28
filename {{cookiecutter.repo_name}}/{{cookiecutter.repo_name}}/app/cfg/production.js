/* eslint-disable */

'use strict';

require('babel-polyfill');
require('babel-register')();

var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var writeStats = require('./helpers/write-stats').default;
var flattenDict = require('./helpers/flatten-dict').default;
var DJ_CONST = JSON.parse(fs.readFileSync(path.join('constants.json')));

// Names of packages that should go into vendor chunk
var vendorPackages = [
    'react', 'react-router', 'lodash', 'alt', 'is', 'iso', 'superagent', 'tcomb', 'tcomb-form', 'tcomb-validation', 'validators',
    'babel-runtime/core-js'
];


module.exports = {
    entry: {
        vendor: vendorPackages.concat(["src/styles/vendor.js", "src/vendor.js"]),
        styles: "src/styles/main.js",
        main: "src/client.js"
    },
    node: {
        fs: "empty"
    },
    target: "web",
    devtool: "source-map",
    output: {
        path: path.join(__dirname, '..', 'build', 'public'),
        filename: 'cached/[hash]/[name].js',
        publicPath: '/public/'
    },
    module: {
        loaders: [
            {
                test: /\.json$/,
                loader: 'json'
            },
            {
                test: /\.(jpe?g|png|gif|svg|woff|eot|ttf)$/,
                loader: 'file?name=assets/[hash].[name].[ext]'
            },
            {
                //Since bootstrap bakes timestamps into the output for these fonts, the previous regex wont match them.
                test: /\.(jpe?g|png|gif|svg|woff2?|eot|ttf)\?&?\d+$/,
                loader: 'file?name=assets/[hash].[name].[ext]'
            },
            {
                test: /\.js$|.jsx$/,
                exclude: /node_modules/,
                loaders: ['babel', 'img-loader']
            },
            {
                test: /\.css$/,
                loader: 'style!font-fix!css'
            },
            {
                test: /\.scss/,
                loader: ExtractTextPlugin.extract('style', 'font-fix!css!autoprefixer!sass?' +
                    'includePaths[]=' + encodeURIComponent(path.resolve(__dirname, '../../', 'node_modules', 'bootstrap-sass', 'assets', 'stylesheets')) +
                    '&includePaths[]=' + encodeURIComponent(path.resolve(__dirname, '../../', 'node_modules', 'compass-mixins', 'lib')))
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('cached/[name].[chunkhash].css'),

        new webpack.DefinePlugin({
            'process.env': {
                BROWSER: JSON.stringify(true),
                NODE_ENV: JSON.stringify('production')
            }
        }),

        // Disable require ensure so our vendor chunk remains as we want it
        function() {
            this.plugin("this-compilation", function(compilation) {
                compilation.mainTemplate.plugin("require-ensure", function(_, chunk, hash) {
                    return '';
                });
            });

            this.plugin("compilation", function(compilation) {
                compilation.mainTemplate.plugin("require-ensure", function(_, chunk, hash) {
                    return '';
                });
            });
        },

        // Bake django constants in for clientside code
        new webpack.DefinePlugin(flattenDict(DJ_CONST, 'DJ_CONST')),

        new webpack.optimize.CommonsChunkPlugin({
            name: "vendor",
            filename: 'cached/[name].[chunkhash].js'
        }),

        new webpack.optimize.OccurenceOrderPlugin(true),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                screw_ie8: true
            },
            output: {
                comments: false
            }
        }),

        function() {
            this.plugin('done', writeStats);
        }
    ],

    resolveLoader: {
        alias: {
            'img-loader': path.join(__dirname, 'helpers', 'img-loader'),
            'font-fix': path.join(__dirname, 'helpers', 'css-font-fix')
        },
        root: path.join('..', '..', "node_modules")
    },

    resolve: {
        extensions: ['', '.js', '.json', '.jsx'],
        modulesDirectories: ['node_modules', 'app'],
        alias: {
            // Alias winston when building browser bundle
            winston: path.join(__dirname, 'helpers', 'winston'),
            bootstrap: path.join(__dirname, '../../', 'node_modules', 'bootstrap-sass', 'assets', 'stylesheets', 'bootstrap')

        }
    }
};
