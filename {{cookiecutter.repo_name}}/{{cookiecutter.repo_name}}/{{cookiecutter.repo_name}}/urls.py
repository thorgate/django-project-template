from django.conf import settings
{%- if cookiecutter.include_cms == "yes" %}
from django.conf.urls.i18n import i18n_patterns
{%- endif %}
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic.base import RedirectView


admin.autodiscover()

urlpatterns = {% if cookiecutter.include_cms == "yes" %}i18n_patterns({% else %}[{% endif %}
    path("api/", include("{{cookiecutter.repo_name}}.rest.urls")),
    path("{{cookiecutter.django_admin_path}}/", admin.site.urls),
    {%- if cookiecutter.include_cms == "yes" %}
    path("filer/", include("filer.urls")),
    # CMS urls should be handled last to avoid possible conflicts
    path("cms/", include("cms.urls")),
    {%- endif %}
{% if cookiecutter.include_cms == "yes" %}){% else %}]{% endif %}

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if not settings.DEBUG:
    handler500 = "{{cookiecutter.repo_name}}.views.server_error"
    handler404 = "{{cookiecutter.repo_name}}.views.page_not_found"

if settings.DEBUG:
    try:
        import debug_toolbar

        urlpatterns += [path("__debug__/", include(debug_toolbar.urls))]
    except ImportError:
        pass


urlpatterns += [
    path(
        "",
        RedirectView.as_view(url=settings.SITE_URL, permanent=False),
        name="app-redirect",
    )
]
