from jinja2.ext import Extension


def as_hostname(value):
    # Replace underscores with dash - to allow using the value as a hostname
    return value.replace('_', '-')


class CleanHostnameModule(Extension):
    def __init__(self, environment):
        super().__init__(environment)

        environment.filters['as_hostname'] = as_hostname
