from django.conf import settings
from django.conf.urls import include, url{%- if cookiecutter.include_cms == 'yes' %}
from django.conf.urls.i18n import i18n_patterns
{%- endif %}
from django.conf.urls.static import static
from django.contrib import admin
{% if cookiecutter.project_type == 'spa' %}from django.http import HttpResponse, HttpResponseRedirect{% else %}from django.views.generic.base import TemplateView{% endif %}


admin.autodiscover()

urlpatterns = {% if cookiecutter.include_cms == 'yes' %}i18n_patterns({% else %}[{% endif %}
    {% if cookiecutter.project_type == 'spa' %}url(r'^api/v1/', include('{{ cookiecutter.repo_name }}.api_urls')),
    {%- else %}url(r'', include('accounts.urls')),
    url(r'^$', TemplateView.as_view(template_name='home.html'), name='home'),{%- endif %}

    url(r'^adminpanel/', include(admin.site.urls)),
    {%- if cookiecutter.include_cms == 'yes' %}
    url(r'^filer/', include('filer.urls')),
    # CMS urls should be handled last to avoid possible conflicts
    url(r'cms/^', include('cms.urls')),
    {%- endif %}
{% if cookiecutter.include_cms == 'yes' %}){% else %}]{% endif %}

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if not settings.DEBUG:
    handler500 = '{{cookiecutter.repo_name}}.views.server_error'
    handler404 = '{{cookiecutter.repo_name}}.views.page_not_found'

{%- if cookiecutter.project_type == 'spa' %}

if settings.DEBUG:
    import logging

    if not isinstance(settings.WEBPACK_PORT, int):
        raise AssertionError('settings.WEBPACK_PORT is not an integer: {}'.format(settings.WEBPACK_PORT))

    if isinstance(settings.EXPRESS_PORT, str):
        logging.warning('Using nginx proxy locally')

    elif isinstance(settings.EXPRESS_PORT, int):
        import time
        from urllib3.exceptions import MaxRetryError
        from revproxy.views import ProxyView

        class LocalHelper(ProxyView):
            upstream = 'http://localhost:{}'.format(settings.EXPRESS_PORT)
            error_message = 'Express proxied connection failed, please reload the page to try again.'

            def dispatch(self, request, path):
                if path == 'favicon.ico':
                    return HttpResponse('')

                if settings.APPEND_SLASH:
                    if path and path[-1] != '/' and 'public' not in path:
                        if path[0] != '/':
                            path = '/%s' % path

                        return HttpResponseRedirect('%s/' % path)

                try:
                    return super().dispatch(request, path)

                except MaxRetryError:
                    try:
                        # Try once more, but sleep on it first
                        time.sleep(1)
                        return super().dispatch(request, path)

                    except MaxRetryError:
                        try:
                            # Try once more, but sleep on it first
                            time.sleep(1)
                            return super().dispatch(request, path)

                        except:
                            return HttpResponse(error_message)

                except Exception as e:
                    logging.error('LocalHelper exception %s', e)
                    return HttpResponse(error_message)

        urlpatterns += [
            url(r'^(?P<path>.*)$', LocalHelper.as_view(), name='home'),
        ]
    else:
        raise AssertionError('settings.EXPRESS_PORT is not an integer or a string: {}'.format(settings.EXPRESS_PORT))
{%- endif %}
