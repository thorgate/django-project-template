from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from accounts.models import User


class UserDetailsSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'name', 'is_staff')


class AuthenticationSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.user = None

    def validate(self, data):
        credentials = {
            'email': data.get('email', None),
            'password': data.get('password', None)
        }

        if all(credentials.values()):
            from django.contrib.auth import authenticate
            user = authenticate(**credentials)

            if user:
                if not user.is_active:
                    raise serializers.ValidationError('Your account has been disabled')

                self.user = user
                # hide the password so it wont leak
                credentials['password'] = '-rr-'

                return credentials

            else:
                raise serializers.ValidationError('Unable to login with provided credentials.')
        else:
            raise serializers.ValidationError('Enter both email and password')

    def create(self, validated_data):
        return validated_data
