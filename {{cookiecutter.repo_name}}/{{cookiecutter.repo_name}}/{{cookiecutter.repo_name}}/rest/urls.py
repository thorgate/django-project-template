from django.conf.urls import include, url


# Adding extra urls
#
# Create a router inside correct app (separation of concern)
#
# For example `some_app/rest/urls.py`:
#     # This is example router, use which ever is appropriate
#     from tg_react.routers import SuffixlessRouter
#
#     router = SuffixlessRouter(trailing_slash=False)
#
#     router.register(r'viewset/1', FirstViewSet)
#     router.register(r'viewset/2', SecondViewSet)
#
#     urlpatterns = router.urls
#
# And finally add include here:
#     url(r'^some_app/', include('some_app.rest.urls')),
urlpatterns = [
    url(r'^auth/', include('accounts.jwt.urls')),
    url(r'^user/', include('accounts.rest.urls')),
]
