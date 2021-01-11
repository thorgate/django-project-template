// https://www.terraform.io/docs/configuration/variables.html
variable "name" {
  type = "string"
}

variable "tags" {
  type    = "map"
  default = {}
}