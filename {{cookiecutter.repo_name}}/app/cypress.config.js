const { defineConfig } = require("cypress");

module.exports = defineConfig({
    pageLoadTimeout: 60000,
    defaultCommandTimeout: 10000,
    fixturesFolder: false,
    modifyObstructiveCode: false,
    reporter: "cypress-multi-reporters",
    reporterOptions: {
        configFile: "./cypress/reporter-config.json",
    },
    screenshotsFolder: "./cypress/screenshots",
    screenshotOnRunFailure: true,
    video: false,
    videosFolder: "./cypress/videos",
    viewportWidth: 1200,
    experimentalStudio: true,
    e2e: {
        baseUrl: "http://node-cypress.{{cookiecutter.live_domain_name}}.com.docker.local:9990",
        specPattern: "./cypress/integration/**/*.spec.js",
        supportFile: "./cypress/support/index.js",
        setupNodeEvents(on, config) {
            on("before:browser:launch", (browser = {}, launchOptions) => {
                if (browser.name === "chrome") {
                    launchOptions.args.push("--disable-dev-shm-usage");
                    launchOptions.args.push("--disable-gpu");
                    launchOptions.args.push("--js-flags=--expose-gc");
                    return launchOptions;
                }
                return launchOptions;
            });
        },
    },
});
