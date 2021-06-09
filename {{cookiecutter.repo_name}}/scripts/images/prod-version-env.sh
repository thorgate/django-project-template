#!/usr/bin/env bash

set -e

if [[ -z ${CI_REGISTRY_IMAGE} ]]; then
    echo "CI_REGISTRY_IMAGE environment variable is required"
    exit 1
fi

DIR="$(cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd)"
source ${DIR}/ci-env.sh

echo "SITE_DJANGO_IMAGE=${CI_REGISTRY_IMAGE}/django"
echo "SITE_NODE_IMAGE=${CI_REGISTRY_IMAGE}/node"

echo "SITE_VERSION=${CI_RAW_CUR_COMMIT_ID}"
