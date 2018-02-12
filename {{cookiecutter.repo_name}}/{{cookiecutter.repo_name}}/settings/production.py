from settings.staging import *


# Allowed hosts for the site
{%- if cookiecutter.live_hostname == 'none' %}
ALLOWED_HOSTS = ['TODO.com']

# Static site url, used when we need absolute url but lack request object, e.g. in email sending.
SITE_URL = 'http://TODO.com'
{%- else %}
ALLOWED_HOSTS = ['{{ cookiecutter.live_hostname }}']

# Static site url, used when we need absolute url but lack request object, e.g. in email sending.
SITE_URL = 'https://{{ cookiecutter.live_hostname }}'
{%- endif %}

EMAIL_HOST_PASSWORD = 'TODO (api key)'

RAVEN_BACKEND_DSN = 'https://TODO:TODO@sentry.thorgate.eu/TODO'
RAVEN_PUBLIC_DSN = 'https://TODO@sentry.thorgate.eu/TODO'
RAVEN_CONFIG['dsn'] = RAVEN_BACKEND_DSN
