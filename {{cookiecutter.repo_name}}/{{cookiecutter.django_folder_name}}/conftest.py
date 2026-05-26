from django.test import Client

import pytest

from model_bakery import baker
# - {%- if cookiecutter.frontend_style == SPA or cookiecutter.frontend_style == SPA_NEXT %}
from rest_framework.test import APIClient
# - {%- endif %}


@pytest.fixture()
def django_client(client) -> Client:
    return client


@pytest.fixture()
def user(django_user_model):
    return baker.make(django_user_model, is_staff=False)


@pytest.fixture()
def other_user(django_user_model):
    return baker.make(django_user_model, is_staff=False)


@pytest.fixture()
def admin(django_user_model):
    return baker.make(django_user_model, is_staff=True)


@pytest.fixture()
def superuser(django_user_model):
    return baker.make(django_user_model, is_staff=True, is_superuser=True)


# - {%- if cookiecutter.frontend_style == SPA or cookiecutter.frontend_style == SPA_NEXT %}
@pytest.fixture()
def api_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture()
def sudo_api_client(superuser):
    client = APIClient()
    client.force_authenticate(superuser)
    return client
# - {%- endif %}
