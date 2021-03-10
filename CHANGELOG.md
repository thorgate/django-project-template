# Changelog

<!--
When adding new changes just create a similar section after this comment like

## DATE (template variant unless it's the main one)

CHANGES

Note: Try to add categories to changes and link to MRs/Issues
-->

## 2021-03-09

- [ENH] Use razzle-plugin-modify-eslint-loader-config to stop eslint errors from failing SPA app builds


## 2021-02-02

- [DEPRECATION] SPA branch has been deprecated. `frontend_style == spa` option should be used as replacement.


## 2021-01-31

- [ENH] Added options to `upgrade-template.py` to define project location with argument
- [NEW] Added a frontend codemods to replace old imports/function calls in older project.
- [DEPRECATION] **SPA:** `react-helmet` has been replaced with `react-helmet-async`. Codemod is added to replace the usage.
- [DEPRECATION] **SPA:** Default export for `SETTINGS` has been removed. Codemod is added to replace the usage.
- [DEPRECATION] **SPA:** `tg-named-routes` and `configuration/routes` import of `urlResolve` has been removed. Now `resolvePath` import from `tg-named-routes` is expected. 
  Codemod is added to replace the usage. Check the codemod test fixtures for replaced variants.


## 2020-12-14

- [ENH] Pipenv replaced by Poetry (!160)

## development

- [ENH] Pipenv >= 2020.8.13 - !136 !137
- [ENH] Replace raven with sentry-sdk and make use of sentry environments (both for python and JS) - !136 !137
- [ENH] Move all sentry configuration to base settings file - !136 !137
- [ENH] Add new setting `IS_DOCKER_BUILD` (controlled by DJANGO_IS_DOCKER_BUILD) which is set to
         True during docker image build (for example during compilemessages) - !136 !137
- [ENH] Use and publish base images for CI - !138
- [ENH] Unify files between spa and master - !140
  - Resulting code is rendered based on new `frontend_style` option
- [NEW] Add spa frontend style to master branch
  - Note: Migration guide for projects generated from spa branch will be provided by #15
- [ENH] Add .git to .dockerignore - !147
- [BUG] Disable koa adding a second HSTS header - !149
- [NEW] Add clientside shim for winston. This allows us to use `logger` on the client too. Please note that we aim to replace winston with
         something modern (that works on both client and server) in the future and this is just an intermediate step before that - !150
- [BUG] Ensure settings and other SSR data is parsed before initializing the application. See more information in !150
- [ENH] Update following frontend packages: !157
  - `react`
  - `react-dom`
  - `@testing-library/*`
- [ENH] Include shared configs for Babel, ESLint and prettier via: !157
  - `@thorgate/babel-preset`
  - `@thorgate/eslint-config`
  - `@thorgate/prettier-config`
- [ENH] Use `screen` in example component test as recommended. @rrebase
- [DEPRECATION] Deprecating default export for `SETTINGS` !157
  - This is for having better support for usage with TypeScript in the future.

## [DEFAULT] development

- [BUG] Fix missing semicolon in nginx config - !139
- [ENH] Make code formatting tools run from project containers and remove linting helper images - !143
  - [ENH] Makefile: add PHONY to the targets instead of keeping a list of them
- [ENH] Move black config to pyproject.toml - !143


## 2020-06-27

- [DEPRECATION] Django CMS is removed


## [DEFAULT] 2020-06-17

- [ENH] Add postgres version option


## [DEFAULT] 2020-06-03

- [ENH] Move frontend app folder one level up and rename it to `webapp`


## 2020-05-12

- [ENH] Pipenv 2020.4.1b1
- [ENH] Update of Celery settings


## 2020-03-30

- [ENH] Add support for database settings from url
- [ENH] Add support for `sslmode` option via environment variables (default=`disable`)


## [DEFAULT] 2020-02-19

- [NEW] Add storybook

## [SPA] 2020-02-09

- [ENH] Node 12
- [ENH] Python 3.8
- [ENH] Django 2.2
- [ENH] various other python dependency bumps
- [BUG] Work around wait-for-it.sh bug where busybox has changed `timeout` call signature
- [ENH] Disable formatting related linting rules as we are using black
- [BUG] Fix gitlab-ci builds failing from docker:latest image update


## [DEFAULT] 2020-02-03

- [ENH] Node 12  !114
- [ENH] Python 3.8  !114
- [ENH] Django 2.2  !114
- [ENH] Django CMS 3.7  !114
- [ENH] django-reversions removed as it is no longer supported by django-cms  !114
- [ENH] various other python dependency bumps  !114
- [BUG] Work around wait-for-it.sh bug where busybox has changed `timeout` call signature  !114
- [ENH] Disable formatting related linting rules as we are using black  !114
- [BUG] Fix gitlab-ci builds failing from docker:latest image update  !114

**Migration guide:**

- https://docs.djangoproject.com/en/2.2/howto/upgrade-version/

- http://docs.django-cms.org/en/latest/upgrade/3.7.html

Note, if you have django cms <=3.4 and are using django-reversions, keep in mind that django-cms no longer supports django reversions.
See: https://www.django-cms.org/en/blog/2017/02/03/back-in-time-with-django-cms/


## [DEFAULT] 2020-01-29

- [ENH] Added Prettier formatter for JavaScript (see !112 and originally !97)
- [ENH] Added Black formatter for Python (see !112 and originally !97)

**Migration guide:**

- Upgrade template to commit `808e88736838c3d5cefca4d22963b54bc3d9fbf9`
- Run code formatting
- Upgrade template to this version
- Commit changes


## [DEFAULT] 2020-01-19

- [NEW] Run `manage.py compilemessages` during production django image build !108
  - Note: For cms variant one needs to make sure their django cms is updated to at-least 3.6.0
- [ENH] CMS: Upgrade to django-cms 3.6.x !108
- [ENH] CMS: Allow configuring cms cache settings via environment !108
- [ENH] Ensure default AppConfig classname uses PascalCase !108
- [NEW] Enable JS translations with [Django Javascript catalog](https://docs.djangoproject.com/en/1.11/topics/i18n/translation/#internationalization-in-javascript-code) !106
- [ENH] Render main menu with react-bootstrap instead of as HTML. This also includes CMS variant where
   we will just parse the existing CMS menu and then re-render it with react - see !106 for details
- [ENH] Provide `reverseUrl` utility function via [django-js-reverse](https://pypi.org/project/django-js-reverse) !106

**Internal changes:**

- [ENH] CI: Test generation of different project configurations in parallel
- [ENH] Update all root dependencies !111


## [DEFAULT] 2020-01-02

- [ENH] Update merge request templates with section about refactoring !103
- [NEW] Add simple django tests !102


## [SPA] 2019-11-14

- [ENH] Add Mailhog for testing emails in local development

## [DEFAULT] 2019-11-14

- [NEW] Add Mailhog for testing emails in local development !99 and !101
- [ENH] Ensure INTERNAL_IPS variable is set correctly during local development in local.py !99
- [BUG] Add missing STDOUT logger handler for production
- [ENH] Optimize kernel settings for Redis !95
- [ENH] Gather repo name from .cookiecutter instead of project dir basename !84

**Thorgate specific:**

- [ENH] Added terraform for automatic infrastructure setup !93


## [SPA] 2019-10-18

- [ENH] Apply code formatting

**Migration guide:**
- Upgrade template to !97
- Run code formatting
- Upgrade template to !98
- Commit changes


## [SPA] 2019-10-18

- [ENH] Added Prettier formatter for JavaScript (see !97)
- [ENH] Added Black formatter for Python (see !97)
- [BUG] Fixed issue with SSR using refresh token saga
- [BUG] Fixed missing `tg-react` forgot password url configuration


## [SPA] 2019-07-24

- [ENH] Add [react-i18next](https://react.i18next.com/) integration to frontend app (see !89)
  - Translations are stored in `.json` files
  - Supports runtime discovery
  - Add all new translations with make command
- [DEPRECATION] Placeholders for `gettext` has been removed (see !89)
- [ENH] Bump razzle to v3 final (see !89)

## [DEFAULT] 2019-07-11

- [NEW] Add fabric command to mirror media files and database from
  the remote server to local !85


 ## [DEFAULT] 2019-06-28

- [BUG] Add an AWS setting to fix a boto3 bug !87


## [DEFAULT] 2019-06-20

- [BUG] Add another way of fixing a boto3 bug into readme !86


## 2019-05-28

- [ENH] Do not pin versions to minor releases to allow security updates !74
- [ENH] Use variable for project name in Makefile !79
- [BUG] Run pipenv inside docker !77
- [NEW] Disable google indexing on test servers !76
- [ENH] Bump pyyaml version !73
- [BUG] Fix Docker Compose install in pipeline, ensures build dependencies in CI !68


## 2019-04-05

- [ENH] Specify indent style of Makefile to be tabs in `.editorconfig`
- [BUG] Run `pipenv-check` through docker. Otherwise it will fail in CI.


## [SPA] 2019-04-28

- [ENH] More strict eslint rules for more consistent code
- [ENH] Split `routes.js` for better maintainability
- [DEPRECATION] Import `urlResolve` from `configuration/routes` is now deprecated.
  Use `import { resolvePath as urlResolve } from 'tg-named-routes';` instead.

**Migration guide:**
- Split the routes into viable groups based on `configuration/routes/authentication.js`
- Commit changes


## 2019-03-16

- Switch `npm` to `yarn` for de-dupe during install and `resolution` overrides

**Migration guide:**
 - Remove existing `package-lock.json`
 - Start development docker environment to generate `yarn.lock`
 - Commit `yarn.lock` changes.


## [SPA] 2019-02-07

- [BUG] Fix issue with nginx and `app.<project>.proxy_<component>.include`, might occur only on newer server (see !46)
- [ENH] Re-structure SPA (see !46)
    - Move `<project>/app` to `app`
    - Move related files as well
    - Move `<project>/static/styles-src` to `app/src/styles`
    - Move `SPA.md` to `app/SPA.md`
    - Move to [Razzle](https://github.com/jaredpalmer/razzle) based setup
- [ENH] SPA template core code have been turned into packages (see [tg-spa-utils](https://github.com/thorgate/tg-spa-utils))
- [ENH] Add `django-cors-headers` to prepare for separate hosts for frontend and backend (see !46)
- [ENH] Improve server logging, logger formatting should be correct now (see !46)


## 2019-02-01

**Breaking:** This version changes of the base python docker images to alpine. If you have changed Django dockerfiles files in your projects make sure to port the changes over to alpine as well. This version also removes production Node dockerfile and builds node stuff inside the django dockerfile using docker multistage build.

- [ENH] Use docker multistage builds for production Django and node (see !61)
  - Note: This removes Dockerfile-node.production
- [ENH] Freeze pipenv dependency to `2018.11.26` (see !61)
- [ENH] Pin pep8-naming to `0.7.0` as a workaround for [this issue](https://github.com/PyCQA/pep8-naming/issues/92) (see !61)
- [ENH] Add pipenv-check to `make quality` (see !60)
- [ENH] Add more deploment hints about S3 (see !59)
- [BUG] Ensure correct DJANGO_SETTINGS_MODULE is set (see !58)
  - Fixes `manage.py shell`, `celery` and deployed code running via `wsgi.py`.
- [NEW] Add GitLab merge request templates to generated projects (see !57)
- [BUG] [FABRIC] Update fabfile to detect requirement changes with Pipfile (see !56)
- [BUG] Added missing --dev flag to pipenv install in development docker file (see !55)
- [BUG] Ignore docs folder when running `makemessages` (see !55)
- [ENH] Add styles from node_modules to global css scope (see !55)
- [ENH] Removed unused `style-loader` from node dependencies (see !55)
- [ENH] Added an example to local.py.example on how to get debug toolbar to work inside docker (see !55)
- [FABRIC] Disable certbot self-upgrade (see !54)
- [FABRIC] Add `--force-recreate` flag to `docker_up` command during a forced deployment (see !53)


## 2019-01-02

**Warning:** This version has a bug regards `DJANGO_SETTINGS_MODULE`, please use the latest version or apply changes from merge request !58 locally.

**Breaking:** This version converts our template to use environment based settings via django-environ.

- Use environment based settings

### Upgrading

- Upgrade template
  - Note: Pay attention to files in settings directory
- Test that everything is still working
- Commit changes
- In servers
    - Update Django to new settings
        - Convert `<root>/<project>/settings/local.py` to `<root>/<project>/django.env`
        - Or remove `DJANGO_PRODUCTION_MODE` env reference from `Dockerfile-django.production`


## 2018-12-06

**Breaking:** This version includes a breaking change which removes support for locally stored
media files. The media files will be stored in a CDN and we have builtin support for both Amazon S3 and
Google's Cloud storage. This change is done to simplify moving to Kubernetes in the future.

- Force storing media files in a CDN
- Remove support for locally stored media files

Some guides for existing projects:

- [Ensuring your project is compatible with remote media](https://gitlab.com/thorgate-public/django-project-template/wikis/Guides/Ensuring-your-project-is-compatible-with-remote-media)
- [Making some of the remote media private](https://gitlab.com/thorgate-public/django-project-template/wikis/Guides/Making-some-of-the-remote-media-private)
- [Moving existing media to S3](https://gitlab.com/thorgate-public/django-project-template/wikis/Guides/Moving-existing-media-to-S3)


## 2018-10-24

- Add Pipenv setup for Django


## 2018-10-24

- Add front-end testing support
- Set up [Jest](https://jestjs.io/) and [react-testing-library](https://github.com/kentcdodds/react-testing-library)


## 2018-09-07

- Webpack 4 support
- Simple CSS modules support
  - SCSS is supported
  - Stylesheets imported from the `src/` directory are used as CSS modules
  - Stylesheets imported from the `static/` directory are treated as global stylesheets


## 2018-09-06

- Add optional Sphinx integration.
- Make Bootstrap 4 the new default project template


## 2018-07-18

- Allow React pure components in eslint configuration.


## 2018-07-13

- Add project code style to `.idea_template` with style settings to match our linters.
  Used to set more specific settings that `.editorconfig` does not allow such as hex color format.
- Use `Django` as Python Template Language instead of `Jinja2`.
- Add browserupgrade molecule import to `main.scss`. It was missing.


## 2018-07-12

- Fix X-Frame-Options for CMS projects.


## 2018-07-06

- Ignore pytest cache directory.
- Fix test database, which also needs the correct host and user/password.


## [SPA] 2018-06-22

- Upgrade Webpack to version 4
  - Remove `WebpackSHAHash` and use built-in solution
  - Rename `manifest` to `runtime` for clarification
  - Server-side now uses packages in `node_modules` as externals to reduce bundle size
- Fix server-side asset loading (use same generated asset ID as client-side)
- Fix template asset loading order
- Fix missing `django_admin_path` replacement's
- Use `redux-saga.getContext` for server-side `requestConfig`
- Remove `serverClient` reducer
- Add better support to run production-mode in development


## 2018-06-15

- Fix broken CSS minification when running `npm run build`.
  Basically the combination of Bootstrap and Webpack didn't work together and we changed order of Bootstrap imports
  to make it work. Note that this might break print styles - see https://github.com/twbs/bootstrap/issues/24931


## 2018-06-12

- Update Bootstrap to 4.1.1


## 2018-06-11

- Update JS packages.
  Notably Webpack loaders as much as seemed to be safe (and compatible with Webpack 2),
  plus Webpack itself from 2.3 to 2.7 (which is the latest 2.x).
  React was upgraded 16.1 -> 16.4
- Update Python packages, notably Celery 4.1 -> 4.2, gunicorn 19.7 -> 19.8
- Update Node Docker image (8.11.1 -> 8.11.2)


## 2018-05-17

- Update packages and Docker images to latest versions.
  Notably updated `node-sass` and `sass-loader` so that binary version can be used.


## 2018-05-15

- Use `bootstrap4` template pack of `django-crispy-forms`.


## 2018-05-14

- Template: use commands from project's `.gitlab-ci.yml` for testing


## 2018-04-20

- Added Nginx-based rate-limiting for login urls.


## 2018-03-29

- Fixed coverage config in `.gitlab-ci.yml` (it has to be regex).


## 2018-03-21 (bootstrap4)

- Updated Bootstrap to 4.0 final


## 2018-03-12

- Update Python packages and Node Docker image to latest versions.
- Update list of supported browsers to be much more restrictive - see `browserslist` file.
- Remove `linttool.py` - it was unused.


## 2018-03-05

- Template: Fix project generation with relative paths, ala `cookiecutter ./django-project-template`.
- Template: add some Cookiecutter variables () and refactor them.


## 2018-02-22

- Use a single toplevel dir (.data/) for local data, reducing clutter in the toplevel directory.


## 2018-02-12

- Update public repo with everything that has happened
  Docker variant is the default now, development moved to Gitlab, tons of other changes.
