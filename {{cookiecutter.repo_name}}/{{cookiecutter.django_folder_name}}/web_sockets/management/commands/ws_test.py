import asyncio

from channels.layers import get_channel_layer
from django.core.management.base import BaseCommand

from web_sockets.consumers import EventsNotifier, HelloWorldEchoConsumer


class Command(BaseCommand):
    help = ""

    async def send_hello(self):
        await get_channel_layer().group_send(
            HelloWorldEchoConsumer.group_name,
            {
                "type": HelloWorldEchoConsumer.event_type,
                "message": "hello world from django via WS!",
            },
        )
        await get_channel_layer().group_send(
            EventsNotifier.group_name,
            {
                "type": EventsNotifier.event_type,
                "message": "hello world from django via SSE!",
            },
        )

    def handle(self, *args, **options):
        loop = asyncio.get_event_loop()
        loop.run_until_complete(self.send_hello())
        self.stdout.write(self.style.SUCCESS("Done"))
