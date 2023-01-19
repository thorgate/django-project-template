# Generation parameter reference

## `project_title`

User-visible title of the project. This is used in the readme and default project settings.


## `repo_name`

Preferably lowercase codename, used for the directory structure and Python modules.

Default value is `project_title` slugified.


## `domain_name`

Production domain name of the site (e.g. example.com). NOTE: should be lowercase and valid FQDN.

Defaults to `TODO.com`.


## `test_host`

Hostname for test server.

Defaults to `test.{{cookiecutter.domain_name}}`.


## `admin_email`

Project email. Used for any data requiring email.

Defaults to `info@{{cookiecutter.domain_name}}`.


## `include_celery`

Include Celery with Redis as the broker.

Choice variable. Valid variables: `yes`, `no`. Defaults to `no`.


## `docker_base_image`

Base Docker images to use.

Choice variable. Valid variables: `alpine`, `debian`. Defaults to `alpine`.


## `python_version`

Python version to use.

Choice variable. Valid variables: `3.11`, `3.10`, `3.9`, `3.8`, `3.7`, `3.6`. Defaults to `3.10`.


## `node_version`

Node.js version to use.

Choice variable. Valid variables: `18`, `16`, `14`, `12`, `10`. Defaults to `14`.


## `postgres_version`

Postgres version to use.

Choice variable. Valid variables: `12`, `11`, `10`, `9`. Defaults to `12`.


## `django_admin_path`

Django Admin panel URL path.
**NOTE:** Should not start or end with `/`.

Defaults to `adminpanel`.


## `django_health_check_path`

Django health check URL path.
**NOTE:** Should not start or end with `/`.

Defaults to `health`.


## `django_media_engine`

Django remote media storage engine to use.

Choice variable. Valid variables: `S3`, `GCS`. Defaults to `S3`.


## `gitlab_repo_url`

**[Optional]** Gitlab repo url in format: https://gitlab.com/your-group/project-name.

This is used for deriving the Gitlab repository url to use when deploying or the default
Docker registry url used for the project. Additionally the CI badges in the README file
are created based on this value.

Defaults to `''`.

> Note: If this is not defined during the project creation/upgrade then one needs to manually update the
>  repository variable inside `ansible/group_vars/all/vars.yml` file of the resulting project to the correct
>  git repository url (SSH). Additionally, when `build_in_ci` is set to `yes` then the image urls in `environemnt`
>  file need to be updated to correct values too.

## `frontend_style`

Set the type of frontend to use.

Choice variable. Valid variables: `webapp`, `spa`. Defaults to `webapp`.


## `webapp_include_storybook`

Webapp only: Include storybook configuration?

Choice variable. Valid variables: `yes`, `no`. Defaults to `no`.


## `use_mypy`

Use MyPy static types checker?

Choice variable. Valid variables: `yes`, `no`. Defaults to `no`.


## `use_cypress`

Use Cypress autotests?

Choice variable. Valid variables: `yes`, `no`. Defaults to `no`.


## `thorgate`

Are you from thorgate? Exclude common config present for Thorgate.

Choice variable. Valid variables: `yes`, `no`. Defaults to `no`.


## `build_in_ci`

Do you want to build docker images in CI for deployment?
**NOTE:** Requires a docker registry.

Choice variable. Valid variables: `yes`, `no`. Defaults to `no`.


## `use_auto_deploy`

Do you want to use automatic deployments?

Choice variable. Valid variables: `yes`, `no`. Defaults to `no`.
