# - {% if cookiecutter.include_celery == YES %}
from {{cookiecutter.repo_name}}.celery import app as celery_app


# - {% endif %}

default_app_config = "{{cookiecutter.repo_name}}.apps.{{cookiecutter.repo_name|snake_to_pascal_case}}Config"

# - {%- if cookiecutter.include_celery == YES %}

__all__ = ["celery_app"]
# - {%- endif %}
