import os
import pytest
import sys

from .constants import YES, NO, WEBAPP

def pytest_addoption(parser):
    parser.addoption(
        "-E",
        action="store",
        metavar="NAME",
        default='main',
        help="only run tests matching the environment NAME.",
    )


def pytest_configure(config):
    # register env marker
    config.addinivalue_line(
        "markers", "env(name): mark test to run only on named environment"
    )

    # Set the base temp directory to TPL_PLAYGROUND so pytest-cookies creates its files into shared storage
    #  see the following issue for reasoning: https://gitlab.com/gitlab-org/gitlab-ce/issues/41227
    if os.environ.get("CI_SERVER") == YES:
        config.option.basetemp = os.environ["TPL_PLAYGROUND"]

    # until this is resolved: https://github.com/audreyr/cookiecutter/pull/944
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "extensions")))


def pytest_runtest_setup(item):
    """If an environment is specified in command line skip tests that do not match it

    Note: environment defaults to main

    Any tests that do not have env marker are automatically treated as env=main
    """
    environment = item.config.getoption("-E") or 'main'

    test_envs = [mark.args[0] for mark in item.iter_markers(name="env")] or ['main']

    if environment not in test_envs:
        pytest.skip("test requires env in {!r}".format(test_envs))


@pytest.fixture
def default_project():
    return {
        "project_title": "Test project",
        "repo_name": "ci_project",
        "include_celery": NO,
        "webapp_include_storybook": NO,
        "test_host": "test1.thorgate.eu",
        "python_version": "3.8",
        "node_version": "14",
        "frontend_style": WEBAPP,
        "use_cypress": NO,
    }
