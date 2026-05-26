#!/usr/bin/env node

"use strict";

const fs = require("fs");
const argv = require("minimist")(process.argv.slice(2), { "--": true });

function writeBrowserEnvironment(env) {
    const base = fs.realpathSync(process.cwd());
    const dest = argv.d || argv.dest || "public";
    const debug = argv.debug;
    const path = `${base}/${dest}/__ENV.js`;
    console.info("react-env: Writing runtime env", path);
    if (debug) {
        console.debug(`react-env: ${JSON.stringify(env, null, 2)}`);
    }
    const populate = `window.__ENV = ${JSON.stringify(
        env
    )}; console.log("react-env: Runtime config loaded...");`;
    fs.writeFileSync(path, populate);
}

function getEnvironment() {
    const prefix = argv.prefix || "APP_PUBLIC";
    const envList = Object.keys(process.env)
        .filter((key) => new RegExp(`^${prefix}_`, "i").test(key))
        .reduce((env, key) => {
            env[key] = process.env[key];
            return env;
        }, {});
    return envList;
}

function resolveFile(file) {
    const path = fs.realpathSync(process.cwd());
    return `${path}/${file}`;
}

function getEnvFiles() {
    const envKey = argv.e || argv.env || "";
    const envVal = process.env[envKey] ? process.env[envKey] : "";
    const path = argv.p || argv.path || "";
    return [
        resolveFile(path),
        resolveFile(".env.local"),
        resolveFile(`.env.${envVal}`),
        resolveFile(".env"),
    ].filter(Boolean);
}

const dotenvFiles = getEnvFiles();

dotenvFiles.forEach((dotenvFile) => {
    if (fs.existsSync(dotenvFile)) {
        require("dotenv-expand")(
            require("dotenv").config({
                path: dotenvFile,
            })
        );
    }
});

const env = getEnvironment();

writeBrowserEnvironment(env);
