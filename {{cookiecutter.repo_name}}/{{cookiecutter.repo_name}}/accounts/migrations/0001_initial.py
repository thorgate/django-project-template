# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import django.utils.timezone
from django.db import migrations, models
from django.contrib.postgres.operations import CreateExtension
from django.contrib.postgres.fields import CIEmailField


class Migration(migrations.Migration):

    dependencies = [
        ("auth", "0006_require_contenttypes_0002"),
    ]

    operations = [
        CreateExtension("citext"),
        migrations.CreateModel(
            name="User",
            fields=[
                (
                    "id",
                    models.AutoField(
                        primary_key=True,
                        serialize=False,
                        auto_created=True,
                        verbose_name="ID",
                    ),
                ),
                ("password", models.CharField(max_length=128, verbose_name="password")),
                (
                    "last_login",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="last login"
                    ),
                ),
                (
                    "is_superuser",
                    models.BooleanField(
                        help_text="Designates that this user has all permissions without explicitly assigning them.",
                        default=False,
                        verbose_name="superuser status",
                    ),
                ),
                (
                    "email",
                    CIEmailField("email address", max_length=254, unique=True),
                ),
                ("name", models.CharField(max_length=255)),
                (
                    "is_staff",
                    models.BooleanField(default=False, verbose_name="staff status"),
                ),
                ("is_active", models.BooleanField(default=True, verbose_name="active")),
                (
                    "date_joined",
                    models.DateTimeField(
                        default=django.utils.timezone.now, verbose_name="date joined"
                    ),
                ),
                (
                    "groups",
                    models.ManyToManyField(
                        help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
                        related_name="user_set",
                        verbose_name="groups",
                        blank=True,
                        to="auth.Group",
                        related_query_name="user",
                    ),
                ),
                (
                    "user_permissions",
                    models.ManyToManyField(
                        help_text="Specific permissions for this user.",
                        related_name="user_set",
                        verbose_name="user permissions",
                        blank=True,
                        to="auth.Permission",
                        related_query_name="user",
                    ),
                ),
            ],
            options={"abstract": False},
        ),
    ]
