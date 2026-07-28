# Thorgate's Django template

[![Build status](https://gitlab.com/thorgate-public/django-project-template/badges/master/pipeline.svg)](https://gitlab.com/thorgate-public/django-project-template/commits/master)

[Django](https://www.djangoproject.com/) project template that we use at [Thorgate](https://thorgate.eu).

Best suited for medium-sized and bigger apps that use JavaScript and React for frontend or single page web applications.

_(note that the primary repo is in [Gitlab](https://gitlab.com/thorgate-public/django-project-template), with mirror in [Github](https://github.com/thorgate/django-project-template))_


## Features

- Django-based backend

    - [Django](https://www.djangoproject.com/)
    - Separate settings for different environments (local/staging/production)
    - Python 3.6 or later
    - [SPA] Accessible from port `3000` for local development
    - [SPA-NEXT] Accessible from port `3000` for local development

- Frontend app with JavaScript (ES2015), React and Sass

    - Latest JavaScript features from [ES2015](https://babeljs.io/docs/learn-es2015/) and beyond, transpiled with
      [Babel](https://babeljs.io/)
    - [React](https://facebook.github.io/react/) for fast modular user interfaces
    - [Sass](http://sass-lang.com/), [PostCSS](http://postcss.org/) and
      [Autoprefixer](https://github.com/postcss/autoprefixer) for more convenient styling
    - [Webpack](https://webpack.github.io/) is used to bundle and minify JavaScript and styles
    - [SPA] [Razzle](https://razzlejs.org/) for preconfigured isomorphic application
    - [SPA] Accessible from port `8000` for local development

- Batteries

    - Docker / Docker Compose integration
    - Linting of Python, JavaScript and Sass code with [Prospector](http://prospector.landscape.io/),
      [ESLint](http://eslint.org/) and [stylelint](https://stylelint.io/)
    - Automated code-formatting using [black](https://black.readthedocs.io) and [prettier](https://prettier.io)
    - [py.test](http://pytest.org/) and [coverage](https://coverage.readthedocs.io/) integration
    - Deploy helpers, using [Ansible](https://www.ansible.com/)
    - Optional Kubernetes / ArgoCD deploy scaffold (experimental, `use_kubernetes`), see [Kubernetes / Helm deployment](#kubernetes--helm-deployment)
    - Media files are stored in a CDN like S3 or Google Cloud Storage
    - Out-of-the-box configuration for nginx, gunicorn and logrotate
    - Includes [PyCharm](https://www.jetbrains.com/pycharm/) project config


## Usage

To use this template, first ensure that you have
[Poetry](https://python-poetry.org/docs/) available.

After that, you should:

1. Install the requirements of the project template by running
    ```
    poetry install
    ```
2. Activate the virtualenv created by _poetry_:
    https://python-poetry.org/docs/managing-environments/#activating-the-environment
    ```
    eval $(poetry env activate)
    ```
3. Navigate to the directory where you'd like to create your project:
    ```
    cd /home/my-awesome-projects/
    ```

4. Create a new project by executing:
    ```
    cookiecutter dir/to/django-project-template/
    ```


It will ask you a few questions, e.g. project's name, python version and so on. **For a reference of all the configuration options** see [CookiecutterVariables.md](./CookiecutterVariables.md) file.



To create isomorphic single-page application set `frontend_style == spa`. Then separate node application will be created supported by [Razzle](https://razzlejs.org/)

After generation completes, **you should deactivate virtual environment for cookiecutter**,
search for any TODOs in the code and make appropriate changes where needed.

See README.md in the generated project for instructions on how to set up your development environment.


## Different frontend styles

### SPA

Isomorphic Javascript single-page application rendered with node and backed by Django Rest Framework. Enabled with `frontend_style == spa`.
During development and production separate node container is used to run and serve assets if needed.
Translations are done with [i18next](https://www.i18next.com/) and its companion library for React.

### Webapp

React powered application rendered with Django templates. This is the default option. Enabled with `frontend_style == webapp`.
During development separate container is used to build assets. In production, node built with multi-stage image.
Translations are done with Django JavaScriptCatalog.


## Kubernetes / Helm deployment

**Experimental.** Enable it with the `use_kubernetes` cookiecutter variable
(see `CookiecutterVariables.adoc`). It generates a `helm_deploy/dev/`
scaffold that deploys the project through ArgoCD on the Thorgate platform,
alongside the ansible flow rather than replacing it.

### What gets generated

- `helm_deploy/dev/values.yaml` and `images.yaml`: config for the `phoenix`
  Helm chart. `images.yaml` is kept separate so argocd-image-updater can bump
  the image tag without touching the rest of the config.
- `helm_deploy/dev/extra/`: a kustomize overlay applied alongside the chart.
  It holds the namespace, a ConfigMap, the movetokube `Postgres` /
  `PostgresUser` CRs, and the argocd-image-updater `ImageUpdater` CR.
- `helm_deploy/dev/secrets/`: **gitignored** plaintext Secret templates
  (registry pull creds, Django env, node env), pre-filled with generated
  random keys the same way `ansible/host_vars/*/vault.yml` is. Fill in the
  `REPLACE_ME` placeholders, run `secrets/seal.sh`, and commit only the
  resulting SealedSecrets in `extra/`. See the generated
  `helm_deploy/dev/secrets/README.md`.

ArgoCD consumes these as one multi-source Application (the `extra/` overlay,
the `phoenix` chart, and the repo's values). For the flow, the cluster
prerequisites, and how to run it on your own ArgoCD, see
[docs/argocd-deployment.md](docs/argocd-deployment.md).

For Thorgate projects there's nothing to set up by hand: the platform's
ApplicationSet discovers the repo once it's tagged `argo-managed`, and the
concrete wiring lives in Thorgate's internal gitops repository.

### Conventions the scaffold depends on (don't regress these)

- The chart version in `values.yaml` is pinned to an exact build, not the
  floating `-dev` tag. The pinned build fixes init containers rendering with
  no image tag (`:latest`), which the registry never pushes, so pods would
  otherwise hang in `Init:ImagePullBackOff`.
- SealedSecrets go in `extra/` as plain, sync-waved resources
  (`argocd.argoproj.io/sync-wave: "-1"`), never as ArgoCD or Helm hooks. A
  hook resource is not tracked as part of the Application, and the default
  hook-delete-policy (`BeforeHookCreation`) deletes it before every sync, so
  an interrupted sync leaves the SealedSecret - and its derived Secret (for
  example the registry pull secret) - gone, and pods `ImagePullBackOff` on
  their next restart. Sync-waves apply the Secret before the chart's wave-30
  Deployment (same mechanism as the Postgres CRs below) while keeping it
  tracked and self-healed. `helm_deploy/dev/secrets/seal.sh` stamps that
  annotation on everything it writes, so this holds by default.
- The generated `.gitignore` ignores `helm_deploy/*/secrets/*.yaml`, and git
  applies that nested `.gitignore` inside **this** repo too. Adding a new
  plaintext template under `{{cookiecutter.repo_name}}/helm_deploy/dev/secrets/`
  therefore needs `git add -f`, or it is silently skipped.
- The movetokube operator provisions Postgres through sync-wave CRs, not helm
  hooks, which would rotate the password on every sync. The platform's ArgoCD
  config (`argocd-cm`) gates the CR health on `status.succeeded=true`, so the
  chart's wave-30 resources wait for the database and its credentials Secret.
- The branch in `extra/imageupdater.yaml` (`allowTags` and the write-back
  `branch`) comes from the `default_git_branch` global in
  `extensions/tg_filters.py`: it reads `git symbolic-ref` and falls back to
  `master` to match what `hooks/post_gen_project.py` checks the new repo out
  as. If you change that hook's branch, keep the fallback in sync.
- k8s object names and hostnames run through the `as_hostname` filter
  (underscores become hyphens) for DNS-1123; postgres database/role names and
  image paths keep underscores.

### Status / roadmap

This is pre-1.0, so chart values may move between Phoenix versions; prefer the
ansible flow for production until it settles. The `confident_curie` and
`eager_cannon` template-test projects have no k8s counterpart yet. The
`circular_orbit` project is meant to fill that role and run a full lifecycle
(deploy, cutover, a few image-updater cycles, token rotation) before this is
recommended for production.


## Upgrading project template

First ensure you have a python3 interpreter with `cookiecutter` installed.

To upgrade an existing project, change the current working directory to the root of the project you want to upgrade. i.e. `cd project-to-upgrade`. Ensure your have not checked out the `template` branch.

Then run `python ~/path/to/django-project-template/upgrade-template.py`

This will make a commit to the branch `template` in your project with the updates to the project template. Then merge the `template` branch.

## Applying codemods

First activate Python 3 interpreter with required dependencies and ensure `docker` is installed and working.

Change the current working directory to the root of the project you want to apply codemods for. i.e. `cd project-to-upgrade`.

Then run `python ~/path/to/django-project-template/upgrade-template.py --apply-frontend-codemods`

This will build custom docker image to update old frontend versions.

## Docker images

The template uses our own images for CI runs. One for the template itself and a second one
for generated projects. Both images are alpine based and contain python3, pip and some support
packages. The images are published to [repository container registry](https://gitlab.com/thorgate-public/django-project-template/container_registry) and also to [docker hub](https://hub.docker.com/u/thorgate).

The images are built in CI (from default branches only) and also updated every day via schedules.

**Project CI Image**

- [Dockerfile-ci](./utils/Dockerfile-ci)
- Image in repository registry: `registry.gitlab.com/thorgate-public/django-project-template/ci`
- Image in docker hub: `thorgate/django-template-ci`
  - [see online](https://hub.docker.com/r/thorgate/django-template-ci)

**Template CI Image:**

- [Dockerfile-base-ci](./utils/Dockerfile-base-ci)
- Image in repository registry: `registry.gitlab.com/thorgate-public/django-project-template/base-ci`
- Image in docker hub: `thorgate/django-template-base-ci`
  - [see online](https://hub.docker.com/r/thorgate/django-template-base-ci)
