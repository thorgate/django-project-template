# README for {{cookiecutter.project_title}}

TODO: verify that the following info is correct:

 - Python:  {{cookiecutter.python_version}}
 - DB:      PostgreSQL (locally SQLite)
 - Node:    6.9.x
 - NPM:     3.x
 - React:   15.x

Browser support is defined in the `browserslist` file that is used for autoprefixing CSS.


## Setting up development

The easy way is to use `make` to set up everything automatically:

    make setup

This copies PyCharm project dir, creates virtualenv, installs dependencies, creates local settings and applies database migrations.
It also installs npm packages for the frontend parts.


### The manual way

If you don't want to use `make`, here's how to accomplish the same manually:

**Create PyCharm project dir** (if you are using PyCharm)

    make pycharm

**Create virtualenv**

    virtualenv --python=python{{cookiecutter.python_version}} venv
    . ./venv/bin/activate

or if you use virtualenvwrapper

    mkvirtualenv {{ cookiecutter.repo_name }} --python=python{{cookiecutter.python_version}}
    workon {{ cookiecutter.repo_name }}

**Install dependencies**

    pip install -r requirements/local.txt

**Switch to internal {{ cookiecutter.repo_name }} dir**

    cd {{ cookiecutter.repo_name }}

**Create local settings**

Create `settings/local.py` from `settings/local.py.example`

    cp settings/local.py.example settings/local.py

(now you can also open the project in PyCharm without running into issues due to missing virtualenv/settings)

**Apply database migrations**

    python manage.py migrate

**Ensure you have node 6.9.x**

See https://nodejs.org/en/ or https://nodejs.org/en/download/package-manager/ or use [n](https://github.com/tj/n)

**Install WebApp dependencies**

    npm install --python=python2.7


## Run development servers

**Note:** Virtualenv must be activated for the following commands to work

Run django server: `python manage.py runserver`

Run development asset server: `npm run dev`

**Note:** Server will run at 127.0.0.1:8000 (localhost wont work because of CORS)


## Running tests

Use `py.test` for running tests. It's configured to run the entire test-suite of the project by default.

    py.test

You can also use `--reuse-db` or `--nomigrations` flags to speed things up a bit. See also:
https://pytest-django.readthedocs.org/en/latest/index.html

### Coverage

You can also calculate tests coverage with `coverage run -m py.test && coverage html`,
the results will be in `cover/` directory.


## Running linters

Linters check your code for common problems. Running them is a good idea before submitting pull requests, to ensure you
don't introduce problems to the codebase.

We use _ESLint_ (for JavaScript parts) and _Prospector_ (for Python) and StyleLint (for SCSS). To use them, run those commands in the Django app
dir:

    # Check Javascript sources with ESLint:
    npm run lint
    # Check SCSS sources with StyleLint:
    npm run stylelint
    # Check Python sources with Prospector:
    prospector


## Drone (project has to be added in Drone)
* Go to Drone: https://drone-inside.thorgate.eu/ and {{ cookiecutter.repo_name }}
* View linting and test results before creating PR.

## Deploys

### Python 2 environment

We use Fabric for deploys, which doesn't support Python 3. Thus you need to create a Python 2 virtualenv.
It needn't be project specific and it's recommended you create one 'standard' Python 2 environment
which can be used for all projects. You will also need to install django and tg-hammer==0.4, our fabric deployment helper.


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
* Install (on the server)
  * PostgreSQL (with postgresql-server-dev-X.Y)
  * python{{cookiecutter.python_version}}, python{{cookiecutter.python_version}}-dev, python-virtualenv, libxml2-dev, libxslt1-dev
  * Node 6.9.x & npm 3.x
  * Nginx
  * git or mercurial
  Also ensure that PostgreSQL allows peer authentication (setup needs to manage the database through the postgres system user).
* Check `fabfile.py` in Django project dir. It has two tasks (functions) - `test` and `live`.
  Ensure that the one you'll use has correct settings (mostly hostname; for production, the number of workers for React
  project is also important).
* Check django settings (`settings/staging.py` and/or `settings/production.py`)
  and Nginx config (`deploy/nginx*.conf`) - ensure that they have proper hostnames etc.
  If you compiled Nginx yourself, it will most likely have installed to `/usr/local/nginx/` instead of `/etc/nginx/`
  and you will have to replace the hardcoded paths in the fabfile, also considering that the `sites-available` and
  `sites-enabled` directories will not have been created and included automatically in the main config.
* If the product uses HTTPS (it should), then you need to manually add key and cert files to `/etc/nginx/certs/`
  and create `/etc/nginx/conf.d/ssl.PROJNAME.include` file, containing their paths.
* Add the server's SSH key (`/root/.ssh/id_rsa.pub`) to the project repo as deployment key.
* Ensure you've committed and pushed all relevant changes.
* Run `fab ENV setup_server` where `ENV` is either `test` or `live`.
  * If it worked, you're all done, congrats!
  * If you got a compiler error while it was installing lxml2, your server probably ran out of memory while compiling.
    In that case, you'll need to either add more RAM or add swap: https://www.digitalocean.com/community/tutorials/how-to-add-swap-on-ubuntu-14-04
  * If something else broke, you might need to either nuke the code dir, database and database user on the server;
    or comment out parts of fabfile (after fixing the problem) to avoid trying to e.g. create database twice. Ouch.
