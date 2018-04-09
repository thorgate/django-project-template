#!/bin/bash
set -x
codecept_dir=$(realpath -- "$(dirname -- "${BASH_SOURCE[0]}")")
root_dir=$(realpath -- "${codecept_dir}/../../")
proj_name=$(basename "$root_dir")

function log {
    printf "[codecept-runner] %s\n" "$*" >&2
}

function help {
    log "Run codecept tests"
    log "Arguments"
    log "  --reuse-db  reuse database from last run"
    log ""
    log "Any arguments after -- are passed on to codecept, for example:"
    log "./run.sh -- codeceptjs run --steps"
    exit 0
}

getopt --test > /dev/null
if [[ $? -ne 4 ]]; then
    log "I’m sorry, `getopt --test` failed in this environment."
    exit 1
fi

LONGOPTIONS=reuse-db,help

PARSED=$(getopt --options : --longoptions=$LONGOPTIONS --name "$0" -- "$@")
if [[ $? -ne 0 ]]; then
    # e.g. $? == 1
    #  then getopt has complained about wrong arguments to stdout
    exit 2
fi

# read getopt's output this way to handle the quoting right:
eval set -- "$PARSED"

reuse_db='no'

while true; do
    case "$1" in
        --reuse-db)
            reuse_db=y
            shift
            ;;
        --help)
            help
            ;;
        --)
            shift
            break
            ;;
        *)
            log "Programming error"
            exit 3
            ;;
    esac
done


set -e

cd -- "$root_dir"

log "Killing existing containers to avoid possible port conflicts"
docker-compose kill

log "Cleaning up pyc files"
docker-compose run --rm django find . -iname '*.pyc' -delete

export COMPOSE_FILE="docker-compose.yml:docker-compose.codecept.yml"
export COMPOSE_PROJECT_NAME="codecept_$(printf '%s' "$proj_name" | tr '[:space:]' _)"

function stop-containers {
  docker-compose kill
}
trap stop-containers EXIT

if [[ $reuse_db != 'y' ]]; then
    log "Deleteing existing database"
    docker-compose run --rm postgres rm -rf '/var/lib/postgresql/data/*'

    log "Loading migrations"
    EDIT_SETTINGS=no make migrate

    log "Loading fixtures"
    # Load fixtures etc here
    for f in "${codecept_dir}/django_fixtures/"*; do

        # Translate path to what is expected by django container
        filename="codecept/${f#$codecept_dir}"

        log "Loading fixture ${filename}"
        docker-compose run --rm django python manage.py loaddata "$filename";
    done
fi

docker-compose up --no-start
docker-compose start

# Can't use docker-compose healthchecks since
# servers use old docker-compose version, do it
# manually instead
docker-compose run --rm django python -c "
from urllib.request import urlopen
import time

for i in range(20):
    try:
        r = urlopen('http://node/api/ping')
        break
    except Exception as exc:
        http_exc = exc
        print('Node not up yet, waiting...')
        time.sleep(3)
else:
    assert False, f'timed out waiting for node, {http_exc}'
"

docker-compose run --rm codeceptjs "$@"
