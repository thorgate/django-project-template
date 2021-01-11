#!/usr/bin/env bash

set -e

# Note: This script should be executed manually before running mirror.yml role since ansible does not have good support
#  for different sudo passwords per host (e.g. for localhost).

if ! command -v yq2 &> /dev/null
then
    echo 'Error: yq could not be found. Please install it with pip or the OS package manager.'
    echo ''
    echo -e '\tGithub repository: https://github.com/kislyuk/yq'
    echo -e '\tPyPI: https://pypi.org/project/yq/'
    echo -e '\tArch linux package: https://www.archlinux.org/packages/community/any/yq/'
    echo ''
    echo 'NB: yq relies on jq - https://stedolan.github.io/jq/download/'
    exit 1
fi

echo "Turning off the site"
docker-compose down

echo "Detecting media dir"
the_dir=`docker-compose config | yq -r '.services.django.volumes[]' | grep '/files/media' | cut -d: -f1`
echo "Media dir is ${the_dir}"

echo "Changing .data dir ownership to ${USER}"
sudo chown -R ${USER}: ${the_dir}/..

echo "Changing media dir ownership to ${USER}"
sudo chown -R ${USER}: ${the_dir}

echo "Detecting postgres data dir"
the_dir=`docker-compose config | yq -r '.services.postgres.volumes[]' | grep '/var/lib/postgresql/data' | cut -d: -f1`
echo "Postgres dir is ${the_dir}"

echo "Changing postgres dir ownership to ${USER}"
sudo chown -R ${USER}: ${the_dir}

echo "Detecting postgres mirror dir"
the_dir=`docker-compose config | yq -r '.services.postgres.volumes[]' | grep 'db-mirror' | cut -d: -f1`
echo "Postgres mirror dir is ${the_dir}"

sudo mkdir -p ${the_dir}
sudo chown -R ${USER}: ${the_dir}

echo "DONE"
