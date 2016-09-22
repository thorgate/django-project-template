import re
from StringIO import StringIO
import string{% if cookiecutter.project_type == 'spa' %}
import time{% endif %}
import os

from fabric import colors
from fabric.api import *
from fabric.contrib import files
from fabric.contrib.console import confirm
from fabric.utils import indent

from django.utils.crypto import get_random_string

from hammer import __version__ as hammer_version

# Ensure that we have expected version of the tg-hammer package installed
assert hammer_version.startswith('0.2.'), "tg-hammer 0.2 is required"

from hammer.service_helpers import {% if cookiecutter.project_type == 'spa' %}install_services, {% endif %}install_services_cp, manage_service
from hammer.vcs import Vcs

"""
    Usage:
        fab TARGET actions

    Actions:
        simple_deploy # Deploy updates without migrations.
            :arg id Identifier to pass to vcs update command.
            :arg silent If true doesn't show confirms.

        offline_deploy # Deploy updates with migrations with server restart.
            :arg id Identifier to pass to vcs update command.
            :arg silent If true doesn't show confirms.

        online_deploy # Deploy updates with migrations without server restart.
            :arg id Identifier to pass to vcs update command.
            :arg silent If true doesn't show confirms.

        version # Get the version deployed to target.
        update_requirements # Perform pip install -r requirements/production.txt

        stop_server # Stop the remote server service.
        start_server # Start the remote server service.
        restart_server # Restart the remote server service.

        migrate_diff # Get the status of migrations needed when upgrading target to the specified version.
            :arg id Identifier of revision to check against.
"""

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
{% if cookiecutter.project_type == 'spa' %}
WORKER_INIT = """description "{{cookiecutter.repo_name}}-express-${index}"

start on (filesystem)
stop on runlevel [016]

respawn
console log
setuid www-data
setgid www-data
chdir /srv/{{cookiecutter.repo_name}}/{{cookiecutter.repo_name}}

env LANG=en_US.UTF-8
exec node --harmony {{ cookiecutter.repo_name }}-server.js ${index}
"""{% endif %}


""" TARGETS """


# Use  .ssh/config  so that you can use hosts defined there.
env.use_ssh_config = True


def defaults():
    env.confirm_required = True
    env.code_dir = '/'

    env.nginx_conf = 'nginx.conf'
    env.target = 'staging'

    env.service_names = ["gunicorn-{{cookiecutter.repo_name}}"]
    env.code_dir = '/srv/{{cookiecutter.repo_name}}'{% if cookiecutter.project_type == 'spa' %}
    env.node_workers = 2{% endif %}

    # See https://tg-hammer.readthedocs.io/en/latest/api.html#hammer.service_helpers.DAEMON_TYPES
    env.service_daemon = 'upstart'


@task(alias="staging")
def test():
    defaults()
    env.hosts = ['{{cookiecutter.test_host}}']


@task(alias="production")
def live():
    raise NotImplemented('TODO: live host not configured')
    defaults()
    env.nginx_conf = 'nginx_prod.conf'
    env.target = 'production'
    env.hosts = ['{{cookiecutter.live_host}}']{% if cookiecutter.project_type == 'spa' %}
    env.node_workers = 4{% endif %}


""" FUNCTIONS """


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

    elif 'forwards' in result:
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

    commit_id, branch, message, author = vcs.version()
    summary = "%s [%s]: %s - %s" % (commit_id, branch, message, author)
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
    app_changed = force or vcs.changed_files(revset, [r' {{ cookiecutter.repo_name }}/app', r' {{ cookiecutter.repo_name }}/static', r' {{ cookiecutter.repo_name }}/settings', r'webpack'])
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
        configure_services(){% if cookiecutter.project_type == 'spa' %}
        update_worker_conf(){% endif %}

    if force or (nginx_changed and auto_nginx):
        nginx_update()

    collectstatic(npm_install=package_changed, npm_build=app_changed)

    {% if cookiecutter.project_type == 'spa' %}reload_server{% else %}restart_server{% endif %}(silent=True)

    # Run deploy systemchecks
    check()


@task
def simple_deploy(id=None, silent=False):
    """ Perform a simple deploy to the target requested. """
    require('hosts')
    require('code_dir')

    # Show log of changes, return if nothing to do
    revset = show_log(id)
    if not revset:
        return

    migrations = migrate_diff(revset=revset, silent=True)
    if migrations:
        msg = "Found %d migrations; are you sure you want to continue with simple deploy?" % len(migrations)
        if not confirm(colors.yellow(msg), False):
            abort('Deployment aborted.')

    if not silent:
        request_confirm("simple_deploy")

    vcs.update(id)
    collectstatic()
    restart_server(silent=True)


@task
def online_deploy(id=None, silent=False):
    """ Perform an online deploy to the target requested. """
    require('hosts')
    require('code_dir')

    # Show log of changes, return if nothing to do
    revset = show_log(id)
    if not revset:
        return

    migrations = migrate_diff(revset=revset, silent=True)
    if migrations:
        print colors.yellow("Will apply %d migrations:" % len(migrations))
        print indent(migrations)

    if not silent:
        request_confirm("online_deploy")

    vcs.update(id)
    migrate(silent=True)
    collectstatic()
    restart_server(silent=True)


@task
def offline_deploy(id=None, silent=False):
    """ Perform an offline deploy to the target requested. """
    require('hosts')
    require('code_dir')

    # Show log of changes, return if nothing to do
    revset = show_log(id)
    if not revset:
        return

    migrations = migrate_diff(revset=revset, silent=True)
    if migrations:
        print colors.yellow("Will apply %d migrations:" % len(migrations))
        print indent(migrations)

    if not silent:
        request_confirm("offline_deploy")

    stop_server(silent=True)
    vcs.update(id)
    migrate(silent=True)
    collectstatic()
    start_server(silent=True)


@task
def setup_server(id=None):
    """ Perform initial deploy on the target """
    require('hosts')
    require('code_dir')
    require('nginx_conf')

    # Clone code repository
    vcs.clone(id or None)

    # Create password for DB, secret key and the local settings
    db_password = generate_password()
    secret_key = generate_password()
    local_settings = string.Template(LOCAL_SETTINGS).substitute(db_password=db_password, secret_key=secret_key, target=env.target)

    # Create database
    sudo('echo "CREATE DATABASE {{cookiecutter.repo_name}}; '
         '      CREATE USER {{cookiecutter.repo_name}} WITH password \'%s\'; '
         '      GRANT ALL PRIVILEGES ON DATABASE {{cookiecutter.repo_name}} to {{cookiecutter.repo_name}};" '
         '| su -c psql postgres' % db_password)

    # Create virtualenv and install dependencies
    with cd(env.code_dir):
        sudo('make venv')
    update_requirements()

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
    require('code_dir')
    require('nginx_conf')

    # Update nginx config
    with cd(env.code_dir):
        sudo('cp deploy/%s /etc/nginx/sites-enabled/{{cookiecutter.repo_name}}' % env.nginx_conf)

    manage_service('nginx', 'restart')


@task
def configure_services():
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
    ]){% if cookiecutter.project_type == 'spa' %}
    update_worker_conf()


@task
def update_worker_conf():
    require('node_workers')

    def make_worker_tuple(n):
        return (
            '{{cookiecutter.repo_name}}-express-%d' % n,
            string.Template(WORKER_INIT).substitute(index=n),
        )

    # Copy node workers init scripts
    install_services([make_worker_tuple(n) for n in range(0, env.node_workers)]){% endif %}


""" SERVER COMMANDS """


@task
def stop_server(silent=False):
    if not silent:
        request_confirm("stop_server")

    require('code_dir')

    manage_service(get_service_names(), "stop")


@task
def start_server(silent=False):
    if not silent:
        request_confirm("start_server")

    require('code_dir')

    manage_service(get_service_names(), "start")


@task
def restart_server(silent=False):
    if not silent:
        request_confirm("restart_server")

    require('code_dir')

    manage_service(get_service_names(), "restart")


{%- if cookiecutter.project_type == 'spa' %}


@task
def reload_server(silent=False):
    """ Restarts frontend servers one-by-one and then restarts the backend
    """
    if not silent:
        request_confirm("reload_server")

    require('code_dir')

    for s_name in get_service_names(lambda name: name.startswith('{{cookiecutter.repo_name}}-express-')):
        manage_service(s_name, "restart")

        # sleep 3s before restarting the next one
        time.sleep(3)

    manage_service(get_service_names(lambda name: not name.startswith('{{cookiecutter.repo_name}}-express-')), "restart")
{%- endif %}


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


@task
def repo_type():
    require('code_dir')

    try:
        print("Current project is using: `%s`" % colors.green(vcs.NAME))

    except EnvironmentError:
        print("Current project is using: `%s`" % colors.red('NO VCS'))


def collectstatic(npm_install=True, npm_build=True):
    with cd(env.code_dir + '/{{cookiecutter.repo_name}}'):
        if npm_install:
            sudo(". ../venv/bin/activate ; "
                 "npm install --unsafe-perm --production")

        if npm_build:
            sudo(". ../venv/bin/activate ; "
                 "npm run build")

    management_cmd('collectstatic --noinput --ignore styles-src')


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

    result = env.service_names{%- if cookiecutter.project_type == 'spa' %} + ['{{cookiecutter.repo_name}}-express-%d' % n for n in range(0, env.node_workers)]{% endif %}

    if predicate:
        return filter(predicate, result)

    return result
