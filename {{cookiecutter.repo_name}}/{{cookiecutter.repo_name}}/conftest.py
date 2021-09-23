from django.test import Client

import pytest


@pytest.fixture()
def django_client() -> Client:
    return Client()
