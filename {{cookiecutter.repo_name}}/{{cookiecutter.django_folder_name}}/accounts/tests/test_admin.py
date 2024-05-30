from urllib.parse import urlencode

from django.test import Client
from django.urls import reverse

import pytest

from ..models import User


@pytest.mark.django_db()
def test_admin_create_user(client, superuser):
    client.force_login(superuser)

    random_pass = User.objects.make_random_password(16)

    response = client.post(
        reverse(f"admin:{User._meta.app_label}_{User._meta.model_name}_add"),
        data=urlencode(
            {
                "email": "t@t.sdf",
                "password1": random_pass,
                "password2": random_pass,
            }
        ),
        content_type="application/x-www-form-urlencoded",
    )
    assert not response.context or not response.context["errors"]
    assert response.status_code == 302

    assert User.objects.filter(email="t@t.sdf").exists()


@pytest.mark.django_db()
def test_admin_change_user(superuser):
    client = Client(enforce_csrf_checks=True)
    client.force_login(superuser)

    assert superuser.name != "tester"

    url = reverse(
        f"admin:{User._meta.app_label}_{User._meta.model_name}_change",
        args=(superuser.pk, ),
    )

    # This request gets the csrf token for following request
    response = client.get(url)
    assert response.status_code == 200

    response = client.post(
        url,
        format="json",
        data={
            "name": "tester",
            "email": superuser.email,
            "csrfmiddlewaretoken": str(response.context["csrf_token"]),
            "is_active": "on",
            "created_0": superuser.created.strftime("%Y-%m-%d"),
            "created_1": superuser.created.strftime("%H:%M"),
            "last_login_0": "",
            "last_login_1": "",
            "delete_at_0": "",
            "delete_at_1": "",
        },
    )
    assert not response.context or not response.context["errors"]
    assert response.status_code == 302

    superuser.refresh_from_db()
    assert superuser.name == "tester"
