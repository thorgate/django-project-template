#!/usr/bin/env bash

if [[ -z $CI_REGISTRY_IMAGE ]]; then
    echo "CI_REGISTRY_IMAGE is required"
    exit 1
fi

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

IMAGE="${CI_REGISTRY_IMAGE}/ci"
IMAGE_TAG=${CI_COMMIT_REF_SLUG:=${CI_COMMIT_TAG:='master'}}

echo "CI image: ${IMAGE}"
echo "Building and tagging CI image with version ${IMAGE_TAG}"

CACHE_ARG="--cache-from ${IMAGE}:master --build-arg BUILDKIT_INLINE_CACHE=1"

docker build $CACHE_ARG -f ${DIR}/Dockerfile-ci -t "${IMAGE}:${IMAGE_TAG}" ${DIR}
docker build $CACHE_ARG -f ${DIR}/Dockerfile-ci -t "${IMAGE}:latest" ${DIR}

echo "Publishing CI image"
docker push "${IMAGE}:${IMAGE_TAG}"
docker push "${IMAGE}:latest"
