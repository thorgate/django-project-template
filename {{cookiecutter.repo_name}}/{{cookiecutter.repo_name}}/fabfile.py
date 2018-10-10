"""
Usage:
    fab [target] [action ...]

Use `fab --list` to see available targets and actions.
"""

import ConfigParser
import string
import os

from StringIO import StringIO
from distutils.version import LooseVersion

from fabric import colors
from fabric.api import *
from fabric.contrib.console import confirm
from fabric.utils import indent

from django.utils.crypto import get_random_string

from hammer import __version__ as hammer_version

# Ensure that we have expected version of the tg-hammer package installed
assert LooseVersion(hammer_version) >= LooseVersion('0.6'), "tg-hammer 0.6.x is required"

from hammer.vcs import Vcs
from hammer.docker_network import create_docker_network


vcs = Vcs.init(project_root=os.path.dirname(os.path.dirname(__file__)), use_sudo=True)


LOCAL_SETTINGS = """from settings.${target} import *

SECRET_KEY = '${secret_key}'

DATABASES = {
    'default': {
        'ENGINE':'django.db.backends.postgresql_psycopg2',
        'NAME': '{{cookiecutter.repo_name}}',
        'USER': '{{cookiecutter.repo_name}}',
        'PASSWORD': '${db_password}',
        'HOST': 'postgres',
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

    env.target = 'staging'

    env.code_dir = '/srv/{{cookiecutter.repo_name}}'

    # Mapping of configuration files and their rules
    #
    #  "Directory name inside deploy/": [
    #      {
    #          "pattern": "filename to search for (replacements: target[env.target])",
    #          "filename": "filename used in remote machine (replacements: target[env.target])",
    #          "remote_path": "path on the remote machine where the file/files must be uploaded to (replacements: filename, target)",
    #      },
    #      ...
    #  ]
    #
    env.deployment_configurations = {
        "letsencrypt": [
            {
                "pattern": "%(target)s.conf",
                "filename": "letsencrypt.{{cookiecutter.repo_name}}.conf",
                "remote_path": "/etc/letsencrypt/configs/%(filename)s"
            }
        ],
        "nginx": [
            {
                "pattern": "common.include",
                "filename": "app.{{cookiecutter.repo_name}}.include",
                "remote_path": "/etc/nginx/conf.d/%(filename)s"
            },
            {
                "pattern": "app.{{cookiecutter.repo_name}}.proxy_django.include",
                "filename": "app.{{cookiecutter.repo_name}}.proxy_django.include",
                "remote_path": "/etc/nginx/conf.d/%(filename)s"
            },
            {
                "pattern": "%(target)s.ssl",
                "filename": "ssl.{{cookiecutter.repo_name}}.include",
                "remote_path": "/etc/nginx/conf.d/%(filename)s"
            },
            {
                "default_site": True,
                "pattern": "%(target)s.conf",
                "filename": "{{cookiecutter.repo_name}}",
                "remote_path": "/etc/nginx/sites-enabled/%(filename)s"
            }
        ]
    }


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

    {%- if 'todo' in cookiecutter.live_hostname|lower %}

    raise NotImplemented('TODO: live host not configured')
    {%- endif %}

    defaults()
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
def deploy(id=None, silent=False, force=False, auto_nginx=True):
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

    # See if we have changes in app source or static files
    app_patterns = [r' {{cookiecutter.repo_name}}/app', r' {{cookiecutter.repo_name}}/static',
                    r' {{cookiecutter.repo_name}}/settings', r' {{cookiecutter.repo_name}}/package.json']
    app_changed = force or vcs.changed_files(revset, app_patterns)
    if app_changed:
        print colors.yellow("Will run npm build")

    # See if we have any changes to migrations between the revisions we're applying
    migrations = force or migrate_diff(revset=revset, silent=True)
    if migrations:
        print colors.yellow("Will apply %d migrations:" % len(migrations))
        print indent(migrations)

    # See if we have any changes to letsencrypt configurations
    letsencrypt_changed = force or vcs.changed_files(revset, get_config_modified_patterns('letsencrypt'))
    if letsencrypt_changed:
        print colors.yellow("Will update letsencrypt configurations")

    # see if nginx conf has changed
    nginx_changed = vcs.changed_files(revset, get_config_modified_patterns('nginx'))

    if nginx_changed:
        if auto_nginx:
            print colors.yellow("Nginx configuration change detected, updating automatically")

        else:
            print colors.red("Warning: Nginx configuration change detected, also run: `fab %target% nginx_update`")

    elif force:
        print colors.yellow("Updating nginx config")

    if not silent:
        request_confirm("deploy")

    vcs.update(id)

    ensure_docker_networks()
    docker_compose('build')

    collectstatic(npm_build=app_changed)

    if migrations or requirements_changes:
        migrate(silent=True)

    # Run deploy systemchecks
    check()

    docker_up(silent=True)

    # Update nginx after bringing up container
    if force or (nginx_changed and auto_nginx):
        nginx_update()

    if force or letsencrypt_changed:
        letsencrypt_update()


@task
def setup_server(id=None):
    """ Perform initial deploy on the target """
    require('hosts')
    require('code_dir')

    # Clone code repository
    vcs.clone(id or None)

    # Create password for DB, secret key and the local settings
    db_password = generate_password()
    secret_key = generate_password()
    local_settings = string.Template(LOCAL_SETTINGS).substitute(db_password=db_password, secret_key=secret_key, target=env.target)

    # Create database
    sudo('echo "CREATE DATABASE {{cookiecutter.repo_name}}; '
         '      CREATE USER {{cookiecutter.repo_name}} WITH password \'{db_password}\'; '
         '      GRANT ALL PRIVILEGES ON DATABASE {{cookiecutter.repo_name}} to {{cookiecutter.repo_name}};" '
         '| docker exec -i postgres-10 psql -U postgres'.format(db_password=db_password))

    # Upload local settings
    put(local_path=StringIO(local_settings), remote_path=env.code_dir + '/{{cookiecutter.repo_name}}/settings/local.py', use_sudo=True)

    # Create log dir
    sudo('mkdir -p /var/log/{{cookiecutter.repo_name}}/')

    # webpack-stats.json must exist before the Django container is run. Otherwise docker-compose assumes it to be a
    #  directory (because it's a volume).
    sudo('touch %s/{{cookiecutter.repo_name}}/app/webpack-stats.json' % env.code_dir)

    ensure_docker_networks()

    docker_compose('build')

    # migrations, collectstatic
    migrate(silent=True)
    collectstatic()

    # Copy logrotate conf
    with cd(env.code_dir):
        sudo('cp deploy/logrotate.conf /etc/logrotate.d/{{cookiecutter.repo_name}}')

    # (Re)start services
    docker_up(silent=True)

    # Run deploy systemchecks
    check()

    # Configure letsencrypt
    letsencrypt_configure(reconfigure_nginx=False)

    # Install nginx config
    nginx_update()


@task
def nginx_update():
    """ Updates the nginx configuration files and restarts nginx.
    """
    update_config_files('nginx')

    # test nginx configuration before restarting it. This catches config problems which might bring down nginx.
    sudo('docker exec nginx nginx -t')
    sudo('docker exec nginx nginx -s reload')


@task
def letsencrypt_configure(reconfigure_nginx=True):
    require('code_dir')

    domains = set()

    # Collect all the domains that need a certificate
    with cd(env.code_dir):
        # construct a configparser object
        config = ConfigParser.ConfigParser()

        for filename in get_config_repo_paths('letsencrypt'):
            buf = StringIO()

            # Add the actual config file data to the buffer
            get(filename, buf)

            # Here we prepend a section header to the in-memory buffer. This
            #  allows us to easily read the letsencrypt config file using stdlib configparser
            #
            # see: http://stackoverflow.com/questions/2819696/parsing-properties-file-in-python/25493615#25493615
            buf = StringIO('[DEFAULT]\n' + buf.getvalue())

            # read config from buf
            config.readfp(buf)

            # get domains from the config file
            for domain in config.get('DEFAULT', 'domains').split(','):
                domains.add(domain.strip())

    # Create a temporary nginx config file
    temporary_nginx_conf = """
        server {
            listen 80;
            server_name %(domains)s;
            location /.well-known/acme-challenge/ {
                root /etc/letsencrypt/www;
                break;
            }
        }
    """ % {
        "domains": " ".join(domains),
    }

    # Notify the user that the dns MUST be configured for all the domains as of this point
    print(" ")
    print(colors.blue('Preparing to request certificate using letsencrypt. The DNS for '
                      'following domains MUST be configured to point to the remote host: %s' % " ".join(domains)))

    if not confirm(colors.yellow("Is the dns configured? (see above)")):
        abort('Deployment aborted.')

    # Upload it to the app nginx config path
    put(local_path=StringIO(temporary_nginx_conf), remote_path=get_nginx_app_target_path(), use_sudo=True)

    # Reload nginx
    sudo('docker exec nginx nginx -s reload')

    # use letsencrypt_update to obtain the certificate
    letsencrypt_update(dry_run=True)

    # restore nginx config if requested
    if reconfigure_nginx:
        nginx_update()


@task
def letsencrypt_update(dry_run=False):
    require('code_dir')

    updated_files = update_config_files('letsencrypt')

    for target_path in updated_files:
        # verify everything works using --dry-run
        if dry_run:
            sudo("certbot-auto certonly --dry-run --noninteractive --agree-tos -c %s" % target_path)

        # Aquire the certificate
        sudo("certbot-auto certonly --noninteractive --agree-tos -c %s" % target_path)

    # Reload nginx
    sudo('docker exec nginx nginx -s reload')


""" SERVER COMMANDS """

@task
def docker_down(silent=False):
    """ Stops all services
    """

    if not silent:
        request_confirm("docker_down")

    docker_compose('down')


@task
def docker_up(silent=False):
    """ Starts all services
    """

    if not silent:
        request_confirm("docker_up")

    docker_compose('up -d --remove-orphans')

    # This is necessary to make nginx refresh IP addresses of containers.
    sudo('docker exec nginx nginx -s reload')


@task
def docker_restart(silent=False):
    # Stops and then starts all services
    docker_down(silent=silent)
    docker_up(silent=silent)


@task
def management_cmd(cmd):
    """ Perform a management command on the target. """

    docker_compose_run('django', 'python manage.py ' + cmd)


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


def collectstatic(npm_build=True):
    if npm_build:
        docker_compose_run('node', 'npm run build', name='{{cookiecutter.repo_name}}_npm_build')

    management_cmd('collectstatic --noinput --ignore styles-src')


def request_confirm(action):
    require('confirm_required')

    if env.confirm_required:
        if not confirm("Are you sure you want to run task: %s on servers %s?" % (action, env.hosts)):
            abort('Deployment aborted.')


def generate_password(length=50):
    # Similar to Django's charset but avoids $ to avoid accidential shell variable expansion
    chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#%^&*(-_=+)'
    return get_random_string(length, chars)


def get_current_version_summary():
    commit_id, branch, message, author = vcs.version()
    return "%s [%s]: %s - %s" % (commit_id, branch, message, author)


def docker_compose(cmd):
    with cd(env.code_dir):
        sudo('docker-compose -f docker-compose.production.yml ' + cmd)


def docker_compose_run(service, cmd='', name='{{cookiecutter.repo_name}}_tmp'):
    docker_compose('run --rm --name {name} {service} {cmd}'.format(name=name, service=service, cmd=cmd))


def get_config_modified_patterns(key):
    return map(lambda x: r' %s' % x, get_config_repo_paths(key))


def get_config_repo_paths(key):
    require('deployment_configurations')

    return map(lambda x: 'deploy/%s/%s' % (key, render_config_key(x, 'pattern')), env.deployment_configurations.get(key, []))


def update_config_files(key):
    require('deployment_configurations')

    paths = []

    with cd(env.code_dir):
        for config_def in env.deployment_configurations.get(key, []):
            repo_path = render_config_key(config_def, 'pattern')
            remote_path = render_config_key(config_def, 'remote_path')

            sudo('cp deploy/%s/%s %s' % (key, repo_path, remote_path))

            paths.append(remote_path)

    return paths


def render_config_key(config_def, key):
    require('target')

    if key == 'pattern' or key == 'filename':
        params = {
            'target': env.target,
        }

    elif key == 'remote_path':
        params = {
            'target': env.target,
            'filename': render_config_key(config_def, 'filename'),
        }

    else:
        return abort('invalid config key: %s' % key)

    return config_def[key] % params

def get_nginx_app_target_path():
    require('deployment_configurations')

    if env.deployment_configurations.get('nginx', None) is None:
        abort('nginx key not in deployment configurations')

    default_site = list(filter(lambda x: x.get('default_site', False), env.deployment_configurations['nginx']))

    if len(default_site) > 1:
        abort('multiple default nginx sites found')

    return render_config_key(default_site[0], 'remote_path')

def ensure_docker_networks():
    # Ensure we have dedicated networks for communicating with Nginx and Postgres
    ensure_docker_network_exists('{{ cookiecutter.repo_name }}_default', [], internal=False)
    ensure_docker_network_exists('{{ cookiecutter.repo_name }}_nginx', ['nginx'])
    ensure_docker_network_exists('{{ cookiecutter.repo_name }}_postgres', ['postgres-10'])


def ensure_docker_network_exists(network_name, connected_containers, internal=True):
    created = create_docker_network(network_name, internal=internal)

    if not created:
        # Already existed
        return

    for container_name in connected_containers:
        sudo('docker network connect %s %s' % (network_name, container_name))
