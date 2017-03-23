"""
Usage:
    fab [target] [action ...]

Use `fab --list` to see available targets and actions.
"""

import re
from StringIO import StringIO
import string
import os

from fabric import colors
from fabric.api import *
from fabric.contrib import files
from fabric.contrib.console import confirm
from fabric.utils import indent

from django.utils.crypto import get_random_string

from hammer import __version__ as hammer_version

# Ensure that we have expected version of the tg-hammer package installed
assert hammer_version.startswith('0.5.'), "tg-hammer 0.5.x is required"

from hammer.service_helpers import install_services_cp, manage_service
from hammer.vcs import Vcs


vcs = Vcs.init(project_root=os.path.dirname(os.path.dirname(__file__)), use_sudo=True)


LOCAL_SETTINGS = """from settings.${target} import *

SECRET_KEY = '${secret_key}'

DATABASES = {
    'default': {
        'ENGINE':'django.db.backends.postgresql_psycopg2',
        'NAME': '{{cookiecutter.repo_name}}',
        'USER': '{{cookiecutter.repo_name}}',
        'PASSWORD': '${db_password}',
        'HOST': '127.0.0.1',
        'PORT': '5432',
    }
}
"""


""" TARGETS """

def defaults():
    # Use  .ssh/config  so that you can use hosts defined there.
    env.use_ssh_config = True
    # Forward ctrl+c to the server, giving the running process there a chance to abort, instead of just aborting Fabric
    #  and cutting the connection.
    env.remote_interrupt = True

    env.confirm_required = True

    env.nginx_conf = 'nginx.conf'
    env.target = 'staging'

    env.service_names = ["gunicorn-{{cookiecutter.repo_name}}"]
    env.code_dir = '/srv/{{cookiecutter.repo_name}}'

    # See https://tg-hammer.readthedocs.io/en/latest/api.html#hammer.service_helpers.DAEMON_TYPES
    env.service_daemon = 'upstart'


@task(alias="staging")
def test():
    """ TARGET: test server (staging)
    """

    defaults()
    env.hosts = ['{{cookiecutter.test_host}}']


@task(alias="production")
def live():
    """ TARGET: live server (production)
    """

    raise NotImplemented('TODO: live host not configured')
    defaults()
    env.nginx_conf = 'nginx_prod.conf'
    env.target = 'production'
    env.hosts = ['{{cookiecutter.live_host}}']


""" ACTIONS """

@task
def show_log(commit_id=None):
    """ List revisions to apply/unapply when updating to given revision.
        When no revision is given, it default to the head of current branch.
        Returns False when there is nothing to apply/unapply. otherwise revset of revisions that will be applied or
        unapplied (this can be passed to `hg|git status` to see which files changed for example).
    """
    result = vcs.deployment_list(commit_id)

    if 'message' in result:
        print(result['message'])
        return False

    current_version = get_current_version_summary()
    print(colors.yellow("Current version: " + current_version))

    if 'forwards' in result:
        print("Revisions to apply:")
        print(indent(result['forwards']))

    elif 'backwards' in result:
        print("Revisions to rollback:")
        print(indent(result['backwards']))

    return result['revset']


@task
def migrate_diff(id=None, revset=None, silent=False):
    """ Check for migrations needed when updating to the given revision. """
    require('code_dir')

    # Exactly one of id and revset must be given
    assert (id or revset) and not (id and revset)

    # no revset given, calculate it by using deployment_list
    if not revset:
        result = vcs.deployment_list(id)

        if 'revset' not in result:
            print(result['message'])
            abort('Nothing to do')

        else:
            revset = result['revset']

    # Pull out migrations
    migrations = vcs.changed_files(revset, "\/(?P<model>\w+)\/migrations\/(?P<migration>.+)")

    if not silent and migrations:
        print "Found %d migrations." % len(migrations)
        print indent(migrations)

    return migrations


@task
def update_requirements(reqs_type='production'):
    """ Install the required packages from the requirements file using pip """
    require('hosts')
    require('code_dir')

    with cd(env.code_dir), prefix('. venv/bin/activate'):
        sudo('pip install -r requirements/%s.txt' % reqs_type)


@task
def migrate(silent=False):
    """ Preform migrations on the database. """

    if not silent:
        request_confirm("migrate")

    management_cmd("migrate --noinput")


@task
def version():
    """ Get current target version hash. """
    require('hosts')
    require('code_dir')

    summary = get_current_version_summary()
    print colors.yellow(summary)


@task
def deploy(id=None, silent=False, force=False, services=False, auto_nginx=True):
    """ Perform an automatic deploy to the target requested. """
    require('hosts')
    require('code_dir')

    if force:
        force = colors.blue('FORCED DEPLOY')

        print '-' * 40
        print force
        print '-' * 40

    # Ask for sudo at the beginning so we don't fail during deployment because of wrong pass
    if not sudo('whoami'):
        abort('Failed to elevate to root')
        return

    # Show log of changes, return if nothing to do
    revset = show_log(id)
    if not revset and not force:
        return

    # See if we have any requirements changes
    requirements_changes = force or vcs.changed_files(revset, r' requirements/')
    if requirements_changes:
        print colors.yellow("Will update requirements (and do migrations)")

    # See if we have package.json changes
    package_changed = force or vcs.changed_files(revset, r' {{ cookiecutter.repo_name }}/package.json')
    if package_changed:
        print colors.yellow("Will run npm install")

    # See if we have changes in app source or static files
    app_patterns = [r' {{ cookiecutter.repo_name }}/app', r' {{ cookiecutter.repo_name }}/static', r' {{ cookiecutter.repo_name }}/settings', r'webpack']
    app_changed = force or package_changed or vcs.changed_files(revset, app_patterns)
    if app_changed:
        print colors.yellow("Will run npm build")

    # See if we have any changes to migrations between the revisions we're applying
    migrations = force or migrate_diff(revset=revset, silent=True)
    if migrations:
        print colors.yellow("Will apply %d migrations:" % len(migrations))
        print indent(migrations)

    # See if we have any changes to crontab config
    crontab_changed = force or vcs.changed_files(revset, r'deploy/crontab.conf')
    if crontab_changed:
        print colors.yellow("Will update cron entries")

    # see if nginx conf has changed
    nginx_changed = vcs.changed_files(revset, [r' deploy/%s' % env.nginx_conf])

    if nginx_changed:
        if auto_nginx:
            print colors.yellow("Nginx configuration change detected, updating automatically")

        else:
            print colors.red("Warning: Nginx configuration change detected, also run: `fab %target% nginx_update`")

    elif force:
        print colors.yellow("Updating nginx config")

    # if services flag is set, let the user know
    if force or services:
        print colors.yellow("Will update service configuration")

    if not silent:
        request_confirm("deploy")

    vcs.update(id)
    if requirements_changes:
        update_requirements()
    if migrations or requirements_changes:
        migrate(silent=True)
    if crontab_changed:
        with cd(env.code_dir):
            sudo('cp deploy/crontab.conf /etc/cron.d/{{cookiecutter.repo_name}}')

    if force or services:
        configure_services()

    if force or (nginx_changed and auto_nginx):
        nginx_update()

    collectstatic(npm_install=package_changed, npm_build=app_changed)

    restart_server(silent=True)

    # Run deploy systemchecks
    check()


@task
def setup_server(id=None):
    """ Perform initial deploy on the target """
    require('hosts')
    require('code_dir')
    require('nginx_conf')

    # Clone code repository
    vcs.clone(id or None)

    # Create virtualenv and install dependencies
    with cd(env.code_dir):
        sudo('make venv')
    update_requirements()

    # Create password for DB, secret key and the local settings
    db_password = generate_password()
    secret_key = generate_password()
    local_settings = string.Template(LOCAL_SETTINGS).substitute(db_password=db_password, secret_key=secret_key, target=env.target)

    # Create database
    sudo('echo "CREATE DATABASE {{cookiecutter.repo_name}}; '
         '      CREATE USER {{cookiecutter.repo_name}} WITH password \'%s\'; '
         '      GRANT ALL PRIVILEGES ON DATABASE {{cookiecutter.repo_name}} to {{cookiecutter.repo_name}};" '
         '| su -c psql postgres' % db_password)

    # Upload local settings
    put(local_path=StringIO(local_settings), remote_path=env.code_dir + '/{{cookiecutter.repo_name}}/settings/local.py', use_sudo=True)

    # Create necessary dirs, with correct permissions
    mkdir_wwwdata('/var/log/{{cookiecutter.repo_name}}/')
    with cd(env.code_dir + '/{{cookiecutter.repo_name}}'), prefix('. ../venv/bin/activate'):
        mkdir_wwwdata('assets/CACHE/')
        mkdir_wwwdata('media/')

    # migrations, collectstatic
    management_cmd('migrate')
    collectstatic()

    # Ensure any and all created log files are owned by the www-data user
    sudo('chown -R www-data:www-data /var/log/{{cookiecutter.repo_name}}/')

    # Copy logrotate and crontab confs
    with cd(env.code_dir):
        sudo('cp deploy/logrotate.conf /etc/logrotate.d/{{cookiecutter.repo_name}}')
        sudo('cp deploy/crontab.conf /etc/cron.d/{{cookiecutter.repo_name}}')

    # Install nginx config
    nginx_update()

    # Install services
    configure_services()

    # (Re)start services
    start_server(silent=True)

    # Run deploy systemchecks
    check()

    # Restart nginx
    manage_service('nginx', 'restart')


@task
def nginx_update():
    """ Updates the nginx configuration files and restarts nginx.
    """

    require('code_dir')
    require('nginx_conf')

    # Update nginx config
    with cd(env.code_dir):
        sudo('cp deploy/%s /etc/nginx/sites-enabled/{{cookiecutter.repo_name}}' % env.nginx_conf)

    # test nginx configuration before restarting it. This catches config problems which might bring down nginx.
    sudo('nginx -t')
    manage_service('nginx', 'restart')


@task
def configure_services():
    """ Updates the services' init files (e.g. for gunicorn)
    """

    require('code_dir')

    # Ensure at-least the default gunicorn.py exists
    with cd(env.code_dir + '/{{ cookiecutter.repo_name }}/settings'):
        if not files.exists('gunicorn.py', use_sudo=True):
            sudo('cp gunicorn.py.example gunicorn.py')

    # Note: DAEMON_TYPE AND DAEMON_FILE_EXTENSION are replaced by hammer automatically
    source_dir = os.path.join(
        env.code_dir,
        'deploy',
        '${DAEMON_TYPE}',
        '${SERVICE_NAME}.${DAEMON_FILE_EXTENSION}',
    )

    # Install the services using hammer
    install_services_cp([
        ('gunicorn-{{cookiecutter.repo_name}}', source_dir.replace('${SERVICE_NAME}', 'gunicorn')),
    ])


""" SERVER COMMANDS """


@task
def stop_server(silent=False):
    """ Stops all services
    """

    if not silent:
        request_confirm("stop_server")

    require('code_dir')

    manage_service(get_service_names(), "stop")


@task
def start_server(silent=False):
    """ Starts all services
    """

    if not silent:
        request_confirm("start_server")

    require('code_dir')

    manage_service(get_service_names(), "start")


@task
def restart_server(silent=False):
    """ Restarts all services
    """

    if not silent:
        request_confirm("restart_server")

    require('code_dir')

    manage_service(get_service_names(), "restart")


@task
def management_cmd(cmd):
    """ Perform a management command on the target. """

    require('hosts')
    require('code_dir')

    sudo("cd %s ;"
         ". ./venv/bin/activate ; "
         "cd {{cookiecutter.repo_name}} ; "
         "python manage.py %s" % (env.code_dir, cmd))


@task
def check():
    """ Perform Django's deploy systemchecks. """
    require('hosts')
    require('code_dir')

    management_cmd('check --deploy')


@task
def createsuperuser():
    """ Creates new superuser in Django. """
    require('hosts')
    require('code_dir')

    management_cmd('createsuperuser')


""" HELPERS """

def repo_type():
    require('code_dir')

    try:
        print("Current project is using: `%s`" % colors.green(vcs.NAME))

    except EnvironmentError:
        print("Current project is using: `%s`" % colors.red('NO VCS'))


def collectstatic(npm_install=True, npm_build=True):
    with cd(env.code_dir + '/{{cookiecutter.repo_name}}'):
        if npm_install:
            node_cmd('npm install --unsafe-perm --production')

        if npm_build:
            node_cmd('npm run build')

    management_cmd('collectstatic --noinput --ignore styles-src')


def node_cmd(command):
    # Runs node/npm command using correct version of Node.js
    node_version = '6.9.4'
    # Figure out where our desired versions of node and npm are installed
    node_bin = sudo('n bin %s' % node_version).strip()
    node_bin_dir = os.path.dirname(node_bin)

    sudo(". ../venv/bin/activate ; export PATH=%s:$PATH; %s" % (node_bin_dir, command))


def mkdir_wwwdata(path):
    # Creates directory and makes www-data its owner
    sudo('mkdir -p ' + path)
    sudo('chown www-data:www-data ' + path)


def request_confirm(action):
    require('confirm_required')

    if env.confirm_required:
        if not confirm("Are you sure you want to run task: %s on servers %s?" % (action, env.hosts)):
            abort('Deployment aborted.')


def generate_password(length=50):
    # Similar to Django's charset but avoids $ to avoid accidential shell variable expansion
    chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#%^&*(-_=+)'
    return get_random_string(length, chars)


def get_service_names(predicate=None):
    """Get service names for the project

    :param predicate: Predicate to use for filtering: ``fn(service_name) -> bool``
    :type predicate: NoneType | callable
    :return:
    """
    require('service_names')

    result = env.service_names

    if predicate:
        return filter(predicate, result)

    return result


def get_current_version_summary():
    commit_id, branch, message, author = vcs.version()
    return "%s [%s]: %s - %s" % (commit_id, branch, message, author)
