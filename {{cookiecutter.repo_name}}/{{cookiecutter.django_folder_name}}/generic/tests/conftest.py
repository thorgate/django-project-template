import pytest

from decorator import contextmanager


@pytest.fixture
def screenshot_on_failure(request, browser):
    """
    FIXME: Maybe we can get it working directly by just including the fixture
    """

    @contextmanager
    def _screenshot_on_failure():
        try:
            yield
        except Exception as e:
            browser.screenshot(f"/files/media/test-screen-{request.node.name}")
            raise e from e

    return _screenshot_on_failure
