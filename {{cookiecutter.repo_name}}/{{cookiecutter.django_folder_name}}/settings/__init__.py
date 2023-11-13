import os
import sys


if os.environ.get("DJANGO_PRODUCTION_MODE"):
    from settings.cloud import *
else:
    # When not using production mode try to load local.py
    try:
        from settings.local import *
    except ImportError:
        sys.stderr.write(
            "Couldn't import settings.local, have you created it from settings/local.py.example ?\n"
        )
        sys.exit(1)
