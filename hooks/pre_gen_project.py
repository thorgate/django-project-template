import sys

import cookiecutter


# Ensure cookiecutter is recent enough
cookiecutter_min_version = '1.5.0'
if cookiecutter.__version__ < cookiecutter_min_version:
    print("--------------------------------------------------------------")
    print("!! Your cookiecutter is too old, at least %s is required !!" % cookiecutter_min_version)
    print("--------------------------------------------------------------")
    sys.exit(1)


# Ensure the selected repo name is usable
repo_name = '{{ cookiecutter.repo_name }}'
assert_msg = 'Repo name should be valid Python identifier!'

if hasattr(repo_name, 'isidentifier'):
    assert repo_name.isidentifier(), assert_msg
else:
    import re
    identifier_re = re.compile(r"[a-zA-Z_][a-zA-Z0-9_]*$")
    assert bool(identifier_re.match(repo_name)), assert_msg


valid_cms_key = ['yes', 'no']
if "{{ cookiecutter.include_cms }}" not in valid_cms_key:
    print("Include CMS '{{ cookiecutter.include_cms }}' is not valid!")
    print("Valid include CMS keys are: %s" % ', '.join(valid_cms_key))
    sys.exit(1)

if "{{ cookiecutter.python_version }}" not in ['3.4', '3.5', '3.6']:
    print("Only allowed python version options are 3.4, 3.5 and 3.6.")
    sys.exit(1)
