from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models
from django.db.models.functions import Collate
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from {{cookiecutter.default_django_app}}.core.models import BaseModel, BaseModelQueryset


class UserQueryset(BaseModelQueryset):
    def with_deterministic_email(self):
        return self.annotate(
            email_deterministic=Collate("email", "und-x-icu"),
        )


class UserManager(BaseUserManager):
    # Mostly copied from django.contrib.auth.models.UserManager

    _queryset_class = UserQueryset

    def _create_user(self, email, password, is_staff, is_superuser, **extra_fields):
        """
        Creates and saves a User with the given username, email and password.
        """
        now = timezone.now()
        if not email:
            raise ValueError("The given email must be set")
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            is_staff=is_staff,
            is_active=True,
            is_superuser=is_superuser,
            last_login=now,
            created=now,
            **extra_fields
        )
        user.set_password(password)  # type: ignore[attr-defined]
        user.save(using=self._db)
        return user

    def create_user(self, email=None, password=None, **extra_fields):
        return self._create_user(email, password, False, False, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        return self._create_user(email, password, True, True, **extra_fields)


class User(BaseModel, AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(
        verbose_name=_("email address"),
        max_length=254,
        unique=True,
        db_collation="case_insensitive",
    )
    name = models.CharField(max_length=255)

    is_staff = models.BooleanField(_("staff status"), default=False)
    is_active = models.BooleanField(_("active"), default=True)
    created = models.DateTimeField(_("date joined"), default=timezone.now)

    USERNAME_FIELD = "email"

    objects = UserManager()

    def get_full_name(self):
        return self.name

    def get_short_name(self):
        return self.name

    def display_name(self):
        return name if (name := self.get_full_name()) else self.email

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")
        ordering = ["-created"]
