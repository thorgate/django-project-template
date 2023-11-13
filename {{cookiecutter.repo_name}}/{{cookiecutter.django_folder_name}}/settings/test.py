from settings.local import *


IS_UNITTEST = True

SEND_EMAILS = False

DATABASES["default"]["TEST"] = {
    "NAME": f"{PROJECT_NAME}_test",
}

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# - {%- if cookiecutter.frontend_style == SPA %}

# Use session in tests to make api login easier
REST_FRAMEWORK["DEFAULT_AUTHENTICATION_CLASSES"] = (
    "rest_framework.authentication.SessionAuthentication",
)
# - {% endif %}
