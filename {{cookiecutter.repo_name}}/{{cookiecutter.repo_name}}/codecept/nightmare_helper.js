// Error on exceptions in browser
// from https://github.com/Codeception/CodeceptJS/issues/358#issuecomment-272034664
'use strict';

class NightmareHelper extends Helper {
    _before() {
        this.err = null;
        let browser = this.helpers['Nightmare'].browser;
        browser.on('page', (type, message, stack) => {
            this.err = `JS Exception in Browser: ${message} ${stack}`;
        });

        if (this.config.verbose) {
            browser.on('console', console.log.bind(console));
        }
    }

    _afterStep() {
        if (this.err) {
            console.log('erroring....');
            throw new Error(this.err);
        }
        this.err = null;
    }
}

module.exports = NightmareHelper;
