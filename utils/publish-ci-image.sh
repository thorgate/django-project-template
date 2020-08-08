#!/usr/bin/env bash

if [[ -z $CI_REGISTRY_IMAGE ]]; then
    echo "CI_REGISTRY_IMAGE is required"
    exit 1
fi

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

IMAGE_SUFFIX='/ci'
IMAGE="${CI_REGISTRY_IMAGE}${IMAGE_SUFFIX}"
IMAGE_TAG=${CI_COMMIT_REF_SLUG:=${CI_COMMIT_TAG:='master'}}

echo "CI image: ${IMAGE}"
echo "Building and tagging CI image with version ${IMAGE_TAG}"

CACHE_ARG="--build-arg BUILDKIT_INLINE_CACHE=1"
CACHE_ARG="${CACHE_ARG} --cache-from ${IMAGE}:latest --cache-from ${IMAGE}:${IMAGE_TAG}"

docker build $CACHE_ARG -f ${DIR}/Dockerfile-ci -t "${IMAGE}:${IMAGE_TAG}" ${DIR}
docker build $CACHE_ARG -f ${DIR}/Dockerfile-ci -t "${IMAGE}:latest" ${DIR}

echo "Publishing CI image"
docker push "${IMAGE}:${IMAGE_TAG}"
docker push "${IMAGE}:latest"

# DOCKER_HUB_TOKEN should be set via build secrets
if [[ -z $DOCKER_HUB_USER ]] || [[ -z $DOCKER_HUB_TOKEN ]]; then
    echo "DOCKER_HUB_TOKEN or DOCKER_HUB_USER env variable is not defined."
    echo " Skipping docker hub publish"
    env
else
    HUB_IMAGE="thorgate/django-template${IMAGE_SUFFIX}"

    echo "Publishing ${HUB_IMAGE} to docker hub too"
    docker tag "${IMAGE}:${IMAGE_TAG}" "${HUB_IMAGE}:${IMAGE_TAG}"
    docker tag "${IMAGE}:latest" "${HUB_IMAGE}:latest"

    echo "Authenticating against docker.io"
    docker login -u "$DOCKER_HUB_USER" -p "$DOCKER_HUB_TOKEN" docker.io
fi
