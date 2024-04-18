from django.conf import settings
from django.test import Client

import pytest

# - {%- if cookiecutter.include_celery == YES %}
from pytest_mock import MockerFixture
# - {%- endif %}


# - {%- if cookiecutter.include_celery == YES %}
@pytest.fixture(autouse=True)
def _patch_celery(mocker: MockerFixture):
    mocker.patch("tg_utils.health_check.checks.celery_beat.backends.CeleryBeatHealthCheck.check_status")
    mocker.patch("health_check.contrib.celery.backends.CeleryHealthCheck.check_status")
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
