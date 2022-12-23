# {{cookiecutter.project_title}}

{% if cookiecutter.gitlab_repo_url -%}
[![Build status]({{ cookiecutter.gitlab_repo_url }}/badges/master/pipeline.svg)]({{ cookiecutter.gitlab_repo_url }}/commits/master)
[![Coverage report]({{ cookiecutter.gitlab_repo_url }}/badges/master/coverage.svg)]({{ cookiecutter.gitlab_repo_url }}/commits/master)

{% endif -%}

TODO: verify that the following info is correct:

 - Python:  {{cookiecutter.python_version}}
 - DB:      PostgreSQL {{cookiecutter.postgres_version}}
 - Node:    {{cookiecutter.node_version}}
 - React:   16.8+

Browser support is defined in the `{{ cookiecutter.repo_name }}/browserslist` file that is used for autoprefixing CSS.


## Setting up development

### Installing Docker and Docker Compose

Refer to original [Docker documentation](https://docs.docker.com/engine/installation/) for installing Docker.

After installing Docker you need to install [Docker Compose](https://docs.docker.com/compose/install/) to run
 multi-container Docker applications (such as ours). The `curl` method is preferred for installation.

To run Docker commands without `sudo`, you also need to
[create a Docker group and add your user to it](https://docs.docker.com/engine/install/linux-postinstall/#manage-docker-as-a-non-root-user).

### Setting up {{cookiecutter.project_title}}

The easy way is to use `make` to set up everything automatically:

    make setup

This command:

- copies PyCharm project directory
- creates local settings file from local.py.example
- builds Docker images
- sets up database and runs Django migrations
- runs `docker-compose up`

Refer to `Makefile` to see what actually happens. You can then use the same commands to set everything up manually.


## Running development server

Both docker and docker-compose are used to run this project, so the run command is quite straightforward.

    docker-compose up

This builds, (re)creates and starts containers for Django, Node, PostgreSQL and Redis. Refer to `docker-compose.yml` for
more insight.
{%- if cookiecutter.frontend_style == SPA %}
Django app is running on `3000` port. Front-end server is running on `8000` port.
For more information see [SPA docs](app/README.md).
{%- endif %}

Logs from all running containers are shown in the terminal. To run in "detached mode", pass the `-d` flag to
docker-compose. To see running containers, use `docker-compose ps`. To see logs from these containers, run
`docker-compose logs`.

To _stop_ all running containers, use

    docker-compose stop

This stops running containers without removing them. The same containers can be started again with
`docker-compose start`. To stop a single container, pass the name as an extra argument, e.g.
`docker-compose stop django`.

To _stop and remove_ containers, run

    docker-compose down

This stops all running containers and removes containers, networks, volumes and images created by `up`.

### Using a different configuration file

By default docker-compose uses the `docker-compose.yml` file in the current directory. To use other configuration files,
e.g. production configuration, specify the file to use with the `-f` flag.

    docker-compose -f docker-compose.production.yml up

Note that the production configuration lacks PostgreSQL, since it runs on a separate container on our servers.

## Running Django commands in Docker

    docker-compose run django python manage.py <command>

### Command shortcuts in the Makefile

|Action                                |Makefile shortcut                      |Actual command                                                              |
|:-------------------------------------|:--------------------------------------|:---------------------------------------------------------------------------|
|Installing Python packages            |`make poetry-add cmd=<package>`        |Runs `poetry add $(cmd)` in its own container                               |
|(Re)Generate poetry.lock              |`make poetry-lock`                     |Runs `poetry lock -v` in its own container                                  |
|Check Python package security warnings|`make poetry-check`                    |`docker-compose run --rm --workdir / django poetry check`                   |
|make migrations                       |`make makemigrations cmd=<command>`    |`docker-compose run --rm django ./manage.py makemigrations $(cmd)`          |
|migrating                             |`make migrate cmd=<command>`           |`docker-compose run --rm django ./manage.py migrate $(cmd)`                 |
|manage.py commands                    |`make docker-manage cmd=<command>`     |`docker-compose run --rm django ./manage.py $(cmd)`                         |
|any command in Django container       |`make docker-django cmd=<command>`     |`docker-compose run --rm django $(cmd)`                                     |
|run tests                             |`make test`                            |`docker-compose run --rm django py.test`                                    |
|run linters                           |`make quality`                         |                                                                            |
|run StyleLint                         |`make stylelint`                       |`docker-compose run --rm node yarn stylelint`                               |
|run ESLint                            |`make eslint`                          |`docker-compose run --rm node yarn lint`                                    |
|run Prospector                        |`make prospector`                      |`docker-compose run --rm django prospector`                                 |
|run isort                             |`make isort`                           |`docker-compose run --rm django isort --recursive --check-only -p . --diff` |
|run psql                              |`make psql`                            |`docker-compose exec postgres psql --user {{cookiecutter.repo_name}} --dbname {{cookiecutter.repo_name}}` |

## Running commands on the server

    docker-compose -f docker-compose.production.yml run --rm --name {{ cookiecutter.repo_name }}_tmp django python manage.py <command>

## Installing new python or npm packages

### Node
Since `yarn` is inside the container, currently the easiest way to install new packages is to add them
to the `package.json` file and rebuild the container.

#### Gotchas

* Keep `react`, `react-dom` and `react-testing-library` node package versions in sync. Otherwise it causes an error when running `jest`.

### Python

Python package management is handled by `poetry`, and employs a lock file (`poetry.lock`) to store the package version information.
The lock file ensures that when we are building production images
we don't install conflicting packages and everything is resolved to matching version while developing.

To install a new Python package, there are two options.
* Edit the `pyproject.toml` file and add the required package there, then run `make poetry-lock` to regenerate the lock file.
* Or run `make poetry-add cmd=<package>` -- this will add the package to `pyproject.toml` and regenerate `poetry.lock` in one take.

#### Using poetry locally for pycharm

PyCharm, as of 2020.3, does not yet support locating Poetry virtualenvs out of the box. So you need to do it manually.

* run `poetry install` locally. Given, that you have poetry installed.
* When you ran previous command, it told you where it created the virtual environment something like 
  `/home/you/.cache/pypoetry/virtualenvs/projectname-somehash`;
* if you missed it you can see it by running `poetry run which python`. It should be something like 
  `/home/you/.cache/pypoetry/virtualenvs/bin/python`;
* Open your project in pycharm and under settings search for _project interpreter_ or just _interpreter_.
  Select the python interpreter located as shown above.

## Rebuilding Docker images

To rebuild the images run `docker-compose build`. This builds images for all containers specified in the configuration
file.

To rebuild a single image, add the container name as extra argument, e.g. `docker-compose build node`.

## Swapping between branches

After changing to a different branch, run `docker-compose up --build`. This builds the images before starting
containers.

If you switch between multiple branches that you have already built once, but haven't actually changed any configuration
(e.g. installed new pip or npm packages), Docker finds the necessary steps from its cache and doesn't actually build
anything.

## Running tests

You can also use `--reuse-db` or `--nomigrations` flags to the actual command above to speed things up a bit. See also:
https://pytest-django.readthedocs.org/en/latest/index.html

### Coverage

You can also calculate tests coverage via `make coverage`. The results will be in the following directories:

- python: [`{{cookiecutter.repo_name}}/cover`](./{{cookiecutter.repo_name}}/cover)
- javascript: [{% if cookiecutter.frontend_style == WEBAPP %}`webapp/coverage`{% else %}`app/coverage`{% endif %}](./{% if cookiecutter.frontend_style == WEBAPP %}webapp/coverage{% else %}app/coverage{% endif %})

## Running code formatting tools

Code formatting tools are used to use same code style across the project.

For JavaScript we use Prettier.
```bash
# To check Javascript code style use:
make prettier-check-all

# To check single Javascript file use:
make prettier-check cmd="app/src/index.js" # File path should be relative to project root

# To format Javascript code use:
make prettier-format-all

# To format single Javascript file use:
make prettier-format cmd="app/src/index.js" # File path should be relative to project root
```

For Python we use Black formatter.
```bash
# To check Python code style use:
make black-check-all

# To check single Python file use:
make black-check cmd="{{ cookiecutter.repo_name }}/accounts/admin.py" # File path should be relative to project root

# To format Python code use:
make black-format-all

# To format single Python file use:
make black-format cmd="app/src/index.js" # File path should be relative to project root
```

There is also option to use file watchers.
To use pre-built docker helpers for this, import `.idea_template/watchers.xml`.

You can also use `prettier` and `black` directly if NodeJS and/or Python is available for you.


## Running linters

Linters check your code for common problems. Running them is a good idea before submitting pull requests, to ensure you
don't introduce problems to the codebase.

We use _ESLint_ (for JavaScript parts), _Prospector_ (for Python), _StyleLint_ (for SCSS), _isort_ (for Python imports)
and _Pipenv check_ (for security vulnerabilities).

To use them, run those commands in the Django app dir:

    # Check Javascript sources with ESLint:
    make eslint
    # Check SCSS sources with StyleLint:
    make stylelint
    # Check Python sources with Prospector:
    make prospector
    # Check Python imports with isort:
    make isort
    # Check Python package security vulnerabilities:
    make poetry-check
    # Run all of above:
    make quality


## Running tests

Tests are ran by `pytest` and `jest` test runners for python and javascript respectively. They can be run with the
makefile via `make test`.


## Django translations

Project contains two commands for updating and compiling translations. Those two are `make makemessages` and `make compilemessages`.
Howewer if you are adding a new language or are creating translations for the first time after setting up project, you need to run
different command to create the initial locale files. The command is `add-locale`. After you have used this command once per each
new language you can safely use `makemessages` and `compilemessages`

{% if cookiecutter.frontend_style == SPA %}
## SPA translations

Frontend app uses [i18next](https://github.com/i18next/i18next) for translations and locale data is stored in `public/locale/**/translations.json`.
Translation discovery is handled in runtime and with command `extract-i18n`. During runtime discovered translations
will be put in `translations.missing.json`, This file can be referred to for new translations added.
**Notice: Only used translations will be automatically discovered. Other usages require manual extraction.**
To add extra language, add it to `i18n.json` and run `make extract-i18n`. This will generate required files.
In development Node server needs to be restarted to see updated translations.
{% endif %}

## Deployment

We use Ansible for deployment, see more information in [ansible directory](./ansible/README.md).
{%- if cookiecutter.build_in_ci == YES %}
You may also be interested in [building & pushing production docker images locally](./scripts/images/README.md#locally).
{%- endif %}
