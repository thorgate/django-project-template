import base64
import json

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
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


class RecoveryPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(required=True)
    password_confirm = serializers.CharField(required=True)

    # uid_and_token receive json dict encoded with base64
    uid_and_token_encoded = serializers.CharField(required=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.user = None

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(gettext("Password mismatch."))

        return {"password": attrs["password"]}

    def validate_uid_and_token_encoded(self, uid_and_token_encoded):

        try:
            # Deserialize data from json
            json_data = base64.urlsafe_b64decode(uid_and_token_encoded).decode("utf-8")
            data = json.loads(json_data)
        except Exception as e:
            raise serializers.ValidationError(gettext("Broken data.")) from e

        uid = data.get("uid", None)
        token = data.get("token", None)

        if not (uid and token and isinstance(uid, int)):
            raise serializers.ValidationError(gettext("Broken data."))

        user_model = get_user_model()

        try:
            self.user = user_model.objects.get(pk=uid)
        except user_model.DoesNotExist as e:
            raise serializers.ValidationError(gettext("User not found.")) from e

        # validate token
        if not default_token_generator.check_token(self.user, token):
            msg_0 = gettext("This password recovery link has expired or associated user does not exist.")
            msg_1 = gettext("Use password recovery form to get new e-mail with new link.")

            raise serializers.ValidationError(f"{msg_0} {msg_1}")
