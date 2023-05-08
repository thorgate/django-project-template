from unittest.mock import patch

from django.test import Client

import pytest

from ..views import page_not_found, server_error


@pytest.fixture
def err_client():
    return Client(raise_request_exception=False)


def test_404_view_used(client):
    response = client.get("/test_page")
    assert response.status_code == 404
    assert "404.html" in [template.name for template in response.templates]


def test_404_view_unit(rf):
    request = rf.get("/test_page")
    response = page_not_found(
        request, exception=None, template_name="bad-template-file.html"
    )

    assert response.status_code == 404
    assert b"Not Found" in response.content


def test_server_error(err_client):
    with patch("{{ cookiecutter.repo_name }}.views.last_event_id", return_value=40):
        response = err_client.get("/test500")

        assert response.status_code == 500
        assert "500.html" in [template.name for template in response.templates]
        assert b"Fault code: #40" in response.content


def test_server_error_fallback_template(rf):
    request = rf.get("/")
    response = server_error(request, "non-existing-template.html")

    assert response.status_code == 500
    assert response.content == b"<h1>Server Error (500)</h1>"
    assert response["Content-type"] == "text/html"

    with patch("{{ cookiecutter.repo_name }}.views.last_event_id", return_value=40):
        response = server_error(request, "non-existing-template.html")

        assert response.status_code == 500
        assert response.content == (
            b"<h1>Server Error (500)</h1>\n<p>Fault code: #40</p>"
        )
        assert response["Content-type"] == "text/html"


def test_server_error_json(err_client):
    with patch("{{ cookiecutter.repo_name }}.views.last_event_id", return_value=40):
        response = err_client.get("/test500", HTTP_ACCEPT="application/json")

        assert response.status_code == 500
        assert response.templates == []
        assert response.json() == {
            "sentry": 40,
            "error": {
                "title": "Something went wrong",
            },
        }
