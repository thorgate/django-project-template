from datetime import timedelta

from django.db import models

from wagtail.admin.panels import FieldPanel
from wagtail.contrib.settings.models import BaseGenericSetting
from wagtail.contrib.settings.registry import register_setting


@register_setting
class BrandSettings(BaseGenericSetting):
    wagtail_admin_logo = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )

    panels = [
        FieldPanel("wagtail_admin_logo"),
    ]

