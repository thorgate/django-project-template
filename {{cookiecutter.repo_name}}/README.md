# README for {{cookiecutter.project_title}}

{% if cookiecutter.gitlab_repo_url -%}
[![Build status](https://gitlab.com/thorgate/{{ cookiecutter.repo_name }}/badges/master/pipeline.svg)]({{ cookiecutter.gitlab_repo_url }}/commits/master)
[![Coverage report](https://gitlab.com/thorgate/{{ cookiecutter.repo_name }}/badges/master/coverage.svg)]({{ cookiecutter.gitlab_repo_url }}/commits/master)

{% endif -%}

TODO: verify that the following info is correct:

 - Python:  {{cookiecutter.python_version}}
 - DB:      PostgreSQL 10
 - Node:    8.x LTS
 - NPM:     5.x
 - React:   16.x

Browser support is defined in the `{{ cookiecutter.repo_name }}/browserslist` file that is used for autoprefixing CSS.


## Setting up development

### Installing Docker and Docker Compose

Refer to original [Docker documentation](https://docs.docker.com/engine/installation/) for installing Docker.

After installing Docker you need to install [Docker Compose](https://docs.docker.com/compose/install/) to run
 multi-container Docker applications (such as ours). The `curl` method is preferred for installation.

To run Docker commands without `sudo`, you also need to
[create a Docker group and add your user to it](https://docs.docker.com/engine/installation/linux/ubuntulinux/#/create-a-docker-group).

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
|Installing Python packages            |`make pipenv-install cmd=<package>`    |Runs `pipenv install $(cmd)` in its own container                           |
|(Re)Generate Pipfile.lock             |`make pipenv-lock`                     |Runs `pipenv lock -v` in its own container                                  |
|Check Python package security warnings|`make pipenv-check`                    |`docker-compose run --rm --workdir / django pipenv check`                   |
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
{% if cookiecutter.include_docs == 'yes' %}|generate docs                         |`make docs`                            |`docker-compose run --rm django sphinx-build ./docs ./docs/_build`          |{% endif %}

## Running commands on the server

    docker-compose -f docker-compose.production.yml run --rm --name {{ cookiecutter.repo_name }}_tmp django python manage.py <command>

## Installing new pip or npm packages

Since `yarn` is inside the container, currently the easiest way to install new packages is to add them
to the `package.json` file and rebuild the container.

Python dependencies are a bit special. As we are using `pipenv` best option is to use `make py-install-deps cmd=<dependency>`.
After package is added also don't forget to `make Pipfile.lock` to update lock file. This ensure when we are building production images
we don't install conflicting packages and everything is resolved to matching version while developing.

When using `pipenv` via make file it will create the virtualenv under project directory. To use `pipenv` manually without `Makefile`,
prefix `pipenv` commands with `PIPENV_VENV_IN_PROJECT=1`.

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

{% if cookiecutter.include_docs == 'yes' %}
## Generating documentation with Sphinx

To build **.rst** files into html, run `make docs`. View the documentation at `/docs/_build/index.html`.
Read more about contributing to docs from `/docs/contributing.rst`.
{% endif %}

### Coverage

You can also calculate tests coverage with `coverage run -m py.test && coverage html`,

TODO: Expose this directory outside of docker
the results will be in `cover/` directory.


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
    make pipenv-check
    # Run all of above:
    make quality


## Django translations

Project contains two commands for updating and compiling translations. Those two are `make makemessages` and `make compilemessages`.
Howewer if you are adding a new language or are creating translations for the first time after setting up project, you need to run
different command to create the initial locale files. The command is `add-locale`. After you have used this command once per each
new language you can safely use `makemessages` and `compilemessages`


## Deploys

### Python 2 environment

We use Fabric for deploys, which doesn't support Python 3. Thus you need to create a Python 2 virtualenv.
It needn't be project specific and it's recommended you create one 'standard' Python 2 environment
which can be used for all projects. You will also need to install django and tg-hammer==0.6, our fabric deployment helper.


### Server setup

Your server needs to have [Docker Engine](https://docs.docker.com/engine/installation/)
as well as [Docker Compose](https://docs.docker.com/compose/) installed.

We also assume that you have Nginx and Postgres (version 10 by default) running in Docker containers and reachable via
'private' network. We also make a few assumptions regards directories that will be used as volumes for static assets,
etc. You can find these paths in `fabfile.py` and `docker-compose.production.yml`.


### Types of deploys

There are basically two types of deploys:

* initial deploy, where the project doesn't exist in the server yet.
* incremental deploy, where the project only needs to be updated.


### Incremental deploy

* Ensure that whatever you want deployed is committed and pushed.
* Just run `fab ENV deploy` where `ENV` is either `test` or `live`.
  You'll see the changes to be applied and can continue or abort.
  * You can specify revision (either id or branch name) by running `fab ENV deploy:id=REV`
    Future deploys will stick to the same branch/rev and you'll need to explicitly deploy master/default
    branch to get back to it.


### Initial deploy

* Figure out which server you're going to deploy to.
  We usually have one main test server and one main production server for new project.
* Check `fabfile.py` in Django project dir. It has two tasks (functions) - `test` and `live`.
  Ensure that the one you'll use has correct settings (mostly hostname).
* Check django settings (`settings/staging.py` and/or `settings/production.py`)
  and Nginx config (`deploy/nginx/*.conf`, `deploy/letsencrypt/*.conf`) - ensure that they have proper hostnames etc.
* Add the server's SSH key (`/root/.ssh/id_rsa.pub`) to the project repo as deployment key.
* Ensure you've committed and pushed all relevant changes.
{% if cookiecutter.django_media_engine == 'S3' -%}
* [Create the bucket for media files](http://docs.aws.amazon.com/AmazonS3/latest/UG/CreatingaBucket.html):
  * Bucket name: {{ cookiecutter.repo_name }}-{ENV} where `ENV` is either `staging` or `production`.
  * Region: Closest to the users of the project.
    * Don't forget to change `AWS_S3_REGION_NAME` to the correct one
  * Public access settings:
    * `Block new public ACLs and uploading public objects (Recommended)` = False
    * `Remove public access granted through public ACLs (Recommended)` = False
  * Properties:
    * Default encryption - AES-256
    * It's nice to add tags
  * Create a new user:
    * Go to [AWS IAM](https://console.aws.amazon.com/iam/home?#users).
    * Click "Create new users" and follow the prompts.
    * Leave "Generate an access key for each User" selected.
    * It's nice to add tags
  * Get the credentials:
    * Go to the new user's Security Credentials tab.
    * Click "Manage access keys".
    * Download the credentials for the access key that was created.
    * and Save them somewhere because no one will ever be able to download them again.
    * Get the new user's ARN (Amazon Resource Name) by going to the user's Summary tab.
       It'll look like this: "arn:aws:iam::123456789012:user/someusername".
  * Go to the bucket properties in the [S3 management console](https://console.aws.amazon.com/s3/home).
  * Add a bucket policy that looks like this, but change "BUCKET-NAME" to the bucket name,
     and "USER-ARN" to your new user's ARN. This grants full access to the bucket and
     its contents to the specified user:

    ```json
    {
        "Statement": [
            {
                "Action": "s3:*",
                "Effect": "Allow",
                "Resource": [
                    "arn:aws:s3:::BUCKET-NAME/*",
                    "arn:aws:s3:::BUCKET-NAME"
                ],
                "Principal": {
                    "AWS": [
                        "USER-ARN"
                    ]
                }
            }
        ]
    }
    ```
  * When receiving `signature we calculated does not match` error
    * waiting should fix this, around 1-2 hours max
    * files should still have been uploaded
        * can be confirmed by removing url params in browser (`?X-Amz-Algorithm=....`)
  * More information about working with S3 can be found [here](https://github.com/Fueled/django-init/wiki/Working-with-S3).
{% endif %}{% if cookiecutter.django_media_engine == 'GCS' -%}
1. Create a service account ([Google Getting Started Guide](https://cloud.google.com/docs/authentication/getting-started)).
2. Create the key and download your-project-XXXXX.json file.
3. Make sure your service account has access to the bucket and appropriate permissions. ([Using IAM Permissions](https://cloud.google.com/storage/docs/access-control/using-iam-permissions)).
4. The key file must be available in a file called `google-credentials-{env}.json` next to to fabfile.py  where `ENV` is either `staging` or `production`.
5. Make sure to delete the local copy of the credentials file once the deployment succeeds{% endif %}
* Run `fab ENV setup_server` where `ENV` is either `test` or `live`.
  * If it worked, you're all done, congrats!
  * If something else broke, you might need to either nuke the code dir, database and database user on the server;
    or comment out parts of fabfile (after fixing the problem) to avoid trying to e.g. create database twice. Ouch.


### Updating python packages

* Update packages in Pipenv file
* run `make pipenv-lock` if it successfully generates lock file, then you are set
* if previous command fails (due to package version clash), then do as it suggests - install the packages using the commands given and see what version is installed.

To install a new package, either follow the instructions above, or run `make pipenv-install cmd=<package>` -- this will add the package to Pipenv and regenerate Pipfile.lock in one take.


### Using pipenv locally for pycharm

* run `pipenv install` locally. Given, that you have pipenv installed.
* When you ran previous command, it told you where it created the virtual environment something like /home/you/.virtualenvs/projectname-somehash
* if you missed it you can see it by running `pipenv run which python`
* Open your project in pycharm and under settings search for _project interpreter_ or just _interpreter_. Pycharm is smart enough and should already have picked up your venv location but just in case you can make sure it matches the path you saw when you ran the install command
