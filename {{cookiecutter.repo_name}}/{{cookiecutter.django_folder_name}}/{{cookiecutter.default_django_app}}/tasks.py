import logging

from django.contrib.sessions.management.commands import clearsessions
from django.db import connection

from {{cookiecutter.default_django_app}}.celery import app


logger = logging.getLogger(__name__)


@app.task
def default_task():
    logger.info("This is a default Celery test task (no-op)")


@app.task
def cleanup_old_sessions():
    clearsessions.Command().handle()
    cursor = connection.cursor()
    cursor.execute("VACUUM ANALYZE django_session")
