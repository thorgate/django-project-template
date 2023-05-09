from django.apps import AppConfig
from django.core import checks
from django.conf import settings
from tg_utils.checks import check_production_settings, check_sentry_config


class {{cookiecutter.default_django_app|snake_to_pascal_case}}Config(AppConfig):
    name = settings.DEFAULT_DJANGO_APP
    verbose_name = settings.PROJECT_TITLE

    def ready(self):
        # Import and register the system checks
        checks.register(check_production_settings)
        checks.register(check_sentry_config)

        # - {%- if cookiecutter.include_celery == YES %}
        # Ensure default celery app is configured all the time
        from .celery import app  # NOQA  # pylint: disable-all
        assert app  # silence pyflakes F401 (app being imported but unused)  # nosec
        # - {%- endif %}
