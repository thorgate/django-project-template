import stringcase

from jinja2.ext import Extension


def as_hostname(value):
    # Replace underscores with dash - to allow using the value as a hostname
    return value.replace('_', '-')


def snake_to_pascal_case(value):
    return stringcase.pascalcase(value)


def as_git_path(value):
    if not value or not value.strip():
        return value

    res = value.strip()
    res = res.replace('http://', '')
    res = res.replace('https://', '')

    domain, rest = res.split('/', maxsplit=1)

    return f"git@{domain}:{rest}.git"


def as_image_path(value):
    if not value or not value.strip():
        return value

    res = value.strip()
    res = res.replace('http://', '')
    res = res.replace('https://', '')

    domain, rest = res.split('/', maxsplit=1)

    return f"{rest}"


class TGFiltersModule(Extension):
    def __init__(self, environment):
        super().__init__(environment)

        environment.filters['as_hostname'] = as_hostname
        environment.filters['snake_to_pascal_case'] = snake_to_pascal_case
        environment.filters['as_git_path'] = as_git_path
        environment.filters['as_image_path'] = as_image_path
