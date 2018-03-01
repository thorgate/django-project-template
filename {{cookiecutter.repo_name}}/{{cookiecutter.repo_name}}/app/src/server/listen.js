// Setup the server
require('./setup');

const memwatch = require('memwatch-next');
const {leak, listen} = require('./server');


// Setup memory watcher
memwatch.on('leak', leak);

// Start listen
listen();
