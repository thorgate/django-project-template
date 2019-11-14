# Changelog

<!--
When adding new changes just create a similar section after this comment like

## DATE (template variant unless it's the main one)

CHANGES

Note: Try to add categories to changes and link to MRs/Issues
-->

## 2019-11-14

- [ENH] Add Mailhog for testing emails in local development


## 2019-07-11

- [NEW] Add fabric command to mirror media files and database from
  the remote server to local !85

## 2019-06-28

- [BUG] Add an AWS setting to fix a boto3 bug !87

## 2019-06-20

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

## 2019-03-16

- Switch `npm` to `yarn` for de-dupe during install and `resolution` overrides

**Migration guide:**
 - Remove existing `package-lock.json`
 - Start development docker environment to generate `yarn.lock`
 - Commit `yarn.lock` changes.


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
