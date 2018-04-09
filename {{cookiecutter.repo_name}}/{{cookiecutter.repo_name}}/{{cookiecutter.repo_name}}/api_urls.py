from django.conf.urls import include, url

from tg_react.routers import SuffixlessRouter

from .views import api_ping


router = SuffixlessRouter(trailing_slash=False)

urlpatterns = [
    url(r'^user/', include('accounts.api_urls')),
    url(r'^ping', api_ping, name='api-ping'),
    url(r'^', include(router.urls)),
]
