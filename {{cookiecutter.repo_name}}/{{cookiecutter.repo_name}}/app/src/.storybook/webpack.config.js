const baseConfig = require('../../webpack/config.dev');

const config = {
    ...baseConfig,

    performance: { hints: 'warning' },
};

module.exports = config;
