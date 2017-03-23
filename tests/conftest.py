import pytest


@pytest.fixture
def default_project():
    return {
        "project_title": "Test project",
        "repo_name": "test_project",
        "include_cms": 'no',
        "test_host": "test1.thorgate.eu",
        "live_host": "test2.thorgate.eu",
        "vcs": None,
        "python_version": "3.4"
    }
