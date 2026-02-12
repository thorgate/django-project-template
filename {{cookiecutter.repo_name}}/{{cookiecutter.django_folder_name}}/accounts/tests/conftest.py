import pytest
import secrets


@pytest.fixture
def random_password():
    return secrets.token_urlsafe(16)
