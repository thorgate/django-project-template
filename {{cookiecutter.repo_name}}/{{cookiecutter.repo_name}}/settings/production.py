from settings.staging import *


# Allowed hosts for the site
ALLOWED_HOSTS = ['{{ cookiecutter.live_hostname }}']

# Static site url, used when we need absolute url but lack request object, e.g. in email sending.
SITE_URL = 'https://{{ cookiecutter.live_hostname }}'

EMAIL_HOST_PASSWORD = 'TODO (api key)'

RAVEN_BACKEND_DSN = 'https://TODO:TODO@sentry.thorgate.eu/TODO'
RAVEN_PUBLIC_DSN = 'https://TODO@sentry.thorgate.eu/TODO'
RAVEN_CONFIG['dsn'] = RAVEN_BACKEND_DSN

# Enable {{ cookiecutter.django_media_engine }} storage
DEFAULT_FILE_STORAGE = '{{ cookiecutter.repo_name }}.storages.MediaStorage'
MEDIA_ROOT = ''
{% if cookiecutter.django_media_engine == 'S3' -%}
AWS_STORAGE_BUCKET_NAME = '{{ cookiecutter.repo_name }}-production'
AWS_ACCESS_KEY_ID = None  # set in local.py
AWS_SECRET_ACCESS_KEY = None  # set in local.py
{%- endif %}{% if cookiecutter.django_media_engine == 'GCS' -%}
GS_BUCKET_NAME = '{{ cookiecutter.repo_name }}-production'
GS_PROJECT_ID = None  # set in local.py
GS_CREDENTIALS = None  # set in local.py{% endif %}
