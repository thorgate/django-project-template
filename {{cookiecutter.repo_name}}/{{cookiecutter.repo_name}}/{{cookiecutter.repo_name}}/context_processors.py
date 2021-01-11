from django.conf import settings


def env(request):
    return {
        "ENVIRONMENT": settings.ENVIRONMENT,
    }
