#!/usr/bin/env bash

# Source this script with `source registry.sh` before interfacing with docker registry. The script sets
#  the value of DOCKER_CONFIG to a project specific directory to allow using multiple credentials for
#  the same docker registry.
#
# Docker issue: https://github.com/moby/moby/issues/37569
#
# Workaround idea from: https://stackoverflow.com/a/51610644

export DOCKER_CONFIG="{{ "{{ code_dir }}" }}/.docker-cfg"
