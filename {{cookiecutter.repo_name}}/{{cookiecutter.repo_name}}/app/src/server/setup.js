// eslint-disable global-require
// Delete the `BROWSER` env variable if it's present
delete process.env.BROWSER;

global.DEV_MODE = process.env.NODE_ENV !== 'production';
global.SERVER_MODE = true;
// Tell `require` calls to look into correct path in `/app` directory
process.env.NODE_PATH = DEV_MODE ? 'app/src' : 'app/lib';

require('module').Module._initPaths(); // eslint-disable-line no-underscore-dangle

require('babel-polyfill');
require('babel-register')();

// Configure logger early
require('./utils/logger');

// Add fetch to node global context
global.fetch = require('node-fetch');

const proto = Object.getPrototypeOf(require);

/* eslint-disable */
// define require.ensure if not present
if (!proto.hasOwnProperty("ensure")) {
    Object.defineProperties(proto, {
        ensure: {
            value: function ensure(modules, callback) {
                callback(this);
            },
            writable: false,
        },
        include: {
            value: function include() {
            },
            writable: false,
        },
    });
}
/* eslint-enable */
