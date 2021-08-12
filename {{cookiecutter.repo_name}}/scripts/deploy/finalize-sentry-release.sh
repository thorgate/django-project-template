#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
. ${DIR}/sentry-env.sh


echo_cyan "Tagging commits for ${CI_COMMIT_TAG} under ${SENTRY_ORGANIZATION}/${SENTRY_PROJECT}"
echo_cyan "    Api root: ${SENTRY_URL}"

sentry-cli releases --org=$SENTRY_ORGANIZATION set-commits "${CI_COMMIT_TAG}" --auto
