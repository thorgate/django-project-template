#!/usr/bin/env bash

set -e

function usage() {
    echo "Usage: build-prod-image.sh image docker_file"
    echo ""
    echo "Where image is one of: django, node"
}

image=$1
docker_file=$2

if [[ ${image} != "django" && ${image} != "node" ]]; then
    usage
    exit 1
fi

if [[ -z ${docker_file} ]]; then
    usage
    exit 1
fi

DIR="$(cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd)"
source ${DIR}/ci-env.sh

full_image="${CI_REGISTRY_IMAGE}/${image}"

# Arguments for --cache-from
cache_from_arg() {
    cache_args="--cache-from ${full_image}:${CI_RAW_CUR_COMMIT_ID}"
    cache_args="${cache_args}  --cache-from ${full_image}:${CI_RAW_PREV_COMMIT_ID}"

    if [[ -n ${CI_COMMIT_REF_SLUG} ]]; then
        cache_args="${cache_args} --cache-from ${full_image}:${CI_COMMIT_REF_SLUG}"
    fi

    TARGET_BRANCH="${CI_COMMIT_REF_SLUG:-master}"

    if [[ -n ${TARGET_BRANCH} ]] && [[ ${CI_COMMIT_REF_SLUG} != ${TARGET_BRANCH} ]]; then
        cache_args="${cache_args} --cache-from ${full_image}:${TARGET_BRANCH}"
    fi

    cache_args="${cache_args} --cache-from ${full_image}:latest"

    echo ${cache_args}
}

set -x

# Build the image
docker build \
    -f ${docker_file} \
    $(cache_from_arg) \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    --build-arg RELEASE_VERSION=${CI_COMMIT_TAG:-$CI_RAW_CUR_COMMIT_ID} \
    -t "${full_image}:${CI_RAW_CUR_COMMIT_ID}" .

# Push the image
echo "Pushing ${full_image} from for commit [${CI_RAW_CUR_COMMIT_ID}]"
docker push "${full_image}:${CI_RAW_CUR_COMMIT_ID}"

# Also push an environment-prefixed tag (dev-<sha> / prod-<sha>) so
# argocd-image-updater consumers can filter on it via allowTags regexp.
# Harmless when the project is ansible-only (just an extra registry tag
# nobody pulls).
#
# Three ways to set the env prefix, in priority order:
#   1. IMAGE_ENV_PREFIX env var: explicit override. Set this as a GitLab
#      CI variable (project or schedule level) for projects whose branch
#      naming doesn't match the defaults, or for one-off manual prod
#      pushes from a feature branch.
#   2. Branch -> env mapping (Thorgate convention; `live` is the
#      historical prod inventory group name):
#        master|main|prod|production|live|stable -> prod
#        develop|dev|staging                      -> dev
#   3. Otherwise: skip the env-prefixed push (other branches stay
#      unprefixed).
ENV_PREFIX="${IMAGE_ENV_PREFIX:-}"
if [[ -z ${ENV_PREFIX} ]]; then
    case "${CI_COMMIT_REF_SLUG:-}" in
        master|main|prod|production|live|stable)  ENV_PREFIX=prod ;;
        develop|dev|staging)                       ENV_PREFIX=dev ;;
    esac
fi
if [[ -n ${ENV_PREFIX} ]]; then
    env_tag="${ENV_PREFIX}-${CI_RAW_CUR_COMMIT_ID}"
    echo "Tagging and pushing env-prefixed: ${full_image}:${env_tag}"
    docker tag "${full_image}:${CI_RAW_CUR_COMMIT_ID}" "${full_image}:${env_tag}"
    docker push "${full_image}:${env_tag}"
fi

if [[ -n ${CI_COMMIT_TAG} ]]; then
    echo "Tagging image with git tag ${CI_COMMIT_TAG}"
    docker tag "${full_image}:${CI_RAW_CUR_COMMIT_ID}" "${full_image}:${CI_COMMIT_TAG}"
    docker push "${full_image}:${CI_COMMIT_TAG}"
elif [[ -n ${CI_COMMIT_REF_SLUG} ]]; then
    echo "Ensuring origin/${CI_COMMIT_REF_NAME} is up to date"
    git fetch origin ${CI_COMMIT_REF_NAME}

    CUR_HEAD=$(git rev-parse HEAD)
    BRANCH_HEAD=$(git rev-parse origin/${CI_COMMIT_REF_NAME})

    if [[ ${CUR_HEAD} == ${BRANCH_HEAD} ]]; then
        echo "Tagging and pushing as branch ${CI_COMMIT_REF_SLUG}"
        docker tag "${full_image}:${CI_RAW_CUR_COMMIT_ID}" "${full_image}:${CI_COMMIT_REF_SLUG}"
        docker push "${full_image}:${CI_COMMIT_REF_SLUG}"

        if [[ ${CI_COMMIT_REF_SLUG} == ${CI_DEFAULT_BRANCH} ]]; then
            echo "Tagging as latest since commit is HEAD of default branch"
            docker tag "${full_image}:${CI_RAW_CUR_COMMIT_ID}" "${full_image}:latest"
            docker push "${full_image}:latest"
        fi
    else
        echo "Not tagging as branch since commit is not HEAD of ${CI_COMMIT_REF_SLUG}"
    fi
else
    echo "Not tagging as branch since CI_COMMIT_REF_SLUG is not set"
fi
