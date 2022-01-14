from django.contrib.auth import views
from django.urls import path

from accounts.forms import LoginForm, PasswordResetForm, SetPasswordForm


urlpatterns = [
    path(
        "login/",
        views.LoginView.as_view(
            template_name="accounts/login.html", authentication_form=LoginForm
        ),
        name="login",
    ),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    # Password reset
    path(
        "account/password_reset/",
        views.PasswordResetView.as_view(form_class=PasswordResetForm),
        name="password_reset",
    ),
    path(
        "account/password_reset/done/",
        views.PasswordResetDoneView.as_view(),
        name="password_reset_done",
    ),
    path(
        r"account/reset/<uidb64>/<token>/",
        views.PasswordResetConfirmView.as_view(form_class=SetPasswordForm),
        name="password_reset_confirm",
    ),
    path(
        "account/reset/done/",
        views.PasswordResetCompleteView.as_view(),
        name="password_reset_complete",
    ),
]
