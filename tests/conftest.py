import os
import pytest
import sys


def pytest_configure(config):
    # Set the base temp directory to TPL_PLAYGROUND so pytest-cookies creates its files into shared storage
    #  see the following issue for reasoning: https://gitlab.com/gitlab-org/gitlab-ce/issues/41227
    if os.environ.get('CI_SERVER') == 'yes':
        config.option.basetemp = os.environ['TPL_PLAYGROUND']

    # until this is resolved: https://github.com/audreyr/cookiecutter/pull/944
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "extensions")))


@pytest.fixture
def default_project():
    return {
        "project_title": "Test project",
        "repo_name": "test_project",
        "include_cms": "no",
        "include_celery": "no",
        "test_host": "test1.thorgate.eu",
        "live_host": "test2.thorgate.eu",
        "vcs": None,
        "python_version": "3.6",
    }
