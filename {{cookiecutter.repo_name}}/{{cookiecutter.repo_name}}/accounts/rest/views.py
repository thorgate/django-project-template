from rest_framework.settings import api_settings
from tg_react.api.accounts.views import UserDetails as TgReactUserDetails


class UserDetails(TgReactUserDetails):
    authentication_classes = api_settings.DEFAULT_AUTHENTICATION_CLASSES
