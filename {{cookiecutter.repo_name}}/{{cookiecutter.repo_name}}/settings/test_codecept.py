from settings.test import *


SITE_URL = 'http://node'
DJANGO_SITE_URL = 'http://django'

# API passthrough doesn't seem to rewrite domain, so do allow node here too
ALLOWED_HOSTS = ALLOWED_HOSTS + ['node']

DATABASES['default'] = {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'HOST': 'postgres',
    'NAME': 'codecept',
    'USER': 'codecept',
    'PASSWORD': 'codecept'
}
