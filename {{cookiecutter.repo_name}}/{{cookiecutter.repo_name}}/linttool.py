#!/usr/bin/env python

"""
Utility to find linting issues relevant to PRs/commits.

Usage: git diff [...] | ./linttool.py
    i.e. pipe diff from hg/git as input

Reads diff from standard input. Then runs linters (eslint and prospector) on the working copy.
The linting errors and warnings are then filtered to include only the ones that are part of the diff.
"""

import io
import json
import os
import subprocess
import sys
from subprocess import CalledProcessError

from unidiff import PatchSet


def get_cmd_output_as_json(command):
    try:
        output = subprocess.check_output(command.split())
    except CalledProcessError as e:
        output = e.output

    return json.loads(output.decode('utf-8'))


class LinterBase(object):
    extensions_whitelist = None

    def __init__(self, diff_files, sources_root):
        self.diff_files = diff_files
        self.sources_root = sources_root

    def should_run(self):
        if self.extensions_whitelist is None:
            return True

        for filename in self.diff_files.keys():
            for ext in self.extensions_whitelist:
                if filename.endswith(ext):
                    return True

        return False


class ProspectorLinter(LinterBase):
    name = 'prospector'
    extensions_whitelist = ['.py']

    def get_issues(self):
        output = get_cmd_output_as_json('prospector -o json')

        issues = []
        for msg in output['messages']:
            filename = msg['location']['path']
            line_no = msg['location']['line']

            if filename not in self.diff_files or line_no not in self.diff_files[filename]:
                continue

            issues.append({
                'filename': filename,
                'line': line_no,
                'column': msg['location'].get('character', ''),
                'message': msg['message'],
            })

        return issues


class ESLintLinter(LinterBase):
    name = 'eslint'
    extensions_whitelist = ['.js', '.jsx']

    def get_issues(self):
        output = get_cmd_output_as_json('npm --silent run lint -- -f json')

        issues = []
        for file in output:
            filename = os.path.relpath(file['filePath'], self.sources_root)
            if filename not in self.diff_files:
                continue

            for msg in file['messages']:
                line_no = msg['line']

                if line_no not in self.diff_files[filename]:
                    continue

                issues.append({
                    'filename': filename,
                    'line': line_no,
                    'column': msg.get('column', ''),
                    'message': msg['message'],
                })

        return issues


def get_diff():
    return sys.stdin.read()


def get_changed_files_and_lines(diff_content, sources_basename):
    """
    Parses given diff file and returns dict where keys are filenames of changed files and values are sets of line
    numbers of changed files (in target files).
    """

    diff = PatchSet(io.StringIO(diff_content))

    diff_files = {}
    for file in diff:
        path_tokens = file.path.split('/', 1)
        if len(path_tokens) != 2:
            continue
        basedir, path = path_tokens
        if basedir != sources_basename:
            continue

        line_nos = set()
        for hunk in file:
            # Add target line nos of added (incl changed) lines.
            line_nos |= {line.target_line_no for line in hunk if line.is_added}

        diff_files[path] = line_nos

    return diff_files


def process():
    sources_root = os.path.dirname(os.path.abspath(__file__))
    sources_basename = os.path.basename(sources_root)

    # Get the processed diff
    print("Getting diff...")
    diff_content = get_diff()
    diff_files = get_changed_files_and_lines(diff_content, sources_basename)
    print("Found %d relevant files in diff" % len(diff_files))

    # Run linters
    linter_classes = [ESLintLinter, ProspectorLinter]
    issues = []
    for linter_cls in linter_classes:
        linter = linter_cls(diff_files, sources_root)

        if not linter.should_run():
            continue

        print("Running %s..." % linter.name)
        issues += linter.get_issues()

    # Sort output from all linters by filename & line
    issues = sorted(issues, key=lambda issue: (issue['filename'], issue['line']))

    print("")
    if not issues:
        print("No issues!  :-)")
        return 0

    print("Found %d issues" % len(issues))
    for issue in issues:
        print("%(filename)s: %(line)d:%(column)s: %(message)s" % issue)
    return 1



if __name__ == '__main__':
    if os.isatty(sys.stdin.fileno()):
        print(__doc__.strip())
        sys.exit(1)

    sys.exit(process())
