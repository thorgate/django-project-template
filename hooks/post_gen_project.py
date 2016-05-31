#!/usr/bin/env python
import os
import shutil


def handle_react():
    cwd = os.getcwd()
    project_type = '{{ cookiecutter.project_type }}'

    print('project_type: %s' % project_type)
    print('cleanup paths in %s' % cwd)

    if project_type == 'spa':
        cleanup_paths = [
            '{{ cookiecutter.repo_name }}/app-standard',
            '{{ cookiecutter.repo_name }}/static/styles-src',
            '{{ cookiecutter.repo_name }}/templates/accounts',
            '{{ cookiecutter.repo_name }}/templates/registration',
            '{{ cookiecutter.repo_name }}/templates/base.html',
            '{{ cookiecutter.repo_name }}/templates/home.html',
            '{{ cookiecutter.repo_name }}/accounts/forms.py',
            '{{ cookiecutter.repo_name }}/accounts/urls.py',
            '{{ cookiecutter.repo_name }}/{{ cookiecutter.repo_name }}/context_processors.py',
        ]
        symlinks = [
            ('../../../../templates/500.html', '{{ cookiecutter.repo_name }}/app/src/server/templates/500.html'),
        ]

        os.rename('{{ cookiecutter.repo_name }}/app-spa', '{{ cookiecutter.repo_name }}/app')

    else:
        cleanup_paths = [
            '{{ cookiecutter.repo_name }}/{{ cookiecutter.repo_name }}/api_urls.py',
            '{{ cookiecutter.repo_name }}/app-spa',
            '{{ cookiecutter.repo_name }}/accounts/api_urls.py',
            '{{ cookiecutter.repo_name }}/accounts/serializers.py',
            '{{ cookiecutter.repo_name }}/static/ensure',
            '{{ cookiecutter.repo_name }}/{{ cookiecutter.repo_name }}-server.js',
            '{{ cookiecutter.repo_name }}/webpack_constants.py',
        ]
        symlinks = []

        os.rename('{{ cookiecutter.repo_name }}/app-standard', '{{ cookiecutter.repo_name }}/app')

    # If using specific vcs, add some extra cleanup paths
    repo_type = '{{ cookiecutter.vcs }}'.lower()
    if repo_type not in {'git', 'hg', 'none'}:
        repo_type = 'none'

    if repo_type == 'git':
        print('Repo is git, removing hg specific files')
        cleanup_paths += ['.hgignore']

    if repo_type == 'hg':
        print('Repo is hg, removing git specific files')
        cleanup_paths += ['.gitignore']

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
                if e.errno == os.errno.EACCES:
                    res = 'ACCESS DENIED'

                else:
                    raise

        print('Removing %s: %s' % (path, res))

    for src, dst in symlinks:
        os.symlink(src, dst)

    # Move package.json from app dir to Django project dir
    os.rename('{{ cookiecutter.repo_name }}/app/package.json', '{{ cookiecutter.repo_name }}/package.json')


def main():
    """Do some stuff based on configuration"""

    handle_react()


if __name__ == '__main__':
    main()
