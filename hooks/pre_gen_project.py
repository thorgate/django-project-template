repo_name = '{{ cookiecutter.repo_name }}'
assert_msg = 'Repo name should be valid Python identifier!'

if hasattr(repo_name, 'isidentifier'):
    assert repo_name.isidentifier(), assert_msg
else:
    import re
    identifier_re = re.compile(r"[a-zA-Z_][a-zA-Z0-9_]*$")
    assert bool(identifier_re.match(repo_name)), assert_msg
