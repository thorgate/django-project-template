from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
# - {%- if cookiecutter.frontend_style == WEBAPP %}
from django.views.generic.base import TemplateView
from django.views.i18n import JavaScriptCatalog
# - {% elif  cookiecutter.frontend_style == SPA %}
from django.views.generic.base import RedirectView
# - {% endif %}
# - {%- if cookiecutter.include_wagtail == YES %}
from .views import favicon
# - {% endif %}
from tg_utils.health_check.views import HealthCheckViewMinimal, HealthCheckViewProtected


admin.autodiscover()

urlpatterns = [
    # - {%- if cookiecutter.frontend_style == WEBAPP %}
    path("", include("accounts.urls")),
    path("jsi18n/", JavaScriptCatalog.as_view(), name="javascript-catalog"),
    # - {% elif  cookiecutter.frontend_style == SPA %}
    path("api/", include(f"{settings.DEFAULT_DJANGO_APP}.rest.urls")),
    # - {% endif %}
    path(f"{settings.DJANGO_ADMIN_PATH}/", admin.site.urls),
    *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT),
    *static(settings.STATIC_URL, document_root=settings.STATIC_ROOT),
    path(f"{settings.DJANGO_HEALTH_CHECK_PATH}", HealthCheckViewMinimal.as_view(), name="health-check"),
    path(
        f"{settings.DJANGO_HEALTH_CHECK_PATH}/details",
        HealthCheckViewProtected.as_view(),
        name="health-check-details",
    ),
    # - {%- if cookiecutter.include_wagtail == YES %}
    path(f"{settings.WAGTAIL_ADMIN_PATH}/", include("wagtail.admin.urls")),
    path("documents/", include("wagtail.documents.urls")),
    path("favicon.ico",favicon, name="favicon"),
    path("hijack/", include("hijack.urls")),
    path("", include("wagtail.urls")),
    # - {% else  %}
    path("", TemplateView.as_view(template_name="home.html"), name="home"),
    # - {% endif %}
]

if not settings.DEBUG:
    handler500 = f"{settings.DEFAULT_DJANGO_APP}.views.server_error"
    handler404 = f"{settings.DEFAULT_DJANGO_APP}.views.page_not_found"

if settings.DEBUG:
    try:
        import debug_toolbar

        urlpatterns.insert(1, path("__debug__/", include(debug_toolbar.urls)))
    except ImportError:
        pass

if settings.IS_UNITTEST:  # pragma: no branch

    def failing_view(*args, **kwargs):
        """
        This view is used during unit tests to ensure correct error view is
        used by the application when another view fails.
        """
        raise Exception("Example error") # noqa: TRY002

    urlpatterns.insert(
        1,
        path("test500", failing_view),
    )

# - {%- if cookiecutter.frontend_style == SPA %}


urlpatterns += [
    path(
        "",
        RedirectView.as_view(url=settings.SITE_URL, permanent=False),
        name="app-redirect",
    )
]
# - {% endif %}
