from django.conf import settings
from django.utils import timezone

import pytest

from freezegun import freeze_time

from ..models import User


def test_custom_user_model():
    assert settings.AUTH_USER_MODEL == "accounts.User"


@pytest.mark.django_db()
def test_get_full_name():
    user = User(name="Foo bar Buzz III")

    assert user.get_full_name() == "Foo bar Buzz III"


@pytest.mark.django_db()
def test_get_short_name():
    user = User(name="Foo bar Buzz III")

    assert user.get_short_name() == "Foo bar Buzz III"


@pytest.mark.django_db()
def test_create_user():
    now = timezone.now()

    with freeze_time(now):
        user = User.objects.create_user(email="Foo@BAR.sdf")

        # domain part is lowered by django by default. the email part is lowered by the DB
        assert user.email == "Foo@bar.sdf"

        assert user.is_active
        assert not user.is_staff
        assert not user.is_superuser

        assert user.last_login == now
        assert user.created == now

    # Should be possible to get the same user regardless of casing of the email
    assert User.objects.get(email="foo@bar.sdf").pk == user.pk


@pytest.mark.django_db()
def test_create_user_email_required():
    with pytest.raises(ValueError):
        User.objects.create_user(email="")

    with pytest.raises(ValueError):
        User.objects.create_user()


@pytest.mark.django_db()
def test_create_superuser():
    random_pass = User.objects.make_random_password(16)

    now = timezone.now()

    with freeze_time(now):
        user = User.objects.create_superuser(email="Foo@BAR.sdf", password=random_pass)

        assert user.email == "Foo@bar.sdf"

        assert user.is_active
        assert user.is_staff
        assert user.is_superuser

        assert user.last_login == now
        assert user.created == now
