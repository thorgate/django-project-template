import subprocess

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

    assert subprocess.check_call(['pip', 'install', '-r' 'requirements/local.txt'], cwd=project_dir) == 0
    assert subprocess.check_call(['cp', 'settings/local.py.example', 'settings/local.py'], cwd=project_inner_dir) == 0
    assert subprocess.check_call(['cp', 'settings/local_test.py.example', 'settings/local_test.py'], cwd=project_inner_dir) == 0
    assert subprocess.check_call(['python', 'manage.py', 'migrate', '--settings=settings.local_test'], cwd=project_inner_dir) == 0
    assert subprocess.check_call(['npm', 'install', '--python=python2.7'], cwd=project_inner_dir) == 0

    # Run python tests
    assert subprocess.check_call(['py.test'], cwd=project_inner_dir) == 0

    # TODO: Assert coverage changes etc
    # TODO: Run js tests


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


def test_git_generate(cookies, default_project):
    default_project.update({
        'vcs': 'git',
    })

    result = generate_project(cookies, default_project)

    assert result.project.join('.gitignore').exists()
    assert not result.project.join('.hgignore').exists()


def test_hg_generate(cookies, default_project):
    default_project.update({
        'vcs': 'hg',
    })
    result = generate_project(cookies, default_project)

    assert result.project.join('.hgignore').exists()
    assert not result.project.join('.gitignore').exists()


def test_invalid_project_name_is_error(cookies, default_project):
    default_project.update({
        'repo_name': '%^&%'
    })

    result = cookies.bake(extra_context=default_project)

    assert result.exit_code == -1
    assert isinstance(result.exception, FailedHookException)
