import importlib

from django.conf import settings

from wagtail.search.management.commands import update_index


logger = __import__("logging").getLogger(__name__)

try:
    module = importlib.import_module(
        f"{getattr(settings,'PROJECT_BACKEND_MODULE',settings.PROJECT_NAME)}.celery"
    )
    app = module.app
except ImportError:
    logger.error("Celery app not found installed")
    app = None

if app:

    @app.task
    def update_wagtail_search_index():
        update_index.Command().handle(backend_name=None, chunk_size=1000, verbosity=0)
