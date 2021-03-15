from django.urls import re_path

from tg_react.api.accounts.views import (
    AuthenticationView,
    ForgotPassword,
    LogoutView,
    RestorePassword,
    SetLanguageView,
    SignUpView,
    UserDetails,
)


urlpatterns = [
    re_path(r"^me$", UserDetails.as_view(), name="api-user-details"),
    re_path(r"^login$", AuthenticationView.as_view(), name="api-user-login"),
    re_path(r"^lang$", SetLanguageView.as_view(), name="api-user-language"),
    re_path(r"^logout$", LogoutView.as_view(), name="api-user-logout"),
    # signup
    re_path(r"^signup$", SignUpView.as_view(), name="api-signup"),
    # password recovery
    re_path(r"^forgot_password$", ForgotPassword.as_view(), name="api-forgot-password"),
    re_path(
        r"^forgot_password/token$",
        RestorePassword.as_view(),
        name="api-forgot-password-token",
    ),
]
