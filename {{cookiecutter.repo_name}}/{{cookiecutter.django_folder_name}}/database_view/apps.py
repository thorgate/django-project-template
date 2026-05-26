from django.apps import AppConfig
from django.db.models.signals import post_migrate, pre_migrate


class DatabaseViewConfig(AppConfig):
    name = "database_view"
    verbose_name = "Database View"

    def ready(self):
        # pylint: disable-next=import-outside-toplevel
        from . import models

        pre_migrate.connect(models.pre_migrate)
        post_migrate.connect(models.post_migrate)
