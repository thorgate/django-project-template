from django.urls import path, re_path

from web_sockets.consumers import HelloWorldEchoConsumer, Websocket404Handler


websocket_urlpatterns = [
    path("ws/hello_world/", HelloWorldEchoConsumer.as_asgi()),
    re_path(r"^.*", Websocket404Handler.as_asgi()),
]
