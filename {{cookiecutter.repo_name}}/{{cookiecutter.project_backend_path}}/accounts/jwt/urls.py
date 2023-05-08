from django.urls import re_path

from rest_framework_simplejwt.views import (
    token_obtain_pair,
    token_refresh,
    token_verify,
)


urlpatterns = [
    re_path(r"^token/$", token_obtain_pair, name="token-obtain"),
    re_path(r"^token/refresh/$", token_refresh, name="token-refresh"),
    re_path(r"^token/verify/$", token_verify, name="token-verify"),
]
