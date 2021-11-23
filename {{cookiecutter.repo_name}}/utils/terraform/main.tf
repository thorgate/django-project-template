terraform {
  backend "s3" {
    bucket         = "tg-terraform-state-bucket"
    dynamodb_table = "terraform_lock_table"
    region         = "eu-north-1"
    role_arn       = "arn:aws:iam::930111947669:role/terraform_state_role"
    key            = "django-project-template-{{cookiecutter.repo_name|as_hostname}}"
  }
}

provider "aws" {
  region  = var.region
  version = "~> 2.26"
}

module "s3_media" {
  source = "./modules/s3_media"
  name   = "${var.project}-${terraform.workspace}"
  is_public = var.s3_media_bucket_is_public
  tags = {
    terraform : "",
    project : var.project,
  }
}

output "DJANGO_AWS_STORAGE_BUCKET_NAME" {
  value       = module.s3_media.bucket.bucket
  description = "Media bucket"
}

output "media_bucket_user" {
  value       = module.s3_media.user.arn
  description = "Media bucket user"
}

output "DJANGO_AWS_ACCESS_KEY_ID" {
  value       = module.s3_media.key.id
  description = "ACCESS_KEY_ID for media bucket user"
}

output "DJANGO_AWS_SECRET_ACCESS_KEY" {
  value       = module.s3_media.key.secret
  description = "SECRET_ACCESS_KEY for media bucket user"
  sensitive   = true
}

output "AWS_S3_REGION_NAME" {
  value       = var.region
  description = "AWS region"
}
