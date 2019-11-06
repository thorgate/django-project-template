// https://www.terraform.io/docs/configuration/variables.html

variable "project" {
  type    = "string"
  default = "{{cookiecutter.repo_name|as_hostname}}"
}

variable "region" {
  type    = "string"
  default = "eu-west-1"
}
