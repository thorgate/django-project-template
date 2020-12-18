import os

from django.conf import settings

from celery import Celery


# Set the default Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings.local")

app = Celery("djangoapp")

# Using a string here means the worker don't have to serialize the configuration object to child processes.
app.config_from_object("djangoapp.celery_settings")

# Load task modules from all registered Django app configs.
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)
