# - {% if cookiecutter.include_celery == YES %}
from {{cookiecutter.default_django_app}}.celery import app as celery_app


__all__ = ["celery_app"]
# - {%- endif %}
