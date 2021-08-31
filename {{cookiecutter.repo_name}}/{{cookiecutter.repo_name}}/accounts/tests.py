from django.conf import settings

import pytest

from .models import User


def test_custom_user_model():
    assert settings.AUTH_USER_MODEL == "accounts.User"


@pytest.mark.django_db
def test_get_full_name():
    user = User(name="Foo bar Buzz III")

    assert user.get_full_name() == "Foo bar Buzz III"


@pytest.mark.django_db
def test_get_short_name():
    user = User(name="Foo bar Buzz III")

    assert user.get_short_name() == "Foo bar Buzz III"
