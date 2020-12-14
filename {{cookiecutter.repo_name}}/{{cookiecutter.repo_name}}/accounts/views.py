from django.contrib.auth.views import LoginView

from accounts.forms import LoginForm


def login(request):
    return LoginView.as_view(
        template_name="accounts/login.html", authentication_form=LoginForm
    )(request)
