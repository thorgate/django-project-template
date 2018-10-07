# Changelog

<!--
When adding new changes just create a similar section after this comment like

## DATE (template variant unless it's the main one)

CHANGES
-->

## 2018-10-07

- Fix issue with nginx and `app.<project>.proxy_<component>.include`, might occure only on newer server
- Remove `crontab` references
- Re-structure SPA
    - Move `<project>/app` to `app`
    - Move related files as well
    - Move `<project>/static/styles-src` to `app/styles-src`
    - Move `SPA.md` to `app/README.md`
    - Move `app/src/server` to `app/server`
- Upgrade SPA to use `babel@7`
- Switch Django & Node to Alpine Docker images
- Refactor SSR to be more clearly defined
    - Can be disabled in settings
    - All api requests will be made only when SSR is enabled
    - Production: Disable SSR on last worker
- Add fancy loading bar for SPA
- Add `app/settings` and `app/env` to support environment based settings in Node
- Add `django-environ` to support environment based settings in Django
- Add `django-cors-headers` to prepare for `k8s`, env based settings is also pre-work for this
- Improve server logging, logger formatting should be correct now
- TODO : `tg-i18n` version upgrade (not released yet)


## 2018-06-22

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
