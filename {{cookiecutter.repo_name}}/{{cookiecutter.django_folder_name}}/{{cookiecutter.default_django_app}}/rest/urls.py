from django.urls import include, path

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from accounts.rest.views import UserViewSet
from {{cookiecutter.default_django_app}}.rest.core.routers import BaseRouter


router = BaseRouter()
router.register(
    r"user",
    UserViewSet,
    basename="user",
)


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
#     path('some_app/', include('some_app.rest.urls')),
urlpatterns = [
    path("auth/", include("accounts.jwt.urls")),
    path("user/", include("accounts.rest.urls")),
    # Swagger OpenAPI Schema
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "schema/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"
    ),
    path("", include(router.urls)),
]
