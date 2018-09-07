# Changelog

<!--
When adding new changes just create a similar section after this comment like

## DATE (template variant unless it's the main one)

CHANGES
-->

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
