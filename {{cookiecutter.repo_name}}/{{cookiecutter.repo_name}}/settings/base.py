"""
Django settings for {{cookiecutter.project_title}} project.

For more information on this file, see
https://docs.djangoproject.com/en/dev/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/dev/ref/settings/
"""

import os


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/dev/howto/deployment/checklist/

# Build paths inside the project like this: os.path.join(SITE_ROOT, ...)
SITE_ROOT = os.path.dirname(os.path.dirname(__file__))


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ADMINS = (
    ('Admins', 'errors@TODO'),
)
MANAGERS = ADMINS
EMAIL_SUBJECT_PREFIX = '[{{cookiecutter.project_title}}] '  # subject prefix for managers & admins

SESSION_COOKIE_NAME = '{{ cookiecutter.repo_name }}_ssid'

INSTALLED_APPS = [
    'accounts',
    '{{cookiecutter.repo_name}}',
{%- if cookiecutter.include_cms == 'yes' %}

    'cms',
    'treebeard',
    'menus',
    'sekizai',
    'djangocms_admin_style',
    'reversion',
    'easy_thumbnails',
    'filer',
    'mptt',
    'djangocms_file',
    'djangocms_link',
    'djangocms_picture',
    'djangocms_text_ckeditor',
{%- endif %}

    'crispy_forms',
    'webpack_loader',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
{%- if cookiecutter.include_cms == 'yes' %}
    'django.contrib.sites',
{%- endif %}
    'django.contrib.messages',
    'django.contrib.staticfiles',
]


MIDDLEWARE = [
    {%- if cookiecutter.include_cms == 'yes' %}
    'cms.middleware.utils.ApphookReloadMiddleware',
    {%- endif %}
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    {%- if cookiecutter.include_cms == 'yes' %}
    'django.middleware.locale.LocaleMiddleware',
    'cms.middleware.user.CurrentUserMiddleware',
    'cms.middleware.page.CurrentPageMiddleware',
    'cms.middleware.toolbar.ToolbarMiddleware',
    'cms.middleware.language.LanguageCookieMiddleware',
    {%- endif %}
]


TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(SITE_ROOT, 'templates'),
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.contrib.auth.context_processors.auth',
                'django.template.context_processors.debug',
                'django.template.context_processors.i18n',
                'django.template.context_processors.media',
                'django.template.context_processors.request',
                'django.template.context_processors.static',
                'django.template.context_processors.tz',
                'django.contrib.messages.context_processors.messages',
                {%- if cookiecutter.include_cms == 'yes' %}
                'django.template.context_processors.csrf',
                'sekizai.context_processors.sekizai',
                'cms.context_processors.cms_settings',
                {%- endif %}
                'django_settings_export.settings_export',
            ],
        },
    },
]
{%- if cookiecutter.include_cms == 'yes' %}

THUMBNAIL_PROCESSORS = (
    'filer.thumbnail_processors.scale_and_crop_with_subject_location',
)

CMS_TEMPLATES = (
    ('cms_main.html', 'Main template'),
)
{%- endif %}


# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'HOST': 'postgres',
        'NAME': '{{cookiecutter.repo_name}}',
        'USER': '{{cookiecutter.repo_name}}',
        'PASSWORD': '{{cookiecutter.repo_name}}',
    }
}


# Redis config (used for caching{% if cookiecutter.include_celery == 'yes' %} and celery{% endif %})
REDIS_HOST = 'redis'
REDIS_PORT = 6379
REDIS_DB = 1
REDIS_URL = 'redis://%s:%d/%d' % (REDIS_HOST, REDIS_PORT, REDIS_DB)
{%- if cookiecutter.include_celery == 'yes' %}


# Celery configuration
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_REDIS_CONNECT_RETRY = True
CELERYD_HIJACK_ROOT_LOGGER = False
BROKER_URL = REDIS_URL
BROKER_TRANSPORT_OPTIONS = {'fanout_prefix': True}

CELERY_TIMEZONE = 'UTC'

# Set your Celerybeat tasks/schedule here
CELERYBEAT_SCHEDULE = {
    'default-task': {
        # TODO: Remove the default task after confirming that Celery works.
        'task': '{{cookiecutter.repo_name}}.tasks.default_task',
        'schedule': 5,
    },
}
{%- endif %}


# Caching
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}


# Internationalization
LANGUAGE_CODE = 'en'
LANGUAGES = (
    ('en', 'English'),
    ('et', 'Eesti keel'),
)
LOCALE_PATHS = (
    'locale',
)

TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True


# Static files and media (CSS, JavaScript, images)
MEDIA_ROOT = '/files/media'
MEDIA_URL = '/media/'

STATIC_ROOT = '/files/assets'
STATIC_URL = '/static/'
STATICFILES_DIRS = (
    os.path.join(SITE_ROOT, 'static'),
    os.path.join(SITE_ROOT, 'app', 'build'),
)
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'dummy key'

AUTH_USER_MODEL = 'accounts.User'


# Static site url, used when we need absolute url but lack request object, e.g. in email sending.
SITE_URL = 'http://127.0.0.1:8000'
ALLOWED_HOSTS = []

{%- if cookiecutter.include_cms == 'yes' %}

SITE_ID = 1
{%- else %}

# Don't allow site's content to be included in frames/iframes.
X_FRAME_OPTIONS = 'DENY'
{%- endif %}


ROOT_URLCONF = '{{cookiecutter.repo_name}}.urls'

WSGI_APPLICATION = '{{cookiecutter.repo_name}}.wsgi.application'


LOGIN_REDIRECT_URL = '/'
LOGIN_URL = 'login'
LOGOUT_REDIRECT_URL = 'login'


# Crispy-forms
CRISPY_TEMPLATE_PACK = 'bootstrap3'


# Email config
{%- if cookiecutter.live_hostname == 'none' %}
DEFAULT_FROM_EMAIL = "{{cookiecutter.project_title}} <info@TODO.com>"
SERVER_EMAIL = "{{cookiecutter.project_title}} server <server@TODO.com>"
{%- else %}
DEFAULT_FROM_EMAIL = "{{cookiecutter.project_title}} <info@{{ cookiecutter.live_hostname }}>"
SERVER_EMAIL = "{{cookiecutter.project_title}} server <server@{{ cookiecutter.live_hostname }}>"
{%- endif %}

# Show emails in the console, but don't send them.
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# SMTP  --> This is only used in staging and production
EMAIL_HOST = 'smtp.sparkpostmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'SMTP_Injection'


# Base logging config. Logs INFO and higher-level messages to console. Production-specific additions are in
#  production.py.
#  Notably we modify existing Django loggers to propagate and delegate their logging to the root handler, so that we
#  only have to configure the root handler.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'default': {
            'format': '%(asctime)s [%(levelname)s] %(name)s:%(lineno)d %(funcName)s - %(message)s'
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'default',
        }
    },
    'loggers': {
        '': {
            'handlers': ['console'],
            'level': 'INFO',
        },
        'django': {'handlers': [], 'propagate': True},
        'django.request': {'handlers': [], 'propagate': True},
        'django.security': {'handlers': [], 'propagate': True},
    }
}

TEST_RUNNER = 'django.test.runner.DiscoverRunner'


# Disable a few system checks. Careful with these, only silence what your really really don't need.
# TODO: check if this is right for your project.
SILENCED_SYSTEM_CHECKS = [
    'security.W001',  # we don't use SecurityMiddleware since security is better applied in nginx config
]


# Default values for sentry
RAVEN_BACKEND_DSN = ''
RAVEN_PUBLIC_DSN = ''
RAVEN_CONFIG = {}

WEBPACK_LOADER = {
    'DEFAULT': {
        'BUNDLE_DIR_NAME': '',
        'STATS_FILE': os.path.join(SITE_ROOT, 'app', 'webpack-stats.json'),
    }
}

# All these settings will be made available to javascript app
SETTINGS_EXPORT = [
    'DEBUG',
    'SITE_URL',
    'STATIC_URL',
    'RAVEN_PUBLIC_DSN',
]
