from django.test import Client

import pytest

from model_bakery import baker


@pytest.fixture()
def django_client(client) -> Client:
    return client


@pytest.fixture
def user(django_user_model):
    return baker.make(django_user_model, is_staff=False)


@pytest.fixture
def other_user(django_user_model):
    return baker.make(django_user_model, is_staff=False)


@pytest.fixture
def admin(django_user_model):
    return baker.make(django_user_model, is_staff=True)


@pytest.fixture
def superuser(django_user_model):
    return baker.make(django_user_model, is_staff=True, is_superuser=True)
