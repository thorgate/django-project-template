import typing as t

from django.db import models
from django.db.models.functions import Now
from django.utils.translation import gettext_lazy


def determine_max_length(choices: t.Collection[tuple[str, t.Any]]):
    max_length = 0
    for value, _ in choices:
        max_length = max(max_length, len(value))

    return max_length


class BaseModelQueryset(models.QuerySet):
    pass


class BaseModel(models.Model):
    updated_timestamp_field_name: str | None = "updated"
    created_timestamp_field_name: str | None = "created"

    created = models.DateTimeField(
        verbose_name=gettext_lazy("Created timestamp"), db_default=Now(), db_index=True
    )
    updated = models.DateTimeField(
        verbose_name=gettext_lazy("Updated timestamp"), auto_now=True, db_index=True
    )

    objects = BaseModelQueryset.as_manager()

    class Meta:
        abstract = True
        ordering: t.Sequence[str | models.F] = ["-created"]
