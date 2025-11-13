import typing as t

from django.conf import settings
from django.contrib import admin
from django.db import models

from django_json_widget.widgets import JSONEditorWidget


admin.site.site_url = settings.SITE_URL


if t.TYPE_CHECKING:
    _AdminMixinBase = admin.ModelAdmin  # pragma: no cover
else:
    _AdminMixinBase = object


class BaseAdminMixin(_AdminMixinBase):
    formfield_overrides = {
        models.JSONField: {"widget": JSONEditorWidget},
    }

    def get_readonly_fields(self, request, obj=None):
        readonly_fields = list(super().get_readonly_fields(request, obj))
        for field in [
            "created",
            "updated",
        ]:
            if field not in readonly_fields:
                readonly_fields.append(field)

        return readonly_fields

    def get_list_display(self, request):
        return [*super().get_list_display(request), "created", "updated"]


class BaseModelAdmin(BaseAdminMixin, admin.ModelAdmin):
    pass
