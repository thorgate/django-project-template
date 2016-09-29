import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import {isArray} from 'lodash';

import writeStats from './helpers/write-stats';
import startHost from './helpers/start-host';
import flattenDict from './helpers/flatten-dict';


export default () => {
    const LOCAL_IP = require('dev-ip')();

    const HOST = isArray(LOCAL_IP) && LOCAL_IP[0] || LOCAL_IP || 'localhost';
    const DJ_CONST = JSON.parse(fs.readFileSync(path.join('constants.json')));

    const PORT = parseInt(process.env.PORT, 10) + 1 || DJ_CONST['WEBPACK_PORT'] || 3001;
    const SITE_URL = `http://${HOST}:${PORT}`;
    const PUBLIC_PATH = `${SITE_URL}/public/`;

    return {
        server: {
            port: PORT,
            options: {
                publicPath: PUBLIC_PATH,
                hot: true,
                stats: {
                    assets: true,
                    colors: true,
                    version: false,
                    hash: false,
                    timings: true,
                    chunks: false,
                    chunkModules: false
                }
            }
        },
        webpack: {
            devtool: 'eval-cheap-module-source-map',
            entry: {
                app: [
                    `webpack-dev-server/client?http://localhost:${PORT}`,
                    'webpack/hot/only-dev-server',
                    'src/index.js'
                ]
            },
            node: {
                fs: 'empty'
            },
            publicPath: PUBLIC_PATH,
            output: {
                path: path.join(__dirname, '..', 'build', 'dist'),
                filename: '[name].js',
                chunkFilename: '[name].js',
                publicPath: PUBLIC_PATH
            },
            module: {
                loaders: [
                    {
                        test: /\.json$/,
                        loader: 'json'
                    },
                    {
                        test: /\.(jpe?g|png|gif|svg|woff|eot|ttf)$/,
                        exclude: /node_modules/,
                        loader: 'file?name=[name].[ext]'
                    },
                    {
                        // Since sass bakes timestamps into the output for these fonts, the previous regex wont match them.
                        test: /\.(jpe?g|png|gif|svg|woff2?|eot|ttf)\?&?\d+$/,
                        exclude: /node_modules/,
                        loader: 'file?name=[name].[ext]'
                    },
                    {
                        test: /\.js$|.jsx$/,
                        exclude: /node_modules/,
                        loaders: ['react-hot', 'babel?cacheDirectory', 'img-loader']
                    },
                    {
                        test: /\.css$/,
                        loader: 'style!font-fix!css'
                    },
                    {
                        test: /\.scss/,
                        loader: 'style!font-fix!css!sass?' +
                            'includePaths[]=' + encodeURIComponent(path.resolve(__dirname, '../../', 'node_modules', 'bootstrap-sass', 'assets', 'stylesheets')) +
                            '&includePaths[]=' + encodeURIComponent(path.resolve(__dirname, '../../', 'node_modules', 'compass-mixins', 'lib'))
                    }
                ]
            },
            plugins: [
                // hot reload
                new webpack.HotModuleReplacementPlugin(),
                new webpack.NoErrorsPlugin(),

                new webpack.DefinePlugin({
                    'process.env': {
                        BROWSER: JSON.stringify(true),
                        NODE_ENV: JSON.stringify('development')
                    }
                }),

                // Bake django constants in for clientside code
                new webpack.DefinePlugin(flattenDict(DJ_CONST, 'DJ_CONST')),

                function() {
                    this.plugin('done', writeStats);
                },

                function() {
                    this.plugin('done', startHost);
                }
            ],
            resolve: {
                extensions: ['', '.js', '.json', '.jsx'],
                modulesDirectories: ['node_modules', 'app'],
                alias: {
                    bootstrap: path.join(__dirname, '../../', 'node_modules', 'bootstrap-sass', 'assets', 'stylesheets', 'bootstrap'),

                    // Alias winston when building browser bundle
                    winston: path.join(__dirname, 'helpers', 'winston')
                }
            },
            resolveLoader: {
                alias: {
                    'img-loader': path.join(__dirname, 'helpers', 'img-loader'),
                    'font-fix': path.join(__dirname, 'helpers', 'css-font-fix')
                }
            }
        }
    };
};
