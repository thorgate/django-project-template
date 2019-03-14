from jinja2.ext import Extension


def as_appconfigname(value):
    return ''.join(x.capitalize() for x in value.split('_'))


class CleanAppConfignameModule(Extension):
    def __init__(self, environment):
        super().__init__(environment)

        environment.filters['as_appconfigname'] = as_appconfigname
