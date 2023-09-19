from django import template
from django.db import models

from wagtail.log_actions import registry as log_registry


register = template.Library()


@register.simple_tag
def the_latest_log_entry(instance: models.Model):
    return log_registry.get_logs_for_instance(instance).first()


@register.simple_tag
def log_entries(instance: models.Model):
    return log_registry.get_logs_for_instance(instance).all()
