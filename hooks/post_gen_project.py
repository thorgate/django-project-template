#!/usr/bin/env python
import errno
import os
import shutil
import subprocess
from enum import Enum
from typing import List, Tuple

YES = "{{YES}}"
NO = "{{NO}}"
WEBAPP = "{{WEBAPP}}"
SPA = "{{SPA}}"
ALPINE = "{{ALPINE}}"
DEBIAN = "{{DEBIAN}}"


class EncryptionPrompt(Enum):
    ENCRYPTED = 1
    EXCLUDED = 2


def cleanup():
    cwd = os.getcwd()
    print('cleanup paths in %s' % cwd)

    cleanup_paths = []
    rename_paths: List[Tuple[str, str]] = []  # Tuples of old -> new path
    symlinks = []

    dockerfiles = [
        'Dockerfile-django',
        'Dockerfile-django.production',
        'Dockerfile-node',
        'Dockerfile-node.production',
        'Dockerfile-poetry',
    ]

    if '{{ cookiecutter.docker_base_image }}' == ALPINE:
        cleanup_paths += [
            f'{dockerfile}.debian'
            for dockerfile in dockerfiles
        ]
    elif '{{ cookiecutter.docker_base_image }}' == DEBIAN:
        rename_paths += [
            (f'{dockerfile}.debian', dockerfile)
            for dockerfile in dockerfiles
        ]

    if '{{ cookiecutter.include_celery}}' == NO:
        cleanup_paths += [
            '{{ cookiecutter.repo_name }}/{{ cookiecutter.repo_name }}/celery.py',
            '{{ cookiecutter.repo_name }}/{{ cookiecutter.repo_name }}/celery_settings.py',
            '{{ cookiecutter.repo_name }}/{{ cookiecutter.repo_name }}/tasks.py',
        ]

    if '{{ cookiecutter.frontend_style }}' == WEBAPP:
        cleanup_paths += [
            'app',
            'Dockerfile-node.production',
            '{{cookiecutter.repo_name}}/accounts/api_urls.py',
            '{{cookiecutter.repo_name}}/accounts/jwt',
            '{{cookiecutter.repo_name}}/accounts/rest',
            '{{cookiecutter.repo_name}}/templates/emails/base.txt',
            '{{cookiecutter.repo_name}}/templates/emails/password_reset.txt',
            '{{cookiecutter.repo_name}}/{{cookiecutter.repo_name}}/rest/',
            '{{cookiecutter.repo_name}}/static/502.html',
            '{{cookiecutter.repo_name}}/static/robots.txt',
            'ansible/roles/deploy/templates/razzle.env',
            'ansible/roles/deploy/templates/nginx/conf.d/common.node.include',
            'ansible/roles/deploy/templates/nginx/conf.d/app.proxy_node.include',
            'deploy/nginx/app.{{cookiecutter.repo_name}}.proxy_node.include',
            'deploy/nginx/common.{{cookiecutter.repo_name}}.node.include',
        ]
    elif '{{ cookiecutter.frontend_style }}' == SPA:
        cleanup_paths += [
            'webapp',
            '{{cookiecutter.repo_name}}/accounts/emails.py',
            '{{cookiecutter.repo_name}}/accounts/forms.py',
            '{{cookiecutter.repo_name}}/accounts/urls.py',
            '{{cookiecutter.repo_name}}/accounts/views.py',
            '{{cookiecutter.repo_name}}/templates/accounts/',
            '{{cookiecutter.repo_name}}/templates/base.html',
            '{{cookiecutter.repo_name}}/templates/home.html',
            '{{cookiecutter.repo_name}}/templates/registration/',
        ]

    if '{{ cookiecutter.webapp_include_storybook }}' == NO and '{{ cookiecutter.frontend_style }}' == WEBAPP:
        cleanup_paths += [
            'webapp/webapp/src/.storybook',
            'webapp/webapp/src/storyshots.test.js',
            'webapp/webapp/src/components/Counter/Counter.stories.js',
            'webapp/webapp/src/components/HelloWorld/HelloWorld.stories.js',
            'webapp/webapp/src/components/NavigationBar/NavigationBar.stories.js',
        ]

    if '{{ cookiecutter.use_cypress }}' == NO:
        cleanup_paths += [
            '.env.cypress',
            'docker-compose.cypress.yml',
            'Makefile-cypress',
            'cypress/',
            '{{cookiecutter.repo_name}}/cypress/',
            '{{cookiecutter.repo_name}}/settings/test_cypress.py',
        ]
    else:
        if '{{ cookiecutter.frontend_style }}' == SPA:
            # Order is important: rename first, then cleanup
            rename_paths = [
                ('cypress/cypress.json', 'app/cypress.json'),
                ('cypress/integration/spa.auth.spec.js', 'cypress/integration/auth.spec.js'),
                ('cypress/', 'app/cypress'),
            ]
            cleanup_paths += [
                'app/cypress/integration/webapp.auth.spec.js',  # operate on an already renamed path
            ]
        elif '{{ cookiecutter.frontend_style }}' == WEBAPP:
            # Order is important: rename first, then cleanup
            rename_paths = [
                ('cypress/cypress.json', 'webapp/cypress.json'),
                ('cypress/integration/webapp.auth.spec.js', 'cypress/integration/auth.spec.js'),
                ('cypress/', 'webapp/cypress'),
            ]
            cleanup_paths += [
                'webapp/cypress/integration/spa.auth.spec.js',  # operate on an already renamed path
            ]

    if '{{ cookiecutter.thorgate }}' == NO:
        cleanup_paths += ['utils/terraform', 'tg-project.yaml']
    else:
        cleanup_paths += [
            'ansible/roles/deploy/tasks/nginx_shared.yml',
            'ansible/roles/deploy/tasks/files/nginx-shared',
        ]

    if '{{ cookiecutter.build_in_ci }}' == NO:
        cleanup_paths += [
            "ansible/roles/deploy/templates/registry.sh",
            "scripts/images",
        ]

    if '{{ cookiecutter.use_mypy }}' == NO:
        cleanup_paths += [
            '{{cookiecutter.repo_name}}/mypy.ini',
        ]

    if '{{ cookiecutter.use_auto_deploy }}' == NO:
        cleanup_paths += [
            "ansible/roles/autodeploy",
            "ansible/ansible-ci.cfg",
            "ansible/autodeploy.yml",
            "ansible/autodeploy.adoc",
            "scripts/deploy",
        ]

    # remove CC leftovers
    kill_lines(cwd)

    # Rename first, then cleanup
    for old_path, new_path in rename_paths:
        old_full_path = os.path.join(cwd, old_path)
        new_full_path = os.path.join(cwd, new_path)

        os.rename(old_full_path, new_full_path)

    for path in cleanup_paths:
        full_path = os.path.join(cwd, path)

        if not os.path.exists(full_path):
            res = 'NO FILE'
        else:
            if os.path.isdir(full_path):
                fn = shutil.rmtree
            else:
                fn = os.remove

            try:
                fn(full_path)
                res = 'OK'

            except OSError as e:
                if e.errno == errno.EACCES:
                    res = 'ACCESS DENIED'

                else:
                    raise

        print('Removing %s: %s' % (path, res))

    for src, dst in symlinks:
        os.symlink(src, dst)

    run_lint_fix(cwd)


def kill_lines(path):
    """
    Will run sed on all files in path and remove leftovers from commented out cookie cutter code ` # - ` or ` // - `
    """
    re = '^\s*(#|//) -\s*$'
    for escape in "()/|":
        re = re.replace(escape, fr"\{escape}")
    sed_command = f"/{re}/d"
    print(f"removing kill lines | {sed_command} | @ { path }")
    return subprocess.check_call(["find", path, "-type", "f", "-exec", "sed", "-i", sed_command, "{}", "+"])


def run_lint_fix(path):
    subprocess.check_call(["ruff","--cache-dir=.ruff_cache", "--fix", path])
    subprocess.check_call(["ruff","--cache-dir=.ruff_cache", "--select", "I", path])
    subprocess.check_call(["ruff","format", "--cache-dir=.ruff_cache", path])

def ask_input(prompt, default_response=None, allowed_responses=None):
    while True:
        result = input(prompt)

        if allowed_responses is None:
            if result:
                return result.lower()

        if result.lower() in allowed_responses:
            return result.lower()

        if not result and default_response:
            return default_response.lower()


def ansible_vault_encrypt():
    ansible_vault_file = "host_vars/{{ cookiecutter.test_host }}/vault.yml"

    with open(os.path.join('ansible', ansible_vault_file)) as fp:
        if "ANSIBLE_VAULT" in fp.read():
            return EncryptionPrompt.ENCRYPTED

    # Disable vault encryption and any prompts
    # This means that default action of not committing vault file will be applied
    is_disabled = os.getenv("DISABLE_PROJECT_TEMPLATE_VAULT_ENCRYPT")
    if is_disabled and is_disabled == '1':
        return EncryptionPrompt.EXCLUDED

    has_ansible_support = False
    if shutil.which('ansible-vault') is not None:
        has_ansible_support = True

    if has_ansible_support:
        should_encrypt = ask_input(
            "Encrypt ansible vault for {{ cookiecutter.test_host }}? [Y/n] ",
            default_response="y",
            allowed_responses=["y", "n"]
        )

        if should_encrypt == "y":
            cwd = os.getcwd()
            subprocess.check_call(
                ['ansible-vault', 'encrypt', ansible_vault_file],
                cwd=os.path.join(cwd, 'ansible'),
            )
            print("Vault files are encrypted")
            return EncryptionPrompt.ENCRYPTED

    print("Vault files are not added to VCS")
    return EncryptionPrompt.EXCLUDED


def is_git_repository(path):
    return path.startswith('/') and os.path.exists(path) and os.path.exists(os.path.join(path, '.git'))


def get_local_commit(template_dir='{{ cookiecutter._template }}'):
    return subprocess.check_output(["git", "rev-parse", "@"], cwd=template_dir).decode().strip()


def get_commit_details(commit_id, template_dir='{{ cookiecutter._template }}'):
    sep = ':|:|:'

    return subprocess.check_output([
        "git",
        "--no-pager",
        "log",
        "-n",
        "1",
        "--oneline",
        "--format=%H{0}%an <%ae>{0}%cI{0}%s".format(sep),
        commit_id,
    ], cwd=template_dir).decode().strip().split(':|:|:')


def get_local_branch(template_dir='{{ cookiecutter._template }}'):
    return subprocess.check_output(["git", "rev-parse", "--abbrev-ref", "@"], cwd=template_dir).decode().strip()


def create_repos():
    if subprocess.check_call(['git', '--version']) != 0:
        # This is unlikely, but just in case, display some sensible message.
        print("No git executable found on path. Skipping Git setup")
        return

    if os.path.exists('.git'):
        print('Creating git repository - SKIP - already exists')
        return

    ansible_vault_encryption = ansible_vault_encrypt()

    template_dir = '{{ cookiecutter._template }}'

    initial_commit_message = 'Initial commit\n\nCreated from django-project-template'
    if is_git_repository(template_dir):
        commit_id = get_local_commit(template_dir)
        initial_commit_message = '{} `{} {}`'.format(
            initial_commit_message,
            get_local_branch(),
            ' '.join(get_commit_details(commit_id)),
        )

    print('Creating git repository')
    subprocess.check_call(['git', 'init'])
    subprocess.check_call(['git', 'checkout', '-b', 'template'])
    subprocess.check_call(['git', 'add', '.'])

    if ansible_vault_encryption == EncryptionPrompt.EXCLUDED:
        ansible_vault_file = "ansible/host_vars/{{ cookiecutter.test_host }}/vault.yml"
        subprocess.check_call(['git', 'rm', '--cached', ansible_vault_file])

    subprocess.check_call(['git', 'commit', '-m', initial_commit_message])
    subprocess.check_call(['git', 'checkout', '-b', 'master'])

    print('Git repository initialized. First commit is in branch `template`.')
    print('Create a repository in Gitlab (https://gitlab.com/projects/new).')
    print('Look for the repository address and run:')
    print('    git remote add origin <repository_address>')
    print('    git push -u origin master')
    print('    git checkout template')
    print('    git push -u origin template')


def main():
    """Do some stuff based on configuration"""

    cleanup()
    create_repos()


if __name__ == '__main__':
    main()
