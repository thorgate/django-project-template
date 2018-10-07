from django.apps import AppConfig
from django.core import checks

from tg_utils.checks import check_production_settings, check_sentry_config


class {{cookiecutter.repo_name|capitalize}}Config(AppConfig):
    name = '{{cookiecutter.repo_name}}'
    verbose_name = "{{cookiecutter.project_title}}"

    def ready(self):
        # Import and register the system checks
        checks.register(check_production_settings)
        checks.register(check_sentry_config)
