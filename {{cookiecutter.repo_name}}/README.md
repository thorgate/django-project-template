# README for {{cookiecutter.project_title}}

TODO: verify that the following info is correct:

 - Python:  3.4
 - DB:      PostgreSQL (locally SQLite){% if cookiecutter.is_react_project == 'y' %}
 - Node:    0.12.0+
 - React:   0.13.3
{% endif %}

## Setting up development

**Create PyCharm project dir** (if you are using PyCharm)

    make

**Create virtualenv**

    virtualenv --python=python3.4 venv
    . ./venv/bin/activate

or if you use virtualenvwrapper

    mkvirtualenv {{ cookiecutter.repo_name }}
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

{% if cookiecutter.is_react_project == 'y' %}
**Ensure you have node>=0.12.0**

Installation instructions are available here: https://nodesource.com/blog/nodejs-v012-iojs-and-the-nodesource-linux-repositories

**Install WebApp dependencies**

    npm install --python=python2.7

**Run development servers**

**Note:** Virtualenv must be activated for the following commands to work

Run django server: `python manage.py runserver`

Run development asset server: `npm run dev`

**Note:** Server will run at 127.0.0.1:8000 (localhost wont work because of CORS)

**Install Alt devtool**

See: `https://github.com/goatslacker/alt-devtool`

**Using nginx locally**

If you prefer to use nginx in local development, please make sure to add 
the following line into your settings/local.py:

    EXPRESS_PORT = '/tmp/express_{{ cookiecutter.repo_name }}.sock'

**Note:** You also need to explicitly set SITE_URL to your local url or you will run into CORS issues.
{% endif %}

## Running tests

Use `py.test` for running tests. It's configured to run the entire test-suite of the project by default.

    py.test

You can also use `--reuse-db` or `--nomigrations` flags to speed things up a bit. See also:
https://pytest-django.readthedocs.org/en/latest/index.html

### Coverage

You can also calculate tests coverage with `coverage run -m py.test && coverage html`,
the results will be in `cover/` directory.

{% if cookiecutter.is_react_project == 'y' %}

## Images

To render an inline img from react views, do this:

```
// Top of the view file
import imgResolver from '../utils/img-resolver';

// when rendering your image call imgResolver on the path
<img src={imgResolver("path/to/image")} />
```

**Always use `imgResolver` as the imported function name**

**`imgResolver` is a reserved name and should not be defined for other usage**

### Why?

To ensure webpack picks up inline images when compiling they need to go through a require call.

Since you can't require images directly on node, and we want our serverside
rendering to return correct public paths instead of filesystem paths, we need to 
run all calls through a function that maps the fs paths to public urls.

Cause webpack wont allow us to do conditional requires(and will scream at us if we do) without 
writing very verbose code, we added a transpile step which replaces all calls to imgResolver 
with calls to require when building the browser package. 

With this, we improve DX and can still get all the caching/ versioning working.


## Deploys

### Python 2 environment

We use Fabric for deploys, which doesn't support Python 3. Thus you need to create a Python 2 virtualenv.
It needn't be project specific and it's recommended you create one 'standard' Python 2 environment 
which can be used for all projects.


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
  Ensure that the one you'll use has correct settings (mostly hostname; for production, the number of workers for React 
  project is also important).
* Check django settings (`settings/staging.py` and/or `settings/production.py`) 
  and Nginx config (`deploy/nginx*.conf`) - ensure that they have proper hostnames etc.
* If the product uses HTTPS (it should), then you need to manually add key and cert files to `/etc/nginx/certs/` 
  and create `/etc/nginx/conf.d/ssl.PROJNAME.include` file, containing their paths.
* Add the server's SSH key (`/root/.ssh/id_rsa.pub`) to the project repo as deployment key.
* Ensure you've committed and pushed all relevant changes.
* Run `fab ENV setup_server` where `ENV` is either `test` or `live`.
  * If it worked, you're all done, congrats!
  * If something broke, you might need to either nuke the code dir, database and database user on the server; 
    or comment out parts of fabfile (after fixing the problem) to avoid trying to e.g. create database twice. Ouch.


## Reasoning/About

Note: Also read the Flux part of the following article http://www.toptal.com/react/navigating-the-react-ecosystem#find-excellent-architects

### Why express?

Since writing an extra compatibility layer for django to serve the 
react-router routes would add too much overhead and would be hard
to maintain we decided to switch to nodejs(currently express) based
ui server and use django for only the api and admin site.

This solution also means we can take advantage of AltIso holy-grail
of serverside rendering. Which in turn keeps our data fetching 
DRY(we don't need to write separate data fetching for client/server)

### Why webpack?

**Cause it's awesome!**

For real, it allows us to do awesome stuff for both production and local development.

**Constants**

We can bake constants like api urls, site root, static paths directly into our javascript.
Just add a processor into WEBPACK_CONSTANT_PROCESSORS in settings and webpack automatically
bakes the constants in.

**Local development**

In local development we have live-reload for client-side (JS/CSS) 
and automatic reload for the server. Sourcemaps are enabled so one
can easily debug their problems.

**Production**

In production we have separated vendor and local chunks for both js and css with long-term cache enabled,
this means continuous updates are loaded fast for the users since vendor chunks usually don't change.

We also use Dedupe and UglifyJs plugins which also remove dead code. For example, in react there are checks
for process being production around debugging code. E.g:

 `if (process.env.NODE_ENV === 'production') { console.warn('some warning'); }`

After webpack bakes constants in(production mode) the line becomes:

 `if (false) { console.warn('some warning'); }`

And after UglifyJs plugin the line is removed from the output

### Why alt?

 - Isomorphism out of the box
 - Can do relay-like component level data fetching with same logic in the client and server
 - Less boilerplate than other flux libaries
 - Used in production (and maintained by) by airbnb
 - Logical data fetching setup
 - Active development

Note: We currently use a fork of alt until patches for issues #334, #354 and #348 get merged into master and released{% else %}

This project includes Bower integration.
To install existing dependencies, run `bower install` in the inner project dir (where manage.py is).
To add a dependency, run `bower install <package-name> --save`.
Deploying with Fabric will ensure that all Bower dependencies are also installed in the server.
If you don't have Bower installed, you can get it by running `npm install -g bower`.{% endif %}
