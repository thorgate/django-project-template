#!/bin/bash

mode="full"
while [ "$#" -gt 0 ]; do
  case "$1" in
    -l) mode=`echo "last"`; shift 1;;
    -f) mode=`echo "full"`; shift 1;;
    -d) mode=`echo "drone"`; shift 1;;

    -*) echo "unknown option: $1" >&2; exit 1;;
  esac
done

DIFF_TOOL=
if [[ -d ../.hg || -d .hg ]]; then
  DIFF_TOOL="hg diff -c tip"

  if [[ "$mode" = "drone" && "$DRONE_BRANCH" != "default" ]]; then
    DIFF_TOOL="hg diff -r default"
  fi
elif [[ -d ../.git || -d .git ]]; then
  DIFF_TOOL="git diff HEAD^ HEAD"

  if [[ "$mode" = "drone" && "$DRONE_BRANCH" != "master" ]]; then
    DIFF_TOOL="git diff `git rev-parse origin/master`"
  fi
fi

if [ ! -f manage.py ]; then
    cd {{cookiecutter.repo_name}}
fi

EXIT=0
if [ "$mode" = "full" ]; then
    npm run lint || EXIT=$?
    prospector || EXIT=$?
elif [ -n "$DIFF_TOOL" ]; then
    eval ${DIFF_TOOL} | python linttool.py || EXIT=$?
fi
py.test || EXIT=$?
exit ${EXIT}
