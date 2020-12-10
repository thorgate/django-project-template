/* eslint-disable no-console, class-methods-use-this */

const support = {
    console: !!window.console,
    modifiedConsole: false,
    consoleStyles: false,
    timing: false,
};
const browser = {
    isFirefox: /firefox/i.test(navigator.userAgent),
    isIE: !!document.documentMode,
};

support.modifiedConsole =
    !browser.isIE &&
    support.console &&
    console.log.toString().indexOf('apply') !== -1;

support.consoleStyles = !!(window.chrome || browser.isFirefox);
support.timing =
    support.console && !!window.console.time && !!window.console.timeEnd;

const availableColors = {
    red: 'red',
    green: 'green',
    lightGreen: 'lightgreen',
    yellow: '#dea92a',
    ligthYellow: '#FFFBE6',
    blue: '#1795de',
};

const styles = {
    def: `color: ${availableColors.blue}; font-weight: bold;`,
    debug: `color: ${availableColors.green}; font-weight: bold; background: ${availableColors.lightGreen}`,
    warn: `color: ${availableColors.yellow}; font-weight: bold;`,
    error: `color: ${availableColors.red}; font-weight: bold`,
};

class BrowserWinston {
    constructor() {
        this.profiles = {};
    }

    styled(str, { bold, color, background }) {
        if (support.consoleStyles) {
            const css = [
                bold ? 'font-weight: bold' : '',
                color ? `color: ${availableColors[color] || color};` : '',
                background
                    ? `background: ${
                          availableColors[background] || background
                      };`
                    : '',
            ].join('; ');

            return `<logger:styled="${css}">${str}</logger:styled>`;
        }

        return str;
    }

    log(...args) {
        return console.log(...this.withTag(null, ...args));
    }

    info(...args) {
        return console.log(...this.withTag('info', ...args));
    }

    debug(...args) {
        return console.log(...this.withTag('debug', ...args));
    }

    warn(...args) {
        return console.warn(...this.withTag('warn', ...args));
    }

    error(...args) {
        return console.error(...this.withTag('error', ...args));
    }

    profile(timerName) {
        if (support.timing) {
            if (!this.profiles[timerName]) {
                this.profiles[timerName] = true;
                console.time(timerName);
            } else {
                this.profiles[timerName] = false;
                console.timeEnd(timerName);
            }
        } else {
            this.warn(
                `Failed to start profiler ${timerName}. Console timing is not supported in this platform.`,
            );
        }
    }

    withTag(inTag, ...inArgs) {
        let tag = inTag;
        let args = inArgs.slice();

        if (tag === null) {
            tag = args[0]; // eslint-disable-line prefer-destructuring
            args = args.slice(1);
        }

        const finalTag = `${tag}`;

        if (support.consoleStyles) {
            // Only add inner styles if first arg is string
            if (args.length === 1 && typeof args[0] === 'string') {
                const theMessage = args[0];
                args = args.slice(1);

                const argArr = [
                    `%c[${finalTag.toUpperCase()}]%c ${theMessage}`,
                    styles[finalTag] ?? styles.def,
                    '',
                ];

                // Find if we have any inner styles
                const tagRe = /<logger:styled="([^"]+)">(.+)<\/logger:styled>/gi;
                argArr[0] = argArr[0].replace(
                    tagRe,
                    (match, style, message) => {
                        argArr.push(style);
                        argArr.push('');

                        return `%c${message}%c`;
                    },
                );

                return argArr.concat(args);
            }

            return [
                `%c[${finalTag.toUpperCase()}]`,
                styles[finalTag] ?? styles.def,
            ].concat(args);
        }

        return [`[${finalTag.toUpperCase()}]`].concat(args);
    }

    addFilter() {}
}

const noop = (a) => a;

export const addColors = () => {};

export const format = (fn) => (param) => fn(param, param);
format.combine = noop;
format.colorize = noop;
format.label = noop;
format.splat = noop;
format.printf = noop;
format.timestamp = noop;

export const createLogger = () => new BrowserWinston();
export const transports = {
    Console() {},
    ConsoleTransportOptions() {},
    File() {},
    FileTransportOptions() {},
    Http() {},
    HttpTransportOptions() {},
    Stream() {},
    StreamTransportOptions() {},
};

export default {
    Logger: BrowserWinston,
};
