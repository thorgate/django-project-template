{% raw %}/* eslint-disable */
'use strict';

const fs = require('fs');
const eol = require('eol');
const path = require('path');
const VirtualFile = require('vinyl');

const i18nSettings = require('./i18n.json');

const appDir = path.resolve(__dirname);


module.exports = {
    input: [
        'src/**/*.{js,jsx}',
    ],
    output: './public/locales',
    options: {
        plural: true,
        removeUnusedKeys: false,
        sort: false,
        attr: { extensions: [] },
        func: { extensions: [] },
        trans: { extensions: [] },
        lngs: i18nSettings.LANGUAGE_ORDER,
        ns: i18nSettings.TRANSLATION_NAMESPACES,
        defaultLng: i18nSettings.DEFAULT_LANGUAGE,
        defaultNs: i18nSettings.DEFAULT_NAMESPACE,
        defaultValue: '',
        resource: {
            loadPath: '{{lng}}/{{ns}}.json',
            savePath: '{{lng}}/{{ns}}.json',
            jsonIndent: 2,
            lineEnding: '\n',
        },
        nsSeparator: ':',
        keySeparator: '.',
        contextSeparator: '_',
        interpolation: {
            prefix: '{{',
            suffix: '}}',
        },
    },
    transform(file, enc, done) {
        const parser = this.parser;

        const content = fs.readFileSync(file.path, enc);
        const code = require('@babel/core').transformSync(content, {
            // Required plugins to parse code but keep it close to the source
            // This is for handling jsx syntax, dynamic imports and optional chaining
            plugins: [
                '@babel/plugin-syntax-jsx',
                '@babel/plugin-syntax-dynamic-import',
                '@babel/plugin-proposal-optional-chaining',
            ],
        });
        parser.parseFuncFromString(code.code, {
            list: ['_', '__', 'i18next.t', 'i18n.t', 't', 'tNoop'],
        });
        parser.parseTransFromString(code.code, {
            component: 'Trans',
            i18nKey: 'i18nKey',
            defaultsKey: 'defaults',
            fallbackKey: (ns, value) => value,
        });
        done();
    },
    flush(done) {
        const { parser } = this;
        const { options } = parser;

        // Flush to resource store
        const resStore = parser.get({ sort: options.sort });
        const { jsonIndent } = options.resource;
        const lineEnding = String(options.resource.lineEnding).toLowerCase();

        Object.keys(resStore).forEach((lng) => {
            const namespaces = resStore[lng];

            Object.keys(namespaces).forEach((ns) => {
                const resPath = parser.formatResourceSavePath(lng, ns);
                let resContent;
                try {
                    resContent = JSON.parse(
                        fs.readFileSync(
                            fs.realpathSync(path.join(appDir, 'public', 'locales', resPath)),
                        ).toString('utf-8'),
                    );
                } catch (e) {
                    resContent = {};
                }
                const obj = { ...namespaces[ns], ...resContent };
                let text = JSON.stringify(obj, null, jsonIndent) + '\n';

                if (lineEnding === 'auto') {
                    text = eol.auto(text);
                } else if (lineEnding === '\r\n' || lineEnding === 'crlf') {
                    text = eol.crlf(text);
                } else if (lineEnding === '\n' || lineEnding === 'lf') {
                    text = eol.lf(text);
                } else if (lineEnding === '\r' || lineEnding === 'cr') {
                    text = eol.cr(text);
                } else { // Defaults to LF
                    text = eol.lf(text);
                }

                let contents = null;

                try {
                    // "Buffer.from(string[, encoding])" is added in Node.js v5.10.0
                    contents = Buffer.from(text);
                } catch (e) {
                    // Fallback to "new Buffer(string[, encoding])" which is deprecated since Node.js v6.0.0
                    contents = new Buffer(text);
                }

                this.push(new VirtualFile({
                    path: resPath,
                    contents: contents,
                }));
            });
        });

        done();
    },
};{% endraw %}
