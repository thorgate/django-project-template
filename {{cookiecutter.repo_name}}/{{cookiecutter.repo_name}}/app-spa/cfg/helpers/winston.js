const support = {};
const browser = {};

browser.isFirefox = /firefox/i.test(navigator.userAgent);
browser.isIE = document.documentMode;

support.console = !!window.console;
support.modifiedConsole = !browser.isIE && support.console && console.log.toString().indexOf('apply') !== -1;
support.consoleStyles = !!window.chrome || !!(browser.isFirefox && support.modifiedConsole);


class Logger {
    constructor() {
        this.styles = {
            def: 'color: #1795de; font-weight: bold;',
            debug: 'color: green; font-weight: bold; background: lightgreen',
            warn: 'color: #dea92a; font-weight: bold;',
            error: 'color: red; font-weight: bold'
        };
    }

    log() {
        console.log.apply(console, this.withTag(null, arguments));
    }

    info() {
        console.log.apply(console, this.withTag('info', arguments));
    }

    debug() {
        console.log.apply(console, this.withTag('debug', arguments));
    }

    warn() {
        console.warn.apply(console, this.withTag('warn', arguments));
    }

    error() {
        console.error.apply(console, this.withTag('error', arguments));
    }

    withTag(tag, args) {
        args = [].slice.call(args);

        if (tag === null) {
            tag = args[0];
            args = args.slice(1);
        }

        if (support.consoleStyles) {
            return [
                `%c[${tag.toUpperCase()}]`,
                this.styles[tag] ? this.styles[tag] : this.styles.def
            ].concat(args);
        } else {
            return [
                `[${tag.toUpperCase()}]`
            ].concat(args);
        }

    }

    addFilter() {}
}


export default {
    Logger: Logger,
    transports: {
        Console: function() {},
        File: function() {}
    }
};
