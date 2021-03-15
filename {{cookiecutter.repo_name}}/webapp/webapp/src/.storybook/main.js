const baseConfig = require('../../webpack/config.dev');

module.exports = {
    webpackFinal: (config) => {
        return {
            ...config,
            module: {
                ...config.module,
                rules: baseConfig.module.rules,
            },
            plugins: baseConfig.plugins.concat(config.plugins),
            resolve: {
                modules: baseConfig.resolve.modules.concat(
                    config.resolve.modules || [],
                ),
            },
        };
    },
    stories: ['../**/*.stories.[tj]s'],
};
