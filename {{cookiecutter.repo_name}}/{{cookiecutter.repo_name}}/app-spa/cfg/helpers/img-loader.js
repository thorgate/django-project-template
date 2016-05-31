{% raw %}'use strict';

/**
 * Replaces all calls to imgResolver with require so we don't
 * need to write extra boilerplate on the client and server
 *
 * This helps us reduce boilerplate.
 *
 * @param source
 * @return {{code: (string)}}
 */
function transpile(source) {
    // Replace calls to imgResolver with require
    source = source.replace(/imgResolver[\s+]?\(/g, "require(");

    return {
        code: source
    };
}


/**
 * Expose this as a loader
 *
 * @param source
 * @param inputSourceMap
 */
module.exports = function(source, inputSourceMap) {
    var result = transpile(source);

    this.callback(null, result.code, inputSourceMap);
};{% endraw %}
