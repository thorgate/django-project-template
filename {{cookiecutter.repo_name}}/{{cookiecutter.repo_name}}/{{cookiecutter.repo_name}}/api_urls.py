from django.conf.urls import include, url

from tg_react.routers import SuffixlessRouter


router = SuffixlessRouter(trailing_slash=False)

urlpatterns = [
    url(r'^user/', include('accounts.api_urls')),
    url(r'^', include(router.urls)),
]
