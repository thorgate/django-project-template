# - {% if cookiecutter.include_celery == YES %}
from {{cookiecutter.default_django_app}}.celery import app as celery_app


# - {% endif %}

default_app_config = "{{cookiecutter.default_django_app}}.apps.{{cookiecutter.default_django_app|snake_to_pascal_case}}Config"

# - {%- if cookiecutter.include_celery == YES %}

__all__ = ["celery_app"]
# - {%- endif %}
