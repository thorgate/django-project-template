module.exports = {
    extends: ['@thorgate'],
    settings: {
        'import/resolver': {
            node: {}, // https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-511007063
            webpack: {
                config: 'webapp/webpack/config.dev.js',
            },
        },
    },

    overrides: [
        {
            "files": [
                "webapp/src/ducks/**/*.{js,jsx}"
            ],
            "rules": {
                "no-param-reassign": 0,
            },
        },
    ],
};
