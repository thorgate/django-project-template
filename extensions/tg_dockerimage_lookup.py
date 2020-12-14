"""
Adds a filter `|python_image` that converts a python
version to a docker image.
"""
from jinja2.ext import Extension


IMAGE_LOOKUP = {
    # Specific image tags that do not fall into the pattern below:
    # '3.6': 'python:3.6-slim-buster',
}


def python_image(value):
    try:
        return IMAGE_LOOKUP[value]
    except KeyError:
        return f'python:{value}-slim-buster'


class TGDockerImageModule(Extension):
    def __init__(self, environment):
        super().__init__(environment)

        environment.filters['python_image'] = python_image
