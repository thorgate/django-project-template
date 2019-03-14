from django.conf.urls import url

from tg_react.api.accounts.views import ForgotPassword, RestorePassword

from accounts.rest import views


urlpatterns = [
    url(r'^me$', views.UserDetails.as_view(), name='api-user-details'),

    # signup
    url(r'^signup$', views.SignUpView.as_view(), name='api-signup'),

    # password recovery
    url(r'^forgot_password$', ForgotPassword.as_view(), name='api-forgot-password'),
    url(r'^forgot_password/token$', RestorePassword.as_view(), name='api-forgot-password-token'),
]
