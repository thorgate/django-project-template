import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils import timezone

from backend.celery import app
from web_sockets.consumers import EventsNotifier, HelloWorldEchoConsumer



logger = logging.getLogger(__name__)


@app.task
def heartbeat():
    logger.info(
        "This is a default Celery test task which send a heartbeat every 10 seconds"
    )
    now = timezone.now()

    async_to_sync(get_channel_layer().group_send)(
        EventsNotifier.group_name,
        {"type": EventsNotifier.event_type, "message": f"heartbeat {now:%X} sse"},
    )
    async_to_sync(get_channel_layer().group_send)(
        HelloWorldEchoConsumer.group_name,
        {"type": HelloWorldEchoConsumer.event_type, "message": f"heartbeat {now:%X} ws"},
    )
