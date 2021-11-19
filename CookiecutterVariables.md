# Generation parameter reference


|Parameter                 |Description                         |Type    |Default |
|:-------------------------|:-----------------------------------|:-------|:-------|
|`project_title`           |User-visible title of the project.  |`string`|`n/a`   |
|`repo_name`               |Preferably lowercase codename, used for the directory structure and Python modules|`string`|`project_title` slugified|
|`domain_name`             |Production domain name of the site (e.g. example.com). NOTE: should be lowercase and valid FQDN.|`string`|`TODO.com`|
|`test_host`               |Hostname for test server|`string`|`test.{{cookiecutter.domain_name}}`|
|`admin_email`             |Project email. Used for any data requiring email.|`string`|`info@{{cookiecutter.domain_name}}`|
|`include_celery`          |Include Celery with Redis as the broker.|`Choice:yes,no`|`no`|
|`docker_base_image`       |Base Docker images to use|`Choice:alpine,debian`|`alpine`|
|`python_version`          |Python version to use|`Choice:3.9,3.8,3.7,3.6`|`3.9`|
|`node_version`            |Node.js version to use|`Choice:14,12,10`|`14`|
|`postgres_version`        |Postgres version to use|`Choice:12,11,10,9`|`12`|
|`django_admin_path`       |Django Admin panel URL path. NOTE: Should not start or end with `/`|`string`|`adminpanel`|
|`django_health_check_path`|Django health check URL path. NOTE: Should not start or end with `/`|`string`|`_health`|
|`django_media_engine`     |Django remote media storage engine to use.|`Choice:S3,GCS`|`S3`|
|`gitlab_repo_url`         |**[Optional]** Gitlab repo url (in format: https://gitlab.com/your-group/project-name, used for CI badges).|`string`|`''`|
|`frontend_style`          |Set the type of frontend to use|`Choice:webapp,spa`|`webapp`|
|`webapp_include_storybook`|Webapp only: Include storybook configuration?|`Choice:yes,no`|`no`|
|`use_mypy`                |Use MyPy static types checker?|`Choice:yes,no`|`no`|
|`use_cypress`             |Use Cypress autotests?|`Choice:yes,no`|`no`|
|`thorgate`                |Are you from thorgate?|`Choice:yes,no`|`no`|
|`build_in_ci`             |Do you want to build docker images in CI for deployment? Requires a docker registry.|`Choice:yes,no`|`no`|
|`use_auto_deploy`         |Do you want to use automatic deployments?|`Choice:yes,no`|`no`|
