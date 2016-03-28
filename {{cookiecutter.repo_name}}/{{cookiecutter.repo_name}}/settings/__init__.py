import sys

try:
    from settings.local import *
except ImportError:
    sys.stderr.write("Couldn't import settings.local, have you created it from settings/local.py.example ?\n")
    sys.exit(1)
