import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import watch from 'node-watch';
import {assign} from 'lodash';
import logger from '../../src/logger';


let server;
let started;
let serverReload;
let constUpdate;

const SERVER_PATH = path.join(__dirname, '../../src/server/listen');

// Load EXPRESS_PORT
const {EXPRESS_PORT} = JSON.parse(fs.readFileSync(path.join('constants.json')));

// Onkill handler
const onKill = () => {
    server.kill('SIGTERM');

    logger.debug('killing server');

    if (typeof EXPRESS_PORT === 'string') {
        logger.debug(`removing sock: ${EXPRESS_PORT}`);

        try {
            fs.unlinkSync(EXPRESS_PORT);
        }

        catch(e) {
            if (e.code !== 'ENOENT') {
                throw e;
            }
        }
    }

    process.exit();
};

// Server startup handler
const startServer = () => {
    // merge env for the new process
    const env = assign({}, {NODE_ENV: 'development'}, process.env);

    // start the server process
    server = cp.fork(SERVER_PATH, {env});

    // when server is `online`
    server.once('message', (message) => {
        if (message.match(/^online$/)) {
            if (serverReload) {
                serverReload = false;
            }

            if (constUpdate) {
                constUpdate = false;
            }

            if (!started) {
                started = true;

                // Listen for commands in stdin
                const help = () => {
                    logger.debug('commands:');
                    logger.debug('\t`const`: Update constants in the background and reload after completion');
                    logger.debug('\t`rs`: Restart express application');
                    logger.debug('\t`exit`: Force express to exit');
                    logger.debug('\t`quit`: Quit the dev server');
                };

                help();

                process.stdin.setEncoding('utf8');
                process.stdin.on('data', (data) => {
                    const parsedData = (data + '').trim().toLowerCase();
                    if (parsedData === 'rs') {
                        return restartServer();
                    } else if (parsedData === 'exit') {
                        server.kill('SIGTERM');
                        logger.debug('Express killed, use `rs` or `quit` to continue');
                    } else if (parsedData === 'quit') {
                        onKill();
                    }  else if (parsedData === 'const') {
                        logger.debug('Calling ./manage.py webpack_constants');

                        // Set constUpdate flag to true
                        constUpdate = true;

                        // Call ./manage.py dump_constants
                        cp.exec('./manage.py webpack_constants', {
                            cwd: path.join(__dirname, '..', '..', '..')
                        }, (err, stdout, stderr) => {
                            logger.debug('Constants updated');

                            logger.debug(`err: ${err}`);
                            logger.debug(`stdout: ${stdout}`);
                            logger.debug(`stderr: ${stderr}`);
                        });

                    } else {
                        help();
                    }
                });

                // Start watcher on server files
                watch(path.join(__dirname, '../../src'), (file) => !file.match('stats.json') ? restartServer() : noop());
            }
        }
    });
};

// Define `restartServer`
const restartServer = () => {
    logger.debug('restarting express application');
    serverReload = true;
    server.kill('SIGTERM');
    return startServer();
};

// kill server on exit
process.on('SIGINT', onKill);
process.on('exit', onKill);


// Restart when constUpdate is True
export default () => {
    if (!server) {
        startServer();
    } else {
        if (constUpdate) {
            restartServer();
        }
    }
};
