from settings.staging import *


# Allowed hosts for the site
ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=['{{ cookiecutter.live_hostname }}'])

# Static site url, used when we need absolute url but lack request object, e.g. in email sending.
SITE_URL = env.str('DJANGO_SITE_URL', default='https://{{ cookiecutter.live_hostname }}')

EMAIL_HOST = env.str('DJANGO_EMAIL_HOST', default='smtp.sparkpostmail.com')
EMAIL_PORT = env.int('DJANGO_EMAIL_PORT', default=587)
EMAIL_HOST_USER = env.str('DJANGO_EMAIL_HOST_USER', default='TODO')
EMAIL_HOST_PASSWORD = env.str('DJANGO_EMAIL_HOST_PASSWORD', default='TODO (api key)')

RAVEN_BACKEND_DSN = env.str('DJANGO_RAVEN_BACKEND_DSN', default='https://TODO:TODO@sentry.thorgate.eu/TODO')
RAVEN_PUBLIC_DSN = env.str('DJANGO_RAVEN_PUBLIC_DSN', default='https://TODO@sentry.thorgate.eu/TODO')
RAVEN_CONFIG['dsn'] = RAVEN_BACKEND_DSN

# Enable {{ cookiecutter.django_media_engine }} storage
DEFAULT_FILE_STORAGE = '{{ cookiecutter.repo_name }}.storages.MediaStorage'
MEDIA_ROOT = env.str('DJANGO_MEDIA_ROOT', default='')
{% if cookiecutter.django_media_engine == 'S3' -%}
AWS_STORAGE_BUCKET_NAME = env.str('DJANGO_AWS_STORAGE_BUCKET_NAME', default='{{ cookiecutter.repo_name }}-production')
AWS_ACCESS_KEY_ID = env.str('DJANGO_AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = env.str('DJANGO_AWS_SECRET_ACCESS_KEY')
{%- endif %}{% if cookiecutter.django_media_engine == 'GCS' -%}
GS_BUCKET_NAME = env.str('DJANGO_GS_BUCKET_NAME', default='{{ cookiecutter.repo_name }}-production')
GS_PROJECT_ID = env.str('DJANGO_GS_PROJECT_ID')
GS_CREDENTIALS = env.str('DJANGO_GS_CREDENTIALS'){% endif %}
