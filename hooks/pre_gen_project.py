import json
import os
import subprocess
import sys
import re

import cookiecutter

from cookiecutter.prompt import read_user_yes_no

from fqdn import FQDN

YES = "{{YES}}"
NO = "{{NO}}"
WEBAPP = "{{WEBAPP}}"
SPA = "{{SPA}}"


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

    if os.environ.get("GITLAB_CI", "") != "":
        print("No latest version check necessary in CI")
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
                default_value=YES):
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

    valid_celery_key = [YES, NO]
    if "{{ cookiecutter.include_celery }}" not in valid_celery_key:
        print("Include Celery '{{ cookiecutter.include_celery }}' is not valid!")
        print("Valid include Celery keys are: %s" % ', '.join(valid_celery_key))
        sys.exit(1)

    valid_storybook_replies = [YES, NO]
    if "{{ cookiecutter.webapp_include_storybook }}" not in valid_storybook_replies:
        print("Your answer to Include Storybook: '{{ cookiecutter.webapp_include_storybook }}' is invalid!")
        print("Valid choices are: %s" % ', '.join(valid_storybook_replies))
        sys.exit(1)

    valid_frontend_styles = [WEBAPP, SPA]
    if "{{ cookiecutter.frontend_style }}" not in valid_frontend_styles:
        print("Your answer to Frontend style: '{{ cookiecutter.webapp_include_storybook }}' is invalid!")
        print("Valid choices are: %s" % ', '.join(valid_frontend_styles))
        sys.exit(1)

    valid_thorgate_key = [YES, NO]
    if "{{ cookiecutter.thorgate }}" not in valid_thorgate_key:
        print("Thorgate '{{ cookiecutter.thorgate }}' is not valid!")
        print("Valid thorgate keys are: %s" % ', '.join(valid_thorgate_key))
        sys.exit(1)

    if not re.match(r'(alpine|debian)$', "{{ cookiecutter.docker_base_image }}"):
        print("Only alpine and debian options for docker_base_image are supported.")
        sys.exit(1)

    if not re.match(r'(3\.[6-9](\.\d+)?)', "{{ cookiecutter.python_version }}"):
        print("Only allowed python version options are 3.6 or later.")
        sys.exit(1)

    if not re.match(r'((8|10|11|12|14)(\.\d+){0,2})', "{{ cookiecutter.node_version }}"):
        print("Only allowed Node.js version's start from 8 or 10 and greater.")
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

    domain_name = "{{ cookiecutter.domain_name }}"
    if 'todo' not in domain_name.lower():
        if domain_name != domain_name.lower():
            print("Domain name should be lowercase")
            sys.exit(1)

        if not FQDN(domain_name).is_valid:
            print("Domain name is not valid")
            sys.exit(1)


def copy_cookiecutter_config(local_filename='.cookiecutterrc'):
    """ Copy cookiecutter replay for template to project dir, unless it already exists.

    This creates the initial .cookiecutterrc file when the project is first generated.
    """
    template_dir = os.path.abspath('{{ cookiecutter._template }}')
    template_name = os.path.basename(template_dir) or "django-project-template"
    replay_filename = os.path.expanduser(f'~/.cookiecutter_replay/{template_name}.json')
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
