import typing as t

from django.db.models import QuerySet

from django_filters import FilterSet
from django_filters.rest_framework import DjangoFilterBackend
from djangorestframework_camel_case.parser import CamelCaseJSONParser
from djangorestframework_camel_case.render import CamelCaseJSONRenderer
from rest_framework import serializers
from rest_framework.serializers import Serializer
from rest_framework.viewsets import GenericViewSet

from .filters import BaseFilterSet
from .pagination import CustomPageNumberPagination


if t.TYPE_CHECKING:
    _Base = GenericViewSet  # pragma: no cover
    _SerializerMixinBase = serializers.ModelSerializer  # pragma: no cover
else:
    _Base = object
    _SerializerMixinBase = object


class ActionBasedSerializerMixin(_Base):
    action_based_serializer_classes: dict[str, t.Type[Serializer]] = {}

    def get_serializer_class(self):
        if (
            hasattr(self, "action")
            and self.action in self.action_based_serializer_classes
        ):
            return self.action_based_serializer_classes[self.action]

        return super().get_serializer_class()


class ActionBasedQuerysetMixin(_Base):
    action_based_querysets: dict[str, t.Type[QuerySet]] = {}

    def get_queryset(self):
        if hasattr(self, "action") and self.action in self.action_based_querysets:
            return self.action_based_querysets[self.action]

        return super().get_queryset()


class BaseFilterBackend(DjangoFilterBackend):
    def get_filterset_class(self, view, queryset=None):
        if (
            isinstance(view, ExtraFilteredActionsMixin)
            and view.action in view.extra_filtered_actions
        ):
            return view.extra_filtered_actions[view.action]

        return super().get_filterset_class(view, queryset)


class BaseViewSet(GenericViewSet):
    filter_backends = [BaseFilterBackend]
    pagination_class = CustomPageNumberPagination
    renderer_classes = [CamelCaseJSONRenderer]
    parser_classes = [
        CamelCaseJSONParser,
    ]
    filterset_class = BaseFilterSet


class ExtraFilteredActionsMixin(_Base):
    extra_filtered_actions: dict[str, FilterSet] = {}
