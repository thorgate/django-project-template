exports.config = {
    "tests": "tests/*_test.js",
    "timeout": 10000,
    "output": "output",
    "helpers": {
        "Nightmare": {
            "url": "http://node/",
            "show": false,
            "restart": false
        },
        "NightmareHelper": {
            "require": "./nightmare_helper.js",
            // Print browser console logs?
            "verbose": false,
        }
    },
    "include": {},
    "bootstrap": false,
    "mocha": {},
    "name": "app"
};
