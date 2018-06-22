from settings.staging import *


# Allowed hosts for the site
ALLOWED_HOSTS = ['{{ cookiecutter.live_hostname }}']

# Static site url, used when we need absolute url but lack request object, e.g. in email sending.
SITE_URL = 'https://{{ cookiecutter.live_hostname }}'

KOA_DJANGO_BASE = SITE_URL
DJANGO_SITE_URL = SITE_URL

EMAIL_HOST_PASSWORD = 'TODO (api key)'

RAVEN_BACKEND_DSN = 'https://TODO:TODO@sentry.thorgate.eu/TODO'
RAVEN_PUBLIC_DSN = 'https://TODO@sentry.thorgate.eu/TODO'
RAVEN_CONFIG['dsn'] = RAVEN_BACKEND_DSN
