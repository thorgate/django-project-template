# - {%- if cookiecutter.frontend_style == SPA %}
from corsheaders.defaults import default_headers

# - {% endif %}
from settings.base import *


DEBUG = False

if not IS_DOCKER_BUILD:
    # Static site url, used when we need absolute url but lack request object, e.g. in email sending.
    # - {%- if cookiecutter.frontend_style == WEBAPP %}
    SITE_URL = env.str("DJANGO_SITE_URL")
    # - {%- elif cookiecutter.frontend_style == SPA %}
    SITE_URL = env.str("RAZZLE_SITE_URL")
    DJANGO_SITE_URL = env.str("RAZZLE_BACKEND_SITE_URL")
    CSRF_COOKIE_DOMAIN = env.str("DJANGO_CSRF_COOKIE_DOMAIN")

CSRF_TRUSTED_ORIGINS = [
    f"https://{host}"
    for host in env.list("DJANGO_CSRF_TRUSTED_ORIGINS", default=ALLOWED_HOSTS)
]

# CORS overrides
CORS_ORIGIN_ALLOW_ALL = False
CORS_EXPOSE_HEADERS = default_headers
CORS_ORIGIN_WHITELIST = [
    f"https://{host}"
    for host in env.list("DJANGO_CORS_ORIGIN_WHITELIST", default=ALLOWED_HOSTS)
]
# - {% endif %}

EMAIL_HOST = env.str("DJANGO_EMAIL_HOST", default="smtp.sparkpostmail.com")
EMAIL_PORT = env.int("DJANGO_EMAIL_PORT", default=587)
EMAIL_HOST_USER = env.str("DJANGO_EMAIL_HOST_USER", default="SMTP_Injection")
EMAIL_HOST_PASSWORD = env.str("DJANGO_EMAIL_HOST_PASSWORD", default="TODO (api key)")

STATIC_URL = env.str("DJANGO_STATIC_URL", default="/assets/")

# Production logging - all INFO and higher messages go to info.log file.
# ERROR and higher messages additionally go to error.log file
LOGGING["loggers"][""] = {
    "handlers": ["console"],
    "level": "INFO",
    "filters": ["require_debug_false"],
}

if env.str("DJANGO_DISABLE_FILE_LOGGING", default="n") != "y":
    # Add file handlers
    LOGGING["handlers"].update(
        {
            "info_log": {
                "level": "INFO",
                "class": "logging.handlers.WatchedFileHandler",
                "filename": f"/var/log/{PROJECT_NAME}/info.log",
                "formatter": "default",
            },
            "error_log": {
                "level": "ERROR",
                "class": "logging.handlers.WatchedFileHandler",
                "filename": f"/var/log/{PROJECT_NAME}/error.log",
                "formatter": "default",
            },
        }
    )
    LOGGING["loggers"][""]["handlers"] = ["info_log", "error_log"]

else:
    LOGGING["handlers"].update(
        {"console": {"class": "logging.StreamHandler", "formatter": "default"}}
    )

# Enable {{ cookiecutter.django_media_engine }} storage
DEFAULT_FILE_STORAGE = f"{PROJECT_NAME}.storages.MediaStorage"
MEDIA_ROOT = env.str("DJANGO_MEDIA_ROOT", default="")
# - {% if cookiecutter.django_media_engine == S3 %}
AWS_STORAGE_BUCKET_NAME = env.str(
    "DJANGO_AWS_STORAGE_BUCKET_NAME", default=f"{PROJECT_NAME}-TODO"
)
AWS_ACCESS_KEY_ID = env.str("DJANGO_AWS_ACCESS_KEY_ID", default="***UNSET***")
AWS_SECRET_ACCESS_KEY = env.str("DJANGO_AWS_SECRET_ACCESS_KEY", default="***UNSET***")
# - {% elif cookiecutter.django_media_engine == GCS %}
GS_BUCKET_NAME = env.str("DJANGO_GS_BUCKET_NAME", default=f"{PROJECT_NAME}-TODO")
GS_PROJECT_ID = env.str("DJANGO_GS_PROJECT_ID", default="***UNSET***")

from google.oauth2 import service_account  # NOQA

GS_CREDENTIALS = service_account.Credentials.from_service_account_info(
    json.load(env.str("DJANGO_GS_CREDENTIALS", default="{}")),
)
# - {% endif %}
