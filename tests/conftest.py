import pytest


@pytest.fixture
def default_project():
    return {
        "project_title": "Test project",
        "repo_name": "test_project",
        "project_type": 'standard',
        "include_cms": 'no',
        "test_host": "test1.thorgate.eu",
        "live_host": "test2.thorgate.eu",
        "vcs": None,
        "python_version": "3.4"
    }


@pytest.fixture
def react_project(default_project):
    config = {}
    config.update(default_project)
    config.update({
        "project_type": 'spa',
    })

    return config
