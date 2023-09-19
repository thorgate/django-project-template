from contextlib import contextmanager

from django.conf import settings
from django.test import Client
from django.urls import reverse

from splinter import Browser


def add_browser_session_cookie(browser: Browser, source: Client):
    session_cookie = source.cookies.get(settings.SESSION_COOKIE_NAME, None)

    if session_cookie is None:
        return

    kwargs = dict(path=session_cookie["path"], domain=session_cookie["domain"])

    if session_cookie["expires"] is not None:
        kwargs["expiry"] = session_cookie["expires"]
    if session_cookie["secure"] is not None:
        kwargs["secure"] = session_cookie["secure"]

    browser.cookies.add(
        {
            settings.SESSION_COOKIE_NAME: session_cookie.value,
        },
        **kwargs,
    )


@contextmanager
def using_admin_dashboard(
    admin_user, server_url: str, browser: Browser, django_client: Client
):
    browser.visit(f"{server_url}/adminpanel/login/")

    django_client.force_login(admin_user)

    browser.cookies.delete_all()

    add_browser_session_cookie(browser, django_client)

    browser.visit(f"{server_url}/adminpanel/")

    yield

    browser.visit(f"{server_url}/adminpanel/logout/")
    assert "Sign in" in browser.title


@contextmanager
def using_client_app(user, server_url: str, browser: Browser, django_client: Client):
    browser.visit(f"{server_url}")

    django_client.force_login(user)

    browser.cookies.delete_all()

    add_browser_session_cookie(browser, django_client)

    yield

    browser.visit(f"{server_url}{reverse('logout')}")
    assert "Sign In" in browser.title


@contextmanager
def screenshot_on_failure(browser: Browser, tag=""):  # pragma: nocover
    """Internal helper to make a screenshot of the webpage on the test failure"""
    try:
        yield
    except Exception as e:
        browser.screenshot(f"/files/media/test{tag}")
        raise e from e
