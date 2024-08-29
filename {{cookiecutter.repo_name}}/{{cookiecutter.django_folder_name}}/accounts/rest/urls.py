from django.urls import re_path

from accounts.rest import views


urlpatterns = [
    re_path(r"^me$", views.UserDetails.as_view(), name="api-user-details"),
    # signup
    re_path(r"^signup$", views.SignUpView.as_view(), name="api-signup"),
    # password recovery
    re_path(r"^forgot_password$", views.ForgotPassword.as_view(), name="api-forgot-password"),
    re_path(
        r"^forgot_password/token$",
        views.RestorePassword.as_view(),
        name="api-forgot-password-token",
    ),
]
