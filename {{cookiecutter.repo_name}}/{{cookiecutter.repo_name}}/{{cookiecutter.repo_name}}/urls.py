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

from tg_utils.health_check.views import HealthCheckViewMinimal, HealthCheckViewProtected


admin.autodiscover()

urlpatterns = [
    # - {%- if cookiecutter.frontend_style == WEBAPP %}
    path("", include("accounts.urls")),
    path("", TemplateView.as_view(template_name="home.html"), name="home"),
    path("jsi18n/", JavaScriptCatalog.as_view(), name="javascript-catalog"),
    # - {% elif  cookiecutter.frontend_style == SPA %}
    path("api/", include("{{cookiecutter.repo_name}}.rest.urls")),
    # - {% endif %}
    path("{{cookiecutter.django_admin_path}}/", admin.site.urls),
    *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT),
    *static(settings.STATIC_URL, document_root=settings.STATIC_ROOT),
    path("{{ cookiecutter.django_health_check_path }}", HealthCheckViewMinimal.as_view(), name="health-check"),
    path(
        "{{ cookiecutter.django_health_check_path }}/details",
        HealthCheckViewProtected.as_view(),
        name="health-check-details",
    ),
]

if not settings.DEBUG:
    handler500 = "{{cookiecutter.repo_name}}.views.server_error"
    handler404 = "{{cookiecutter.repo_name}}.views.page_not_found"

if settings.DEBUG:
    try:
        import debug_toolbar

        urlpatterns += [path("__debug__/", include(debug_toolbar.urls))]
    except ImportError:
        pass

# - {%- if cookiecutter.frontend_style == SPA %}


urlpatterns += [
    path(
        "",
        RedirectView.as_view(url=settings.SITE_URL, permanent=False),
        name="app-redirect",
    )
]
# - {% endif %}
