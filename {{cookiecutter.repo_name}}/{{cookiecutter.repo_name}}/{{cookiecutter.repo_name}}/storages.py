from django.conf import settings

{% if cookiecutter.django_media_engine == "S3" -%}
from storages.backends.s3boto3 import S3Boto3Storage


class PrivateMediaStorage(S3Boto3Storage):
    """
    In order to use this storage,
    change the following settings in Terraform to true:
    ```
    resource "aws_s3_bucket_public_access_block" "access_storage" {
        block_public_acls       = true
        block_public_policy     = true
        ignore_public_acls      = true
        restrict_public_buckets = true
    }
    ```
    in the file
    {{cookiecutter.repo_name}}/utils/terraform/modules/s3_media/main.tf
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
