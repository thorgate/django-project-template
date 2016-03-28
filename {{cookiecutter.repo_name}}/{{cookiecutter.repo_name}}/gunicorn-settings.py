#bind = "0.0.0.0:8000"
bind = "unix:/tmp/gunicorn_{{cookiecutter.repo_name}}.sock"

workers = 2
proc_name = "{{cookiecutter.repo_name}}"
#loglevel = 'debug'
