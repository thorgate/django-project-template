// https://www.terraform.io/docs/configuration/variables.html

variable "project" {
  type    = string
  default = "{{cookiecutter.repo_name|as_hostname}}"
}

variable "region" {
  type    = string
  default = "eu-north-1"
}

variable "s3_media_bucket_is_public" {
  type = bool
  default = true
}
