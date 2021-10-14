# Generated by Django 3.2.7 on 2021-10-01 13:54

import django.contrib.postgres.fields.citext
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="email",
            field=django.contrib.postgres.fields.citext.CIEmailField(
                max_length=254, unique=True, verbose_name="email address"
            ),
        ),
    ]
