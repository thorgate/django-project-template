from django.conf import settings
# - {%- if cookiecutter.include_celery == YES %}
from django.core.cache import cache
# - {%- endif %}
from django.test import Client
# - {%- if cookiecutter.include_celery == YES %}
from django.utils.datetime_safe import datetime
# - {%- endif %}

import pytest

# - {%- if cookiecutter.include_celery == YES %}
from pytest_mock import MockerFixture
from tg_utils.health_check.checks.celery_beat.backends import CACHE_KEY, TIMEOUT
# - {%- endif %}


# - {%- if cookiecutter.include_celery == YES %}
@pytest.fixture(autouse=True)
def _patch_celery(mocker: MockerFixture):
    cache.set(CACHE_KEY, datetime.now(), timeout=TIMEOUT * 2)
    mocker.patch("health_check.contrib.celery.backends.CeleryHealthCheck.check_status")
    yield
# - {%- endif %}


@pytest.mark.django_db()
def test_health_url(django_client: Client):
    response = django_client.get(f"/{ settings.DJANGO_HEALTH_CHECK_PATH }")
    assert response.status_code == 200
    assert response.json() == {"error": False}


@pytest.mark.django_db()
def test_health_detail_no_token(django_client: Client):
    response = django_client.get(f"/{ settings.DJANGO_HEALTH_CHECK_PATH }/details")
    assert response.status_code == 403

    response = django_client.get(f"/{ settings.DJANGO_HEALTH_CHECK_PATH }/details?healthtoken=fake")
    assert response.status_code == 403


@pytest.mark.django_db()
def test_health_detail(django_client: Client):
    response = django_client.get(
        f"/{ settings.DJANGO_HEALTH_CHECK_PATH }/details?healthtoken={settings.HEALTH_CHECK_ACCESS_TOKEN}"
    )
    assert response.status_code == 200
