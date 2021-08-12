#!/usr/bin/env bash

echo_red() {
    echo -e "\033[1;31m$1\033[0m"
}

echo_cyan() {
    echo -e "\033[1;36m$1\033[0m"
}

if [[ -z ${SENTRY_URL} ]]; then
    echo_red "SENTRY_URL not specified - skipping"
    exit 0
fi

if [[ -z ${SENTRY_AUTH_TOKEN} ]]; then
    echo_red "SENTRY_AUTH_TOKEN not specified - skipping"
    exit 0
fi

if [[ -z ${SENTRY_PROJECT} ]]; then
    echo_red "SENTRY_PROJECT not specified - skipping"
    exit 0
fi

if [[ -z ${CI_COMMIT_TAG} ]] || [[ "${CI_COMMIT_TAG}" == "" ]]; then
    echo_red "CI_COMMIT_TAG not specified - skipping"
    exit 0
fi

if ! command -v sentry-cli &> /dev/null; then
    if ! command -v curl &> /dev/null; then
        apk add curl
    fi

    # Install sentry cli
    curl -sL https://sentry.io/get-cli/ | bash
fi

export SENTRY_LOG_LEVEL=info
