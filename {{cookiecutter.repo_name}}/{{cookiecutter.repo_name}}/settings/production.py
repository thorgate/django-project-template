from settings.staging import *


# fmt: off
# Allowed hosts for the site
ALLOWED_HOSTS = env.list(
    "DJANGO_ALLOWED_HOSTS",
{%- if cookiecutter.frontend_style == 'webapp' %}
    default=["{{ cookiecutter.domain_name }}"]
{% else %}
    default=["{{ cookiecutter.spa_django_host_prefix|as_hostname }}.{{ cookiecutter.domain_name }}", "{{ cookiecutter.domain_name }}"]
{% endif %}
)
# fmt: on

# Static site url, used when we need absolute url but lack request object, e.g. in email sending.
{%- if cookiecutter.frontend_style == 'webapp' %}
SITE_URL = env.str("DJANGO_SITE_URL", default="https://{{ cookiecutter.domain_name }}")
{% else %}
SITE_URL = env.str("RAZZLE_SITE_URL", default="https://{{ cookiecutter.domain_name }}")
DJANGO_SITE_URL = env.str("RAZZLE_BACKEND_SITE_URL", default="https://{{ cookiecutter.spa_django_host_prefix|as_hostname }}.{{ cookiecutter.domain_name }}")

CSRF_COOKIE_DOMAIN = env.str("DJANGO_CSRF_COOKIE_DOMAIN", default=".{{ cookiecutter.domain_name }}"){% endif %}

EMAIL_HOST = env.str("DJANGO_EMAIL_HOST", default="smtp.sparkpostmail.com")
EMAIL_PORT = env.int("DJANGO_EMAIL_PORT", default=587)
EMAIL_HOST_USER = env.str("DJANGO_EMAIL_HOST_USER", default="TODO")
EMAIL_HOST_PASSWORD = env.str("DJANGO_EMAIL_HOST_PASSWORD", default="TODO (api key)")

{%- if cookiecutter.frontend_style == 'spa' %}

# CORS whitelist
CORS_ORIGIN_WHITELIST = [
    "https://{host}".format(host=host)
    for host in env.list("DJANGO_CORS_ORIGIN_WHITELIST", default=ALLOWED_HOSTS)
]

# CSRF Trusted hosts
CSRF_TRUSTED_ORIGINS = env.list("DJANGO_CSRF_TRUSTED_ORIGINS", default=ALLOWED_HOSTS)
{% endif %}

# Enable {{ cookiecutter.django_media_engine }} storage
DEFAULT_FILE_STORAGE = "{{ cookiecutter.repo_name }}.storages.MediaStorage"
MEDIA_ROOT = env.str("DJANGO_MEDIA_ROOT", default="")
{% if cookiecutter.django_media_engine == "S3" -%}
AWS_STORAGE_BUCKET_NAME = env.str(
    "DJANGO_AWS_STORAGE_BUCKET_NAME", default="{{ cookiecutter.repo_name }}-production"
)
AWS_ACCESS_KEY_ID = env.str("DJANGO_AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = env.str("DJANGO_AWS_SECRET_ACCESS_KEY")
{%- endif %}{% if cookiecutter.django_media_engine == "GCS" -%}
GS_BUCKET_NAME = env.str("DJANGO_GS_BUCKET_NAME", default="{{ cookiecutter.repo_name }}-production")
GS_PROJECT_ID = env.str("DJANGO_GS_PROJECT_ID")

from google.oauth2 import service_account  # NOQA

GS_CREDENTIALS = service_account.Credentials.from_service_account_info(
    json.load(env.str("DJANGO_GS_CREDENTIALS") or "{}"),
){% endif %}
