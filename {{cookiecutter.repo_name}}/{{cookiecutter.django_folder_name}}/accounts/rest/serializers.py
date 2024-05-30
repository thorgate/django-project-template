from django.contrib.auth import get_user_model
from django.utils.translation import gettext

from rest_framework import serializers
from tg_react.api.accounts.views import (
    UserDetailsSerializer as TgReactUserDetailsSerializer,
)

from {{cookiecutter.default_django_app}}.rest.core.serializers import ModelSerializerMixin


class UserCreateSerializer(ModelSerializerMixin, TgReactUserDetailsSerializer):
    password = serializers.CharField(write_only=True)

    def get_fields(self):
        fields = super().get_fields()
        fields.pop("id", None)
        return fields

    def validate_email(self, data):
        if self.instance:
            return super().validate_email(data)

        if get_user_model().objects.filter(email=data).exists():
            raise serializers.ValidationError(
                gettext("User with this e-mail address already exists.")
            )

        return data

    def create(self, validated_data):
        return get_user_model().objects.create_user(
            **validated_data,
        )


class UserDetailMeSerializer(UserCreateSerializer):
    email = serializers.EmailField(validators=[], read_only=True)


class UserDetailSerializer(UserDetailMeSerializer):
    def get_fields(self):
        fields = super().get_fields()
        fields.pop("password", None)
        return fields
