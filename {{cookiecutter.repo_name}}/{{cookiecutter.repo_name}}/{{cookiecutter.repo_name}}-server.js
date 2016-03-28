/*eslint-disable */

function doClustering() {
    var index = parseInt(process.argv[2], 10);

    // Validate args
    if ((!index && index !== 0) || isNaN(index) || !(0 <= index < 100)) {
        console.error('Please specify a valid index (0 <= index < 100)');
        process.exit();
        return;
    }

    // Set env variables
    process.env.CLUSTERED = true;
    process.env.CLUSTER_INDEX = index;

    // if NODE_ENV not set lets force it to production
    if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'production';
    }

    // Set process name in ps|top
    process.title = '{{ cookiecutter.repo_name }}-express-' + index;

    // Start the host
    require('./app/src/server/index.js').listen(index);
}

// Run with clustering
doClustering();

/*eslint-enable */
