"""
ASGI entrypoint. Configures Django and then runs the application
defined in the ASGI_APPLICATION setting.
"""

import os

import django
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from django.urls import path, re_path


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings")

django.setup()
# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

# pylint: disable=wrong-import-position
from backend.routing import websocket_urlpatterns  # noqa: E402
from web_sockets.consumers import EventsNotifier


# Refer to https://channels.readthedocs.io/en/latest/topics/routing.html for more details
application = ProtocolTypeRouter(
    {
        "http": URLRouter(
            [
                path("sse/events/", EventsNotifier.as_asgi()),
                re_path(r"", django_asgi_app),  # type: ignore[arg-type]
            ]
        ),
        "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
    }
)
