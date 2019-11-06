import json
import os
import subprocess
import sys
import re

import cookiecutter

from cookiecutter.prompt import read_user_yes_no

from fqdn import FQDN


# Ensure cookiecutter is recent enough
cookiecutter_min_version = '1.6.0'
if cookiecutter.__version__ < cookiecutter_min_version:
    print("--------------------------------------------------------------")
    print("!! Your cookiecutter is too old, at least %s is required !!" % cookiecutter_min_version)
    print("--------------------------------------------------------------")
    sys.exit(1)


def is_git_repository(path):
    return path.startswith('/') and os.path.exists(path) and os.path.exists(os.path.join(path, '.git'))


def check_remote_repository_updates():
    template_dir = '{{ cookiecutter._template }}'
    if not is_git_repository(template_dir):
        print("Template dir is not absolute dir or not Git repo; skipping freshness check")
        return

    print('Template dir:', template_dir)
    print('Checking for latest template version via git')
    subprocess.call(["git", "fetch"], cwd=template_dir)
    print('')

    # Warn user if the version of the template that's being used is not the latest available
    local_sha = subprocess.check_output(["git", "rev-parse", "@"], cwd=template_dir).decode().strip()
    local_branch = subprocess.check_output(["git", "rev-parse", "--abbrev-ref", "@"], cwd=template_dir).decode().strip()
    if local_branch == 'HEAD':
        remote_branch = 'master'  # default to master
    else:
        remote_branch = local_branch

    try:
        remote_sha = subprocess.check_output(["git", "rev-parse", "origin/{}".format(remote_branch)], cwd=template_dir).decode().strip()

    except subprocess.CalledProcessError:
        # The branch is probably not pushed
        remote_sha = None

    # Print out the template version info
    print('local commit: {}; branch: {}'.format(local_sha, local_branch))
    print('remote commit: {}; branch: {}'.format(remote_sha, remote_branch))
    print()

    if local_sha != remote_sha:
        if not read_user_yes_no(
                'The template version you are using is not the latest available, are you sure you want to continue?',
                default_value='yes'):
            print("Bye!")
            sys.exit(1)


def validate_config():
    # Ensure the selected repo name is usable
    repo_name = '{{ cookiecutter.repo_name }}'
    assert_msg = 'Repo name should be valid Python identifier!'

    if hasattr(repo_name, 'isidentifier'):
        assert repo_name.isidentifier(), assert_msg
    else:
        identifier_re = re.compile(r"[a-zA-Z_][a-zA-Z0-9_]*$")
        assert bool(identifier_re.match(repo_name)), assert_msg

    valid_cms_key = ['yes', 'no']
    if "{{ cookiecutter.include_cms }}" not in valid_cms_key:
        print("Include CMS '{{ cookiecutter.include_cms }}' is not valid!")
        print("Valid include CMS keys are: %s" % ', '.join(valid_cms_key))
        sys.exit(1)

    valid_celery_key = ['yes', 'no']
    if "{{ cookiecutter.include_celery }}" not in valid_celery_key:
        print("Include Celery '{{ cookiecutter.include_celery }}' is not valid!")
        print("Valid include Celery keys are: %s" % ', '.join(valid_celery_key))
        sys.exit(1)

    valid_docs_key = ['yes', 'no']
    if "{{ cookiecutter.include_docs }}" not in valid_docs_key:
        print("Include docs '{{ cookiecutter.include_docs }}' is not valid!")
        print("Valid include Docs keys are: %s" % ', '.join(valid_docs_key))
        sys.exit(1)

    valid_thorgate_key = ['yes', 'no']
    if "{{ cookiecutter.thorgate }}" not in valid_thorgate_key:
        print("Thorgate '{{ cookiecutter.thorgate }}' is not valid!")
        print("Valid thorgate keys are: %s" % ', '.join(valid_thorgate_key))

    if not re.match(r'(3\.[4-7](\.\d+)?)', "{{ cookiecutter.python_version }}"):
        print("Only allowed python version options are 3.4.x, 3.5.x, 3.6.x and 3.7.x.")
        sys.exit(1)

    if not re.match(r'((8|9|10|11)(\.\d+){0,2})', "{{ cookiecutter.node_version }}"):
        print("Only allowed Node.js version's start from 8.")
        sys.exit(1)

    valid_dme_keys = ['S3', 'GCS']
    if "{{ cookiecutter.django_media_engine }}" not in valid_dme_keys:
        print("Django media engine '{{ cookiecutter.django_media_engine }}' is not valid!")
        print("Valid media engines are: %s" % ', '.join(valid_dme_keys))
        sys.exit(1)

    if not FQDN("{{ cookiecutter.test_host }}").is_valid:
        print("Test host is not a valid domain name")
        sys.exit(1)

    if not FQDN("{{ cookiecutter.live_host }}").is_valid:
        print("Live host is not a valid domain name")
        sys.exit(1)

    if not FQDN("{{ cookiecutter.repo_name|as_hostname }}.{{ cookiecutter.test_host }}").is_valid:
        print("Test hostname is not a valid domain name")
        sys.exit(1)

    live_hostname = "{{ cookiecutter.live_hostname }}"
    if 'todo' not in live_hostname.lower():
        if live_hostname != live_hostname.lower():
            print("Live hostname should be lowercase")
            sys.exit(1)

        if not FQDN(live_hostname).is_valid:
            print("Live hostname is not a valid domain name")
            sys.exit(1)


def copy_cookiecutter_config(local_filename='.cookiecutterrc'):
    """ Copy cookiecutter replay for template to project dir, unless it already exists.

    This creates the initial .cookiecutterrc file when the project is first generated.
    """

    replay_filename = os.path.expanduser('~/.cookiecutter_replay/django-project-template.json')
    if not os.path.exists(replay_filename) or os.path.exists(local_filename):
        # This happens when we're upgrading an existing project
        return

    with open(replay_filename, 'r') as f_in, open(local_filename, 'w') as f_out:
        config = json.load(f_in)
        # Don't dump the template dir (stored under '_template' key)
        if '_template' in config['cookiecutter']:
            del config['cookiecutter']['_template']
        json.dump(config, f_out, indent=4, sort_keys=True)


check_remote_repository_updates()
validate_config()
copy_cookiecutter_config()
