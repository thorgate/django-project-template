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
cookiecutter_min_version = '1.7.0'
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

    if re.match(r'/(.*)/$', "{{ cookiecutter.django_admin_path }}"):
        print("Django Admin URL path should not start or end with a `/`.")
        sys.exit(1)

    if re.match(r'/(.*)/$', "{{ cookiecutter.django_health_check_path }}"):
        print("Django Health check URL path should not start or end with a `/`.")
        sys.exit(1)

    if not FQDN("{{ cookiecutter.test_host }}").is_valid:
        print("Test host is not a valid domain name")
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
