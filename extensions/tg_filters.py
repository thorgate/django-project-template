import stringcase

from jinja2.ext import Extension


def as_hostname(value):
    # Replace underscores with dash - to allow using the value as a hostname
    return value.replace('_', '-')


def snake_to_pascal_case(value):
    return stringcase.pascalcase(value)


class TGFiltersModule(Extension):
    def __init__(self, environment):
        super().__init__(environment)

        environment.filters['as_hostname'] = as_hostname
        environment.filters['snake_to_pascal_case'] = snake_to_pascal_case
