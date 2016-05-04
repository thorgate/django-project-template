#!/usr/bin/env python
import os
import shutil


def handle_react():
    cwd = os.getcwd()
    is_react_project = '{{ cookiecutter.is_react_project }}' == 'y'

    print('is_react_project: %s ({{ cookiecutter.is_react_project }})' % str(is_react_project))
    print('cleanup paths in %s' % cwd)

    if is_react_project:
        cleanup_paths = [
            '{{ cookiecutter.repo_name }}/.bowerrc',
            '{{ cookiecutter.repo_name }}/bower.json',
            '{{ cookiecutter.repo_name }}/static/config.rb',
            '{{ cookiecutter.repo_name }}/static/css',
            '{{ cookiecutter.repo_name }}/static/fonts',
            '{{ cookiecutter.repo_name }}/static/js',
            '{{ cookiecutter.repo_name }}/static/sass',
            '{{ cookiecutter.repo_name }}/templates/accounts',
            '{{ cookiecutter.repo_name }}/templates/registration',
            '{{ cookiecutter.repo_name }}/templates/base.html',
            '{{ cookiecutter.repo_name }}/templates/home.html',
            '{{ cookiecutter.repo_name }}/accounts/forms.py',
            '{{ cookiecutter.repo_name }}/accounts/urls.py',
        ]
        symlinks = [
            ('../../../../templates/500.html', '{{ cookiecutter.repo_name }}/app/src/server/templates/500.html'),
        ]

    else:
        cleanup_paths = [
            '{{ cookiecutter.repo_name }}/{{ cookiecutter.repo_name }}/api_urls.py',
            '{{ cookiecutter.repo_name }}/app',
            '{{ cookiecutter.repo_name }}/accounts/api_urls.py',
            '{{ cookiecutter.repo_name }}/accounts/serializers.py',
            '{{ cookiecutter.repo_name }}/static/ensure',
            '{{ cookiecutter.repo_name }}/package.json',
            '{{ cookiecutter.repo_name }}/process.json',
            '{{ cookiecutter.repo_name }}/{{ cookiecutter.repo_name }}-server.js',
            '{{ cookiecutter.repo_name }}/webpack_constants.py',
        ]
        symlinks = []

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


def main():
    """Do some stuff based on configuration"""

    handle_react()


if __name__ == '__main__':
    main()
