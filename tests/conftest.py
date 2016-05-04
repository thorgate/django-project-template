import pytest


@pytest.fixture
def default_project():
    return {
        "project_title": "Test project",
        "repo_name": "test_project",
        "is_react_project": False,
        "test_host": "test1.thorgate.eu",
        "live_host": "test2.thorgate.eu",
        "vcs": None
    }


@pytest.fixture
def react_project(default_project):
    config = {}
    config.update(default_project)
    config.update({
        "is_react_project": True,
    })

    return config
