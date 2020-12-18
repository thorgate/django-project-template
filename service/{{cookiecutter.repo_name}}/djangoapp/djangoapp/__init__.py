{% if cookiecutter.include_celery == "yes" -%}
from djangoapp.celery import app as celery_app


{% endif -%}

default_app_config = "djangoapp.apps.CustomConfig"

{%- if cookiecutter.include_celery == "yes" %}

__all__ = ["celery_app"]
{%- endif %}
