#!/usr/bin/env python
import os
import shutil
import subprocess


def handle_react():
    cwd = os.getcwd()
    print('cleanup paths in %s' % cwd)

    cleanup_paths = []
    symlinks = []

    if '{{ cookiecutter.include_cms }}' == 'no':
        cleanup_paths += ['{{ cookiecutter.repo_name }}/templates/cms_main.html']

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


def create_repos():
    repo_type = '{{ cookiecutter.vcs }}'.lower()
    if repo_type == 'git' and not os.path.exists('.git'):
        print('Creating git repository')
        subprocess.check_call(['git', 'init'])
        subprocess.check_call(['git', 'checkout', '-b', 'template'])
        subprocess.check_call(['git', 'add', '.'])
        subprocess.check_call(['git', 'commit', '-m', 'Initial commit'])
        subprocess.check_call(['git', 'checkout', '-b', 'master'])

        print('Git repository initialized. First commit is in branch `template`.')
        print('Create a repository in BitBucket (https://bitbucket.org/repo/create).')
        print('Look for the repository address and run:')
        print('    git remote add origin <repository_address>')
        print('    git push -u origin master')
        print('    git checkout template')
        print('    git push -u origin template')

    elif repo_type == 'hg' and not os.path.exists('.hg'):
        print('Creating mercurial repository')
        subprocess.check_call(['hg', 'init'])
        subprocess.check_call(['hg', 'branch', 'template'])
        subprocess.check_call(['hg', 'add'])
        subprocess.check_call(['hg', 'commit', '-m', 'Initial commit'])
        subprocess.check_call(['hg', 'branch', 'default'])

        print('Mercurial repository initialized. First commit is in branch `template`.')
        print('You are on branch default. Fix some TODOs and commit.')
        print('After that create a repository in BitBucket (https://bitbucket.org/repo/create).')
        print('Look for the repository address and run:')
        print('    hg push <repository_address>')


def main():
    """Do some stuff based on configuration"""

    handle_react()
    create_repos()


if __name__ == '__main__':
    main()
