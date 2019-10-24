from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.response import Response
from rest_framework.settings import api_settings
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from tg_react.api.accounts.serializers import SignupSerializer
from tg_react.api.accounts.views import SignUpView as TgReactSignUpView
from tg_react.api.accounts.views import UserDetails as TgReactUserDetails


class UserDetails(TgReactUserDetails):
    authentication_classes = api_settings.DEFAULT_AUTHENTICATION_CLASSES


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
