import logging

from django.conf import settings
from django.urls import reverse
from django.utils.translation import gettext as _

from tg_utils.email import send_email


logger = logging.getLogger("accounts.emails")


def send_password_reset(user, uid, token):
    try:
        email_subject = _("{{cookiecutter.project_title}} password reset")
        path = reverse("password_reset_confirm", kwargs={"uidb64": uid, "token": token})
        confirm_reset_url = f"{settings.SITE_URL}{path}"

        return send_email(
            user.email,
            email_subject,
            "emails/password_reset.html",
            {"user": user, "confirm_reset_url": confirm_reset_url},
        )
    except Exception:
        logger.exception("Couldn't send password reset to %s (%d)", user.email, user.id)
        return None
