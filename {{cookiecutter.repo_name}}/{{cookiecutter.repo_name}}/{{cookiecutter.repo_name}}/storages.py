from django.conf import settings

{% if cookiecutter.django_media_engine == "S3" -%}
from storages.backends.s3boto3 import S3Boto3Storage


class PrivateMediaStorage(S3Boto3Storage):
    """Media storage which disables public access by default

    When you use this as the default storage it makes sense to
    turn off all public access to the bucket.

{%- if cookiecutter.thorgate == 'yes' %}

    You can do this by changing the `s3_media_bucket_is_public` variable
    in Terraform to false in the file {{cookiecutter.repo_name}}/utils/terraform/variables.tf
{%- endif %}
    """

    location = settings.MEDIAFILES_LOCATION
    default_acl = "private"


class MediaStorage(S3Boto3Storage):
    location = settings.MEDIAFILES_LOCATION
    default_acl = "public-read"
{%- endif %}{% if cookiecutter.django_media_engine == "GCS" -%}
from storages.backends.gcloud import GoogleCloudStorage


class PrivateMediaStorage(GoogleCloudStorage):
    location = settings.MEDIAFILES_LOCATION
    default_acl = "private"


class MediaStorage(GoogleCloudStorage):
    location = settings.MEDIAFILES_LOCATION
    default_acl = "publicRead"{% endif %}
