from typing import List

from django import forms
from django.contrib.auth import forms as auth_forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.utils.translation import gettext_lazy as _

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Field, Layout, Submit

from accounts.emails import send_password_reset
from accounts.models import User


class LoginForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.helper = FormHelper()
        self.helper.form_class = "login-form"
        self.helper.form_show_labels = False
        self.helper.layout = Layout(
            Field("username", placeholder=_("Username")),
            Field("password", placeholder=_("Password")),
        )
        self.helper.add_input(Submit("submit", _("Log in")))


class PasswordResetForm(auth_forms.PasswordResetForm):
    helper = FormHelper()
    helper.form_class = "login-form"
    helper.layout = Layout("email", Submit("submit", _("Reset my password")))

    def save(self, *args, **kwargs):
        """
        Generates a one-use only link for resetting password and sends to the
        Copy of Django's implementation, changed to use our own email-sending.
        """
        user_model = get_user_model()
        email = self.cleaned_data["email"]
        active_users = user_model.objects.filter(email__iexact=email, is_active=True)
        for user in active_users:
            # Make sure that no email is sent to a user that actually has
            # a password marked as unusable
            if not user.has_usable_password():
                continue

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            send_password_reset(user, uid, token)


class SetPasswordForm(auth_forms.SetPasswordForm):
    helper = FormHelper()
    helper.form_class = "login-form"
    helper.layout = Layout("new_password1", Submit("submit", _("Change my password")))

    def __init__(self, user, *args, **kwargs):
        super().__init__(user, *args, **kwargs)

        del self.fields["new_password2"]


class ChangePasswordForm(forms.ModelForm):
    class Meta:
        model = User
        fields: List[str] = []

    password_old = forms.CharField(
        widget=forms.PasswordInput(),
        label=_("Enter your old password for confirmation"),
        required=True,
    )
    password_new = forms.CharField(
        widget=forms.PasswordInput(), label=_("New password"), required=True
    )

    helper = FormHelper()
    helper.layout = Layout(
        "password_old",
        "password_new",
        Submit("submit", _("Save changes"), css_class="btn btn-primary"),
    )

    def clean(self):
        cleaned_data = super().clean()
        password_old = cleaned_data.get("password_old", "")
        self.password_new = cleaned_data.get("password_new", "")

        # If either old or new password is None, then we get an inline error and don't want to raise ValidationError
        if (
            password_old
            and self.password_new
            and not self.instance.check_password(password_old)
        ):
            raise forms.ValidationError(
                _("The old password you've entered is not correct!")
            )

        return cleaned_data

    def save(self, commit=True):
        self.instance.set_password(self.password_new)

        return super().save(commit)
