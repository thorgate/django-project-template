from corsheaders.defaults import default_headers

from settings.base import *


DEBUG = False

ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=['{{ cookiecutter.django_host_prefix }}.{{cookiecutter.repo_name|as_hostname}}.{{cookiecutter.test_host}}', '{{cookiecutter.repo_name|as_hostname}}.{{cookiecutter.test_host}}'])

# Static site url, used when we need absolute url but lack request object, e.g. in email sending.
SITE_URL = env.str('RAZZLE_SITE_URL', default='https://{{cookiecutter.repo_name|as_hostname}}.{{cookiecutter.test_host}}')
DJANGO_SITE_URL = env.str('RAZZLE_DJANGO_SITE_URL', default='https://{{ cookiecutter.django_host_prefix }}.{{cookiecutter.repo_name|as_hostname}}.{{cookiecutter.test_host}}')

CSRF_COOKIE_DOMAIN = env.str('DJANGO_CSRF_COOKIE_DOMAIN', default='.{{cookiecutter.repo_name|as_hostname}}.{{cookiecutter.test_host}}')

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

EMAIL_HOST_PASSWORD = env.str('DJANGO_EMAIL_HOST_PASSWORD', default='TODO (api key)')
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

STATIC_URL = env.str('DJANGO_STATIC_URL', default='/assets/')

# Production logging - all INFO and higher messages go to info.log file. ERROR and higher messages additionally go to
#  error.log file plus to Sentry.
if env.str('DJANGO_DISABLE_FILE_LOGGING') != 'y':
    LOGGING['handlers'] = {
        'info_log': {
            'level': 'INFO',
            'class': 'logging.handlers.WatchedFileHandler',
            'filename': '/var/log/{{cookiecutter.repo_name}}/info.log',
            'formatter': 'default',
        },
        'error_log': {
            'level': 'ERROR',
            'class': 'logging.handlers.WatchedFileHandler',
            'filename': '/var/log/{{cookiecutter.repo_name}}/error.log',
            'formatter': 'default',
        },
        'sentry': {
            'level': 'ERROR',
            'class': 'raven.contrib.django.raven_compat.handlers.SentryHandler',
        },
    }
    LOGGING['loggers'][''] = {
        'handlers': ['info_log', 'error_log', 'sentry'],
        'level': 'INFO',
        'filters': ['require_debug_false'],
    }
else:
    # When no file logging, also enable sentry
    LOGGING['loggers'][''] = {
        'handlers': ['console', 'sentry'],
        'level': 'INFO',
        'filters': ['require_debug_false'],
    }

# Sentry error logging
INSTALLED_APPS += (
    'raven.contrib.django.raven_compat',
)
RAVEN_BACKEND_DSN = env.str('DJANGO_RAVEN_BACKEND_DSN', default='https://TODO:TODO@sentry.thorgate.eu/TODO')
RAVEN_PUBLIC_DSN = env.str('DJANGO_RAVEN_PUBLIC_DSN', default='https://TODO@sentry.thorgate.eu/TODO')
RAVEN_CONFIG = {'dsn': RAVEN_BACKEND_DSN}

# CORS overrides
CORS_ORIGIN_ALLOW_ALL = False
CORS_EXPOSE_HEADERS = default_headers
CORS_ORIGIN_WHITELIST = env.list('DJANGO_CORS_ORIGIN_WHITELIST', default=ALLOWED_HOSTS)
CSRF_TRUSTED_ORIGINS = env.list('DJANGO_CSRF_TRUSTED_ORIGINS', default=ALLOWED_HOSTS)
