import json

from django.conf import settings
from django.core.management.base import BaseCommand


# package might not be installed
try:
    import environ
except ImportError:
    environ = None


class SettingsEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)

        if environ and isinstance(obj, environ.Path):
            return str(obj)

        # Let the base class default method raise the TypeError
        return json.JSONEncoder.default(self, obj)


class Command(BaseCommand):
    help = "Returns settings dumped as JSON"

    def add_arguments(self, parser):
        parser.add_argument("--keys", nargs="+", required=False)

    def handle(self, *args, **options):
        settings_as_dict = settings._wrapped.__dict__
        if options["keys"]:
            settings_as_dict = {
                k: v for k, v in settings_as_dict.items() if k in options["keys"]
            }
        self.stdout.write(json.dumps(settings_as_dict, indent=2, cls=SettingsEncoder))
