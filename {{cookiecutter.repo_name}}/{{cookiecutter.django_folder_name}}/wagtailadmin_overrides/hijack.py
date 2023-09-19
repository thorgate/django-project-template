from django.conf import settings
from hijack.permissions import superusers_only


def can_hijack(hijacker, hijacked):
    if settings.HIJACK_DISABLED:
        return False
    return superusers_only(hijacker=hijacker, hijacked=hijacked)
