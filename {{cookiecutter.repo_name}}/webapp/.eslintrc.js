module.exports = {
    extends: ['@thorgate'],
    settings: {
        'import/resolver': {
            webpack: {
                config: 'webapp/webpack/config.dev.js',
            },
        },
    },
};
