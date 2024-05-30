import re
import typing as t

from django.db import models
from django.db.models import Case, F, When
from django.utils.translation import gettext_lazy

import django_filters
from djangorestframework_camel_case.util import (
    camel_to_underscore,
    camelize_re,
    underscore_to_camel,
)


class PrimaryKeyInFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    pass


class BaseFilterSet(django_filters.FilterSet):
    search_fields: t.Collection[str] = []
    sorting_fields: t.Collection[str] = []
    extra_sort = ["id"]
    include_id_in = False

    status_field_name = ""
    status_choices_name = ""

    disable_sort = False
    SORT_ASC = "asc"
    SORT_DESC = "desc"

    search = django_filters.CharFilter(
        method="filter_search",
        help_text=gettext_lazy("Search by all supported text fields"),
    )

    @classmethod
    def filter_search(cls, queryset, name, value):
        queryset_filter: models.Q | None = None
        for field in cls.search_fields:
            queryset_filter_bit = models.Q(
                **{
                    f"{field}__icontains": value,
                }
            )
            if queryset_filter is None:
                queryset_filter = queryset_filter_bit
            else:
                queryset_filter = queryset_filter | queryset_filter_bit

        if not queryset_filter:
            return queryset

        return queryset.filter(queryset_filter)

    @classmethod
    def get_sorting_choices(cls):
        if not cls._meta.model:
            return []

        if cls.disable_sort:
            return []

        sorting_choices = []
        if cls._meta.model.created_timestamp_field_name is not None:
            sorting_choices += [
                ("creationTimeAsc", gettext_lazy("By creation time, ascending")),
                ("creationTimeDesc", gettext_lazy("By creation time, descending")),
            ]

        if cls._meta.model.updated_timestamp_field_name is not None:
            sorting_choices += [
                (
                    "lastModificationTimeAsc",
                    gettext_lazy("By last modification time, ascending"),
                ),
                (
                    "lastModificationTimeDesc",
                    gettext_lazy("By last modification time, descending"),
                ),
            ]

        if cls.sorting_fields:
            for field_name in cls.sorting_fields:
                camel_field_name = (
                    re.sub(camelize_re, underscore_to_camel, field_name)
                    if "_" in field_name
                    else field_name
                )
                sorting_choices += [
                    (
                        f"{camel_field_name}Asc",
                        gettext_lazy("By {camel_field_name}, ascending").format(
                            camel_field_name=camel_field_name
                        ),
                    ),
                    (
                        f"{camel_field_name}Desc",
                        gettext_lazy("By {camel_field_name}, descending").format(
                            camel_field_name=camel_field_name
                        ),
                    ),
                ]

        return sorting_choices

    @classmethod
    def get_filters(cls):
        filters = super().get_filters()
        if not cls.search_fields and "search" in filters:
            del filters["search"]

        if cls._meta.model:
            primary_key_field = cls._meta.model._meta.pk

            if primary_key_field and cls.include_id_in:
                filters[f"{primary_key_field.name}_in"] = PrimaryKeyInFilter(
                    field_name=primary_key_field.name,
                    lookup_expr="in",
                    help_text=gettext_lazy(
                        "Filter by {field_name} being in provided list"
                    ).format(field_name=primary_key_field.name),
                )

            if cls._meta.model.created_timestamp_field_name is not None:
                filters["created"] = django_filters.DateTimeFromToRangeFilter(
                    field_name=cls._meta.model.created_timestamp_field_name,
                    help_text=gettext_lazy(
                        "Limit by creation timestamp that never changes for existing records."
                    ),
                )
            if cls._meta.model.updated_timestamp_field_name is not None:
                filters["last_modified"] = django_filters.DateTimeFromToRangeFilter(
                    field_name=cls._meta.model.updated_timestamp_field_name,
                    help_text=gettext_lazy(
                        "Limit by update timestamp that changes every time any information related to the record is updated."
                    ),
                )

        if sorting_choices := cls.get_sorting_choices():
            filters["sort"] = django_filters.ChoiceFilter(
                choices=sorting_choices,
                method="filter_sort",
            )

        return filters

    @classmethod
    def filter_sort(cls, queryset, _, value):
        method: None | t.Callable = getattr(
            cls,
            f"sort_by_{value}",
            getattr(cls, f"sort_by_{camel_to_underscore(value)}", None),
        )
        if method:
            return method(queryset)

        name, order = cls.get_name_and_sorting_direction(value)

        if (field_name := camel_to_underscore(name)) in cls.sorting_fields:
            return cls.sort_by_field_name(queryset, field_name, order)

        raise RuntimeError(
            f"Define {cls.__name__}.sort_by_{camel_to_underscore(value)} for sorting."
        )

    @classmethod
    def sort_asc(cls, queryset, field_name):
        return queryset.order_by(F(field_name).asc(nulls_first=True), *cls.extra_sort)

    @classmethod
    def sort_desc(cls, queryset, field_name):
        return queryset.order_by(F(field_name).desc(nulls_last=True), *cls.extra_sort)

    @classmethod
    def sort_by_field_name(cls, queryset, field_name, order):
        return (
            cls.sort_asc(queryset, field_name)
            if order == cls.SORT_ASC
            else cls.sort_desc(queryset, field_name)
        )

    @classmethod
    def sort_by_creation_time_asc(cls, queryset):
        return cls.sort_by_field_name(
            queryset, cls._meta.model.created_timestamp_field_name, cls.SORT_ASC
        )

    @classmethod
    def sort_by_creation_time_desc(cls, queryset):
        return cls.sort_by_field_name(
            queryset, cls._meta.model.created_timestamp_field_name, cls.SORT_DESC
        )

    @classmethod
    def sort_by_last_modification_time_asc(cls, queryset):
        return cls.sort_by_field_name(
            queryset, cls._meta.model.updated_timestamp_field_name, cls.SORT_ASC
        )

    @classmethod
    def sort_by_last_modification_time_desc(cls, queryset):
        return cls.sort_by_field_name(
            queryset, cls._meta.model.updated_timestamp_field_name, cls.SORT_DESC
        )

    @classmethod
    def get_name_and_sorting_direction(cls, name):
        if name.lower().endswith(cls.SORT_ASC):
            return name[: -len(cls.SORT_ASC)], cls.SORT_ASC

        if name.lower().endswith(cls.SORT_DESC):
            return name[: -len(cls.SORT_DESC)], cls.SORT_DESC

        raise ValueError(
            f"Invalid sorting name format for '{name}'. "
            f"Expected <field_name>{cls.SORT_ASC.capitalize()} or <field_name>{cls.SORT_DESC.capitalize()}."
        )

    @classmethod
    def _sort_by_status(cls, queryset, order):
        """
        Useful when sorting by the position of the status (in the status choices tuple)
        instead of the status value is needed.

        1. Override variables, e.g.:
            status_field_name = "sync_status"
            status_choices_name = "SYNC_STATUS_CHOICES"

        2. Add value of `status_field_name` to `sorting_fields`;
            sorting_fields = [..., "sync_status", ...]

        3. Implement the following methods:

            ```
            @classmethod
            def sort_by_{status_field_name}_asc(cls, queryset):
                return cls._sort_by_status(queryset, cls.SORT_ASC)

            @classmethod
            def sort_by_{status_field_name}_desc(cls, queryset):
                return cls._sort_by_status(queryset, cls.SORT_DESC)
            ```
        """
        if not all([cls._meta.model, cls.status_field_name, cls.status_choices_name]):
            return queryset

        choices = getattr(cls._meta.model, cls.status_choices_name, [])

        when = [
            When(**{cls.status_field_name: status[0]}, then=pos)
            for pos, status in enumerate(choices)
        ]

        if order == cls.SORT_ASC:
            return queryset.annotate(
                position=Case(*when, default=len(choices))
            ).order_by(F("position").asc(nulls_first=True), *cls.extra_sort)

        if order == cls.SORT_DESC:
            return queryset.annotate(
                position=Case(*when, default=len(choices))
            ).order_by(F("position").desc(nulls_last=True), *cls.extra_sort)

        return queryset
