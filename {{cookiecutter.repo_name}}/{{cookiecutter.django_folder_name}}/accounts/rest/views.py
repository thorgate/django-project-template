from django.contrib.auth import get_user_model
from django.utils.translation import gettext

from rest_framework import mixins, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.settings import api_settings
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from tg_react.api.accounts.serializers import SignupSerializer
from tg_react.api.accounts.views import ForgotPassword as TgReactForgotPassword
from tg_react.api.accounts.views import RestorePassword as TgReactRestorePassword
from tg_react.api.accounts.views import SignUpView as TgReactSignUpView
from tg_react.api.accounts.views import UserDetails as TgReactUserDetails

from accounts.models import User
from accounts.rest.filters import UserFilterSet
from accounts.rest.serializers import (
    ForgotPasswordSerializer,
    RecoveryPasswordSerializer,
    UserCreateSerializer,
    UserDetailMeSerializer,
    UserDetailSerializer,
)
from {{cookiecutter.default_django_app}}.rest.core.viewsets import ActionBasedSerializerMixin, BaseViewSet


class UserDetails(TgReactUserDetails):
    authentication_classes = api_settings.DEFAULT_AUTHENTICATION_CLASSES
    serializer_class = UserDetailMeSerializer


class SignUpView(TgReactSignUpView):
    serializer_class = SignupSerializer

    def post(self, request):
        # TG_REACT_UPGRADE: Code is copied over to correctly create Organizations
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            data: dict = serializer.validated_data.copy()
            password = data.pop("password", None)

            user = get_user_model()(**data)
            user.set_password(password)
            user.save()

            serializer = TokenObtainPairSerializer(
                data={"email": user.email, "password": password}
            )
            serializer.is_valid()
            # serializer = TokenObtainPairSerializer(data=request.data)
            return Response(serializer.validated_data)

        return Response(
            {"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )


class RestorePassword(TgReactRestorePassword):
    serializer_class = RecoveryPasswordSerializer


class ForgotPassword(TgReactForgotPassword):
    serializer_class = ForgotPasswordSerializer

    def send_email_notification(self, user, uid_and_token_b64):
        if user.id:
            super().send_email_notification(user, uid_and_token_b64)


class UserViewSet(
    ActionBasedSerializerMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    BaseViewSet,
):
    lookup_field = "email"
    lookup_value_regex = "[^/]+"

    serializer_class = UserDetailSerializer
    action_based_serializer_classes = {
        "create": UserCreateSerializer,
    }

    # TODO: NEWPROJECT - replace this permission check with relevant one
    permission_classes = [IsAuthenticated]
    filterset_class = UserFilterSet

    def get_queryset(self):
        return User.objects.all().with_deterministic_email()  # type: ignore[attr-defined]

    def perform_destroy(self, instance) -> None:
        if instance.id == self.request.user.id:
            raise ValidationError(gettext("You can not deactivate your own user."))

        instance.is_active = False
        instance.save()
