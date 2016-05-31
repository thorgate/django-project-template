/* eslint-disable */

var del = require('del');
var path = require('path');


module.exports = (function() {
    var DIST_PATH = path.resolve(__dirname, '../../build/*');
    del.sync([DIST_PATH]);
    console.log('cleaned `' + DIST_PATH + '` directory');
})();
