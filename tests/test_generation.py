import os
import subprocess
import yaml

from cookiecutter.config import USER_CONFIG_PATH
from cookiecutter.exceptions import FailedHookException


def generate_project(cookies, config):
    cookies._config_file = USER_CONFIG_PATH
    result = cookies.bake(extra_context=config)

    assert result.exit_code == 0
    assert result.exception is None
    assert result.project.basename == config['repo_name']
    assert result.project.isdir()

    assert result.project.join('{repo_name}/manage.py'.format(**config)).exists()

    return result


def validate_project_works(result, config):
    # Note: If we want to use tox to cross test this on multiple python/django/etc versions,
    #       we should create a temporary venv for the created project before installing

    project_dir = str(result.project)
    project_inner_dir = str(result.project.join(config['repo_name']))

    with open(os.path.join(project_dir, '.gitlab-ci.yml')) as f:
        gitlab_ci = yaml.load(f)

    # Grab commands and environment from gitlab-ci
    commands = gitlab_ci['test']['script']
    gitlab_ci_env = gitlab_ci['test'].get('variables', {})

    if not commands:
        raise ValueError(
            "No test commands extracted from project gitlab-ci. "
            "You probably need to update this part of the test to reflect changes "
            "made to the .gitlab-ci.yml structure."
        )

    env = os.environ.copy()
    env.update({
        **gitlab_ci_env,

        # PWD call in Makefile reports wrong path during testing
        'PROJECT_ROOT': project_dir,
        'SITE_ROOT': project_inner_dir,
    })

    for cmd in commands:
        assert subprocess.check_call(
            cmd.split(' '),
            cwd=project_dir,
            env=env,
        ) == 0


def test_base_generate(cookies, default_project):
    result = generate_project(cookies, default_project)

    assert result.project.join('.hgignore').exists()
    assert result.project.join('.gitignore').exists()
    assert not result.project.join('%s/templates/cms_main.html' % (default_project['repo_name'],)).exists()

    validate_project_works(result, default_project)


def test_cms_generate(cookies, default_project):
    default_project.update({
        'include_cms': 'yes',
    })
    result = generate_project(cookies, default_project)

    assert result.project.join('%s/templates/cms_main.html' % (default_project['repo_name'],)).exists()

    validate_project_works(result, default_project)


def test_celery_generate(cookies, default_project):
    default_project.update({
        'include_celery': 'yes',
    })
    result = generate_project(cookies, default_project)

    assert result.project.join('docker-compose.yml').exists()
    with open(result.project.join('docker-compose.yml')) as f:
        contents = f.read()
    assert 'celery:' in contents

    validate_project_works(result, default_project)


def test_celery_and_cms_generate(cookies, default_project):
    default_project.update({
        'include_cms': 'yes',
        'include_celery': 'yes',
    })
    result = generate_project(cookies, default_project)

    assert result.project.join('%s/templates/cms_main.html' % (default_project['repo_name'],)).exists()

    assert result.project.join('docker-compose.yml').exists()
    with open(result.project.join('docker-compose.yml')) as f:
        contents = f.read()
    assert 'celery:' in contents

    validate_project_works(result, default_project)


def test_codecept_generate(cookies, default_project):
    default_project.update({
        'include_codecept': 'yes',
    })
    result = generate_project(cookies, default_project)

    assert result.project.join('docker-compose.codecept.yml').exists()

    validate_project_works(result, default_project)


def test_git_generate(cookies, default_project):
    default_project.update({
        'vcs': 'git',
    })

    result = generate_project(cookies, default_project)

    assert result.project.join('.gitignore').exists()
    assert not result.project.join('.hgignore').exists()


def test_invalid_project_name_is_error(cookies, default_project):
    default_project.update({
        'repo_name': '%^&%'
    })

    result = cookies.bake(extra_context=default_project)

    assert result.exit_code == -1
    assert isinstance(result.exception, FailedHookException)


def test_invalid_test_host_is_error(cookies, default_project):
    default_project.update({
        'test_host': '-foo.com',
    })

    result = cookies.bake(extra_context=default_project)

    assert result.exit_code == -1
    assert isinstance(result.exception, FailedHookException)


def test_invalid_live_host_is_error(cookies, default_project):
    default_project.update({
        'live_host': '-foo.com',
    })

    result = cookies.bake(extra_context=default_project)

    assert result.exit_code == -1
    assert isinstance(result.exception, FailedHookException)


def test_invalid_test_hostname_is_error(cookies, default_project):
    default_project.update({
        'repo_name': '_foo',  # translated to `-foo.{{ test_host }}` for the hostname
    })

    result = cookies.bake(extra_context=default_project)

    assert result.exit_code == -1
    assert isinstance(result.exception, FailedHookException)


def test_invalid_live_hostname_is_error(cookies, default_project):
    default_project.update({
        'live_hostname': '-foo.com',
    })

    result = cookies.bake(extra_context=default_project)

    assert result.exit_code == -1
    assert isinstance(result.exception, FailedHookException)
