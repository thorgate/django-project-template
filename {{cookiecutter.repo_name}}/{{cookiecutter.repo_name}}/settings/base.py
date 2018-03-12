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
    ('Admins', '{{ cookiecutter.admin_email }}'),
)
MANAGERS = ADMINS
EMAIL_SUBJECT_PREFIX = '[{{cookiecutter.project_title}}] '  # subject prefix for managers & admins

SESSION_COOKIE_NAME = '{{ cookiecutter.repo_name }}_ssid'
SESSION_SAVE_EVERY_REQUEST = True  # Set cookie headers on every request - This is for api

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

    'rest_framework',
    'django_filters',
    'tg_react',
    'crispy_forms',

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
    'django.middleware.locale.LocaleMiddleware',
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
STATIC_WEBPACK_URL = '/static-webpack/'
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
DJANGO_SITE_URL = 'http://127.0.0.1:3000'
ALLOWED_HOSTS = ['django', 'localhost', '127.0.0.1']


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
DEFAULT_FROM_EMAIL = "{{cookiecutter.project_title}} <info@{{ cookiecutter.live_hostname }}>"
SERVER_EMAIL = "{{cookiecutter.project_title}} server <server@{{ cookiecutter.live_hostname }}>"

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


# Rest framework configuration
REST_FRAMEWORK = {
    # Disable Basic auth
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
    # Change default full-url media files to be only stored path, needs /media prepended in frontend
    'UPLOADED_FILES_USE_URL': False,
}

# Webpack settings exporter
WEBPACK_CONSTANT_PROCESSORS = (
    'tg_react.webpack.default_constants',
    '{{cookiecutter.repo_name}}.webpack_constants.language_constants',
    '{{cookiecutter.repo_name}}.webpack_constants.constants',
)


# Koa configuration
API_BASE = '/api/'
KOA_PORT = 80
KOA_SITE_BASE = 'http://django'
# If False Koa app will wait for initial data to finish before showing next route
KOA_APP_IS_EAGER = False
# If True, 404 are not treated as errors for sentry
KOA_APP_IGNORE_404 = True

# Proxy map, used by Koa app to proxy all to Django
KOA_APP_PROXY = {
    '/d/': KOA_SITE_BASE,  # Generic prefix, helpful if adding new urls to site to use Django views
    '/api/': KOA_SITE_BASE,
    MEDIA_URL: KOA_SITE_BASE,
    STATIC_URL: KOA_SITE_BASE,
    '/adminpanel/': KOA_SITE_BASE,
}



# Default values for sentry
RAVEN_BACKEND_DSN = ''
RAVEN_PUBLIC_DSN = ''
RAVEN_CONFIG = {}


# All these settings will be made available to javascript app
SETTINGS_EXPORT = [
    'DEBUG',
    'SITE_URL',
    'DJANGO_SITE_URL',
    'MEDIA_URL',
    'STATIC_URL',
    'STATIC_WEBPACK_URL',
    'RAVEN_PUBLIC_DSN',
    'RAVEN_BACKEND_DSN',
    'CSRF_COOKIE_NAME',
    'SESSION_COOKIE_NAME',

    'LOGIN_REDIRECT',
    'LOGIN_URL',

    'ALLOWED_HOSTS',
    'KOA_PORT',
    'API_BASE',
    'KOA_API_BASE',
    'KOA_APP_PROXY',
    'KOA_APP_IS_EAGER',
    'KOA_APP_IGNORE_404',

    'APPEND_SLASH',
]
