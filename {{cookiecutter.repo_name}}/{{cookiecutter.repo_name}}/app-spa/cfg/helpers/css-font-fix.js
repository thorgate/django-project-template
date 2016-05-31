/* eslint-disable */


function transpile(source) {
    var pos = 0;

    while (true) {
        var needle = source.indexOf('url(', pos);

        if (needle === -1) {
            break;
        }

        source = source.substr(0, needle) + "url('" + source.substr(needle + 4, source.length);

        pos = needle + 4;
        var open = 1;

        while (true) {
            var ch = source.charAt(pos);
            if (ch === '(') {
                open += 1;
            } else if (ch === ')') {
                open -= 1;
                if (open < 1) {
                    break;
                }
            }

            pos += 1;
        }

        // Last brace closed, lets modify the end
        source = source.substr(0, pos) + "'" + source.substr(pos, source.length);
    }

    return {
        code: source
    };
}


module.exports = function(source, inputSourceMap) {
    var result = transpile(source);

    this.callback(null, result.code, inputSourceMap);
};
