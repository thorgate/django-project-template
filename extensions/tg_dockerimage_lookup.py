"""
Adds a filter `|python_image` that converts a python
version to a docker image.
"""
from jinja2.ext import Extension


IMAGE_LOOKUP = {
    '3.6': 'python:3.6-alpine3.11',
    '3.7': 'python:3.7-alpine3.11',
    '3.8': 'python:3.8-alpine3.11',
}


def python_image(value):
    try:
        return IMAGE_LOOKUP[value]
    except KeyError:
        return f'python:{value}-alpine'


class TGDockerImageModule(Extension):
    def __init__(self, environment):
        super().__init__(environment)

        environment.filters['python_image'] = python_image
