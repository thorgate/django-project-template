// Delete the `BROWSER` env variable if it's present
delete process.env.BROWSER;

// Tell `require` calls to look into `/app` also
process.env.NODE_PATH = 'app';
require('module').Module._initPaths();

// Install `babel` hook for ES6++
require('babel-polyfill');
require('babel-register')();

// Configure logger early
require('../logger');

// Start the server
var server = require('./server').default;

// Setup memory watcher
require('memwatch-next').on('leak', server.leak);

// Export the server
module.exports = server;
