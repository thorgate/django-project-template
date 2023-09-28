import pytest

from channels.testing import WebsocketCommunicator

from web_sockets.consumers import HelloWorldEchoConsumer, Websocket404Handler

@pytest.mark.asyncio
async def test_hello_world_consumer():
    communicator = WebsocketCommunicator(HelloWorldEchoConsumer.as_asgi(), "/ws/hello_world/")
    connected, _ = await communicator.connect()

    assert connected

    response = await communicator.receive_json_from()
    assert response == {"message": "Hello world from WS!"}

    await communicator.send_json_to({"message": "Test message"})

    response = await communicator.receive_json_from()
    assert response == {"message": "Test message"}

    await communicator.disconnect()

@pytest.mark.asyncio
async def test_404_handler_consumer():
    communicator = WebsocketCommunicator(Websocket404Handler.as_asgi(), "/ws/some_invalid_path/")
    connected, _ = await communicator.connect()

    assert not connected

