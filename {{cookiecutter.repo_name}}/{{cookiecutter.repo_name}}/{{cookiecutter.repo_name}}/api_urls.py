from django.conf.urls import include, url


urlpatterns = [
    url(r'^user/', include('accounts.api_urls')),

    # Catch all bad api urls here
    url(r'^.*$', 'django.views.defaults.page_not_found', name='api-noop'),
]
