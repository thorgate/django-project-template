import json

from channels.exceptions import StopConsumer
from channels.generic.http import AsyncHttpConsumer
from channels.generic.websocket import JsonWebsocketConsumer, WebsocketConsumer


class Websocket404Handler(WebsocketConsumer):
    def connect(self):
        # Close connection without accepting it - 4404 refers to 404
        self.close(4404)


class HelloWorldEchoConsumer(JsonWebsocketConsumer):
    group_name = "hello_world"
    groups = [group_name]
    event_type = "hello_world"

    def connect(self):
        self.accept()
        self.send_json({"message": "Hello world from WS!"})
    def receive_json(self, content, **kwargs):
        # Just echo the content back
        self.send_json(content)

    def hello_world(self, event):
        self.send_json({"message": event["message"]})


class SseConsumer(AsyncHttpConsumer):
    group_name: str

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.keepalive = True

    async def handle(self, body):
        await self.send_headers(
            headers=[
                (b"Cache-Control", b"no-cache"),
                (b"Content-Type", b"text/event-stream"),
                (b"Transfer-Encoding", b"chunked"),
                (b"X-Accel-Buffering", b"no"),
                (b"Access-Control-Allow-Origin", b"*"),
            ]
        )

        await self.channel_layer.group_add(self.group_name, self.channel_name)

    async def send_body(self, body, *, more_body=False):
        if more_body:
            self.keepalive = True
        assert isinstance(body, bytes), "Body is not bytes"
        await self.send(
            {"type": "http.response.body", "body": body, "more_body": more_body}
        )

    async def http_request(self, message):
        if "body" in message:
            self.body.append(message["body"])
        if not message.get("more_body"):
            try:
                await self.handle(b"".join(self.body))
            finally:
                if not self.keepalive:
                    await self.disconnect()
                    raise StopConsumer()


class EventsNotifier(SseConsumer):
    group_name = "sse_group"
    event_type = "server_sent_event"

    async def server_sent_event(self, event):
        # magic function which is called based on the 'type' value in the message

        payload = f"data: {json.dumps(event['message'])}\n\n"
        more_body = event.get("more_body", True)
        await self.send_body(payload.encode("utf-8"), more_body=more_body)
