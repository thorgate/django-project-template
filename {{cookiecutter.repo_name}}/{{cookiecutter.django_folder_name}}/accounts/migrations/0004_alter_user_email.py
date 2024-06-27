# Generated by Django 4.2.11 on 2024-03-22 14:00

from django.contrib.postgres.operations import CreateCollation
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0003_alter_user_id"),
    ]

    operations = [
        CreateCollation(
            "case_insensitive",
            provider="icu",
            locale="und-u-ks-level2",
            deterministic=False,
        ),
        migrations.AlterField(
            model_name="user",
            name="email",
            field=models.EmailField(
                max_length=254, unique=True, verbose_name="email address", db_collation="case_insensitive"
            ),
        ),
    ]