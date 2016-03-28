import re
from StringIO import StringIO
import string{% if cookiecutter.is_react_project == 'y' %}
import time{% endif %}
import os

from fabric import colors
from fabric.api import *
from fabric.contrib.console import confirm
from fabric.utils import indent

from django.utils.crypto import get_random_string

from hammer import __version__ as hammer_version
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

# Ensure that we have expected version of the tg-hammer package installed
assert hammer_version == '0.0.5', "tg-hammer==0.0.5 is required"
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
{% if cookiecutter.is_react_project == 'y' %}
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
    env.venv_name = 'venv'
    env.confirm_required = True
    env.code_dir = '/'

    env.nginx_conf = 'nginx.conf'
    env.target = 'staging'

    env.service_name = ["gunicorn-{{cookiecutter.repo_name}}"]
    env.code_dir = '/srv/{{cookiecutter.repo_name}}'{% if cookiecutter.is_react_project == 'y' %}
    env.node_workers = 2{% endif %}

@task
def test():
    defaults()
    env.hosts = ['{{cookiecutter.test_host}}']

@task
def live():
    raise NotImplemented('TODO: live host not configured')
    defaults()
    env.nginx_conf = 'nginx_prod.conf'
    env.target = 'production'
    env.hosts = ['{{cookiecutter.live_host}}']{% if cookiecutter.is_react_project == 'y' %}
    env.node_workers = 4{% endif %}


@task
def staging():
    return test()

@task
def production():
    return live()


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
    require('tag')

    print colors.yellow(vcs.version())


@task
def deploy(id=None, silent=False, force=False):
    """ Perform an automatic deploy to the target requested. """
    require('hosts')
    require('code_dir')

    # Ask for sudo at the begginning so we don't fail during deployment because of wrong pass
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
        print colors.yellow("Will update requirements (and do migrations):")
        print indent(requirements_changes){% if cookiecutter.is_react_project == 'y' %}

    # See if we have package.json changes
    package_changed = force or vcs.changed_files(revset, r' {{ cookiecutter.repo_name }}/package.json')
    if package_changed:
        print colors.yellow("Will run npm install:")
        print indent(package_changed)

    # See if we have changes in app source or static files
    app_changed = force or vcs.changed_files(revset, [r' {{ cookiecutter.repo_name }}/app', r' {{ cookiecutter.repo_name }}/static', r' {{ cookiecutter.repo_name }}/settings', r'webpack'])
    if app_changed:
        print colors.yellow("Will run npm build:")
        print indent(app_changed[:10])

        if len(app_changed) > 10:
            print indent('    ... more ...'){% endif %}

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
    if vcs.changed_files(revset, r' deploy/%s' % env.nginx_conf):
        print colors.red("Warning: Nginx configuration change detected, also run: `fab %target% nginx_update`")

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

    collectstatic({% if cookiecutter.is_react_project == 'y' %}npm_install=package_changed, npm_build=app_changed{% endif %})

    {% if cookiecutter.is_react_project == 'y' %}reload_server{% else %}restart_server{% endif %}(silent=True)

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
def setup_server():
    require('hosts')
    require('code_dir')
    require('nginx_conf')

    # Clone code repository
    vcs.clone()

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
        sudo('virtualenv -p python3.4 venv')
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

    # Copy logrotate, nginx, crontab and gunicorn confs
    with cd(env.code_dir):
        sudo('cp deploy/logrotate.conf /etc/logrotate.d/{{cookiecutter.repo_name}}')
        sudo('cp deploy/%s /etc/nginx/sites-enabled/{{cookiecutter.repo_name}}' % env.nginx_conf)
        sudo('cp deploy/gunicorn.conf /etc/init/gunicorn-{{cookiecutter.repo_name}}.conf')
        sudo('cp deploy/crontab.conf /etc/cron.d/{{cookiecutter.repo_name}}')
    {% if cookiecutter.is_react_project == 'y' %}
    update_worker_conf(){% endif %}

    # (Re)start services
    start_server(silent=True)

    # Run deploy systemchecks
    check()

    # Restart nginx
    sudo('service nginx restart')


@task
def nginx_update():
    require('code_dir')
    require('nginx_conf')

    # Update nginx config
    with cd(env.code_dir):
        sudo('cp deploy/%s /etc/nginx/sites-enabled/{{cookiecutter.repo_name}}' % env.nginx_conf)

    sudo('service nginx restart'){% if cookiecutter.is_react_project == 'y' %}


@task
def update_worker_conf():
    require('node_workers')

    # Copy worker conf
    for n in range(0, env.node_workers):
        worker_conf = string.Template(WORKER_INIT).substitute(index=n)

        target_name = '{{cookiecutter.repo_name}}-express-%d' % n
        target_dir = '/etc/init'
        file_name = '%s.conf'

        put(local_path=StringIO(worker_conf), remote_path='%s/%s' % (target_dir, file_name % target_name), use_sudo=True){% endif %}


""" SERVER COMMANDS """


@task
def stop_server(silent=False):
    if not silent:
        request_confirm("stop_server")

    require('service_name')
    require('code_dir')

    service(env.service_name, "stop"){% if cookiecutter.is_react_project == 'y' %}
    service(['{{cookiecutter.repo_name}}-express-%d' % n for n in range(0, env.node_workers)], "stop"){% endif %}


@task
def start_server(silent=False):
    if not silent:
        request_confirm("start_server")

    require('service_name')
    require('code_dir')
    service(env.service_name, "start"){% if cookiecutter.is_react_project == 'y' %}
    service(['{{cookiecutter.repo_name}}-express-%d' % n for n in range(0, env.node_workers)], "start"){% endif %}


@task
def restart_server(silent=False):
    if not silent:
        request_confirm("restart_server")

    require('service_name')
    require('code_dir')
    service(env.service_name, "restart"){% if cookiecutter.is_react_project == 'y' %}
    service(['{{cookiecutter.repo_name}}-express-%d' % n for n in range(0, env.node_workers)], "restart")


@task
def reload_server(silent=False):
    """ Restarts backend and then restarts frontend servers one-by-one
    """

    if not silent:
        request_confirm("reload_server")

    require('service_name')
    require('code_dir')

    service(env.service_name, "restart")

    for n in range(0, env.node_workers):
        s_name = '{{cookiecutter.repo_name}}-express-%d' % n
        service(s_name, "restart")

        # sleep 3s before restarting the next one
        time.sleep(3){% endif %}


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


def service(names, cmd):
    if not isinstance(names, (list, tuple)):
        names = [names, ]

    for name in names:
        full_cmd = "service %s %s" % (name, cmd)

        try:
            sudo(full_cmd, warn_only=True)

        except Exception as e:
            print('Failed: %s', full_cmd)
            print(e)


@task
def repo_type():
    require('code_dir')

    try:
        print("Current project is using: `%s`" % colors.green(vcs.NAME))

    except EnvironmentError:
        print("Current project is using: `%s`" % colors.red('NO VCS'))


def collectstatic({% if cookiecutter.is_react_project == 'y' %}npm_install=True, npm_build=True{% endif %}):
    with cd(env.code_dir{% if cookiecutter.is_react_project != 'y' %} + '/{{cookiecutter.repo_name}}'{% endif %}):
        {% if cookiecutter.is_react_project == 'y' %}if npm_install:
            sudo("cd %s ;"
                 ". ./venv/bin/activate ; "
                 "cd {{cookiecutter.repo_name}} ; "
                 "npm install --unsafe-perm" % env.code_dir)

            sudo("cd %s ;"
                 ". ./venv/bin/activate ; "
                 "cd {{cookiecutter.repo_name}} ; " % env.code_dir)

        if npm_build:
            sudo("cd %s ;"
                 ". ./venv/bin/activate ; "
                 "cd {{cookiecutter.repo_name}} ; "
                 "npm run build" % env.code_dir){% else %}sudo('bower install --production --allow-root'){% endif %}

    management_cmd('collectstatic --noinput')


def mkdir_wwwdata(path):
    # Creates directory and makes www-data its owner
    sudo('mkdir -p ' + path)
    sudo('chown www-data:www-data ' + path)


def request_confirm(tag):
    require('confirm_required')

    if env.confirm_required:
        if not confirm("Are you sure you want to run task: %s on servers %s?" % (tag, env.hosts)):
            abort('Deployment aborted.')


def generate_password(length=50):
    # Similar to Django's charset but avoids $ to avoid accidential shell variable expansion
    chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#%^&*(-_=+)'
    return get_random_string(length, chars)
