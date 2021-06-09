#!/usr/bin/env bash

# Get the current commit id with git
export CI_RAW_CUR_COMMIT_ID=`git rev-parse HEAD`

# Get the previous commit id. We use this instead of using CI_COMMIT_BEFORE_SHA as that might
#  be 0000000000000000000000000000000000000000 in some cases (or just plain wrong in case of
#  amended commits).
export CI_RAW_PREV_COMMIT_ID=`git rev-parse HEAD~1`
