import typing as t

from rest_framework import serializers
from rest_framework.serializers import ListSerializer

from {{cookiecutter.default_django_app}}.core.models import BaseModel


if t.TYPE_CHECKING:
    _SerializerMixinBase = serializers.ModelSerializer  # pragma: no cover
else:
    _SerializerMixinBase = object


class ModelSerializerForRequestSchemaMixin(_SerializerMixinBase):
    view_name = ""

    def get_fields(self):
        fields = super().get_fields().copy()
        read_only_field_names = []

        for field_name, field in fields.items():
            if field.read_only:
                read_only_field_names.append(field_name)

            elif isinstance(field, ForRequestSchemaSerializerMixin):
                fields[field_name] = field.for_request_schema(
                    view_name=self.view_name
                )()

            elif isinstance(field, serializers.ListSerializer) and isinstance(
                field.child, ForRequestSchemaSerializerMixin
            ):
                fields[field_name] = field.child.for_request_schema(
                    view_name=self.view_name
                )(many=True)

        for field_name in read_only_field_names:
            del fields[field_name]

        return fields


class ForRequestSchemaSerializerMixin(_SerializerMixinBase):
    request_schemas: dict[str, t.Type] = {}

    @classmethod
    def for_request_schema(cls, view_name=""):
        base_name = cls.__name__.replace("Serializer", "")
        final_name = f"{base_name}{view_name}Serializer"
        if final_name in cls.request_schemas:
            return cls.request_schemas[final_name]

        request_serializer = type(
            final_name,
            (ModelSerializerForRequestSchemaMixin, cls),
            {"view_name": view_name},
        )
        cls.request_schemas[final_name] = request_serializer
        return cls.request_schemas[final_name]


class ModelSerializerMixin(ForRequestSchemaSerializerMixin):
    exclude_updated_timestamp = False
    exclude_created_timestamp = False

    updated_timestamp_serializer_field_name = "updated"
    created_timestamp_serializer_field_name = "created"

    def get_field_names(self, declared_fields, info):
        field_names = list(super().get_field_names(declared_fields, info))
        model = getattr(self.Meta, "model")

        if not issubclass(model, BaseModel):
            return field_names

        parent = self.parent
        if isinstance(parent, ListSerializer):
            parent = parent.parent

        if not parent:
            if all(
                [
                    not self.exclude_updated_timestamp,
                    model.updated_timestamp_field_name is not None,
                    self.updated_timestamp_serializer_field_name not in field_names,
                ]
            ):
                field_names.append(self.updated_timestamp_serializer_field_name)
            if all(
                [
                    not self.exclude_created_timestamp,
                    model.created_timestamp_field_name is not None,
                    self.created_timestamp_serializer_field_name not in field_names,
                ]
            ):
                field_names.append(self.created_timestamp_serializer_field_name)

        return tuple(field_names)

    def get_extra_kwargs(self):
        extra_kwargs = super().get_extra_kwargs()

        model = getattr(self.Meta, "model")

        if not issubclass(model, BaseModel):
            return extra_kwargs

        for field_name, serializer_field_name in [
            (
                model.updated_timestamp_field_name,
                self.updated_timestamp_serializer_field_name,
            ),
            (
                model.created_timestamp_field_name,
                self.created_timestamp_serializer_field_name,
            ),
        ]:
            if field_name is not None:
                kwargs = extra_kwargs.get(serializer_field_name, {})
                kwargs["read_only"] = True
                if field_name != serializer_field_name:
                    kwargs["source"] = field_name
                extra_kwargs[serializer_field_name] = kwargs
        return extra_kwargs
