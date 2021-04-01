#!/usr/bin/env bash

set -e

cmdname=$(basename $0)

usage()
{
    cat << USAGE >&2
Usage:
    $cmdname -- command args
    -- COMMAND ARGS             Execute command with args after running entrypoint commands
USAGE
    exit 1
}


# process arguments
while [[ $# -gt 0 ]]
do
    case "$1" in
        --)
        shift
        CLI=("$@")
        break
        ;;
        --help)
        usage
        ;;
        *)
        echoerr "Unknown argument: $1"
        usage
        ;;
    esac
done

if [[ "${DPT_VENV_CACHING}" -eq "1"  ]] && [[ -z $SKIP_INSTALL ]]; then
    # Install dependencies
    echo "Installing dependencies and then running original command"
    poetry install
fi

if [[ "${DPT_VENV_CACHING}" -eq "1" ]]; then
    reported_path=$(poetry env list | cut -f 1 -d ' ')

    if [[ "${reported_path}" != "${ENV_FOLDER}" ]]; then
        echo "The env folder path does not match ENV_FOLDER setting. Please update ENV_FOLDER"
        echo " in Dockerfile-django."
        echo ""
        echo "Reported: ${reported_path}"
        echo "ENV_FOLDER: ${ENV_FOLDER}"
        echo ""
        exit 1
    fi
fi

# Run the command passed in
exec "${CLI[@]}"
