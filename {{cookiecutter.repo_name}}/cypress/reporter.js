// eslint-disable-next-line import/no-extraneous-dependencies
const mocha = require('mocha');
const fs = require('fs');

const { EVENT_TEST_PASS, EVENT_SUITE_END } = mocha.Runner.constants;

function appendToReportFile(content) {
    const path = 'cypress/integration_test_report.txt';
    if (fs.existsSync(path)) {
        fs.readFile(path, (err, data) => {
            const json = JSON.parse(data.toString());
            fs.writeFileSync(path, JSON.stringify({ ...json, ...content }, null, 4));
        });
    } else {
        fs.writeFileSync(path, JSON.stringify(content, null, 4));
    }
}

/**
 * Custom reporter to generate a Json of all the successfully ran tests
 */
function reporter(runner) {
    mocha.reporters.Base.call(this, runner);
    const tests = {};

    runner.on(EVENT_TEST_PASS, function (test) {
        if (!(test.parent.title in tests)) {
            tests[test.parent.title] = [];
        }

        tests[test.parent.title].push(test.title);
    });

    runner.on(EVENT_SUITE_END, function () {
        appendToReportFile(tests);
    });
}

module.exports = reporter;
