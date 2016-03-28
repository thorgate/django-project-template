from django.conf.urls import url

from accounts.views import UserDetails, AuthenticationView, LogoutView


urlpatterns = [
    url(r'^me$', UserDetails.as_view(), name='api-user-details'),
    url(r'^login$', AuthenticationView.as_view(), name='api-user-login'),
    url(r'^logout$', LogoutView.as_view(), name='api-user-logout'),
]
