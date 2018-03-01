/* eslint-disable */
const is = require('is');

// Keys to not include in frontend app
const FORBIDDEN_APP_KEYS = ['RAVEN_BACKEND_DSN'];


function flattenDict(dict, baseKey) {
    const result = {};

    Object.keys(dict).forEach((key) => {
        const theKey = (baseKey ? `${baseKey}.` : '') + key;

        if (is.object(dict[key])) {
            const innerDict = flattenDict(dict[key]);

            result[theKey] = {};
            Object.keys(innerDict).forEach((k2) => {
                result[theKey][k2] = innerDict[k2];
            });
        } else if (FORBIDDEN_APP_KEYS.includes(key)) {
            result[theKey] = JSON.stringify(null);
        } else {
            result[theKey] = JSON.stringify(dict[key]);
        }
    });

    return result;
}

module.exports = flattenDict;
