from django import template
from django.core.files.storage import get_storage_class
from django.template.defaultfilters import stringfilter


media_storage = get_storage_class()()

register = template.Library()


@register.filter
@stringfilter
def file_url(file: str):
    return media_storage.url(file)
