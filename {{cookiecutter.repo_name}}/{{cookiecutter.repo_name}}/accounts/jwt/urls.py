from django.conf.urls import url

from rest_framework_simplejwt.views import (
    token_obtain_pair,
    token_refresh,
    token_verify,
)


urlpatterns = [
    url(r"^token/$", token_obtain_pair, name="token-obtain"),
    url(r"^token/refresh/$", token_refresh, name="token-refresh"),
    url(r"^token/verify/$", token_verify, name="token-verify"),
]
