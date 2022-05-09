#!/usr/bin/env bash

# A script that is used as a node entrypoint during development.

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

# Run the command passed in
eval "${CLI[@]}"
