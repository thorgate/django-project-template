from django.contrib.auth.views import login as django_login

from accounts.forms import LoginForm


def login(request):
    response = django_login(request, template_name='accounts/login.html', authentication_form=LoginForm)

    return response
