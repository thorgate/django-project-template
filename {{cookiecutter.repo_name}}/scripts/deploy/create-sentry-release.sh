#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
. ${DIR}/sentry-env.sh


echo_cyan "Creating new release ${CI_COMMIT_TAG} for ${SENTRY_ORGANIZATION}/${SENTRY_PROJECT}"
echo_cyan "    Api root: ${SENTRY_URL}"

sentry-cli releases --org="${SENTRY_ORGANIZATION}" new -p "${SENTRY_PROJECT}" "${CI_COMMIT_TAG}"
