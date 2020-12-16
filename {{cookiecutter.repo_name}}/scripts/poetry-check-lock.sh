#!/bin/sh

# Once poetry gets a built in command to perform the lockfile freshness check,
#  this script can be removed.
# see https://github.com/python-poetry/poetry/issues/453

set -e

poetry run python -c "from poetry.factory import Factory; l = Factory().create_poetry('.').locker; exit(0) if l.is_locked() and l.is_fresh() else exit(1)" \
 && echo 'poetry.lock is up to date' || echo 'poetry.lock is out of date'
