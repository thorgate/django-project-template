from django.conf import settings
from django.contrib import admin
from django.utils.translation import gettext as _


# fmt: off
admin.site.site_url = settings.SITE_URL
if settings.ENVIRONMENT in ["TEST", "DEV"]:
    admin.site.site_title = (
        "{{cookiecutter.project_title}} " + _("Site Admin") + f" {settings.ENVIRONMENT.title()}"
    )
    admin.site.site_header = (
        "{{cookiecutter.project_title}} " + _("Site Administration") + f" {settings.ENVIRONMENT.title()}"
    )

elif settings.ENVIRONMENT == "LIVE":
    admin.site.site_title = "{{cookiecutter.project_title}} " + _("Site Admin")
    admin.site.site_header = "{{cookiecutter.project_title}} " + _("Site Administration")
# fmt: on
