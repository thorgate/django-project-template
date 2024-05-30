from drf_spectacular import openapi
from rest_framework.serializers import ListSerializer

from .serializers import (
    ForRequestSchemaSerializerMixin,
    ModelSerializerForRequestSchemaMixin,
)
from .viewsets import ExtraFilteredActionsMixin


class AutoSchema(openapi.AutoSchema):
    def get_request_serializer(self):
        base_serializer = super().get_request_serializer()
        if isinstance(base_serializer, ListSerializer):
            serializer = base_serializer.child
            many = True
        else:
            serializer = base_serializer
            many = False

        if isinstance(serializer, ForRequestSchemaSerializerMixin) and not isinstance(
            serializer, ModelSerializerForRequestSchemaMixin
        ):
            action = "".join(
                [
                    word.capitalize()
                    for word in getattr(self.view, "action", "").split("_")
                ]
            )
            view_name = self.view.__class__.__name__
            return serializer.for_request_schema(view_name=f"{view_name}{action}")(
                many=many
            )

        return base_serializer

    def get_filter_backends(self):
        if (
            isinstance(self.view, ExtraFilteredActionsMixin)
            and self.view.action in self.view.extra_filtered_actions
        ):
            return getattr(self.view, "filter_backends", [])

        return super().get_filter_backends()
