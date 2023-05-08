import json

from django.conf import settings
from django.core.management.base import BaseCommand


# package might not be installed
try:
    import environ
except ImportError:
    environ = None


class SettingsEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, set):
            return list(o)

        if environ and isinstance(o, environ.Path):
            return str(o)

        # Let the base class default method raise the TypeError
        return json.JSONEncoder.default(self, o)


class Command(BaseCommand):
    help = "Returns settings dumped as JSON"

    def add_arguments(self, parser):
        parser.add_argument("--keys", nargs="+", required=False)

    def handle(self, *args, **options):
        settings_as_dict = (
            settings._wrapped.__dict__  # type: ignore  # pylint: disable=protected-access
        )
        if options["keys"]:
            settings_as_dict = {
                k: v for k, v in settings_as_dict.items() if k in options["keys"]
            }
        self.stdout.write(json.dumps(settings_as_dict, indent=2, cls=SettingsEncoder))
