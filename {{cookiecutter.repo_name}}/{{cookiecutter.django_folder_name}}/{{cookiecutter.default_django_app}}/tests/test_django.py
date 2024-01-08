from io import StringIO

from django.core.management import call_command
from django.test import override_settings

import pytest


@pytest.mark.django_db()
def test_for_missing_migrations():
    output = StringIO()
    try:
        call_command(
            "makemigrations", interactive=False, dry_run=True, check=True, stdout=output
        )
    except SystemExit:
        pytest.fail("There are missing migrations:\n %s" % output.getvalue())


# Without this settings patch, we get an error:
#   (tg_utils.W001) EMAIL_HOST_PASSWORD setting is not set to proper value
# while locally we don't need a password because we use mailhog
@override_settings(EMAIL_HOST_PASSWORD="propervalue")
@pytest.mark.django_db()
def test_django_checks():
    try:
        call_command("check", fail_level="WARNING")
    except SystemExit:
        pytest.fail("Django system checks failed")
