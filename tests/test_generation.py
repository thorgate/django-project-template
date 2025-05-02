import os
import re
import subprocess
import yaml

import pytest

from cookiecutter.config import USER_CONFIG_PATH
from cookiecutter.exceptions import FailedHookException

from .constants import YES, NO, WEBAPP, SPA, SPA_NEXT, ALPINE, DEBIAN


def generate_project(cookies, config):
    os.environ.setdefault("DISABLE_PROJECT_TEMPLATE_VAULT_ENCRYPT", '1')
    os.environ.setdefault("DPT_CI_PROJECT_TEST", '1')

    cookies._config_file = USER_CONFIG_PATH
    result = cookies.bake(extra_context=config)

    assert result.exit_code == 0, f"Failed to generate {result.exit_code} - {result.exception}"
    assert result.exception is None
    assert result.project.basename == config['repo_name']
    assert result.project.isdir()

    assert result.project.join('{repo_name}/manage.py'.format(**config)).exists()

    return result


def validate_project_works(result, config):
    project_dir = str(result.project)
    project_inner_dir = str(result.project.join(config['repo_name']))

    with open(os.path.join(project_dir, '.gitlab-ci.yml')) as f:
        gitlab_ci = yaml.load(f, Loader=yaml.FullLoader)

    # Grab commands and environment from gitlab-ci
    django_commands = gitlab_ci['test-django']['script']
    node_commands = gitlab_ci['test-node']['script']
    commands = django_commands + node_commands

    if not commands:
        raise ValueError(
            "No test commands extracted from project gitlab-ci. "
            "You probably need to update this part of the test to reflect changes "
            "made to the .gitlab-ci.yml structure."
        )

    env = os.environ.copy()
    env.update({
        'EDIT_SETTINGS': NO,
        **gitlab_ci['test-django'].get('variables', {}),
        **gitlab_ci['test-node'].get('variables', {}),

        # PWD call in Makefile reports wrong path during testing
        'PROJECT_ROOT': project_dir,
        'SITE_ROOT': project_inner_dir,
        'DPT_VENV_CACHING': '1',
        'DJANGO_JWT_PUBLIC_KEY': '',
    })

    try:
        for cmd in commands:
            cmd_env = {}
            cmd_env.update(env)

            print(f"Running command: {cmd}")

            # If the command includes a cmd='anything' then extract it out into an
            #  env variable. This is not the most elegant way but should work well enough.
            mat = re.search(r"cmd='([^']+)'", cmd)
            if mat is not None:
                cmd = re.sub(r"cmd='([^']+)'", '', cmd).strip()
                cmd_env["cmd"] = mat.group(1)

                print(f"detected that cmd should be set to {cmd_env['cmd']}")

            subprocess.run(
                cmd.split(' '),
                cwd=project_dir,
                env=cmd_env,
                check=True,
            )
    finally:
        # teardown
        try:
            subprocess.run(
                ['docker compose', 'down'],
                cwd=project_dir,
                env=env,
            )
        except:
            print("Failed to call docker compose down")


@pytest.mark.parametrize('docker_base_image', [ALPINE, DEBIAN])
def test_base_generate(cookies, default_project, docker_base_image):
    config = {**default_project, 'docker_base_image': docker_base_image}
    result = generate_project(cookies, config)

    assert result.project.join('.gitignore').exists()

    assert result.project.join('webapp/').exists()
    assert not result.project.join('app/').exists()

    validate_project_works(result, config)


@pytest.mark.env("CELERY")
def test_celery_generate(cookies, default_project):
    default_project.update({
        'include_celery': YES,
    })
    result = generate_project(cookies, default_project)

    assert result.project.join('docker-compose.yml').exists()
    with open(result.project.join('docker-compose.yml')) as f:
        contents = f.read()
    assert 'celery:' in contents

    validate_project_works(result, default_project)


@pytest.mark.env("STORYBOOK")
def test_storybook_generate(cookies, default_project):
    default_project.update({
        'webapp_include_storybook': YES,
    })
    result = generate_project(cookies, default_project)

    assert result.project.join('webapp/webapp/src/.storybook/').exists()

    validate_project_works(result, default_project)


@pytest.mark.env("SPA")
def test_spa_generate(cookies, default_project):
    default_project.update({
        'frontend_style': SPA,
    })
    result = generate_project(cookies, default_project)

    assert result.project.join('app/').exists()
    assert not result.project.join('webapp/').exists()

    validate_project_works(result, default_project)


@pytest.mark.env("SPA_NEXT")
def test_spa_next_generate(cookies, default_project):
    default_project.update({
        'frontend_style': SPA_NEXT,
    })
    result = generate_project(cookies, default_project)

    assert result.project.join('app/').exists()
    assert not result.project.join('webapp/').exists()

    validate_project_works(result, default_project)


@pytest.mark.env("DEBIAN_SPA")
def test_debian_spa_generate(cookies, default_project):
    default_project.update({
        'frontend_style': SPA,
        'docker_base_image': DEBIAN,
    })
    result = generate_project(cookies, default_project)

    assert result.project.join('app/').exists()
    assert not result.project.join('webapp/').exists()

    validate_project_works(result, default_project)


@pytest.mark.env("DEBIAN_SPA_NEXT")
def test_debian_spa_next_generate(cookies, default_project):
    default_project.update({
        'frontend_style': SPA_NEXT,
        'docker_base_image': DEBIAN,
    })
    result = generate_project(cookies, default_project)

    assert result.project.join('app/').exists()
    assert not result.project.join('webapp/').exists()

    validate_project_works(result, default_project)


@pytest.mark.env("DEBIAN_WEBAPP")
def test_debian_webapp_generate(cookies, default_project):
    default_project.update({
        'frontend_style': WEBAPP,
        'docker_base_image': DEBIAN,
    })
    result = generate_project(cookies, default_project)

    assert result.project.join('webapp/').exists()
    assert not result.project.join('app/').exists()

    validate_project_works(result, default_project)


@pytest.mark.env("MYPY_WEBAPP")
def test_mypy_webapp_generate(cookies, default_project):
    default_project.update({
        'use_mypy': YES,
        'frontend_style': WEBAPP,

    })
    result = generate_project(cookies, default_project)

    assert result.project.join('webapp/').exists()
    assert not result.project.join('app/').exists()

    validate_project_works(result, default_project)


@pytest.mark.env("MYPY_SPA")
def test_mypy_spa_generate(cookies, default_project):
    default_project.update({
        'use_mypy': YES,
        'frontend_style': SPA,
    })
    result = generate_project(cookies, default_project)

    assert result.project.join('app/').exists()
    assert not result.project.join('webapp/').exists()

    validate_project_works(result, default_project)


@pytest.mark.env("MYPY_SPA_NEXT")
def test_mypy_spa_next_generate(cookies, default_project):
    default_project.update({
        'use_mypy': YES,
        'frontend_style': SPA_NEXT,
    })
    result = generate_project(cookies, default_project)

    assert result.project.join('app/').exists()
    assert not result.project.join('webapp/').exists()

    validate_project_works(result, default_project)


@pytest.mark.env("CYPRESS_SPA")
def test_cypress_spa_generate(cookies, default_project):
    default_project.update({
        'frontend_style': SPA,
        'use_cypress': YES,
    })
    result = generate_project(cookies, default_project)

    assert result.project.join('app/').exists()
    assert result.project.join('app/cypress/').exists()
    assert result.project.join('app/cypress.json').exists()
    assert not result.project.join('webapp/').exists()

    validate_project_works(result, default_project)


@pytest.mark.env("CYPRESS_SPA_NEXT")
def test_cypress_spa_next_generate(cookies, default_project):
    default_project.update({
        'frontend_style': SPA_NEXT,
        'use_cypress': YES,
    })
    result = generate_project(cookies, default_project)

    assert result.project.join('app/').exists()
    assert result.project.join('app/cypress/').exists()
    assert result.project.join('app/cypress.json').exists()
    assert not result.project.join('webapp/').exists()

    validate_project_works(result, default_project)


@pytest.mark.env("CYPRESS_WEBAPP")
def test_cypress_webapp_generate(cookies, default_project):
    default_project.update({
        'frontend_style': WEBAPP,
        'use_cypress': YES,
    })
    result = generate_project(cookies, default_project)

    assert result.project.join('webapp/').exists()
    assert result.project.join('webapp/cypress/').exists()
    assert result.project.join('webapp/cypress.json').exists()
    assert not result.project.join('app/').exists()

    validate_project_works(result, default_project)


@pytest.mark.env("AUTO_DEPLOY")
def test_auto_deploy_generate(cookies, default_project):
    default_project.update({
        'frontend_style': SPA_NEXT,
        'build_in_ci': YES,
        'use_auto_deploy': YES,
    })
    result = generate_project(cookies, default_project)

    assert result.project.join('ansible/autodeploy.yml').exists()
    assert result.project.join('ansible/roles/autodeploy').exists()
    assert result.project.join('scripts/deploy').exists()

    validate_project_works(result, default_project)


def test_storybook_not_generate(cookies, default_project):
    default_project.update({
        'webapp_include_storybook': NO,
    })
    result = generate_project(cookies, default_project)

    assert not result.project.join('webapp/webapp/src/.storybook/').exists()


def test_invalid_project_name_is_error(cookies, default_project):
    default_project.update({
        'repo_name': '%^&%'
    })

    result = cookies.bake(extra_context=default_project)

    assert result.exit_code == -1
    assert isinstance(result.exception, FailedHookException)


def test_invalid_django_admin_path_is_error(cookies, default_project):
    default_project.update({
        'django_admin_path': '/invalid-path/'
    })

    result = cookies.bake(extra_context=default_project)

    assert result.exit_code == -1
    assert isinstance(result.exception, FailedHookException)


def test_invalid_django_health_check_path_is_error(cookies, default_project):
    default_project.update({
        'django_health_check_path': '/invalid-path/'
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


def test_invalid_test_hostname_is_error(cookies, default_project):
    default_project.update({
        'repo_name': '_foo',  # translated to `-foo.{{ test_host }}` for the hostname
    })

    result = cookies.bake(extra_context=default_project)

    assert result.exit_code == -1
    assert isinstance(result.exception, FailedHookException)


def test_invalid_live_domain_name_is_error(cookies, default_project):
    default_project.update({
        'live_domain_name': '-foo.com',
    })

    result = cookies.bake(extra_context=default_project)

    assert result.exit_code == -1
    assert isinstance(result.exception, FailedHookException)
