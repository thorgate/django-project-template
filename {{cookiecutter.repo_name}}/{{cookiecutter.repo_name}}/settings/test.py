from settings.local import *


SEND_EMAILS = False

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': '{{ cookiecutter.repo_name }}',
        'TEST': {
            'NAME': '{{ cookiecutter.repo_name }}_test',
        },
    }
}

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
