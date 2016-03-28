{% if cookiecutter.is_react_project == 'y' -%}
from rest_framework import generics, status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.serializers import AuthenticationSerializer, UserDetailsSerializer


class UserDetails(generics.RetrieveAPIView):
    serializer_class = UserDetailsSerializer
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    def get_object(self):
        return self.request.user


class AuthenticationView(APIView):
    class UnsafeSessionAuthentication(SessionAuthentication):
        def enforce_csrf(self, request):
            pass

    throttle_classes = ()
    permission_classes = (AllowAny,)
    authentication_classes = (UnsafeSessionAuthentication, )
    serializer_class = AuthenticationSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            from django.contrib.auth import login
            login(request, serializer.user)

            return Response({'success': True})

        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    throttle_classes = ()
    permission_classes = (IsAuthenticated, )
    authentication_classes = (SessionAuthentication, )

    def post(self, request):
        from django.contrib.auth import logout
        logout(request)

        return Response({'success': True})

{%- else -%}

from django.contrib.auth.views import login as django_login

from accounts.forms import LoginForm


def login(request):
    response = django_login(request, template_name='accounts/login.html', authentication_form=LoginForm)

    return response

{%- endif %}
