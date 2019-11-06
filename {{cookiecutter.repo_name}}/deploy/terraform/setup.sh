#!/bin/bash
set -eu

workspace=$1

if [[ $workspace != 'production' ]] && \
   [[ $workspace != 'staging' ]] && \
   [[ $workspace != 'prelive' ]] && \
   [[ $workspace != dev* ]]; then
  printf "%s\n" "Please use a better environment name: production/staging/prelive or dev-*" >&2
  printf "Provided: '%s'\n" "$workspace"
  exit 1
fi

# Make sure the current directory is here where script lives.
cd "${0%/*}"

printf "%s\n" "##################################################################"
printf "%s\n" "Terraform setup requires following environment variables:" >&2
printf "%s\n" "AWS_ACCESS_KEY_ID" >&2
printf "%s\n" "AWS_SECRET_ACCESS_KEY" >&2
printf "%s\n" "The IAM user must be allowed to assume the terraform role"  >&2
printf "%s\n" "and be able to create the resources specified." >&2
printf "%s\n" "##################################################################"
printf "%s\n" "If this is an existing project, you can skip this" >&2

read -p "Continue with terraform setup? [y/N] " continue;
continue=${continue:0:1}

if [[ $continue != [yY] ]] ; then
  printf "%s\n" "Exiting without setting up terraform" >&2
  exit 0
fi

TF_WORKSPACE=default ./terraform init -input=false
TF_WORKSPACE="$workspace" ./terraform apply
