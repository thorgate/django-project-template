from datetime import timedelta

from django.apps import apps
from django.conf import settings
from django.utils import timezone, translation

import jwt
from rest_framework.permissions import BasePermission


class SignedAccessResourceMixin:
    signed_resource_name: str

    def get_signed_resource_id(self) -> str:
        return getattr(self, "id", "")

    @classmethod
    def get_signed_resource_name(cls) -> str:
        return cls.__name__


class SignedAccessListViewMixin:
    signed_resource_name: str


class HasSignedResourceToken(BasePermission):
    token_parameter_name = "token"  # nosec
    algorithm = "HS512"
    validity_period = timedelta(hours=1)

    # Set this in a subclass, or alternatively set attribute with the same name on viewset if all actions in viewset
    # use same signed resource
    signed_resource_name: str | None = None

    @classmethod
    def create_token_parameters(
        cls, obj: SignedAccessResourceMixin, user_id=None
    ) -> dict[str, str]:
        now = timezone.now()
        valid_until = now + cls.validity_period

        payload = {
            "iat": now,
            "exp": valid_until,
            "aid": f"{obj.get_signed_resource_name()}:{obj.get_signed_resource_id()}",
        }

        if user_id:
            payload["user_id"] = user_id

        token = jwt.encode(
            payload,
            settings.SECRET_KEY,
            algorithm=cls.algorithm,
        )
        return {cls.token_parameter_name: token}

    def get_token(self, request):
        encoded_token = request.GET.get(self.token_parameter_name, "")

        if not encoded_token:
            return None

        try:
            payload = jwt.decode(
                encoded_token, settings.SECRET_KEY, algorithms=["HS512"]
            )
        except jwt.PyJWTError:
            return None

        return payload

    def has_permission(self, request, view) -> bool:
        signed_resource_name: str
        if self.signed_resource_name is None:
            signed_resource_name = getattr(view, "signed_resource_name", "")
        else:
            signed_resource_name = self.signed_resource_name

        if not signed_resource_name:
            return False

        token = self.get_token(request)

        if not token:
            return False

        if token and token.get("user_id", None):
            user_model = apps.get_model("accounts", "User")
            user = user_model.objects.get(id=token.get("user_id"))
            if not user:
                return False
            request.user = user
            translation.activate(user.language_code)
            timezone.activate(user.timezone)

        return token.get("aid", "").startswith(f"{signed_resource_name}:")

    def get_resource_for_object(
        self, request, view, obj
    ) -> SignedAccessResourceMixin | None:
        if isinstance(obj, SignedAccessResourceMixin):
            return obj

        raise NotImplementedError(
            f"Override get_resource_for_object on `{self.__class__.__name__} `to properly extract "
            f"signed resource from {obj.__class__.__name__}."
        )

    def get_aid_for_resource(
        self, resource: SignedAccessResourceMixin | None
    ) -> str:
        if resource is None:
            return ""
        return (
            f"{resource.get_signed_resource_name()}:{resource.get_signed_resource_id()}"
        )

    def get_aid_for_request(self, request) -> str | None:
        if token := self.get_token(request):
            return token.get("aid", None)

        return None

    def has_object_permission(self, request, view, obj) -> bool:
        resource = self.get_resource_for_object(request, view, obj)
        aid = self.get_aid_for_request(request)

        return all([resource, aid, aid == self.get_aid_for_resource(resource)])
