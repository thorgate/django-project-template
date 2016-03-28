import is from 'is';


export default function flattenDict(dict, baseKey) {
    var result = {};

    Object.keys(dict).forEach((key) => {
        var theKey = (baseKey ? baseKey + '.' : '') + key;

        if (is.object(dict[key])) {
            var innerDict = flattenDict(dict[key]);

            result[theKey] = {};
            Object.keys(innerDict).forEach(function (k2) {
                result[theKey][k2] = innerDict[k2];
            });
        }

        else {
            result[theKey] = JSON.stringify(dict[key]);
        }
    });

    return result;
}
