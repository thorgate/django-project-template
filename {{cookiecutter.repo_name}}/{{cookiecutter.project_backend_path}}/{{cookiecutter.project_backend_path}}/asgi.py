"""
ASGI config for {{cookiecutter.project_title}} project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/dev/howto/deployment/asgi/
"""
import os


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings")

# pylint: disable=wrong-import-position
from django.core.asgi import get_asgi_application


application = get_asgi_application()
