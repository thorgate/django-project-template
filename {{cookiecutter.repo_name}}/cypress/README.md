# Testing with Cypress

## Getting started 

https://docs.cypress.io/guides/getting-started/writing-your-first-test

## Running tests

There are two ways of running tests: in a browser and in headless mode.

* The headless mode is suited well for CI and for regression tests, i.e. 
  just verifying that all works as it should. 
* The browser mode is targeted at cases when you need to see what's happening, e.g. developing
  new functionality or writing new cypress tests.

The setup supplied by `docker-compose.cypress.yml` supports both modes.

The `docker-compose.cypress.yml` setup provides django and node containers that are separate from the ones 
in the default docker-compose file. This is done in order that you don't have to stop/restart/rebuild containers
that you are using for the actual development, and to also enable headless mode without hassle.

The list of yarn/npm commands in `package.json` contains 3 cypress-related commands - one for headless/CLI/CI mode,
and two for localhost/GUI mode.

### Running headless tests in docker (CLI/CI)

All that is needed is running `make cypress`. This will build the cypress containers and run the necessary
preparation steps, perform the tests and then clean up.

A couple other `make` commands can be found in [the cypress makefile](../Makefile-cypress).

The corresponding `package.json` command is `cy:run-ci`.

### Running tests in browser on local host

To run in browser, the tests need access to the screen, which is tricky with docker, so the easy way is 
to use the `node.js` environment installed on host.

* First, you would need to set the `django-cypress.{{ cookiecutter.domain_name }}.docker.local` 
  and `node-cypress.{{ cookiecutter.domain_name }}.docker.local` hosts to point to localhost in `/etc/hosts`.
* From the project root run: `make cypress-prepare`. This will create and start the containers necessary
  to perform browser tests.
* Make sure your current `node.js` version on host matches that of the [Dockerfile-node](../Dockerfile-node), 
  and `yarn` is available for this `node.js` version.
* In the same `webapp` directory, run `yarn` to install the `node.js` dependencies.
  After that, run `yarn run cypress install` to complete cypress setup.
* The command `yarn cy:run` will run all tests in Chrome.
* Alternatively, `yarn cy:open` will open the cypress GUI from where you can start individual test suites.
* Please note, when running locally, cypress uses a cache directory located in `~/.cache/Cypress` to store
  the browser and other data.

Whenever you run cypress on host, make sure the cypress containers are up & running. 
(i.e. you've run `make cypress-prepare` prior to it.)

Depending on the tests, it might be necessary to run cleanup between them - use `make cypress-reset` for that. 

## Notes

* The `docker-compose.cypress.yml` file is meant to run together with the `.env.cypress` env file, so docker-compose
  **must** be run with the `--env-file .env.cypress` argument, despite `env_file` options in the yaml. 
  Otherwise, it would use `.env` to build the containers
  and then some env variables would be somehow taken from `.env` or be absent altogether.
  Also, we can not reuse env variables (i.e. set values in the `environment` section based on the variables in `.env*`)
  because docker-compose doesn't substitute the values from `.env*` into the `environment` section - 
  issuing warnings like 
```
WARNING: The POSTGRES_DB variable is not set. Defaulting to a blank string.
```
  even though `POSTGRES_DB` is set in the `.env.cypress`.
  It appears to be a feature of docker-compose.   
* To simplify the environment preparation and ensure reproducibility,
  we do not mount the postgres data directory, so the database is fresh after each recreation of the postgres
  container, and the current development database is never affected. To populate the database with data, 
  use django fixtures named `cypress.json` - one is provided by default, containing a test account. 
* In the makefile, the node container needs to perform `cypress install` before testing,
  the started containers are reused when running the tests. This allows for shorter times of startup and re-running tests.
* To ensure that cookies are set correctly, we need a fully qualified domain name for our server.
  This requires setting a "network alias" for the django container. Please note, this domain name can not contain
  underscores because they are not "orthodox" characters in domain names and would trigger errors.
* The `defaultCommandTimeout` cypress config option was set to 10s, overriding the default of 4s, because in headless mode, 
  the internal browser experiences bigger delays compared to the GUI browser, resulting 
  in sporadic timeouts of cypress trying to find an element. In Gitlab CI, due to poor performance of CI runners, 
  this timeout is further increased to 60s with an environment variable, because even 30s
  proved to be not enough sometimes.
