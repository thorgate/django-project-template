from django.conf.urls import url

from tg_react.api.accounts.views import (AuthenticationView, ForgotPassword, LogoutView, RestorePassword,
                                         SetLanguageView, SignUpView, UserDetails)


urlpatterns = [
    url(r'^me$', UserDetails.as_view(), name='api-user-details'),
    url(r'^login$', AuthenticationView.as_view(), name='api-user-login'),
    url(r'^lang$', SetLanguageView.as_view(), name='api-user-language'),
    url(r'^logout$', LogoutView.as_view(), name='api-user-logout'),
    # signup
    url(r'^signup$', SignUpView.as_view(), name='api-signup'),
    # password recovery
    url(r'^forgot_password$', ForgotPassword.as_view(), name='api-forgot-password'),
    url(r'^forgot_password/token$', RestorePassword.as_view(), name='api-forgot-password-token'),
]
