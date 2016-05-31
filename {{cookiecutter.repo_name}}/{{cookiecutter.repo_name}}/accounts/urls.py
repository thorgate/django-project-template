from django.conf.urls import url
from django.contrib.auth.views import logout_then_login, password_reset, password_reset_done, password_reset_confirm, \
    password_reset_complete

from accounts.forms import PasswordResetForm, SetPasswordForm
from accounts.views import login


urlpatterns = [
    url(r'^login/$', login, name='login'),
    url(r'^logout/$', logout_then_login, name='logout'),

    # Password reset
    url(r'^account/password_reset/$', password_reset, name='password_reset',
        kwargs={'password_reset_form': PasswordResetForm}),
    url(r'^account/password_reset/done/$', password_reset_done, name='password_reset_done',),
    url(r'^account/reset/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        password_reset_confirm, name='password_reset_confirm', kwargs={'set_password_form': SetPasswordForm}),
    url(r'^account/reset/done/$', password_reset_complete, name='password_reset_complete'),
]
